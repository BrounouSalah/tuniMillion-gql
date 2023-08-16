import * as nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import * as fs from 'fs'
import { User } from '@models'

import {
	AUTHOR,
	END_POINT,
	ISSUER,
	NODEMAILER_USER,
	NODEMAILER_PASS,
	TUNIMILLION_BASEURL,
	NODEMAILER_HOST,
	NODEMAILER_PORT
} from 'environments'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

type Type =
	| 'verifyEmail'
	| 'sendEventTicket'
	| 'forgotPassword'
	| 'finalizeRegistration'
	| 'sendEventInvitation'
	| 'welcome'
	| 'verification'
	| 'gagnant'
	| 'reactivation'

/**
 * Returns any by send email.
 *
 * @remarks
 * This method is part of the {@link shared/mail}.
 *
 * @param type - 1st input
 * @param user - 2nd input
 * @param req - 3rd input
 * @param token - 4th input
 * @param _id - 5th input
 *
 * @returns The any mean of `type`, `user`, `req`, `token` and `_id`
 *
 * @beta
 */
export const sendMail = async (
	type: Type,
	user: User,
	token: string,
	qrCodeUrl: string = null
): Promise<any> => {
	const transporter = nodemailer.createTransport({
		host: NODEMAILER_HOST,
		port: Number(NODEMAILER_PORT) || 0,
		secure: false,
		auth: {
			user: NODEMAILER_USER,
			pass: NODEMAILER_PASS
		},
		tls: {
			ciphers: 'SSLv3'
		},

		logger: true,
		debug: true
	})

	const readHTMLFile = (path, callback) => {
		fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
			if (err) {
				callback(err)
			} else {
				callback(null, html)
			}
		})
	}

	readHTMLFile('./src/assets/templates/udacity-index.html', (err, html) => {
		const template = handlebars.compile(html)

		const common = {
			author: AUTHOR!,
			issuer: ISSUER!,
			ios: 'https://itunes.apple.com/us/app/chnirt',
			android: 'https://play.google.com/store/apps/chnirt',
			twitter: 'https://twitter.com/chnirt',
			facebook: 'https://www.facebook.com/trinhchinchinn',
			googleplus: 'https://plus.google.com/chnirt',
			linkedin:
				'https://www.linkedin.com/authwall?trk=gf&trkInfo=AQFSlEdMz0wy8AAAAW2cEMIYqabj7d0O-w7EMMY5W1BFRDacs5fcAbu4akPG8jrJQPG5-cNbLf-kaBHIfmW-f6a3WgaqAEjIG6reC_mLvY9n-mzZwZbcFf0q9XmrlkFVdVUH2I4=&originalReferer=https://www.facebook.com/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fchin-tr%25E1%25BB%258Bnh-62200215a%3Ffbclid%3DIwAR289POrXez8UY6k2RQNEnNAjrtOto8H6zhFABlQ7HHCvpIS0afgQHxGGic',
			number: '1803',
			street: 'Su Van Hanh',
			country: 'Viet Nam',
			to: user.firstName
		}

		const replacements = {
			verifyEmail: {
				link: `${TUNIMILLION_BASEURL}/verify/${token}`,
				subject: 'Verify Email',
				text1: 'To complete your sign up, please verify your email: ',
				button: 'VERIFY EMAIL',
				text2: 'Or copy this link and paste in your web	browser',
				...common
			},
			forgotPassword: {
				link: `${TUNIMILLION_BASEURL}/reset/${token}`,
				subject: 'Reset Your Password',
				text1:
					// tslint:disable-next-line:quotemark
					"Tap the button below to reset your customer account password. If you didn't request a new password, you can safely delete this email.",
				button: 'Set New Password',
				text2:
					// tslint:disable-next-line:quotemark
					"If that doesn't work, copy and paste the following link in your browser:",
				...common
			},

			welcome:{
				link: `${TUNIMILLION_BASEURL}`,
				subject: 'Bienvenue sur Tunimillions',
				text1:`Félicitations pour avoir rejoint la communauté Tunimillions! Préparez-vous à vivre l'excitation des jeux de concours et à avoir la chance de gagner gros.
				Nous vous souhaitons la meilleure des chances et espérons que chaque tirage vous rapproche du jackpot! N'hésitez pas à explorer nos jeux et à tenter votre chance.	
				Jouez, amusez-vous et qui sait, vous pourriez être notre prochain grand gagnant!\n
				"L'équipe Tunimillions". 
				`,
				button: 'Retour Vers Tunimillions',
				...common
			},
			verification:{
				link: `${TUNIMILLION_BASEURL}`,
				subject: `Soyez au cœur de l'action sur Tunimillions! `,
				text1: `Cher(e) utilisateur(trice),
				Nous avons remarqué que vous n'avez pas encore vérifié votre compte Tunimillions. La vérification est une étape importante pour profiter pleinement de nos jeux de concours passionnants et pour garantir la sécurité de votre expérience.
				Ne manquez pas l'opportunité de jouer et de gagner! Veuillez vérifier votre compte dès maintenant en envoyant votre  carte d’identité nationale et suivre les étapes à l’inscription.				
				L'équipe Tunimillions est là pour vous aider à démarrer votre aventure de jeu en toute confiance. Jouez, amusez-vous et tentez votre chance pour gagner gros!				
				Cordialement,
				L'équipe Tunimillions .
				`,
				button: 'Retour Vers Tunimillions',
				...common
			},

			reactivation:{
				link: `${TUNIMILLION_BASEURL}`,
				subject: `Action requise: Réactivez votre compte Tunimillions! `,
				text1: `Cher utilisateur,
				Nous espérons que vous allez bien. Nous avons remarqué que vous n'avez pas joué sur Tunimillions depuis un certain temps. Pour continuer à profiter de nos passionnants jeux de concours et pour éviter la désactivation de votre compte, nous vous encourageons à jouer à nouveau.				
				Ne laissez pas les opportunités de gagner vous échapper! Connectez-vous dès maintenant et tentez votre chance.				
				L'équipe Tunimillions. 
				
				`,
				button: 'Retour Vers Tunimillions',
				...common
			},

			gagnant:{
				link: `${TUNIMILLION_BASEURL}`,
				subject: `Félicitations, Vous avez gagné sur Tunimillions! `,
				text1: `Cher(e) gagnant(e),
				Nous sommes ravis de vous annoncer que vous avez remporté un prix sur Tunimillions! Votre chance a porté ses fruits et nous sommes enchantés d'être à vos côtés pour célébrer votre victoire.				
				Contactez-nous dès maintenant pour réclamer votre récompense et en savoir plus sur les étapes à suivre. Votre succès fait partie de ce qui rend Tunimillions si spécial.				
				Félicitations encore et continuez à jouer pour de futures victoires!				
				Cordialement,
				L'équipe Tunimillions. 				
				`,
				button: 'Retour Vers Tunimillions',
				...common
			}
			// finalizeRegistration: {
			// 	link: `${TUNIMILLION_BASEURL}/finalizeRegistration/?email=${user.local.email}&password=${token}`,
			// 	subject: 'Finalize MineClap registration',
			// 	text1:
			// 		'To finalize your Mineclap Registration, please click on the button below:',
			// 	button: 'Finalize Registration',
			// 	text2: 'Use your mail to connect, you have to change your password',
			// 	...common
			// },
			// sendEventInvitation: {
			// 	subject: 'Mineclap Event Invitation',
			// 	text1: 'You received a mineclap invitation'
			// },
			// sendEventTicket: {
			// 	subject: 'Mineclap Event Ticket',
			// 	text1: 'You received a mineclap Ticket',
			// 	qrCodeUrl
			// }
		}

		const htmlToSend = template(replacements[type])
		
		const mailOptions = {
			from: NODEMAILER_USER, // sender address
			to: user.local.email, // list of receivers
			subject: replacements[type].subject,
			html: htmlToSend,
			attachments: [
				{
					path: './src/assets/images/logo.png',
					cid: 'unique@kreata.ee' // same cid value as in the html img src
				},
				{
					path: './src/assets/images/mail/ios.gif',
					cid: 'ios@chnirt.ee'
				},
				{
					path: './src/assets/images/mail/android.gif',
					cid: 'android@chnirt.ee'
				},
				{
					path: './src/assets/images/mail/twitter.jpg',
					cid: 'twitter@chnirt.ee'
				},
				{
					path: './src/assets/images/mail/facebook.jpg',
					cid: 'facebook@chnirt.ee'
				},
				{
					path: './src/assets/images/mail/googleplus.jpg',
					cid: 'googleplus@chnirt.ee'
				},
				{
					path: './src/assets/images/mail/linkedin.jpg',
					cid: 'linkedin@chnirt.ee'
				}
			]
		}

		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				console.log(err)
			} else {
				 //console.log('Message sent: ' + info.response)
			}
		})

		// // verify connection configuration
		// transporter.verify(function (error, success) {
		// 	if (error) {
		// 		console.log(error)
		// 	} else {
		// 		console.log(
		// 			'Server is ready to take our messages========================================='
		// 		)
		// 	}
		// })

		transporter.close()
	})
}
