import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly to = process.env.NOTIFY_EMAIL || 'khafagy.ahmedibrahim@gmail.com';
  private readonly resendKey = process.env.RESEND_API_KEY;

  private async send(subject: string, html: string) {
    if (!this.resendKey) {
      this.logger.log(`[Email disabled] ${subject}`);
      return;
    }

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Exale <noreply@exale.local>',
          to: [this.to],
          subject,
          html,
        }),
      });
    } catch (err) {
      this.logger.error('Failed to send email notification', err instanceof Error ? err.stack : String(err));
    }
  }

  async notifyNewContact(payload: {
    name: string;
    email: string;
    phone: string;
    concern: string;
    message: string;
  }) {
    const subject = '[Exale] New Contact Submission';
    const html = `
      <h2>New contact submission</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Concern:</strong> ${payload.concern}</p>
      <p><strong>Message:</strong></p>
      <p>${payload.message.replace(/\n/g, '<br/>')}</p>
    `;
    await this.send(subject, html);
  }

  async notifyNewApplication(payload: {
    name: string;
    email: string;
    phone: string;
    industry: string;
    message: string;
    fileUrl?: string;
  }) {
    const subject = '[Exale] New Application Submission';
    const html = `
      <h2>New application</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Industry:</strong> ${payload.industry}</p>
      <p><strong>Message:</strong></p>
      <p>${payload.message.replace(/\n/g, '<br/>')}</p>
      ${
        payload.fileUrl
          ? `<p><strong>Attachment:</strong> <a href="${payload.fileUrl}">${payload.fileUrl}</a></p>`
          : '<p><strong>Attachment:</strong> None</p>'
      }
    `;
    await this.send(subject, html);
  }
}

