import { getConnection } from 'typeorm';

export const clearDb = async () => {
  const entities = getConnection().entityMetadatas;
  for (const entity of entities) {
    const repository = await getConnection().getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName};`);
  }
};
