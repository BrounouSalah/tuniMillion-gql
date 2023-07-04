import { User, Roles } from 'generator/graphql.schema'

export const hasAccessRole = (authUser: User, role: Roles): boolean => {
	let roles: string[]
	switch (authUser.userRole) {
		case Roles.ADMIN:
			roles = [Roles.ADMIN]
			break
		case Roles.USER:
			roles = [Roles.USER]
			break
	}

	return roles && roles.includes(role)
}
