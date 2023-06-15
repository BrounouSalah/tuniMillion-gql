import { Args, Mutation, Query, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { Grille } from '../models/grille.entity'
import {
	Combinations,
	CreateGrilleInput,
	Status,
	UpdateGrilleInput
} from 'generator/graphql.schema'
import { ApolloError, ForbiddenError } from 'apollo-server-express'
import { NotFoundException } from '@nestjs/common'
import { User } from '@models'

type CombinationsBasic = {
	numbers: number[]
	stars: number[]
	tuniMillionsCode?: string
}

export class GrilleResolver {
	constructor() {}

	async generateCombinations(
		starArray: number[],
		numberArray: number[],
		prise
	): Promise<any> {
		const combinations: CombinationsBasic[] = []

		// Generate all possible combinations of 5 numbers
		const numberCombos = this.combinationsOf(numberArray, 5)

		// Generate all possible combinations of 2 stars
		const starCombos = this.combinationsOf(starArray, 2)
		const lastPlayedGrille = await getMongoRepository(Grille).findOne({
			where: {
				deletedAt: null,
				prise: prise > 10 ? { $gt: 10 } : { $lte: 10 }
			},
			order: {
				createdAt: 'DESC'
			}
		})
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
			tuniMillionsCode: this.generateConsecutiveStrings(depart, index)
		}))
		return combWithCode
	}

	combinationsOf<T>(arr: T[], count: number): T[][] {
		if (count === 0) {
			return [[]]
		}

		return arr.flatMap((val, idx) => {
			const subcombos = this.combinationsOf(arr.slice(idx + 1), count - 1)
			return subcombos.map((combo) => [val, ...combo])
		})
	}

	generateConsecutiveStrings(
		start: string,

		number: number
	): string {
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
			consonants = this.incrementConsonants(consonants)
			currentNumber = currentNumber - 100000
			return `F ${consonants} ${currentNumber.toString().padStart(5, '0')}`
		}
		const currentString = `F ${consonants} ${currentNumber
			.toString()
			.padStart(5, '0')}`
		return currentString
	}

	incrementConsonants(consonants: string) {
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

	@Mutation()
	async createGrille(
		@Args('input') input: CreateGrilleInput,
		@Context('currentUser') currentUser: User
	): Promise<Grille> {
		const { _id } = currentUser
		input.userId = _id

		const gridPrice = [
			[
				{ price: 5, prise: 1 },
				{ price: 30, prise: 6 },
				{ price: 165, prise: 21 },
				{ price: 280, prise: 56 },
				{ price: 630, prise: 126 },
				{ price: 1260, prise: 252 }
			],
			[
				{ price: 15, prise: 3 },
				{ price: 90, prise: 18 },
				{ price: 315, prise: 63 },
				{ price: 840, prise: 168 },
				{ price: 1890, prise: 378 }
			],
			[
				{ price: 30, prise: 6 },
				{ price: 180, prise: 36 },
				{ price: 630, prise: 126 },
				{ price: 1680, prise: 336 }
			],
			[
				{ price: 50, prise: 10 },
				{ price: 300, prise: 60 },
				{ price: 1050, prise: 210 }
			],
			[
				{ price: 75, prise: 15 },
				{ price: 550, prise: 90 },
				{ price: 1575, prise: 315 }
			],
			[
				{ price: 105, prise: 21 },
				{ price: 630, prise: 126 }
			],
			[
				{ price: 140, prise: 28 },
				{ price: 840, prise: 168 }
			],
			[
				{ price: 180, prise: 36 },
				{ price: 1080, prise: 216 }
			],
			[
				{ price: 225, prise: 45 },
				{ price: 1350, prise: 270 }
			],
			[
				{ price: 275, prise: 55 },
				{ price: 1650, prise: 330 }
			],
			[
				{ price: 330, prise: 66 },
				{ price: 1980, prise: 396 }
			]
		]
		const { numbers, stars } = input
		 
		if (numbers.some((number) => number < 1 || number > 50) || new Set(numbers).size !== numbers.length || numbers.length > 10 ) {
			throw  new ForbiddenError('Invalid numbers. Please provide a unique set of numbers between 1 and 50 and a maximum of 10 numbers..');
		  }
		
			

		  if (stars.some((star) => star < 1 || star > 12) || new Set(stars).size !== stars.length) {
			throw new ForbiddenError('Invalid stars. Please provide a unique set of stars between 1 and 12.');
		  }
		
		if (!(numbers.length > 4 && stars.length > 1))
			throw new ForbiddenError('invalid input')
		if (numbers.length > 4 && stars.length > 1) {
			let object = gridPrice[stars.length - 2][numbers.length - 5]
			if (!object) throw new ForbiddenError('invalid input')
			
			type Combinations = {
				number: number[]
				stars: number[]
				tuniMillionsCode: string
			}[]
			const combinations: any = await this.generateCombinations(
				stars,
				numbers,
				object.prise
			)
			

			return await getMongoRepository(Grille).save(
				new Grille({
					...input,
					prise: object.prise,
					price: object.price,
					combinations
				})
			)
			
			}
			
			
	}

	@Query()
	async getAllGrilles(): Promise<Grille[]> {
		return getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null
			}
		})
	}

	@Query()
	async getAllGrillesByStatus(
		@Args('status') status: Status
	): Promise<Grille[]> {
		return getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null,
				status: status
			}
		})
	}

	@Query()
	async getAllGrillesByUserId(
		@Args('userId') userId: string
	): Promise<Grille[]> {
		return await getMongoRepository(Grille).find({
			cache: true,
			where: {
				deletedAt: null,
				userId
			}
		})
	}

	@Query()
	async getGrille(@Args('id') id: string): Promise<Grille> {
		return getMongoRepository(Grille).findOne({
			where: {
				_id: id,
				deletedAt: null
			}
		})
	}

	@Mutation()
	async deleteGrille(@Args('_id') _id: string): Promise<Boolean> {
		// const grille = await  getMongoRepository(Grille).softDelete({ _id})
		//  grille.deletedAt = new Date(Date.now())
		// return grille

		const grille = await getMongoRepository(Grille).findOne({ _id })

		if (!grille) {
			throw new NotFoundException('Grille not found')
		}
		grille.deletedAt = new Date(Date.now())

		const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
			{ _id: grille._id },
			{ $set: grille },
			{ returnOriginal: false }
		)
		return updateGrille ? true : false
	}

	@Mutation()
	async updateGrille(
		@Args('userId') userId: string,
		@Args('input') input: UpdateGrilleInput
	): Promise<boolean> {
		try {
			const grille = await getMongoRepository(Grille).findOne({ userId })

			if (!grille) {
				throw new ForbiddenError('grille not found.')
			}

			const updateGrille = await getMongoRepository(Grille).findOneAndUpdate(
				{ userId: userId },
				{ $set: input },
				{ returnOriginal: false }
			)
			return updateGrille ? true : false
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
