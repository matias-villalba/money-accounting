import {Entity, model, property} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Transaction} from './transaction.model';

@model()
export class Account extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'number',
    required: true,
  })
  balance: number;

  constructor(data?: Partial<Account>) {
    super(data);
  }

  increaseOrDecreaseBalanceBy(transaction: Transaction): Account {
    if (transaction.isCredit()) {
      this.balance += transaction.amount;
      return this;
    } else if (transaction.isDebit()) {
      if (this.balance - transaction.amount < 0) {
        throw new HttpErrors.UnprocessableEntity(
          'Invalid transaction. It leads to a negative balance',
        );
      }

      this.balance -= transaction.amount;
      return this;
    }

    throw new Error('transaction must be credit or debit');
  }
}

export interface AccountRelations {
  // describe navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
