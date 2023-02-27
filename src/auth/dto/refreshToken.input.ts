import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class RefreshTokenInput {

  @IsString()
  @Field()
  refreshToken: string;
}
