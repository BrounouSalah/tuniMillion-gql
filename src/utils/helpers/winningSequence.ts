import { WinningRank } from 'generator/graphql.schema'

export const compareGrilleWithWinningSequence = (grille, winningSequence) => {
	const matchingNumbers = grille.numbers.filter((number) =>
		winningSequence.numbers.includes(number)
	)
	const matchingStars = grille.stars.filter((star) =>
		winningSequence.stars.includes(star)
	)

	const numMatchingNumbers = matchingNumbers.length
	const numMatchingStars = matchingStars.length
	if (numMatchingNumbers === 5 && numMatchingStars === 2) {
		return WinningRank.FIRST
	} else if (numMatchingNumbers === 5 && numMatchingStars === 1) {
		return WinningRank.SECOND
	} else if (numMatchingNumbers === 5 && numMatchingStars === 0) {
		return WinningRank.THIRD
	} else if (numMatchingNumbers === 4 && numMatchingStars === 2) {
		return WinningRank.FOURTH
	} else if (numMatchingNumbers === 4 && numMatchingStars === 1) {
		return WinningRank.FIFTH
	} else if (numMatchingNumbers === 3 && numMatchingStars === 2) {
		return WinningRank.SIXTH
	} else if (numMatchingNumbers === 4 && numMatchingStars === 0) {
		return WinningRank.SEVENTH
	} else if (numMatchingNumbers === 2 && numMatchingStars === 2) {
		return WinningRank.EIGHTH
	} else if (numMatchingNumbers === 3 && numMatchingStars === 1) {
		return WinningRank.NINTH
	} else if (numMatchingNumbers === 3 && numMatchingStars === 0) {
		return WinningRank.TENTH
	} else if (numMatchingNumbers === 1 && numMatchingStars === 2) {
		return WinningRank.ELEVENTH
	} else if (numMatchingNumbers === 2 && numMatchingStars === 1) {
		return WinningRank.TWELFTH
	} else if (numMatchingNumbers === 2 && numMatchingStars === 0) {
		return WinningRank.THIRTEENTH
	} else {
		return WinningRank.NONE
	}
}