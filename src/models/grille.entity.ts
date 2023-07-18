import { Expose, plainToClass } from 'class-transformer'
import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm'
import * as uuid from 'uuid'
import { MetaData, PaymentStatus, Status } from '../generator/graphql.schema'
import { Combinations } from '../generator/graphql.schema'

@Entity({
	name: 'grilles',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class Grille {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	userId: string

	@Expose()
	@Column()
	winningSequenceId: string

	@Expose()
	@Column()
	numbers: number[]

	@Expose()
	@Column()
	stars: number[]

	@Expose()
	@Column()
	status: Status

	@Expose()
	@Column()
	paymentStatus: PaymentStatus

	@Expose()
	@Column()
	randomCode: string

	@Expose()
	@Column()
	prise: number

	@Expose()
	@Column()
	price: number

	@Expose()
	@Column()
	combinations: Combinations[]

	@Expose()
	@Column()
	metaData: MetaData

	@Expose()
	@Column()
	winningStars: number[]

	@Expose()
	@Column()
	winningNumbers: number[]

	@Expose()
	@Column()
	winningPrice: number

	@Expose()
	@Column()
	createdAt: Date

	@Expose()
	@Column()
	updatedAt: Date

	@Expose()
	@Column()
	deletedAt: Date

	constructor(grille: Partial<Grille>) {
		if (grille) {
			Object.assign(
				this,
				plainToClass(Grille, grille, { excludeExtraneousValues: true })
			)

			this._id = this._id || uuid.v1()
			this.winningSequenceId = this.winningSequenceId || null
			this.status = this.status || Status.PENDING
			this.paymentStatus = this.paymentStatus || PaymentStatus.NOT_PAIED
			this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
			this.winningPrice = this.winningPrice || 0
		}
	}
}
