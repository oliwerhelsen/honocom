import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { injectable } from 'inversify';
import { DatabaseConnection } from './database-connection';
import * as schema from './schema';

@injectable()
export class PostgresConnection implements DatabaseConnection {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;

  constructor() {
    const connectionString = this.buildConnectionString();
    
    // Create postgres client
    this.client = postgres(connectionString, {
      max: 20, // Maximum number of connections
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false, // Disable prepared statements for better compatibility
    });

    // Create Drizzle instance
    this.db = drizzle(this.client, { schema });
    
    console.log('🐘 PostgreSQL connection initialized');
  }

  private buildConnectionString(): string {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'mysecretpassword';
    const database = process.env.DB_NAME || 'honocom';

    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.client.unsafe(sql, params || []);
      return Array.from(result) as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  }

  async queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
    try {
      const results = await this.query<T>(sql, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw new Error(`Database queryOne failed: ${(error as Error).message}`);
    }
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    try {
      await this.client.unsafe(sql, params || []);
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error(`Database execute failed: ${(error as Error).message}`);
    }
  }

  async transaction<T>(fn: (tx: DatabaseConnection) => Promise<T>): Promise<T> {
    // For now, we'll use the same connection instance
    // In a real implementation, you'd create a transaction-specific connection
    try {
      return await fn(this);
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  // Drizzle-specific methods
  getDrizzle() {
    return this.db;
  }

  getClient() {
    return this.client;
  }

  async close(): Promise<void> {
    await this.client.end();
    console.log('🐘 PostgreSQL connection closed');
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.client`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}