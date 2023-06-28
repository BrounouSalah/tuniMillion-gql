import { WinningSequence } from 'generator/graphql.schema';

export function getStatistique(winningSequences: WinningSequence[]) {
    function initializeStatistiqueNumbers(type: string) {
        const statistique = {};
        if (type === 'numbers') {
            for (let i = 1; i <= 50; i++) {
              statistique[i.toString()] = 0;
            }

        }
        if (type === 'stars') {
            for (let i = 1; i <= 12; i++) {
              statistique[i.toString()] = 0;
            }
        }
        return statistique;
      }
    const statistique = {numbers: initializeStatistiqueNumbers('numbers'), stars: initializeStatistiqueNumbers('stars') }
    for (const winningSequence of winningSequences) {
        for (const number of winningSequence.numbers) {
            statistique.numbers[number] = statistique.numbers[number] + +((((1 / winningSequences.length) * 100).toFixed(3)))
        }
        for (const stars of winningSequence.stars) {
            statistique.stars[stars] = statistique.stars[stars] + +(((1 / winningSequences.length) * 100).toFixed(3))
        }
    }
    return statistique
}

