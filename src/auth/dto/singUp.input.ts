import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class SingUpInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  birthday: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  CIN: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  address: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Field()
  email: string; //@unique

  @IsNotEmpty()
  @IsString()
  @MinLength(9)
  @MaxLength(32)
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message: `Passwords Should contain at least 1 upper case letter
                Passwords Should contain at least 1 lower case letter
                Passwords Should contain at least 1 number or special character`
    }
  )
  @Field()
  password: string;
}
