/* eslint-disable @typescript-eslint/naming-convention */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import CardTransaction from 'App/Models/CardTransaction'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import Help from 'App/Helpers/Helpers'
import User from 'App/Models/User'
import Beneficiary from 'App/Models/Beneficiary'
import Wallet from 'App/Models/Wallet'

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

      const wallet = await Wallet.findBy('user_id', auth.user?.id)

      await CardTransaction.create({
        external_reference: nextAction.data.reference,
        amount,
        wallet_id: wallet?.id,
        last_response,
      })

      // init transaction process
      const trx = await Database.beginGlobalTransaction()
      try {
        if (nextAction.data.shouldCreditAccount) {
          const purpose = 'Card_funding'
          const creditResult = await Help.creditAccount({
            amount,
            userId: auth.user?.id,
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
          userId: auth.user?.id,
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
        status: charge.data.status,
        message: charge.data.message,
        data: {
          shouldCreditAccount: false,
          status: charge.data.data.status,
          reference: charge.data.data.reference,
        },
      })
    } catch (error) {
      return response.status(400).json(error.response.data)
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
      const charge = await axios.post(`${PAYSTACK_BASE_URL}/submit_otp`, {
        reference,
        otp,
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
          userId: auth.user?.id,
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
      return response.status(400).json(error.response ? error.response.data : error || error.message)
    }
  }

  public async transfer ({ request, auth, response }: HttpContextContract){
    const req = await request.validate({
      schema: schema.create({
        recipient_email: schema.string({}, [rules.email()]),
        amount: schema.string(),
      }),

      messages: {
        'recipient_email.required': 'Please recipient email',
        'amount.required': 'Please provide the amount',
      },
    })

    const amount = req.amount
    const email = req.recipient_email

    //init transaction process
    const trx = await Database.beginGlobalTransaction()

    try {
      const recipientExist = await User.findBy('email', email)
      //check if user with mail exist
      if(!recipientExist) {
        return response.status(400).json({
          status: 'error',
          message: `user with account email ${email} does not exist`,
        })
      }

      const purpose = 'Transfer'
      const userId = recipientExist?.id

      if (userId === auth?.user?.id) {
        return response.status(400).json({
          status: 'error',
          message: 'This transaction can only be perform between two separate account',
        })
      }

      const transactionResult = await Promise.all([

        Help.creditAccount({
          amount,
          userId,
          purpose,
          reference: uuidv4(),
          metadata: auth?.user?.id,
          trx,
        }),

        Help.debitAccount({
          amount,
          userId: auth?.user?.id,
          purpose,
          reference: uuidv4(),
          metadata: auth?.user?.id,
          trx,
        }),

      ])

      const isFailed = await transactionResult.filter((result) => !result.success)

      if (isFailed.length) {
        await trx.rollback()
        return response.status(400).json(transactionResult)
      }

      await trx.commit()
      return response.status(200).json({
        success: true,
        message: 'transfer successful',
      })
    } catch (error) {
      await trx.rollback()
      response.status(400).json({
        success: false,
        error: 'Transfer unsuccessful',
      })
    }
  }

  public async beneficiary ({ request, auth, response }: HttpContextContract) {
    const req = await request.validate({
      schema: schema.create({
        beneficiary_bank_code: schema.string(),
      }),

      messages: {
        'beneficiary_name.required': 'Please provide beneficiary_name',
      },
    })

    const beneficiary_bank_code = req.beneficiary_bank_code
    const userId = auth?.user?.id

    try {
      await Beneficiary.create({
        beneficiary_bank_code,
        userId,
      })

      response.status(200).json({
        success: true,
        message: 'Beneficiary successfully added',
      })
    } catch (error) {
      response.status(400).json({
        success: false,
        error: 'Beneficiary unsuccessful',
      })
    }
  }

  public async createTransferRecipient ({ request, auth, response }: HttpContextContract){
    const req = await request.validate({
      schema: schema.create({
        description: schema.string(),
        name: schema.string(),
        account_number: schema.string(),
        bank_code: schema.string(),
      }),

      messages: {
        'description.required': 'Please provide a description',
        'name.required': 'Name is required',
        'account_number.required': 'Please provide recipient account number',
        'bank_code.required': 'Please provide a valid bank code',
      },
    })
    const name = JSON.stringify(req.name)
    const account_number = req.account_number
    const bank_code = req.bank_code
    const description= JSON.stringify(req.description)

    const PAYSTACK_BASE_URL = 'https://api.paystack.co/transferrecipient'

    try {
      //**check beneficiary */
      const isBeneficiary = await Beneficiary.findBy('beneficiary_bank_code', req.bank_code)

      if(!isBeneficiary) {
        return response.status(400).json({
          status: false,
          message: 'Bank is not part of beneficiary',
        })
      }
      const charge = await axios.post(PAYSTACK_BASE_URL, {
        form: {
          type: 'nuban',
          name,
          description,
          currency: 'NGN',
        },
        account_number,
        bank_code,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      response.status(200).json({
        success: charge.data.status,
        status: charge.data.message,
        data: {
          recipient_code: charge.data.data.recipient_code,
          account_name: charge.data.data.details.account_name,
          bank_code: charge.data.data.details.bank_code,
          bank_name: charge.data.data.details.bank_name,
        },
      })
    } catch (error) {
      response.status(400).json(error.response.data)
    }
  }

  public async webHookUrl ({ request, auth, response }: HttpContextContract){
    const data = request.body()

    response.status(200).json({ data })
  }
}

