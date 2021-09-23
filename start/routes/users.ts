
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('/signup', 'AuthController.signup')
  Route.post('/login', 'AuthController.login')
  Route.post('/logout', 'AuthController.logout').middleware('auth')
  Route.post('/credit', 'TransactionsController.creditAccount').middleware('auth')
  Route.post('/submit_pin', 'TransactionsController.submitPin').middleware('auth')
  Route.post('/submit_otp', 'TransactionsController.submitOtp').middleware('auth')
  Route.post('/submit_phone', 'TransactionsController.submitPhone').middleware('auth')
  Route.post('/debit', 'TransactionsController.transfer').middleware('auth')
  Route.post('/beneficiary', 'TransactionsController.beneficiary').middleware('auth')
  Route.post('/transfer', 'TransactionsController.createTransferRecipient').middleware('auth')
  Route.post('/webhook/url', 'TransactionsController.webHookUrl')
}).prefix('/api/v1')
