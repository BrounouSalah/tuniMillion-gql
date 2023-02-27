import { Field, ObjectType,  } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

@ObjectType()
export class SignInResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(()=> User)
  user: Partial<User>;
}
