import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CardTransactions extends BaseSchema {
  protected tableName = 'card_transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.decimal('amount').notNullable()
      table.integer('wallet_id').notNullable()
      table.string('external_reference').notNullable().unique()
      table.string('last_response').notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
