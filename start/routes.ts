
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

// check db connection
Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})

Route.post('/signup', 'AuthController.signup')
Route.post('/login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout').middleware('auth')
Route.post('/credit', 'TransactionsController.creditAccount').middleware('auth')
Route.post('/submit_pin', 'TransactionsController.submitPin').middleware('auth')
Route.post('/submit_otp', 'TransactionsController.submitOtp').middleware('auth')
Route.post('/debit', 'TransactionsController.transfer')
Route.post('/transfer', 'TransactionsController.createTransferRecipient')
Route.post('/webhook/url', 'TransactionsController.createTransferRecipient')

