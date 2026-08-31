import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'sonia',
  password: '123456',
  database: 'tienda-db',

  entities: ['src/**/*.entity.ts'],

  migrations: ['src/migrations/*.ts'],
});