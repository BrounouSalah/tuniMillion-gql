import { Grille } from '@models'
import { compareGrille } from './winningSequence'
import { WinningSequence } from 'generator/graphql.schema'
import { calculateMoneyAmout } from './winningMoneyAmout'

export const simulation = (
	numbers: number[],
	stars: number[],
	cagonte: number,
	winningSequence: WinningSequence
) => {
	let partialGrille = {
		numbers: [...numbers],
		stars: [...stars]
	} as Partial<Grille>
	const resp = compareGrille(partialGrille, winningSequence)
	const response = calculateMoneyAmout(
		cagonte,
		resp.winningNumbers.length,
		resp.winningStars.length
	)
	return {
		winningNumbers: resp.winningNumbers,
		winningStars: resp.winningStars,
		winningValue: response
	}
}
