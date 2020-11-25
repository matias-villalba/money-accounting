import {Transaction} from '@loopback/repository';
import {v4 as uuidv4} from 'uuid';
import {Rollback} from './db.datasource';
import {SerializableLocker} from './serializable.locker';

export class InMemoryTransaction implements Transaction {
  rollbacks: Array<Rollback>;
  id: string;
  active: boolean;
  locker: SerializableLocker;

  constructor(locker: SerializableLocker, timeout: number) {
    this.rollbacks = [];
    this.active = true;
    this.locker = locker;
    this.id = uuidv4();
    locker.putTimeoutByTx(this.id, timeout);
  }

  addRollback(rollback: Rollback): void {
    this.rollbacks.push(rollback);
  }

  async commit(): Promise<void> {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.locker.unlock(this.id);
  }

  async rollback(): Promise<void> {
    if (!this.active) {
      return;
    }
    for (const rollback of this.rollbacks) {
      await rollback.operation();
    }
    this.active = false;
    this.locker.unlock(this.id);
  }

  isActive(): boolean {
    return this.active;
  }
}
