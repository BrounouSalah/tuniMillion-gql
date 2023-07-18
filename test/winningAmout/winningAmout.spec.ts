import { calculateMoneyAmout } from 'utils/helpers/winningMoneyAmout'

describe('calculateMoneyAmout', () => {
	it('should return the correct amount for each winning combination', () => {
		// Test case 1: 5 winning numbers and 2 winning stars
		expect(calculateMoneyAmout(1000000, 5, 2)).toBe(1000000)

		// Test case 2: 5 winning numbers and 1 winning star
		expect(calculateMoneyAmout(1000000, 5, 1)).toBeCloseTo(11808)

		// Test case 3: 5 winning numbers and 0 winning stars
		expect(calculateMoneyAmout(1000000, 5, 0)).toBeCloseTo(7227)

		// Test case 4: 4 winning numbers and 2 winning stars
		expect(calculateMoneyAmout(1000000, 4, 2)).toBeCloseTo(3897)

		// Test case 5: 4 winning numbers and 1 winning star
		expect(calculateMoneyAmout(1000000, 4, 1)).toBeCloseTo(360)

		// Test case 6: 3 winning numbers and 2 winning stars
		expect(calculateMoneyAmout(1000000, 3, 2)).toBeCloseTo(171)

		// Test case 7: 4 winning numbers and 0 winning stars
		expect(calculateMoneyAmout(1000000, 4, 0)).toBeCloseTo(117)

		// Test case 8: 2 winning numbers and 2 winning stars
		expect(calculateMoneyAmout(1000000, 2, 2)).toBeCloseTo(42)

		// Test case 9: 3 winning numbers and 1 winning star
		expect(calculateMoneyAmout(1000000, 3, 1)).toBeCloseTo(33.78)

		// Test case 10: 3 winning numbers and 0 winning stars
		expect(calculateMoneyAmout(1000000, 3, 0)).toBeCloseTo(27.96)

		// Test case 11: 1 winning number and 2 winning stars
		expect(calculateMoneyAmout(1000000, 1, 2)).toBeCloseTo(20.25)

		// Test case 12: 2 winning numbers and 1 winning star
		expect(calculateMoneyAmout(1000000, 2, 1)).toBeCloseTo(16.74)

		// Test case 13: 2 winning numbers and 0 winning stars
		expect(calculateMoneyAmout(1000000, 2, 0)).toBeCloseTo(7.5)

		// Test case 14: No winning numbers
		expect(calculateMoneyAmout(1000000, 0, 0)).toBe(0)
	})
})
