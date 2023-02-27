import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  SingUpInput,
  SingInInput,
  RefreshTokenInput,
  RefreshTokenPayload,
  VerifMailTokenPayload,
  VerifMailTokenInput
} from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../user/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MailService } from '../mail/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private config: ConfigService,
    private mailer: MailService,
  ) {}
  async singUp(singUpInput: SingUpInput) {
    // password hash
    singUpInput.password = await argon.hash(singUpInput.password);

    // create new user in DB and return signInResponse
    try {
      let user = await new this.userModel(singUpInput).save();
      user = JSON.parse(JSON.stringify(user));

      delete user.password;
      delete user.refreshTokenHash;

      const { accessToken, refreshToken, mailVerifToken } =
        await this.tokenCreation(user);
      await this.updateRefreshToken(user._id, refreshToken);
      await this.mailer.sendUserConfirmation(user, mailVerifToken);

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async singIn(singInInput: SingInInput) {
    let user = await this.userModel
      .findOne({
        email: singInInput.email,
      })
      .exec();

    // check user existence
    if (!user) throw new ForbiddenException('Incorrect Credentials');

    // passwored match check
    const pwMatch = await argon.verify(user.password, singInInput.password);
    if (!pwMatch) throw new ForbiddenException('Incorrect Credentials');

    user = JSON.parse(JSON.stringify(user));

    delete user.password;
    delete user.refreshTokenHash;

    const { accessToken, refreshToken } = await this.tokenCreation(user);
    await this.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  // simultaniously creates accessToken alongside a refreshToken
  async tokenCreation(user: Partial<User>) {
    user = JSON.parse(JSON.stringify(user));

    delete user?.password;
    delete user?.refreshTokenHash;

    const accessToken = this.jwt.sign(
      { ...user },
      {
        expiresIn: '1d',
        secret: this.config.get('ACCESS_TOKEN_SECRET'),
      },
    );

    const refreshToken = this.jwt.sign(
      {
        sub: user._id,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
      },
    );

    let mailVerifToken = '';

    if (!JSON.parse(user.isEmailVerified))
      mailVerifToken = this.jwt.sign(
        { sub: user._id, verification: true },
        {
          expiresIn: '1d',
          secret: this.config.get('ACCESS_TOKEN_SECRET'),
        },
      );
    return {
      accessToken,
      refreshToken,
      mailVerifToken,
    };
  }

  // update the user schema with the right refreshToken
  async updateRefreshToken(
    id: Types.ObjectId,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await argon.hash(refreshToken);
    await this.userModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          refreshTokenHash,
        },
      )
      .exec();
  }

  // get new accessToken when the old one expires
  async refreshAccessToken(refreshTokenInput: RefreshTokenInput) {
    const payload = this.jwt.decode(
      refreshTokenInput.refreshToken,
    ) as RefreshTokenPayload;
    const user = await this.userModel.findOne({ _id: payload.id });
    const tokenCheck = await argon.verify(
      user.refreshTokenHash,
      refreshTokenInput.refreshToken,
    );
    console.log(tokenCheck);
    if (!tokenCheck) throw new ForbiddenException('Wrong token issuer');

    const { accessToken } = await this.tokenCreation(user);

    return {
      accessToken,
    };
  }

  // logout logic
  async logOut(id: Types.ObjectId) {
    await this.userModel
      .findOneAndUpdate(
        {
          _id: id,
        },
        {
          refreshTokenHash: null,
        },
      )
      .exec();
  }

  async verifMailUser({ mailToken }: VerifMailTokenInput) {
    const { sub, verification } = this.jwt.decode(mailToken) as VerifMailTokenPayload;

    const user = await this.userModel.findOneAndUpdate({ _id: sub, isEmailVerified: false }, { isEmailVerified: verification }, { new: true });
    if(!user) throw new ForbiddenException('User already Verified')
    
    //send mail to confirm validation
    await this.mailer.sendWelcomMessage(user);

    return {
      isVerified: true
    }
  }
}
