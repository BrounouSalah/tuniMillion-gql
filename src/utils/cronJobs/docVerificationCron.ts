import { VerificationStatus } from 'generator/graphql.schema'
import {
	AmountOfWalletResolver,
	EmailResolver,
	FileResolver,
	GrilleResolver,
	UserLimitationResolver,
	UserNotificationsResolver,
	UserResolver
} from 'resolvers'

export async function docVerificationCron() {
	const emailResolver = new EmailResolver()
	const fileResolver = new FileResolver()
	const walletResolver = new AmountOfWalletResolver()
	const userLimitationResolver = new UserLimitationResolver()
	const grilleResolver = new GrilleResolver(walletResolver)
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
				userId: user._id,
				message: 'Please Upload Documents To Get Verified'
			})
		}
		for (const user of usersRejected) {
			await notifResolver.createUserNotification({
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
