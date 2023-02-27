import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SingInInput } from '../dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {
    super();
  }

  async validate(payload: SingInInput): Promise<Partial<User>> {
    const { email } = payload;
    const user: User = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException();
    }

    delete user.password
    delete user.refreshTokenHash

    return user; 
  }
}