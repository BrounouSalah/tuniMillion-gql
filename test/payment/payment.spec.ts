import { compareValues } from 'utils/helpers/payment'

describe('compareValues', () => {
	it('should return the correct difference when reste is null', () => {
		const reste: number | null = null
		const montantPaiement = 50
		const limit = 100
		const expectedDifference = limit - montantPaiement

		const result = compareValues(reste, montantPaiement, limit)

		expect(result).toEqual(expectedDifference)
	})

	it('should return -1 when montantPaiement exceeds limit and reste is null', () => {
		const reste: number | null = null
		const montantPaiement = 150
		const limit = 100

		const result = compareValues(reste, montantPaiement, limit)

		expect(result).toEqual(-1)
	})

	it('should return the correct difference when reste is not null', () => {
		const reste: number | null = 80
		const montantPaiement = 50
		const limit = 100
		const expectedDifference = reste - montantPaiement

		const result = compareValues(reste, montantPaiement, limit)

		expect(result).toEqual(expectedDifference)
	})

	it('should return -1 when montantPaiement exceeds reste and reste is not null', () => {
		const reste: number | null = 80
		const montantPaiement = 100
		const limit = 100

		const result = compareValues(reste, montantPaiement, limit)

		expect(result).toEqual(-1)
	})
})
