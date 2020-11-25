import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {
  IsolationLevel,
  juggler,
  Options,
  Transaction,
} from '@loopback/repository';
import {InMemoryTransaction, SerializableLocker} from '../datasources';
const config = {
  name: 'db',
  connector: 'memory',
  localStorage: '',
  file: '',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  async runOperation(
    operation: Function,
    operationRollback: Rollback,
    options: Options,
  ) {
    if (!options.transaction) {
      throw new Error('no transaction active');
    }

    const tx = options.transaction as InMemoryTransaction;

    try {
      const result = await operation();
      tx.addRollback(operationRollback);
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async beginTransaction(options?: Options): Promise<Transaction> {
    if (!options) {
      options = {
        isolationLevel: IsolationLevel.SERIALIZABLE,
        timeout: 6000,
      };
    }

    const serializableLockr = SerializableLocker.getInstance();

    const tx = new InMemoryTransaction(serializableLockr, options.timeout);
    return tx;
  }
}

export interface Rollback {
  operation: Function;
}
