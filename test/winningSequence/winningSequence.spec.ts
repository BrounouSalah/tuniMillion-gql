import { WinningRank, WinningSequence } from 'generator/graphql.schema'
import {
	getStatistique,
	initializeStatistiqueObject
} from 'utils/helpers/statistique'
import { compareGrilleWithWinningSequence } from 'utils/helpers/winningSequence'

describe('compareGrilleWithWinningSequence', () => {
	it('should return the correct winning rank for matching numbers and stars', () => {
		const grille = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		}
		const winningSequence = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		}
		const expectedRank = WinningRank.FIRST

		const result = compareGrilleWithWinningSequence(grille, winningSequence)

		expect(result).toEqual(expectedRank)
	})

	it('should return the correct winning rank for matching numbers only', () => {
		const grille = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		}
		const winningSequence = {
			numbers: [1, 2, 3, 4, 5],
			stars: [3, 4]
		}
		const expectedRank = WinningRank.THIRD

		const result = compareGrilleWithWinningSequence(grille, winningSequence)

		expect(result).toEqual(expectedRank)
	})

	it('should return the correct winning rank for matching stars only', () => {
		const grille = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		}
		const winningSequence = {
			numbers: [6, 7, 8, 9, 10],
			stars: [1, 2]
		}
		const expectedRank = WinningRank.NONE

		const result = compareGrilleWithWinningSequence(grille, winningSequence)

		expect(result).toEqual(expectedRank)
	})

	it('should return WinningRank.NONE when there are no matches', () => {
		const grille = {
			numbers: [1, 2, 3, 4, 5],
			stars: [1, 2]
		}
		const winningSequence = {
			numbers: [6, 7, 8, 9, 10],
			stars: [3, 4]
		}
		const expectedRank = WinningRank.NONE

		const result = compareGrilleWithWinningSequence(grille, winningSequence)

		expect(result).toEqual(expectedRank)
	})
})

describe('getStatistique function', () => {
	it('test the function with 2 winningSequences', () => {
		const winningSequences: WinningSequence[] = [
			{
				_id: '123',
				numbers: [1, 2, 3, 4, 5],
				stars: [4, 5],
				createdAt: new Date('2023-06-28T10:00:00Z')
			},
			{
				_id: '1234',
				numbers: [2, 3, 4, 10, 11],
				stars: [1, 5],
				createdAt: new Date('2023-06-29T08:30:00Z')
			}
		]
		const resp = getStatistique(winningSequences)
		expect(resp.numbers).toBeDefined()
		expect(resp.stars).toBeDefined()
		expect(Object.keys(resp.numbers)).toHaveLength(50)
		expect(Object.keys(resp.stars)).toHaveLength(12)
		Object.values(resp.numbers).forEach((item) => {
			expect(item).toHaveProperty('perCent')
			expect(item).toHaveProperty('nTimes')
			expect(item).toHaveProperty('lastSeenDate')
		})
		Object.values(resp.stars).forEach((item) => {
			expect(item).toHaveProperty('perCent')
			expect(item).toHaveProperty('nTimes')
			expect(item).toHaveProperty('lastSeenDate')
		})
	})
	it('test the function with 0 winningSequences', () => {
		const winningSequences: WinningSequence[] = []
		const resp = getStatistique(winningSequences)
		expect(resp.numbers).toBeDefined()
		expect(resp.stars).toBeDefined()
		expect(Object.keys(resp.numbers)).toHaveLength(50)
		expect(Object.keys(resp.stars)).toHaveLength(12)
		Object.values(resp.numbers).forEach((item) => {
			expect(item).toEqual({
				perCent: 0,
				nTimes: 0,
				lastSeenDate: 0
			})
		})
		Object.values(resp.stars).forEach((item) => {
			expect(item).toEqual({
				perCent: 0,
				nTimes: 0,
				lastSeenDate: 0
			})
		})
	})
	it('test the function with 2 winningSequences without createdAt => lastSeenDate remian 0 ', () => {
		const winningSequences: WinningSequence[] = [
			{
				_id: '123',
				numbers: [1, 2, 3, 4, 5],
				stars: [4, 5]
			},
			{
				_id: '1234',
				numbers: [2, 3, 4, 10, 11],
				stars: [1, 5]
			}
		]
		const resp = getStatistique(winningSequences)
		expect(resp.numbers).toBeDefined()
		expect(resp.stars).toBeDefined()
		expect(Object.keys(resp.numbers)).toHaveLength(50)
		expect(Object.keys(resp.stars)).toHaveLength(12)
		Object.values(resp.numbers).forEach((item) => {
			expect(item).toHaveProperty('perCent')
			expect(item).toHaveProperty('nTimes')
			expect(item).toHaveProperty('lastSeenDate', 0)
		})
		Object.values(resp.stars).forEach((item) => {
			expect(item).toHaveProperty('perCent')
			expect(item).toHaveProperty('nTimes')
			expect(item).toHaveProperty('lastSeenDate', 0)
		})
	})
})

describe('initializeStatistiqueObject', () => {
	it('should initialize statistics object for numbers', () => {
		const expectedOutput = {}
		for (let i = 1; i <= 50; i++) {
			expectedOutput[i.toString()] = {
				perCent: 0,
				nTimes: 0,
				lastSeenDate: +new Date(0)
			}
		}
		const result = initializeStatistiqueObject('numbers')

		expect(result).toBeDefined()
		expect(result).toEqual(expectedOutput)
		expect(Object.keys(result)).toHaveLength(50)
	})

	it('should initialize statistics object for stars', () => {
		const result = initializeStatistiqueObject('stars')
		const expectedOutput = {}
		for (let i = 1; i <= 12; i++) {
			expectedOutput[i.toString()] = {
				perCent: 0,
				nTimes: 0,
				lastSeenDate: +new Date(0)
			}
		}
		expect(Object.keys(result)).toHaveLength(12)
		expect(result).toBeDefined()
		expect(result).toEqual(expectedOutput)
	})

	it('should return an empty object for an invalid type', () => {
		const result = initializeStatistiqueObject('invalid')
		expect(result).toBeDefined()
		expect(result).toEqual({})
	})
})
