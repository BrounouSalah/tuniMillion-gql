import { Grille } from 'generator/graphql.schema'
export const generateConsecutiveStrings = (
	start: string,

	number: number
): string => {
	const end = 'F ZZZ 99999'

	const endNumber = Number(end.slice(-5))
	const startNumber = Number(start.slice(-5)) + 1
	let currentNumber = startNumber + number

	let consonants = start.slice(2, 5) // Retrieve the consonants from the start input string

	// Handle wraparound of number part
	if (currentNumber > endNumber) {
		if (consonants === 'ZZZ') {
			return null // Reached the end, exit loop
		}
		consonants = incrementConsonants(consonants)
		currentNumber = currentNumber - 100000
		return `F ${consonants} ${currentNumber.toString().padStart(5, '0')}`
	}
	const currentString = `F ${consonants} ${currentNumber
		.toString()
		.padStart(5, '0')}`
	return currentString
}

export const incrementConsonants = (consonants: string) => {
	const validConsonants = [
		'B',
		'C',
		'D',
		'F',
		'G',
		'H',
		'J',
		'K',
		'L',
		'M',
		'N',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'V',
		'W',
		'X',
		'Y',
		'Z'
	]
	const consonantArray = Array.from(consonants)

	let carry = true // Flag to indicate carryover to the subsequent letter

	for (let i = consonantArray.length - 1; i >= 0; i--) {
		const char = consonantArray[i].toUpperCase()
		const currentIndex = validConsonants.indexOf(char)

		if (currentIndex === -1) {
			continue // Skip vowels or non-consonants
		}

		let nextIndex = (currentIndex + (carry ? 1 : 0)) % validConsonants.length

		if (carry && nextIndex === 0) {
			carry = true // Set carryover flag if transitioning from 'Z' to 'B'
		} else {
			carry = false
		}

		consonantArray[i] = validConsonants[nextIndex]
	}

	return consonantArray.join('')
}
export const combinationsOf = <T>(arr: T[], count: number): T[][] => {
	if (count === 0) {
		return [[]]
	}

	return arr.flatMap((val, idx) => {
		const subcombos = combinationsOf(arr.slice(idx + 1), count - 1)
		return subcombos.map((combo) => [val, ...combo])
	})
}

export const generateCombinations = async (
	starArray: number[],
	numberArray: number[],
	prise,
	lastPlayedGrille?: Grille
): Promise<any> => {
	type CombinationsBasic = {
		numbers: number[]
		stars: number[]
		tuniMillionsCode?: string
	}
	const combinations: CombinationsBasic[] = []

	// Generate all possible combinations of 5 numbers
	const numberCombos = combinationsOf(numberArray, 5)

	// Generate all possible combinations of 2 stars
	const starCombos = combinationsOf(starArray, 2)

	let depart
	if (!lastPlayedGrille) {
		depart = prise > 10 ? 'F WBB 00000' : 'F BBB 00000'
	} else {
		depart =
			lastPlayedGrille.combinations[lastPlayedGrille.combinations.length - 1]
				.tuniMillionsCode
	}
	// Combine number and star combos to form valid combinations
	for (const numbers of numberCombos) {
		for (const stars of starCombos) {
			combinations.push({ numbers, stars })
		}
	}

	let combWithCode = combinations.map((el, index) => ({
		numbers: el.numbers,
		stars: el.stars,
		tuniMillionsCode: generateConsecutiveStrings(depart, index)
	}))
	return combWithCode
}

export const gridPrices = [
	[
		{ price: 7.5, prise: 1 },
		{ price: 45, prise: 6 },
		{ price: 157.5, prise: 21 },
		{ price: 420, prise: 56 },
		{ price: 945, prise: 126 },
		{ price: 1890, prise: 252 }
	],
	[
		{ price: 22.5, prise: 3 },
		{ price: 135, prise: 18 },
		{ price: 472.5, prise: 63 },
		{ price: 1260, prise: 168 },
		{ price: 2835, prise: 378 }
	],
	[
		{ price: 45, prise: 6 },
		{ price: 270, prise: 36 },
		{ price: 945, prise: 126 },
		{ price: 2520, prise: 336 }
	],
	[
		{ price: 75, prise: 10 },
		{ price: 450, prise: 60 },
		{ price: 1575, prise: 210 }
	],
	[
		{ price: 112.5, prise: 15 },
		{ price: 675, prise: 90 },
		{ price: 2162.5, prise: 315 }
	],
	[
		{ price: 157.5, prise: 21 },
		{ price: 945, prise: 126 }
	],
	[
		{ price: 210, prise: 28 },
		{ price: 1260, prise: 168 }
	],
	[
		{ price: 270, prise: 36 },
		{ price: 1620, prise: 216 }
	],
	[
		{ price: 337.5, prise: 45 },
		{ price: 2025, prise: 270 }
	],
	[
		{ price: 412.5, prise: 55 },
		{ price: 2475, prise: 330 }
	],
	[
		{ price: 495, prise: 66 },
		{ price: 2970, prise: 396 }
	]
]
