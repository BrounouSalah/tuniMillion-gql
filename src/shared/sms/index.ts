const smsorange = require('smsorange')

// Promise interface

export const sendSms = async (
	recieverNumber: string,
	pin: string
): Promise<any> => {
	try {
		const SMS = new smsorange(process.env.SMS_KEY, '+21655397795')
		return await SMS.sendSms(recieverNumber, `Votre PIN Pour TAKTAK est ${pin}`)
	} catch (error) {
		console.log('smsError', error)
		throw new Error(error)
	}
}