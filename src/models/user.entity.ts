import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import {
	Local,
	Google,
	Facebook,
	UserType,
	AccountStateType,
	Grille
} from '../generator/graphql.schema'

@Entity({
	name: 'users',
	orderBy: {
		createdAt: 'ASC'
	}
})
export class User {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	walletId: string

	@Expose()
	@Column()
	local: Local

	@Expose()
	@Column()
	facebook: Facebook

	@Expose()
	@Column()
	google: Google

	@Expose()
	@Column()
	firstName: string

	@Expose()
	@Column()
	lastName: string

	@Expose()
	@Column()
	birthDate: string

	@Expose()
	@Column()
	address: string

	@Expose()
	@Column()
	phoneNumber: string

	@Expose()
	@Column()
	accountState: AccountStateType

	@Expose()
	@Column()
	avatar: string

	@Expose()
	@Column()
	background: string

	@Expose()
	@Column()
	resetPasswordToken: string

	@Expose()
	@Column()
	resetPasswordExpires: number

	@Expose()
	@Column()
	isVerified: boolean

	@Expose()
	@Column()
	isOnline: boolean

	@Expose()
	@Column()
	isLocked: boolean

	@Expose()
	@Column()
	reason: string

	@Expose()
	@Column()
	stripeId: string

	@Expose()
	@Column()
	ccLast4: string

	@Expose()
	@Column()
	type: UserType

	@Expose()
	@Column()
	grilles:Grille[]

	
	@Expose()
	@Column()
	createdAt: Date

	@Expose()
	@Column()
	updatedAt: Date

	@Expose()
	@Column()
	deletedAt: Date
   

	constructor(user: Partial<User>) {
		if (user) {
			Object.assign(
				this,
				plainToClass(User, user, {
					excludeExtraneousValues: true
				})
			)
			this._id = this._id || uuid.v1()
			this.isVerified =
				this.isVerified !== undefined
					? this.isVerified
					: this.google || this.facebook
					? true
					: false
			this.isOnline = this.isOnline !== undefined ? this.isOnline : false
			this.isLocked = this.isLocked !== undefined ? this.isLocked : false
			this.reason = this.reason || ''
			this.phoneNumber = this.phoneNumber || ''
			this.walletId = this.walletId || null
			this.type = this.type || UserType.BASIC
			this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
		}
	}
}
