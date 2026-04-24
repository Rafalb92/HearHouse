import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User } from '@/users/entities/user.entity';
import { Account } from '@/users/entities/account.entity';
import { Session } from '@/users/entities/session.entity';

import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RolesGuard } from './guards/roles.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Verification } from '@/users/entities/verification.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { MailModule } from '@/mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { CustomersModule } from '@/customers/customers.module';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Account, Session, Verification]),
    CustomersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    RolesGuard,
    LocalAuthGuard,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
