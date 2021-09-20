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
        wallet_id: 1,
        last_response,
      })

      // init transaction process
      const trx = await Database.beginGlobalTransaction()
      try {
        if (nextAction.data.shouldCreditAccount) {
          const purpose = 'Card_funding'
          const creditResult = await Help.creditAccount({
            amount,
            userId: 1,
            purpose,
            reference: uuidv4(),
            metadata: nextAction.data.reference,
            trx,
          })
          if (!creditResult.success) {
            return response.status(200).json({
              success: false,
              error: 'Charge not success',
            })
          }
          return response.status(200).json({
            success: true,
            message: 'Charge successful',
          })
        }
        trx.commit()
        console.log(nextAction)
        return response.status(200).json(nextAction)
      } catch (error) {
        trx.rollback()
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

  public async submitPin ({ request, auth, response }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        reference: schema.string(),
        pin: schema.string(),
      }),

      messages: {
        'reference.required': 'Please transaction reference number',
        'pin.required': 'Please provide a pin',
      },
    })

    const pin = req.pin
    const reference = req.reference

    const PAYSTACK_BASE_URL = 'https://api.paystack.co/charge'

    // init transaction process
    const trx = await Database.beginGlobalTransaction()

    try {
      const cardTransaction = await CardTransaction.findBy('external_reference', reference)

      if (!cardTransaction) {
        return response.status(400).json({
          success: false,
          error: 'Transaction not found',
        })
      }
      if (cardTransaction.last_response === 'success') {
        return response.status(400).json({
          success: false,
          error: 'Transaction already succeeded',
        })
      }
      const charge = await axios.post(`${PAYSTACK_BASE_URL}/submit_pin`, {
        reference, pin,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      })
      if (charge.data.data.status === 'success') {
        cardTransaction.last_response = 'success'
        await cardTransaction.save()
        const purpose = 'Card_funding'
        const creditResult = await Help.creditAccount({
          amount: cardTransaction.amount,
          userId: 1,
          purpose,
          reference: uuidv4(),
          metadata: charge.data.data.reference,
          trx,
        })
        if (!creditResult.success) {
          return response.status(400).json({
            success: false,
            error: 'Charge not success',
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Charge successful',
          shouldCreditAccount: true,
        })
      }
      cardTransaction.last_response = charge.data.data.status
      cardTransaction.save()
      return response.status(200).json({
        success: true,
        message: charge.data.data.message,
        data: {
          shouldCreditAccount: false,
          reference,
        },
      })
    } catch (error) {
      console.log(error)
      return response.status(400).json(error.message)
    }
  }

  public async submitOtp ({ request, auth, response }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        reference: schema.string(),
        otp: schema.string(),
      }),

      messages: {
        'reference.required': 'Please provide transaction reference number',
        'pin.required': 'Please provide an otp code',
      },
    })

    const otp = req.otp
    const reference = req.reference

    const PAYSTACK_BASE_URL = 'https://api.paystack.co/charge'

    // init transaction process
    const trx = await Database.beginGlobalTransaction()

    try {
      const cardTransaction = await CardTransaction.findBy('external_reference', reference)

      if (!cardTransaction) {
        return response.status(400).json({
          success: false,
          error: 'Transaction not found',
        })
      }
      if (cardTransaction.last_response === 'success') {
        return response.status(400).json({
          success: false,
          error: 'Transaction already succeeded',
        })
      }
      const charge = await axios.post(`${PAYSTACK_BASE_URL}/submit_pin`, {
        reference, otp,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      })

      const purpose = 'Card_funding'
      if (charge.data.data.status === 'success') {
        cardTransaction.last_response = 'success'
        await cardTransaction.save()
        const creditResult = await Help.creditAccount({
          amount: cardTransaction.amount,
          userId: 1,
          purpose,
          reference: uuidv4(),
          metadata: charge.data.data.reference,
          trx,
        })
        if (!creditResult.success) {
          return response.status(400).json({
            success: false,
            error: 'Charge not success',
          })
        }
        return response.status(200).json({
          success: true,
          message: 'Charge successful',
          shouldCreditAccount: true,
        })
      }
      cardTransaction.last_response = charge.data.data.status
      cardTransaction.save()
      return response.status(200).json({
        success: true,
        message: charge.data.data.message,
        data: {
          shouldCreditAccount: false,
          reference,
        },
      })
    } catch (error) {
      console.log(error)
      return response.status(400).json(error.response ? error.response.data : error || error.message)
    }
  }

  public async transfer ({ request, auth, response }: HttpContextContract){
    const req = await request.validate({
      schema: schema.create({
        recipient_email: schema.string(),
        amount: schema.string(),
      }),

      messages: {
        'recipient_email.required': 'Please recipient email',
        'amount.required': 'Please provide the amount',
      },
    })

    const amount = req.amount
    const email = req.recipient_email
  }
}

