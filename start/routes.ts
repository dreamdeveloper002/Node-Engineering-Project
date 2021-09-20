
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/signup', 'AuthController.signup')
Route.post('/charge', 'TransactionsController.creditAccount')
Route.post('/submit_pin', 'TransactionsController.submitPin')
