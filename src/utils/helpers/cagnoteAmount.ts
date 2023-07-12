import { Grille } from "generator/graphql.schema";



export const TotalCagnoteAmount =(grilles:Grille[])  =>{
    let totalCAG_CUMM = 0;
    let totalM75 =0;
    let totalTVA_CUMM=0;
    let totalRunpayCost=0;
    let TotalBenefiet=0;
    let total_ht= 0;


    for (const grille of grilles) {
        
        const metaData = grille.metaData;
       
          totalCAG_CUMM += metaData.CAG_CUMM ?? 0
          totalM75 += metaData.M75 ?? 0
          totalTVA_CUMM += metaData.TVA_CUMM ?? 0
          totalRunpayCost += metaData.RunpayCost ?? 0
          TotalBenefiet += metaData.benefiet ?? 0
          total_ht += metaData.total_ht ?? 0

        
      }
    
       return {totalCAG_CUMM, totalM75, totalTVA_CUMM, totalRunpayCost, TotalBenefiet, total_ht};
}