import { Grille } from 'generator/graphql.schema'
import {
	combinationsOf,
	generateCombinations,
	generateConsecutiveStrings
} from 'utils/helpers/grille'

describe('testing grille coimbination and generate Consecutive Strings without lastPlayedGrille', () => {
	it('test combinations creation when prise < 10 and stars and numbers exists', async () => {
		const res = await generateCombinations([1, 2, 3], [1, 2, 3, 4, 5], 6)

		expect(res).toHaveLength(3)
		expect(Array.isArray(res)).toBeTruthy()
	})
	it('test combinations creation when prise > 10 and stars and numbers exists ', async () => {
		const res = await generateCombinations([1, 2, 3], [1, 2, 3, 4, 5], 10)
		expect(res).toHaveLength(3)
		expect(Array.isArray(res)).toBeTruthy()
	})
	it('test combinations creation when prise < 10 and stars.length = 1 and numbers exists ', async () => {
		const res = await generateCombinations([1], [1, 2, 3, 4, 5], 6)
		expect(res).toEqual([])
	})

	it('test combinations creation when prise < 10 and stars and numbers do not exist ', async () => {
		const res = await generateCombinations([], [], 6)

		expect(res).toHaveLength(0)
	})
})

describe('testing grille coimbination and generate Consecutive Strings with lastPlayedGrille', () => {
	const grille: Grille = {
		_id: '123',
		userId: 'userId',
		combinations: [
			{
				tuniMillionsCode: 'F BBB 00001'
			},
			{
				tuniMillionsCode: 'F BBB 00010'
			}
		]
	}
	it('test combinations creation when prise < 10 and stars and numbers exists', async () => {
		const res = await generateCombinations(
			[1, 2, 3],
			[1, 2, 3, 4, 5],
			6,
			grille
		)

		expect(res).toHaveLength(3)
		expect(Array.isArray(res)).toBeTruthy()
	})
	it('test combinations creation when prise > 10 and stars and numbers exists ', async () => {
		const res = await generateCombinations(
			[1, 2, 3],
			[1, 2, 3, 4, 5],
			10,
			grille
		)
		expect(res).toHaveLength(3)
		expect(Array.isArray(res)).toBeTruthy()
	})
	it('test combinations creation when prise < 10 and stars.length = 1 and numbers exists ', async () => {
		const res = await generateCombinations([1], [1, 2, 3, 4, 5], 6, grille)
		expect(res).toEqual([])
	})

	it('test combinations creation when prise < 10 and stars and numbers do not exist ', async () => {
		const res = await generateCombinations([], [], 6, grille)

		expect(res).toHaveLength(0)
	})
})

describe('generateCode Tests', () => {
	it('test generate Consecutive Strings correctly', async () => {
		const start = 'F BBB 00000'
		const number = 5
		const expectedResult = 'F BBB 00006'
		const res = generateConsecutiveStrings(start, number)
		expect(res).toBe(expectedResult)
	})

	it('test generate Consecutive Strings correctly', async () => {
		const start = 'F BBB 99999'
		const number = 1
		const expectedResult = 'F BBC 00001'

		const res = generateConsecutiveStrings(start, number)
		expect(res).toBe(expectedResult)
	})

	it('test generate Consecutive Strings should return null when reaching the end', async () => {
		const start = 'F ZZZ 99999'
		const number = 1
		const res = generateConsecutiveStrings(start, number)
		expect(res).toBeNull()
	})
})

describe('combinationsOf', () => {
	it('should return an array of all combinations of given elements', () => {
		const arr = [1, 2, 3, 4]
		const count = 2
		const expectedCombinations = [
			[1, 2],
			[1, 3],
			[1, 4],
			[2, 3],
			[2, 4],
			[3, 4]
		]

		const result = combinationsOf(arr, count)

		expect(result).toEqual(expectedCombinations)
	})

	it('should return an empty array if count is 0', () => {
		const arr = [1, 2, 3]
		const count = 0

		const result = combinationsOf(arr, count)

		expect(result).toEqual([[]])
	})

	it('should return an empty array if arr is empty', () => {
		const arr: number[] = []
		const count = 2

		const result = combinationsOf(arr, count)

		expect(result).toEqual([])
	})
})

describe('combinationsOf', () => {
	it('should return an array of all combinations of given elements', () => {
		const arr = ['A', 'B', 'C']
		const count = 2
		const expectedCombinations = [
			['A', 'B'],
			['A', 'C'],
			['B', 'C']
		]

		const result = combinationsOf(arr, count)

		expect(result).toEqual(expectedCombinations)
	})

	it('should return an empty array if count is 0', () => {
		const arr = ['A', 'B', 'C']
		const count = 0

		const result = combinationsOf(arr, count)

		expect(result).toEqual([[]])
	})

	it('should return an empty array if arr is empty', () => {
		const arr: string[] = []
		const count = 2

		const result = combinationsOf(arr, count)

		expect(result).toEqual([])
	})

	it('should return an empty array if count is greater than the length of arr', () => {
		const arr = ['A', 'B']
		const count = 3

		const result = combinationsOf(arr, count)

		expect(result).toEqual([])
	})
})
