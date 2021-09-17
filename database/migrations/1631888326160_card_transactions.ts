import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CardTransactions extends BaseSchema {
  protected tableName = 'card_transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('bank_name').notNullable()
      table.decimal('amount').notNullable()
      table.integer('wallet_id').references('id').inTable('wallets').notNullable().unique().onDelete('CASCADE')
      table.integer('external_reference').notNullable().unique()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
