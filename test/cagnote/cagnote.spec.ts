import { Grille, MetaData } from 'generator/graphql.schema'
import {TotalCagnoteAmount} from 'utils/helpers/cagnoteAmount'

describe('testing cagnote amount', () => {
    it('test cagnote amount', async () => {
        const grille1: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
                M75: 1,
                TVA_CUMM: 2.2,
                RunpayCost: 11,
                CAG_CUMM: 28.11,
                benefiet: 5.2,
                total_ht: 80.22 
            }
        }
        const grille2: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
                M75: 12.55,
                TVA_CUMM: 1.44,
                RunpayCost: 11,
                CAG_CUMM: 22.11,
                benefiet: 5.2,
                total_ht: 50.154
            }
        }
        const result = {
            totalCAG_CUMM: 50.22,
            totalM75: 13.55,
            totalTVA_CUMM: 3.64,
            totalRunpayCost: 22,
            TotalBenefiet: 10.4,
            total_ht: 130.374
        }

        const response= TotalCagnoteAmount([grille1,grille2])
        expect(response).toEqual(result)
        expect (response).toHaveProperty("totalCAG_CUMM", 50.22)
        expect (response).toHaveProperty("totalM75", 13.55)
        expect (response).toHaveProperty("totalTVA_CUMM", 3.64)
        expect (response).toHaveProperty("totalRunpayCost", 22)
        expect (response).toHaveProperty("TotalBenefiet", 10.4)
        expect (response).toHaveProperty("total_ht", 130.374)



        
        
    })

    it('test cagnote amount return 0 to each property if there is no object grille ', async () => {
        const grille1: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
                M75: 1,
                TVA_CUMM: 2.2,
                RunpayCost: 11,
                CAG_CUMM: 28.11,
                benefiet: 5.2,
                total_ht: 80.22 
            }
        }
        const grille2: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
                M75: 12.55,
                TVA_CUMM: 1.44,
                RunpayCost: 11,
                CAG_CUMM: 22.11,
                benefiet: 5.2,
                total_ht: 50.154
            }
        }
        const result = {
            totalCAG_CUMM: 0,
            totalM75: 0,
            totalTVA_CUMM: 0,
            totalRunpayCost: 0,
            TotalBenefiet: 0,
            total_ht: 0
        }

        const response= TotalCagnoteAmount([])
        expect(response).toEqual(result)
        expect (response).toHaveProperty("totalCAG_CUMM", 0)
        expect (response).toHaveProperty("totalM75", 0)
        expect (response).toHaveProperty("totalTVA_CUMM", 0)
        expect (response).toHaveProperty("totalRunpayCost", 0)
        expect (response).toHaveProperty("TotalBenefiet", 0)
        expect (response).toHaveProperty("total_ht", 0)



        
        
    })
    it('test cagnote amount with messing property  ', async () => {
        const grille1: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
                M75: 1,
                TVA_CUMM: 2.2,
                RunpayCost: 11,
                CAG_CUMM: 28.11,
                benefiet: 5.2,
                total_ht: 80.22 
            }
        }
        const grille2: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
               
                RunpayCost: 11,
                CAG_CUMM: 22.11,
                benefiet: 5.2,
                total_ht: 50.154
            } as MetaData
        }
        const result = {
            totalCAG_CUMM: 50.22,
            totalM75: 1,
            totalTVA_CUMM: 2.2,
            totalRunpayCost: 22,
            TotalBenefiet: 10.4,
            total_ht: 130.374
        }

        const response= TotalCagnoteAmount([grille1,grille2])
        expect(response).toEqual(result)
        expect (response).toHaveProperty("totalCAG_CUMM", 50.22)
        expect (response).toHaveProperty("totalM75", 1)
        expect (response).toHaveProperty("totalTVA_CUMM", 2.2)
        expect (response).toHaveProperty("totalRunpayCost", 22)
        expect (response).toHaveProperty("TotalBenefiet", 10.4)
        expect (response).toHaveProperty("total_ht", 130.374)



        
        
    })
    it('test cagnote amount return 0 if grille is empty ', async () => {
        const grille1: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
              
            } as MetaData
        }
        const grille2: Grille={
            _id: '123',
            userId: 'userId',
            metaData:{
              
            } as MetaData
        }
        const result = {
            totalCAG_CUMM: 0,
            totalM75: 0,
            totalTVA_CUMM: 0,
            totalRunpayCost: 0,
            TotalBenefiet: 0,
            total_ht: 0
        }

        const response= TotalCagnoteAmount([grille1,grille2])
        expect(response).toEqual(result)
        expect (response).toHaveProperty("totalCAG_CUMM", 0)
        expect (response).toHaveProperty("totalM75", 0)
        expect (response).toHaveProperty("totalTVA_CUMM", 0)
        expect (response).toHaveProperty("totalRunpayCost", 0)
        expect (response).toHaveProperty("TotalBenefiet", 0)
        expect (response).toHaveProperty("total_ht", 0)



        
        
    })
})