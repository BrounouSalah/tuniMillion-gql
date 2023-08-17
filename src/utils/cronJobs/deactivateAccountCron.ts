import { AmountOfWalletResolver, EmailResolver, FileResolver, GrilleResolver, PaymentTaxeResolver, UserLimitationResolver, UserNotificationsResolver, UserResolver } from "resolvers"
import { HttpService } from '@nestjs/axios'
import { UpdateUserInput } from "generator/graphql.schema"
export async function deactivateAccount(){
    const emailResolver = new EmailResolver()
    const fileResolver = new FileResolver()
    const httpService = new HttpService()
    const walletResolver = new AmountOfWalletResolver()
    const paymentTaxeResolver= new PaymentTaxeResolver(httpService )
    const grilleResolver = new GrilleResolver(walletResolver,paymentTaxeResolver)
    const userLimitationResolver = new UserLimitationResolver()
    const notifResolver = new UserNotificationsResolver()
    const userResolver = new UserResolver(
        emailResolver,
        fileResolver,
        walletResolver,
        userLimitationResolver,
        grilleResolver,
        notifResolver
    )
    try{
    const users = await userResolver.getUsersByLastLoginDate()
    console.log(users)

    for (const user of users){
        const updateInput:UpdateUserInput = {
            firstName: user.firstName,
            lastName: user.lastName,
            birthDate: user.birthDate,
            address: user.address,
            phoneNumber: user.phoneNumber,
            email: user.local.email,
            termsOfUse:user.termsOfUse,
            gender:user.gender,
            identityVerified:user.identityVerified,
            isActive: false,
            
        }
        await userResolver.updateUser(user._id,updateInput)

   
    }
        }catch(error){
        console.error(
            'An error occurred while executing getUsersByLastLoginDate:',
            error
        )
    }

}