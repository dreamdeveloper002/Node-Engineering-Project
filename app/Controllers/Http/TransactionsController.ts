import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'
import axios from 'axios'

export default class TransactionsController {
  public async creditAccount ({ request, auth, response }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        number: schema.number(),
        cvv: schema.string(),
        amount: schema.number(),
        expiry_year: schema.string(),
        expiry_month: schema.string(),
        email: schema.string({}, [rules.email()]),
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

    const PAYSTACK_BASE_URL = 'https://api.paystack.co/charge'

    //init transaction process
    const trx = await Database.beginGlobalTransaction()

    try {
      const charge = await axios.post(PAYSTACK_BASE_URL, {
        card: {
          number: req.number,
          cvv: req.cvv,
          expiry_year: req.expiry_year,
          expiry_month: req.expiry_month,
        },
        email : req.email,
        amount: req.amount,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      const wallet = await Wallet.findBy('wallet_id', auth.user?.id)

      //check if user with mail already exist
      if(!wallet) {
        return response.status(400).json({
          success: false,
          message: 'Account does not exist',
        })
      }

      console.log(charge)

      return response.status(200).json({
        status: 'error',
        message: charge,
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }
}
