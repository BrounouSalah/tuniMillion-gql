import { WinningSequence } from 'generator/graphql.schema'
import { simulation } from 'utils/helpers/simultation'

describe('testing simulator', () => {
	it('simulator with winning input', () => {
		const numbers = [1, 2, 3, 4, 5]
		const stars = [1, 2]
		const winningSeqeunce = {
			numbers: numbers,
			stars: stars
		} as WinningSequence
		const cagnote = 1000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [1, 2, 3, 4, 5],
			winningStars: [1, 2],
			winningValue: 1000
		})
	})
	it('simulator with partial winning input', () => {
		const numbers = [1, 2, 3, 4, 6]
		const stars = [1, 2]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 4, 5],
			stars: stars
		} as WinningSequence
		const cagnote = 1000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [1, 2, 3, 4],
			winningStars: [1, 2],
			winningValue: 3.897
		})
	})
	it('simulator with no winning input', () => {
		const numbers = [10, 20, 30, 40, 6]
		const stars = [11, 12]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		} as WinningSequence
		const cagnote = 1000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [],
			winningStars: [],
			winningValue: 0
		})
	})
})
