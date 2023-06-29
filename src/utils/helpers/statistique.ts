import { WinningSequence } from 'generator/graphql.schema'

export function initializeStatistiqueObject(type: string) {
	const obj = {}
	if (type === 'numbers') {
		for (let i = 1; i <= 50; i++) {
			obj[i.toString()] = {
				perCent: 0,
				nTimes: 0,
				lastSeenDate: +new Date(0)
			}
		}
	}
	if (type === 'stars') {
		for (let i = 1; i <= 12; i++) {
			obj[i.toString()] = {
				perCent: 0,
				nTimes: 0,
				lastSeenDate: +new Date(0)
			}
		}
	}
	return obj
}
export function getStatistique(winningSequences: WinningSequence[]) {
	const statistique = {
		numbers: initializeStatistiqueObject('numbers'),
		stars: initializeStatistiqueObject('stars')
	}
	for (const winningSequence of winningSequences) {
		for (const number of winningSequence.numbers) {
			statistique.numbers[number].perCent =
				statistique.numbers[number].perCent +
				+((1 / winningSequences.length) * 100).toFixed(3)
			statistique.numbers[number].nTimes =
				statistique.numbers[number].nTimes + 1
			if (
				+new Date(winningSequence.createdAt) >
				+new Date(statistique.numbers[number].lastSeenDate)
			) {
				statistique.numbers[number].lastSeenDate = winningSequence.createdAt
			}
		}
		for (const stars of winningSequence.stars) {
			statistique.stars[stars].perCent =
				statistique.stars[stars].perCent +
				+((1 / winningSequences.length) * 100).toFixed(3)
			statistique.stars[stars].nTimes = statistique.stars[stars].nTimes + 1
			if (
				+new Date(winningSequence.createdAt) >
				+new Date(statistique.stars[stars].lastSeenDate)
			) {
				statistique.stars[stars].lastSeenDate = winningSequence.createdAt
			}
		}
	}
	return statistique
}
