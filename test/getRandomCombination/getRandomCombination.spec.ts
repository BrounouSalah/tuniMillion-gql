import { Grille } from 'generator/graphql.schema'
import { GetRandomCombination } from 'utils/helpers/getRandomCombination'

describe('GetRandomCombination', () => {
	it('should return null when the grilles array is empty', () => {
		const grilles = []
		const result = GetRandomCombination(grilles)
		expect(result).toBeNull()
	})

	it('should return null when no Grille object has a randomCode', () => {
		const grilles = [
			{ _id: '1', userId: 'user1' },
			{ _id: '2', userId: 'user2' }
		] as Grille[]
		const result = GetRandomCombination(grilles)
		expect(result).toBeNull()
	})
	it('should return null when combinations are empty', () => {
		const grilles = [
			{ _id: '1', userId: 'user1', combinations: [] },
			{ _id: '2', userId: 'user2', combinations: [] }
		] as Grille[]
		const result = GetRandomCombination(grilles)
		expect(result).toBeNull()
	})

	it('should return an object with grilleId, userId, and winningCode when grilles array contains Grille objects with randomCode', () => {
		const grilles = [
			{
				_id: '1',
				userId: 'user1',
				combinations: [{ tuniMillionsCode: 'rand1' }]
			},
			{
				_id: '2',
				userId: 'user2',
				combinations: [{ tuniMillionsCode: 'rand2' }]
			},
			{
				_id: '3',
				userId: 'user3',
				combinations: [{ tuniMillionsCode: 'rand3' }]
			},
			{
				_id: '4',
				userId: 'user4',
				combinations: [{ tuniMillionsCode: 'rand4' }]
			}
		] as unknown as Grille[]
		const result = GetRandomCombination(grilles)
		expect(result).toHaveProperty('grilleId')
		expect(result).toHaveProperty('userId')
		expect(result).toHaveProperty('winningCode')
	})
})
