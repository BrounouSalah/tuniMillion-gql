import { HttpService } from '@nestjs/axios'
import { Gender, Roles } from 'generator/graphql.schema'
import {
	AmountOfWalletResolver,
	EmailResolver,
	FileResolver,
	GrilleResolver,
	PaymentTaxeResolver,
	UserLimitationResolver,
	UserNotificationsResolver,
	UserResolver
} from 'resolvers'

const emailResolver = new EmailResolver()
const fileResolver = new FileResolver()
const httpService = new HttpService()
const walletResolver = new AmountOfWalletResolver()
const paymentTaxeResolver = new PaymentTaxeResolver(httpService)
const grilleResolver = new GrilleResolver(walletResolver, paymentTaxeResolver)
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
export const createAdminUser = async () => {
	let input = {
		firstName: 'admin',
		lastName: 'admin',
		email: 'admin@tunimillion.com',
		password: 'tunimillionAdmin',
		birthDate: '1999-10-10',
		phoneNumber: '11111111',
		address: {
			city: 'sousse',
			town: 'sousse',
			postalAddress: '4012'
		},
		gender: Gender.MALE,
		role: Roles.ADMIN
	}

	const existingAdmin = await userResolver.getUserByEmail(input.email)
	if (!existingAdmin) {
		let input = {
			firstName: 'admin',
			lastName: 'admin',
			email: 'admin@tunimillion.com',
			password: 'tunimillionAdmin',
			birthDate: '1999-10-10',
			phoneNumber: '11111111',
			address: {
				city: 'sousse',
				town: 'sousse',
				postalAddress: '4012'
			},
			gender: Gender.MALE,
			role: Roles.ADMIN
		}
		await userResolver.createUserOnStart(input)
	} else {
		return
	}
}
