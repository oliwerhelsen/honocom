import { DatabaseConnection } from "./database-connection";

// Vi definiera interface nu, implementation kommer när vi lägger till Drizzle
export class DrizzleConnection implements DatabaseConnection {
  constructor(private drizzle: any) {} // any för nu, blir typed när vi lägger till Drizzle

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    // Implementation kommer
    throw new Error("Not implemented");
  }

  async queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    await this.query(sql, params);
  }

  async transaction<T>(fn: (tx: DatabaseConnection) => Promise<T>): Promise<T> {
    // Implementation kommer
    throw new Error("Not implemented");
  }
}
