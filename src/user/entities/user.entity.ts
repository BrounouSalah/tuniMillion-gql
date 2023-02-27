import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

enum Role {
  'USER',
  'ADMIN'
}

registerEnumType(Role, {
  name: 'Role',
});

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(()=> ID)
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  @Field()
  fullName: string;

  @Prop({ required: true })
  @Field()
  birthday: string;

  @Prop({ required: true, unique: true })
  @Field()
  CIN: string;

  @Prop({ required: true, unique: true })
  @Field()
  address: string;

  @Prop({ required: true })
  @Field()
  phone: string;

  @Prop({ required: true })
  @Field()
  email: string; 

  @Prop({ required: true })
  @Field()
  password: string;

  @Prop({ default: 'USER' })
  @Field(()=> Role)
  role: string;

  @Prop()
  @Field()
  refreshTokenHash?: string;

  @Prop({ default: null })
  @Field()
  favoriteGame?: string;

  @Prop({ default: null })
  @Field()
  verifHistory?: string;

  @Prop({ default: false })
  @Field()
  isIdVerified?: string;

  @Prop({ default: false })
  @Field()
  isEmailVerified?: string;
}

export type UserDocument =  HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);