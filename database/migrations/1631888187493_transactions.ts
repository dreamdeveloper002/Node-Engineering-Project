import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Transactions extends BaseSchema {
  protected tableName = 'transactions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('txn_type', ['Debit', 'Credit']).notNullable()
      table.string('purpose').notNullable()
      table.decimal('amount').notNullable()
      table.integer('wallet_id').notNullable()
      table.uuid('reference').notNullable().unique()
      table.decimal('balance_before').notNullable()
      table.decimal('balance_after').notNullable()
      table.string('metadata')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
