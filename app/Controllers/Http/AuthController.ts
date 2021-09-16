import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class AuthController {
  public async signup ({ request, auth, response }: HttpContextContract) {
    const newUserSchema = schema.create({
      name: schema.string(),
      email: schema.string({}, [rules.email()]),
      password: schema.string({},[rules.minLength(8)]),
    })

    //init transaction process
    const trx = await Database.beginGlobalTransaction()

    try {
      //Validate user's request
      const req = await request.validate({
        schema: newUserSchema,
        messages: {
          'name.required': 'Name is required to sign up',
          'email.required': 'Email is required to sign up',
          'password.required': 'Password is required to sign up',
        },
      })
      const checkUserExist = await User.findBy('email', req.email)

      //check if user with mail already exist
      if(checkUserExist) {
        return response.status(400).json({
          status: 'error',
          message: `user with ${req.email} already exist`,
        })
      }

      const name = req.name
      const email = req.email
      const password = req.password

      //Create new user
      const createUser = await User.create({
        name,
        email,
        password,
      }, trx)

      //Create wallet for newly registered user with initial balance
      const wallet = await Wallet.create({ balance: 5000000, userId: createUser.id }, trx)

      //Generate token for newly created user
      const token = await auth.use('api').login(createUser, {
        expiresIn: '10 days',
      })

      //commit all transaction if no fail process
      await trx.commit()

      return response.json({
        status: 'success',
        createUser,
        wallet,
        token: token.toJSON(),
      })
    } catch (error) {
      //rollback transaction if there's any failed process
      await trx.rollback()

      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }
}

