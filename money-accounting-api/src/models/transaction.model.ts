import {Entity, model, property} from '@loopback/repository';

@model()
export class Transaction extends Entity {
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
  amount: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'date',
  })
  effectiveDate?: Date;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }

  isCredit() {
    return this.type === 'credit';
  }

  isDebit() {
    return this.type === 'debit';
  }
}

export interface TransactionRelations {
  // describe navigational properties here
}

export type TransactionWithRelations = Transaction & TransactionRelations;
