import {
  DataObject,
  DefaultTransactionalRepository,
  Entity,
  Filter,
  FilterExcludingWhere,
  juggler,
  Options,
} from '@loopback/repository';
import {DbDataSource, SerializableLocker} from '../datasources';

export class InMemoeryTransactionalRepository<
  T extends Entity,
  ID,
  Relations extends object = {}
> extends DefaultTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
  ) {
    super(entityClass, dataSource);
  }

  async create(entity: DataObject<T>, options?: Options): Promise<T> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.create(entity, options);
    }
    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const rollback = {operation: function () {}};
    const created = await dataSource.runOperation(
      super.create.bind(this, entity),
      rollback,
      options,
    );

    rollback.operation = super.deleteById.bind(this, created.getId());

    return created;
  }
  async save(entity: T, options?: Options): Promise<T> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.save(entity, options);
    }

    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const original = entity.getId()
      ? await super.findById(entity.getId())
      : await Promise.resolve(null);

    const rollback = {operation: function () {}};
    const created = await dataSource.runOperation(
      super.save.bind(this, entity),
      rollback,
      options,
    );

    rollback.operation = original
      ? super.save.bind(this, original)
      : super.deleteById.bind(this, created.getId());

    return created;
  }

  async updateById(
    id: ID,
    data: DataObject<T>,
    options?: Options,
  ): Promise<void> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.updateById(id, data, options);
    }

    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const original = await super.findById(id);

    const rollback = {operation: super.update.bind(this, original as T)};
    await dataSource.runOperation(
      super.updateById.bind(this, id, data),
      rollback,
      options,
    );

    return;
  }

  async update(entity: T, options?: Options): Promise<void> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.update(entity, options);
    }
    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const original = await super.findById(entity.getId());

    const rollback = {operation: super.update.bind(this, original as T)};
    const updated = await dataSource.runOperation(
      super.update.bind(this, entity),
      rollback,
      options,
    );

    return updated;
  }

  async delete(entity: T, options?: Options): Promise<void> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.delete(entity, options);
    }

    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const original = await super.findById(entity.getId());

    const rollback = {operation: super.create.bind(this, original as T)};
    const deleted = await dataSource.runOperation(
      super.delete.bind(this, entity),
      rollback,
      options,
    );

    return deleted;
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory' || !options) {
      return super.deleteById(id, options);
    }

    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options.transaction.id,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise(
        options.transaction.id,
      );
    }

    SerializableLocker.getInstance().lock(
      this.entityClass.name,
      options.transaction.id,
    );

    const original = await super.findById(id);

    const rollback = {operation: super.create.bind(this, original as T)};
    await dataSource.runOperation(
      super.deleteById.bind(this, id),
      rollback,
      options,
    );

    return;
  }

  async find(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations)[]> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory') {
      return super.find(filter, options);
    }
    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options?.transaction ? options.transaction.id : undefined,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise();
    }
    return super.find(filter, options);
  }

  async findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory') {
      return super.findOne(filter, options);
    }
    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options?.transaction ? options.transaction.id : undefined,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise();
    }

    return super.findOne(filter, options);
  }
  async findById(
    id: ID,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T & Relations> {
    const dataSource = this.dataSource as DbDataSource;
    if (dataSource.settings.connector !== 'memory') {
      return super.findById(id, filter, options);
    }
    if (
      SerializableLocker.getInstance().isLocked(
        this.entityClass.name,
        options?.transaction ? options.transaction.id : undefined,
      )
    ) {
      await SerializableLocker.getInstance().getUnlockPromise();
    }

    return super.findById(id, filter, options);
  }
}
