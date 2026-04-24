import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import argon2 from 'argon2';

import { User, UserStatus, Role } from '@/users/entities/user.entity';
import { Account, AccountProviderType } from '@/users/entities/account.entity';
import { Session } from '@/users/entities/session.entity';

import { JwtAccessPayload, JwtRefreshPayload } from './types/jwt-payloads';
import { AuthUser } from './types/auth-user.type';
import { generateJti } from './utils/tokens';
import { sha256 } from './utils/crypto';
import { nowPlusDays } from './utils/time';
import {
  Verification,
  VerificationType,
} from '@/users/entities/verification.entity';
import { MailService } from '@/mail/mail.service';
import { CustomersService } from '@/customers/customers.service';

type Meta = { ip?: string; userAgent?: string };

export type SafeUser = {
  id: string;
  email: string;
  roles: string[];
  status: string;
  displayName: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
    @InjectRepository(Verification)
    private readonly verificationsRepo: Repository<Verification>,
    private readonly customers: CustomersService,
  ) {}

  private readonly linkTokenStore = new Map<
    string,
    {
      googleId: string;
      email: string;
      displayName: string | null;
      picture: string | null;
      expiresAt: number;
    }
  >();

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private pepper() {
    return this.config.get<string>('PASSWORD_PEPPER') ?? '';
  }

  private accessTtlMin() {
    return Number(this.config.get<string>('ACCESS_TOKEN_TTL_MIN') ?? '15');
  }

  private refreshTtlDays() {
    return Number(this.config.get<string>('REFRESH_TOKEN_TTL_DAYS') ?? '14');
  }

  private safeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      status: user.status,
      displayName: user.displayName,
    };
  }

  // ─── Register ───────────────────────────────────────────────────────────────

  async register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const email = this.normalizeEmail(input.email);

    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');

    const displayName =
      [input.firstName, input.lastName].filter(Boolean).join(' ') || null;

    const user = await this.usersRepo.save(
      this.usersRepo.create({
        email,
        displayName,
        roles: [Role.USER],
        status: UserStatus.PENDING_VERIFICATION,
        emailVerifiedAt: null,
      }),
    );

    const passwordHash = await argon2.hash(input.password + this.pepper());

    await this.accountsRepo.save(
      this.accountsRepo.create({
        userId: user.id,
        providerType: AccountProviderType.CREDENTIALS,
        provider: 'credentials',
        providerAccountId: user.email,
        passwordHash,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
    );

    await this.sendVerificationEmail(user.id);

    // Przepisz do CustomerProfile
    if (input.firstName || input.lastName) {
      await this.customers.updateProfile(user.id, {
        firstName: input.firstName,
        lastName: input.lastName,
      });
    }

    return this.safeUser(user);
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(input: { email: string; password: string }, meta: Meta = {}) {
    const email = this.normalizeEmail(input.email);

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.DISABLED)
      throw new UnauthorizedException('Account disabled');

    const account = await this.accountsRepo.findOne({
      where: {
        userId: user.id,
        providerType: AccountProviderType.CREDENTIALS,
        provider: 'credentials',
      },
    });
    if (!account?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(
      account.passwordHash,
      input.password + this.pepper(),
    );
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id, meta);

    return { user: this.safeUser(user), accessToken, refreshToken };
  }

  // ─── Refresh ─────────────────────────────────────────────────────────────────

  async refresh(refreshPayload: JwtRefreshPayload, meta: Meta = {}) {
    const userId = refreshPayload.sub;
    const jtiHash = sha256(refreshPayload.jti);

    const session = await this.sessionsRepo.findOne({
      where: { refreshJtiHash: jtiHash },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      await this.sessionsRepo.update(
        { userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    session.revokedAt = new Date();
    session.lastSeenAt = new Date();
    await this.sessionsRepo.save(session);

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || user.status === UserStatus.DISABLED)
      throw new UnauthorizedException('Unauthorized');

    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(userId, meta);

    return { user: this.safeUser(user), accessToken, refreshToken };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout(refreshPayload?: JwtRefreshPayload) {
    if (!refreshPayload?.jti) return { ok: true };

    const jtiHash = sha256(refreshPayload.jti);

    await this.sessionsRepo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('refreshJtiHash = :jtiHash', { jtiHash })
      .andWhere('revokedAt IS NULL')
      .execute();

    return { ok: true };
  }

  async logoutAll(userId: string) {
    await this.sessionsRepo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('revokedAt IS NULL')
      .execute();

    return { ok: true };
  }

  // ─── Forgot password ─────────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({
      where: { email: this.normalizeEmail(email) },
    });

    if (!user) return { ok: true };

    await this.verificationsRepo
      .createQueryBuilder()
      .update()
      .set({ usedAt: new Date() })
      .where('userId = :userId', { userId: user.id })
      .andWhere('type = :type', { type: VerificationType.PASSWORD_RESET })
      .andWhere('usedAt IS NULL')
      .execute();

    const rawToken = generateJti(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await this.verificationsRepo.save(
      this.verificationsRepo.create({
        userId: user.id,
        type: VerificationType.PASSWORD_RESET,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    await this.mail.sendResetPassword({
      to: user.email,
      displayName: user.displayName,
      rawToken,
    });

    return { ok: true };
  }

  // ─── Email verification ───────────────────────────────────────────────────────

  async sendVerificationEmail(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return;

    await this.verificationsRepo
      .createQueryBuilder()
      .update()
      .set({ usedAt: new Date() })
      .where('userId = :userId', { userId })
      .andWhere('type = :type', { type: VerificationType.EMAIL_VERIFICATION })
      .andWhere('usedAt IS NULL')
      .execute();

    const rawToken = generateJti(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.verificationsRepo.save(
      this.verificationsRepo.create({
        userId,
        type: VerificationType.EMAIL_VERIFICATION,
        tokenHash,
        expiresAt,
        usedAt: null,
      }),
    );

    await this.mail.sendVerifyEmail({
      to: user.email,
      displayName: user.displayName,
      rawToken,
    });
  }

  async verifyEmail(rawToken: string) {
    const tokenHash = sha256(rawToken);

    const verification = await this.verificationsRepo.findOne({
      where: {
        tokenHash,
        type: VerificationType.EMAIL_VERIFICATION,
        usedAt: IsNull(),
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification link.');
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification link has expired.');
    }

    await this.usersRepo.update(
      { id: verification.userId },
      { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
    );

    verification.usedAt = new Date();
    await this.verificationsRepo.save(verification);

    return { ok: true };
  }

  // ─── Reset password ───────────────────────────────────────────────────────────

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = sha256(rawToken);

    const verification = await this.verificationsRepo.findOne({
      where: {
        tokenHash,
        type: VerificationType.PASSWORD_RESET,
        usedAt: IsNull(),
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token has expired.');
    }

    const passwordHash = await argon2.hash(newPassword + this.pepper());

    await this.accountsRepo
      .createQueryBuilder()
      .update()
      .set({ passwordHash })
      .where('userId = :userId', { userId: verification.userId })
      .andWhere('provider = :provider', { provider: 'credentials' })
      .execute();

    verification.usedAt = new Date();
    await this.verificationsRepo.save(verification);

    await this.logoutAll(verification.userId);

    return { ok: true };
  }

  // ─── Change password ──────────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const account = await this.accountsRepo.findOne({
      where: {
        userId,
        providerType: AccountProviderType.CREDENTIALS,
        provider: 'credentials',
      },
    });

    if (!account?.passwordHash) {
      throw new BadRequestException('No password set for this account.');
    }

    const ok = await argon2.verify(
      account.passwordHash,
      currentPassword + this.pepper(),
    );

    if (!ok) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const passwordHash = await argon2.hash(newPassword + this.pepper());

    await this.accountsRepo
      .createQueryBuilder()
      .update()
      .set({ passwordHash })
      .where('userId = :userId', { userId })
      .andWhere('provider = :provider', { provider: 'credentials' })
      .execute();

    await this.logoutAll(userId);

    return { ok: true };
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────────

  async findOrCreateGoogleUser(input: {
    googleId: string;
    email: string;
    displayName: string | null;
    picture: string | null;
  }): Promise<
    | { status: 'ok'; user: User }
    | { status: 'requires_linking'; linkToken: string; email: string }
  > {
    const email = this.normalizeEmail(input.email);

    const existingAccount = await this.accountsRepo.findOne({
      where: { provider: 'google', providerAccountId: input.googleId },
    });

    if (existingAccount) {
      const user = await this.usersRepo.findOne({
        where: { id: existingAccount.userId },
      });
      if (!user || user.status === UserStatus.DISABLED) {
        throw new UnauthorizedException('Account disabled.');
      }
      return { status: 'ok', user };
    }

    const existingUser = await this.usersRepo.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.status === UserStatus.DISABLED) {
        throw new UnauthorizedException('Account disabled.');
      }
      const linkToken = generateJti(32);
      this.linkTokenStore.set(linkToken, {
        ...input,
        email,
        expiresAt: Date.now() + 1000 * 60 * 10,
      });
      return { status: 'requires_linking', linkToken, email };
    }

    const user = await this.usersRepo.save(
      this.usersRepo.create({
        email,
        displayName: input.displayName,
        roles: [Role.USER],
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      }),
    );

    await this.accountsRepo.save(
      this.accountsRepo.create({
        userId: user.id,
        providerType: AccountProviderType.OAUTH,
        provider: 'google',
        providerAccountId: input.googleId,
        passwordHash: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
    );

    return { status: 'ok', user };
  }

  // ─── Confirm link Google ──────────────────────────────────────────────────────

  async confirmLinkGoogle(
    linkToken: string,
    password: string,
    meta: Meta = {},
  ) {
    const pending = this.linkTokenStore.get(linkToken);

    if (!pending || pending.expiresAt < Date.now()) {
      this.linkTokenStore.delete(linkToken);
      throw new BadRequestException('Link token expired or invalid.');
    }

    const email = this.normalizeEmail(pending.email);
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found.');

    const account = await this.accountsRepo.findOne({
      where: { userId: user.id, provider: 'credentials' },
    });

    if (account?.passwordHash) {
      const ok = await argon2.verify(
        account.passwordHash,
        password + this.pepper(),
      );
      if (!ok) throw new BadRequestException('Incorrect password.');
    }

    await this.accountsRepo.save(
      this.accountsRepo.create({
        userId: user.id,
        providerType: AccountProviderType.OAUTH,
        provider: 'google',
        providerAccountId: pending.googleId,
        passwordHash: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
    );

    this.linkTokenStore.delete(linkToken);

    return this.issueTokens(user, meta);
  }

  // ─── Add password ─────────────────────────────────────────────────────────────

  async addPassword(userId: string, password: string) {
    const existing = await this.accountsRepo.findOne({
      where: { userId, provider: 'credentials' },
    });

    if (existing) {
      throw new BadRequestException('Password already set.');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found.');

    const passwordHash = await argon2.hash(password + this.pepper());

    await this.accountsRepo.save(
      this.accountsRepo.create({
        userId,
        providerType: AccountProviderType.CREDENTIALS,
        provider: 'credentials',
        providerAccountId: user.email,
        passwordHash,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
    );

    return { ok: true };
  }

  // ─── Unlink provider ──────────────────────────────────────────────────────────

  async unlinkProvider(userId: string, provider: string) {
    const accounts = await this.accountsRepo.find({ where: { userId } });

    if (accounts.length <= 1) {
      throw new BadRequestException('Cannot unlink the only sign-in method.');
    }

    await this.accountsRepo.delete({ userId, provider });
    return { ok: true };
  }

  // ─── Linked accounts ──────────────────────────────────────────────────────────

  async getLinkedAccounts(userId: string) {
    const accounts = await this.accountsRepo.find({ where: { userId } });
    return accounts.map((a) => ({
      provider: a.provider,
      providerType: a.providerType,
      createdAt: a.createdAt,
    }));
  }

  // ─── Passport helpers ─────────────────────────────────────────────────────────

  validateAccessPayload(payload: JwtAccessPayload): AuthUser {
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }

  async validateLocalUser(emailRaw: string, password: string) {
    if (!emailRaw || !password) return null;
    const email = this.normalizeEmail(emailRaw);

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return null;
    if (user.status === UserStatus.DISABLED) return null;
    if (user.status !== UserStatus.ACTIVE) return null;

    const account = await this.accountsRepo.findOne({
      where: {
        userId: user.id,
        providerType: AccountProviderType.CREDENTIALS,
        provider: 'credentials',
      },
    });
    if (!account?.passwordHash) return null;

    const ok = await argon2.verify(
      account.passwordHash,
      password + this.pepper(),
    );
    if (!ok) return null;

    return user;
  }

  async issueTokens(user: User, meta: Meta = {}) {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id, meta);
    return { accessToken, refreshToken, user: this.safeUser(user) };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async signAccessToken(user: User) {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: `${this.accessTtlMin()}m`,
    });
  }

  private async issueRefreshToken(userId: string, meta: Meta) {
    const jti = generateJti(16);
    const jtiHash = sha256(jti);
    const expiresAt = nowPlusDays(this.refreshTtlDays());

    await this.sessionsRepo.save(
      this.sessionsRepo.create({
        userId,
        refreshJtiHash: jtiHash,
        expiresAt,
        revokedAt: null,
        lastSeenAt: new Date(),
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      }),
    );

    const payload: JwtRefreshPayload = { sub: userId, jti };

    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.refreshTtlDays()}d`,
    });
  }
}
