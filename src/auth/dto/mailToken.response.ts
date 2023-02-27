import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VerifMailTokenResponse {

  @Field()
  isVerified: Boolean;
}
