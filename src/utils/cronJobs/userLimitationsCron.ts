import { TypeLimit, UpdateUserLimitationInput } from 'generator/graphql.schema'
import { UserLimitationResolver } from 'resolvers'

export async function userLimitationCron() {
	const userLimitationResolver = new UserLimitationResolver()
	try {
		const userLimitations = await userLimitationResolver.getAllUserLimitations()

		if (userLimitations.length > 0) {
			const initialLimit = userLimitations[0].limit

			for (const userLimitation of userLimitations) {
				const updateInput: UpdateUserLimitationInput = {
					type: TypeLimit.MOIS,
					rest: null,
					limit: initialLimit
				}

				await userLimitationResolver.updateUserLimitation(
					userLimitation._id,
					updateInput
				)
			}
		}
		console.log('userLimitation Updated')
	} catch (error) {
		console.error(
			'An error occurred while executing getAllUserLimitations:',
			error
		)
	}
}
