import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { Expose, plainToClass } from 'class-transformer'
import {
	Local,
	Google,
	Facebook,
	UserType,
	Grille
	AccountStateType,
	Address,
	Gender,
	UserVerificationData
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
	address: Address

	@Expose()
	@Column()
	phoneNumber: string

	@Expose()
	@Column()
	avatar: string

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
	pseudoName: string

	@Expose()
	@Column()
	secondeName: string

	@Expose()
	@Column()
	thirdName: string

	@Expose()
	@Column()
	termsOfUse: boolean

	@Expose()
	@Column()
	userVerificationData: UserVerificationData

	@Expose()
	@Column()
	identityVerified: boolean

	@Expose()
	@Column()
	ccLast4: string

	@Expose()
	@Column()
	gender: Gender

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

			this.phoneNumber = this.phoneNumber || ''
			this.walletId = this.walletId || null
			this.userVerificationData=this.userVerificationData || { verificationImage: "",
				type: "",
				isVerified: false}
				this.identityVerified=this.identityVerified || false
			this.createdAt = this.createdAt || new Date(Date.now())
			this.updatedAt = this.updatedAt || new Date(Date.now())
		}
	}
}
