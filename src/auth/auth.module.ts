import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from 'src/mail/mailer.module';

@Module({
  imports: [JwtModule.register({}), UserModule, MailModule],
  providers: [AuthResolver, AuthService, JwtService, JwtStrategy]
})
export class AuthModule {}
