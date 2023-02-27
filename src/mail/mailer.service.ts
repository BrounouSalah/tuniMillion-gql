import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `tunimillion.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Tunimillion! Confirm your Email',
      template: './confirmation', 
      context: { 
        name: user.fullName,
        url,
      },
    });
  }

  
  async sendWelcomMessage(user: User) {

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Tunimillion! Confirm your Email',
      template: './welcome', 
      context: { 
        name: user.fullName,
      },
    });
  }
}
