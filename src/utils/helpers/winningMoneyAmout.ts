const multipliers = {
	winningNumbers: {
		5: { 2: 1, 1: 0.011808, 0: 0.007227 },
		4: { 2: 0.003897, 1: 0.00036, 0: 0.000117 },
		3: { 2: 0.000171, 1: 0.00003378, 0: 0.00002796 },
		2: { 2: 0.000042, 1: 0.00001674, 0: 0.0000075 },
		1: { 2: 0.00002025 }
	}
}

export const calculateMoneyAmout = (
	cagnoteAmount: number,
	winningNumbers: number,
	winningStars: number
): number => {
	console.log(cagnoteAmount, winningNumbers, winningStars)
	const winningNumberMultiplier = multipliers.winningNumbers[winningNumbers]
	console.log(winningNumberMultiplier)
	if (winningNumberMultiplier && winningNumberMultiplier[winningStars]) {
		return cagnoteAmount * winningNumberMultiplier[winningStars]
	} else {
		return 0
	}
}
