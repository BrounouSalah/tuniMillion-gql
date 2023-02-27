import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class VerifMailTokenInput {

  @IsString()
  @Field()
  mailToken: string;
}
