import { Grille, WinningCode } from 'generator/graphql.schema'

export function GetRandomCombination(grilles: Grille[]) {
	if (grilles.length === 0) {
		return null
	}
	let arrCombinations: WinningCode[] = []
	for (let grille of grilles) {
		if (grille.combinations && grille.combinations.length > 0) {
			for (let combination of grille.combinations) {
				arrCombinations.push({
					tunimillionCode: combination.tuniMillionsCode,
					grilleId: grille._id,
					userId: grille.userId
				})
			}
		}
		continue
	}
	if (arrCombinations.length === 0) return null
	const randomNum = Math.floor(Math.random() * arrCombinations.length)
	const winningCode = arrCombinations[randomNum]

	return {
		grilleId: winningCode.grilleId,
		userId: winningCode.userId,
		winningCode: winningCode.tunimillionCode
	}
}
