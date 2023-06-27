export const compareValues = (
	reste: number | null,
	montantPaiement: number,
	limit: number
) => {
	if (reste === null) {
		if (montantPaiement > limit) {
			return -1
		}
		return limit - montantPaiement
	} else {
		if (montantPaiement > reste) {
			return -1
		}
		return reste - montantPaiement
	}
}
