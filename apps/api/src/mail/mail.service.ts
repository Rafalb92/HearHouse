import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { verifyEmailTemplate } from './templates/verify-email.template';
import type { SentMessageInfo } from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from =
      config.get<string>('MAIL_FROM') ?? 'HearHouse <noreply@hearhouse.dev>';

    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('MAIL_HOST'),
      port: Number(config.get<string>('MAIL_PORT') ?? '2525'),
      secure: config.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: config.getOrThrow<string>('MAIL_USER'),
        pass: config.getOrThrow<string>('MAIL_PASS'),
      },
    });
  }

  async sendResetPassword(opts: {
    to: string;
    displayName: string | null;
    rawToken: string;
  }) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${opts.rawToken}`;

    const { subject, html, text } = resetPasswordTemplate({
      displayName: opts.displayName,
      resetUrl,
      expiresInHours: 1,
    });

    await this.send({ to: opts.to, subject, html, text });
  }

  async sendVerifyEmail(opts: {
    to: string;
    displayName: string | null;
    rawToken: string;
  }) {
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${opts.rawToken}`;

    const { subject, html, text } = verifyEmailTemplate({
      displayName: opts.displayName,
      verifyUrl,
    });

    await this.send({ to: opts.to, subject, html, text });
  }

  private async send(opts: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    try {
      const info = (await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      })) as SentMessageInfo;

      this.logger.log(`Email sent to ${opts.to} — id: ${info.messageId}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${opts.to}`, err);
      throw err;
    }
  }
}
