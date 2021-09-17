import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'
import axios from 'axios';

export default class TransactionsController {
  public async creditAccount ({ request, auth, response }: HttpContextContract) {
    const validatePayload = schema.create({
      number: schema.number(),
      cvv: schema.string(),
      amount: schema.number(),
      expiry_year: schema.string(),
      expiry_month: schema.string(),
      email: schema.string({}, [rules.email()]),
    })
  }
}
