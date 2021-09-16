import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AuthController {
  public async signUp ({ request, auth, response }: HttpContextContract) {
    const newUserSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: 'User', column: 'email'}),
      ]),
      password: schema.string({ trim: true }),
      name: schema.string({ trim: true }),
    })

    try {
      const req = await request.validate({
        schema: newUserSchema,
        messages: {
          'name.required': 'Name is required to sign up',
          'email.required': 'Email is required to sign up',
          'password.required': 'Password is required to sign up',
        },
      })

      const createUser = new User()
      createUser.name = req.name
      createUser.email = req.email
      createUser.password = req.password

      // save user to database
      const user = await createUser.save()

      // generate JWT token for user
      const token = await auth.generate(user)

      return response.json({
        status: 'success',
        data: token,
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: error.messages,
      })
    }
  }
}
