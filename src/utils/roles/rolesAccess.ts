import { User, Roles } from 'generator/graphql.schema'

export const hasAccessRole = (authUser: User, role: Roles): boolean => {
	let roles: string[]
	switch (authUser.userRole) {
		case Roles.SUPER_ADMIN:
			roles = [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.USER]
			break
		case Roles.ADMIN:
			roles = [Roles.ADMIN, Roles.USER]
			break
		case Roles.USER:
			roles = [Roles.USER]
			break
	}

	return roles && roles.includes(role)
}
