import { VerificationStatus } from 'generator/graphql.schema'
import {
	AmountOfWalletResolver,
	EmailResolver,
	FileResolver,
	GrilleResolver,
	UserLimitationResolver,
	UserNotificationsResolver,
	UserResolver,
	PaymentTaxeResolver
} from 'resolvers'
import { HttpService } from '@nestjs/axios'


export async function docVerificationCron() {
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
	try {
		const usersWithoutDoc = await userResolver.getUsersByVerificationStatus(
			VerificationStatus.NO_DOCUMENTS
		)
		const usersRejected = await userResolver.getUsersByVerificationStatus(
			VerificationStatus.REJECTED
		)
		for (const user of usersWithoutDoc) {
			await notifResolver.createUserNotification({
				title:"Verification de Compte!",
				userId: user._id,
				message: `Cher utilisateur,
				Pour profiter pleinement de Tunimillions, veuillez vérifier votre compte dès maintenant. Ne manquez pas l'excitation des jeux de loterie et les chances de gagner incroyables qui vous attendent!
				"L'équipe Tunimillions".
				`
			})
		}
		for (const user of usersRejected) {
			await notifResolver.createUserNotification({
				title:"Verification de Compte!",
				userId: user._id,
				message: 'Your Documents Are Rejected, Please Upload New Ones Again'
			})
		}
		console.log('docVerificationCron finish running successfully')
	} catch (error) {
		console.error(
			'An error occurred while executing docVerificationCron:',
			error
		)
	}
}
