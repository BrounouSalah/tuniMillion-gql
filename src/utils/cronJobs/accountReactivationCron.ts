import { HttpService } from '@nestjs/axios'
import { AmountOfWalletResolver, EmailResolver, FileResolver, GrilleResolver, PaymentTaxeResolver, UserLimitationResolver, UserNotificationsResolver, UserResolver } from "resolvers";
import { generateToken } from '@auth'
import { sendMail } from '../../shared/mail/index'
export async function accountReactivation(){
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

    const users = await userResolver.getAllUsers()
    const currentDate = new Date();

    for (const user of users ){
        const lastLogin=new Date ( user.lastLoginDate)
        console.log(lastLogin)
        const days = Math.floor ((currentDate.getTime() - lastLogin.getTime())/ (1000*60*60*24))
        console.log(days)

        if (days < 90 && days>85){
            const emailToken = await generateToken(user, 'emailToken')
			await sendMail('reactivation', user, emailToken)
           
        }
    }
    console.log('accountReactivation finish running successfully')
    }
        catch (error) {
            console.error(
                'An error occurred while executing accountReactivation:',
                error
            )
        }
   
}