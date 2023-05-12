import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import {
	Amount,
	Currency,
	Invoice,
	PaymentData,
	PaymentDataMethod,
	PaymentStatusEnum
} from 'generator/graphql.schema'

@Entity({
	name: 'paymen-method',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class PaymentMethod {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	userId: string

	@Expose()
	@Column()
	runPayId: String

	@Expose()
	@Column()
	status: PaymentStatusEnum

	@Expose()
	@Column()
	created: number

	@Expose()
	@Column()
	merchantId: String

	@Expose()
	@Column()
	amount: Amount

	@Expose()
	@Column()
	paymentData: PaymentData

	@Expose()
	@Column()
	invoice: Invoice

	@Expose()
	@Column()
	createdAt: number
	@Expose()
	@Column()
	updatedAt: number

	constructor(paymentMethod: Partial<PaymentMethod>) {
		if (paymentMethod) {
			Object.assign(
				this,
				plainToClass(PaymentMethod, paymentMethod, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.userId = this.userId || ''
			this.runPayId = this.runPayId || ''
			this.status = this.status || PaymentStatusEnum.Pending
			this.created = this.created || +new Date()
			this.merchantId = this.merchantId || ''
			this.amount = this.amount || { value: 0, currency: Currency.TND }
			this.paymentData = this.paymentData || {
				paymentMethod: PaymentDataMethod.runpay
			}
			this.invoice = this.invoice || {}
			this.createdAt = this.createdAt || +new Date()
			this.updatedAt = +new Date()
		}
	}
}
