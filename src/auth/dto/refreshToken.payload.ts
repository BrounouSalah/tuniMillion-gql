import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenPayload {
  @Field()
  id: string;

  @Field()
  accessToken: string;
}
