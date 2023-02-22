import { ValidationSchema, registerSchema } from 'class-validator'

const PageName = [
	{
		type: 'minLength', // validation type. All validation types are listed in ValidationTypes class.
		constraints: [3],
		message: 'Your PageName must be between 3 and 20 characters'
	},
	{
		type: 'maxLength',
		constraints: [20],
		message: 'Your PageName must be between 3 and 20 characters'
	}
]


const createPageValidation: ValidationSchema = {
	// using interface here is not required, its just for type-safety
	name: 'createPageRegister', // this is required, and must be unique
	properties: {
		PageName
	}
}

const updatePageValidation: ValidationSchema = {
	// using interface here is not required, its just for type-safety
	name: 'updatePageRegister', // this is required, and must be unique
	properties: {
		PageName
	}
}

registerSchema(createPageValidation)
registerSchema(updatePageValidation)
