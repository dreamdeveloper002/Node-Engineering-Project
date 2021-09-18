import { Request } from '@adonisjs/http-server/build/standalone'
import { types } from '@ioc:Adonis/Core/Helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
//import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'
import axios from 'axios'
import lodash from 'lodash'


export default class TransactionsController {
  public async creditAccount ({ request, auth, response }: HttpContextContract) {
    const body = await request.validate({
      schema: schema.create({
        number: schema.string(),
        cvv: schema.string(),
        amount: schema.number(),
        expiry_year: schema.string(),
        expiry_month: schema.string(),
        email: schema.string({}),
      }),

      messages: {
        'number.required': 'Please provide your credit card number',
        'cvv.required': 'Cvv number is required',
        'amount.required': 'Please provide the amount',
        'email.required': 'Email is required',
        'expiry_year.required': 'Enter your card expiry date',
        'expiry_month.required': 'Enter your card expiry mont',
      },
    })
  console.log(JSON.stringify(body.number))
    
    const PAYSTACK_BASE_URL = 'https://api.paystack.co/charge'
   
    const number = JSON.stringify(body.number)
    const cvv = JSON.stringify(body.cvv)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const expiry_year = JSON.stringify(body.expiry_year)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const expiry_month= JSON.stringify(body.expiry_month)
    //const email = JSON.stringify(body.email)
    //init transaction process
    //const trx = await Database.beginGlobalTransaction()
    const secret = 'sk_test_22e4b1e4915030c821ff7262726ac8491e15287c'

    try {

     
      const charge = await axios.post(PAYSTACK_BASE_URL, {
        card: {
          number: number,
          cvv: cvv,
          expiry_year : expiry_year,
          expiry_month : expiry_month,
        },
        email: body.email,
        amount: body.amount,
      }, {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      })
      // const wallet = await Wallet.findBy('wallet_id', auth.user?.id)

      // //check if user with mail already exist
      // if(!wallet) {
      //   return response.status(400).json({
      //     success: false,
      //     message: 'Account does not exist',
      //   })
      // }

      console.log(charge.data)
    } catch (error) {
      //  console.log(error)
    }
  }
}
