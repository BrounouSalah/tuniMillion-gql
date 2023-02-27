import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { SingInInput, SingUpInput, SignInResponse, RefreshTokenResponse, RefreshTokenInput, VerifMailTokenInput, VerifMailTokenResponse } from './dto';


@Resolver(()=> Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignInResponse, { name: 'singUp' })
  async singUp(@Args('singUpInput') singUpInput: SingUpInput) {
    return await this.authService.singUp(singUpInput);
  }

  @Mutation(() => SignInResponse, { name: 'singIn' })
  async singIn(@Args('singInInput') singInInput: SingInInput) {
    return await this.authService.singIn(singInInput);
  }

  @Mutation(()=> RefreshTokenResponse, { name: 'refreshUserToken' }) 
  async refreshToken(@Args('refreshTokenInput') refreshTokenInput: RefreshTokenInput){
    return await this.authService.refreshAccessToken(refreshTokenInput)
  }

  @Mutation(()=> VerifMailTokenResponse, { name: 'veririfyUser' }) 
  async verifiedUser(@Args('mailToken') mailToken: VerifMailTokenInput){
    return await this.authService.verifMailUser(mailToken)
  }
}
