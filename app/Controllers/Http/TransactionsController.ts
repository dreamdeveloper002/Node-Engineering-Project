/* eslint-disable @typescript-eslint/naming-convention */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import CardTransaction from 'App/Models/CardTransaction'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import Help from 'App/Helpers/Helpers'

export default class TransactionsController {
  public async creditAccount ({ request, auth, response }: HttpContextContract) {
    const req = await request.validate({
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
    const PAYSTACK_BASE_URL = 'https://api.paystack.co/charge'
    const number = JSON.stringify(req.number)
    const cvv = JSON.stringify(req.cvv)
    const expiry_year = JSON.stringify(req.expiry_year)
    const expiry_month= JSON.stringify(req.expiry_month)
    const amount = req.amount
    const email = req.email

    try {
      const charge = await axios.post(PAYSTACK_BASE_URL, {
        card: {
          number,
          cvv,
          expiry_year,
          expiry_month,
        },
        email,
        amount,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      const nextAction = Help.processInitialCardCharge(charge.data)
      const last_response = nextAction.success ? nextAction.message : 'unsuccessful'

      await CardTransaction.create({
        external_reference: nextAction.data.reference,
        amount,
        wallet_id: 7,
        last_response,
      })

      // init transaction process
      // const trx = await Database.beginGlobalTransaction()
      try {
        if (nextAction.data.shouldCreditAccount) {
          const creditResult = await Help.creditAccount({
            amount,
            userId: 7,
            reference: uuidv4(),
            metadata: {
              external_reference: nextAction.data.reference,
            },
          })
          if (!creditResult.success) {
            return response.status(200).json({
              success: false,
              error: creditResult.error,
            })
          }
          return response.status(200).json({
            success: true,
            message: 'Charge successful',
          })
        }

        return response.status(200).json(nextAction)
      } catch (error) {
        return response.status(400).json({
          success: false,
          message: error.message,
        })
      }
    } catch (error) {
      if (error.response) {
        return response.status(400).json({
          status: 'error',
          message: error.response.data,
        })
      }
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }
}
