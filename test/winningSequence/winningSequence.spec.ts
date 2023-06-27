import { WinningRank } from 'generator/graphql.schema'
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
