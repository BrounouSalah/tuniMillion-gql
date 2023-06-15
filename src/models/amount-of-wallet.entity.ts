import { Expose, plainToClass } from "class-transformer";
import { Currency, WalletInCommingTransaction, WalletOutCommingTransaction } from "generator/graphql.schema";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import * as uuid from 'uuid';


@Entity({
	name: 'amount-of-wallet',
	orderBy: {
		createdAt: 'ASC'
	}
})


export class AmountOfWallet {

    @Expose()
	@ObjectIdColumn()
	_id: string

    @Expose()
    @Column()
    userId:string
    
    @Expose()
    @Column()
    totalAmount: number

    @Expose()
    @Column()
    amount: number


    @Expose()
    @Column()
    inCommingTransactions: WalletInCommingTransaction[]

    @Expose()
    @Column()
    outGoingTransactions: WalletOutCommingTransaction[]

    @Expose()   
    @Column()
    currency:Currency

    @Expose()
    @Column()
    createdAt:Date

    @Expose()
    @Column()
    updatedAt:Date

    @Expose()
    @Column()
    deletedAt:Date
   

    constructor(amountOfWallet: Partial<AmountOfWallet>) {
        if (amountOfWallet){
            Object.assign(this, plainToClass(AmountOfWallet, amountOfWallet, {excludeExtraneousValues: true}))

			this._id = this._id || uuid.v1()
            this.totalAmount = this.totalAmount || 0
            this.inCommingTransactions = this.inCommingTransactions || []
            this.outGoingTransactions = this.outGoingTransactions || []
            this.currency = this.currency || Currency.TND
            this.deletedAt = this.deletedAt || null
            this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
        }
       

    }


}