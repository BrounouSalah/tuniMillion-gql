import {  WinningSequence } from 'generator/graphql.schema'
import { simulation } from 'utils/helpers/simultation'

describe('testing simulator', () => {
	it('simulator with winning input', () => {
		const numbers = [1, 2, 3, 4, 5]
		const stars = [1, 5]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 6, 7],
			stars: [1, 5]
		} as WinningSequence
		const cagnote = 100000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [1, 2, 3],
			winningStars: [1, 5],
			winningValue: 171.000
			

		})
	})
	it('simulator with partial winning input', () => {
		const numbers = [1, 2, 3, 4, 6]
		const stars = [1, 2]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 4, 5],
			stars: stars
		} as WinningSequence
		const cagnote = 100000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [1, 2, 3, 4],
			winningStars: [1, 2],
			winningValue: 3897.000
		})
	})
	it('simulator with no winning input', () => {
		const numbers = [1, 2, 3, 4, 5]
		const stars = [1, 2]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 4, 6],
			stars: [1, 2]
		} as WinningSequence
		const cagnote = 10000000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [1,2,3,4],
			winningStars: [1,2],
			winningValue: 764.1176
		})
	})

	it('simulator with no winning input', () => {
		const numbers = [11, 22, 33, 44, 15]
		const stars = [11, 12]
		const winningSeqeunce = {
			numbers: [1, 2, 3, 4, 6],
			stars: [1, 2]
		} as WinningSequence
		const cagnote = 10000000
		const res = simulation(numbers, stars, cagnote, winningSeqeunce)
		expect(res).toEqual({
			winningNumbers: [],
			winningStars: [],
			winningValue: 0
		})
	})
})
