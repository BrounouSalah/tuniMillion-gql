import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserDocument } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private config: ConfigService,
  ) {}

  create(createUserInput: CreateUserInput) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userModel.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(updateUserInput: UpdateUserInput) {
    return `This action updates a #${updateUserInput._id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
