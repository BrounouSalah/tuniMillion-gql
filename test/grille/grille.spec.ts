import { TestingModule, Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AppModule } from '../../src/app.module'
import { AmountOfWalletResolver, GrilleResolver } from '../../src/resolvers'
import { Repository } from 'typeorm'
import { Grille } from '../../src/models'

const initModule = async ()=> {
    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        providers: [
            GrilleResolver,
            {
                provide: getRepositoryToken(Grille),
                useClass: Repository
            },
            AmountOfWalletResolver
        ]
    }).compile()
    return module
}

describe('testing grille coimbination and generate Consecutive Strings', () => {
	it('test combinations creation when prise < 10 and stars and numbers exists', async () => {
		const res = await (await initModule())
        .get<GrilleResolver>(GrilleResolver)
        .generateCombinations([1, 2, 3], [1, 2, 3, 4, 5], 6)   
		expect(res).toHaveLength(3)
        expect(Array.isArray(res)).toBeTruthy()
     
       
	})
	it('test combinations creation when prise > 10 and stars and numbers exists', async () => {
	

		const res = await (await initModule())
			.get<GrilleResolver>(GrilleResolver)
			.generateCombinations([1, 2, 3], [1, 2, 3, 4, 5], 10)
        expect(res).toHaveLength(3)
        expect(Array.isArray(res)).toBeTruthy()
		
	})
	it('test combinations creation when prise < 10 and stars.length = 1 and numbers exists', async () => {


		const res = await (await initModule())
			.get<GrilleResolver>(GrilleResolver)
			.generateCombinations([1], [1, 2, 3, 4, 5], 6)
            expect(res).toEqual([]);
		
	})

    it('test combinations creation when prise < 10 and stars and numbers do not exist', async () => {
        const res = await (await initModule())
          .get<GrilleResolver>(GrilleResolver)
          .generateCombinations([], [], 6);
      
        expect(res).toHaveLength(0);
      })

      it('test generate Consecutive Strings correctly', async () => {
	
        const start = 'F BBB 00000';
        const number = 5;
        const expectedResult = 'F BBB 00006';

		const res = await (await initModule())
			.get<GrilleResolver>(GrilleResolver)
			.generateConsecutiveStrings(start, number)
            expect(res).toBe(expectedResult)

		
	})

    it('test generate Consecutive Strings correctly', async () => {
	
        const start = 'F BBB 99999';
        const number = 1;
        const expectedResult = 'F BBC 00001';

		const res = await (await initModule())
			.get<GrilleResolver>(GrilleResolver)
			.generateConsecutiveStrings(start, number)
            expect(res).toBe(expectedResult)

		
	})
    
    it('test generate Consecutive Strings should return null when reaching the end', async () => {
	
        const start = 'F ZZZ 99999';
        const number = 1;
        

		const res = await (await initModule())
			.get<GrilleResolver>(GrilleResolver)
			.generateConsecutiveStrings(start, number)
            expect(res).toBeNull();

		
	})

      
 
      
      
    
      
})
