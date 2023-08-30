
const CagnoteLimit =1000000
const multipliers = {
	winningNumbers: {
		5: {  1: 1.180811765, 0: 0.122652941 },
		4: { 2: 0.007641176, 1: 0.000705882, 0: 0.000229412 },
		3: { 2: 0.000335294, 1: 0.0000662353, 0: 0.00000548235 },
		2: { 2: 0.0000823529, 1: 0.0000328235, 0: 0.0000235294 },
		1: { 2: 0.0000397059 },
	
	}
}

const Amounts={
	WinningAmounts:{
		5: {  1: 11808.000, 0: 7227.000 },
		4: { 2: 3897.000, 1: 360.000, 0: 117.000 },
		3: { 2: 171.000, 1: 33.780, 0: 27.960},
		2: { 2: 42.000, 1: 16.740, 0: 7.500 },
		1: { 2: 20.250 },
		
	}

}

export const calculateMoneyAmout = (
	cagnoteAmount: number,
	winningNumbers: number,
	winningStars: number
): number => {
	if (cagnoteAmount > CagnoteLimit){
	const winningNumberMultiplier = multipliers.winningNumbers[winningNumbers]
	if (winningNumberMultiplier && winningNumberMultiplier[winningStars]) {
		return cagnoteAmount * (winningNumberMultiplier[winningStars])/100
	} 
}	else if (cagnoteAmount<= CagnoteLimit){
		const winningNumberMultiplier = Amounts.WinningAmounts[winningNumbers]
		if (winningNumberMultiplier && winningNumberMultiplier[winningStars]) {
			return winningNumberMultiplier[winningStars]
		}
}

		return 0

}