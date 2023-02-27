import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class VerifMailTokenPayload {

  @IsString()
  @Field()
  sub: string;

  @IsBoolean()
  @Field()
  verification: boolean;
}
