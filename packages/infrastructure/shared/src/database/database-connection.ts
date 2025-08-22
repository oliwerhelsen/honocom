export interface DatabaseConnection {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(fn: (tx: DatabaseConnection) => Promise<T>): Promise<T>;
}

export interface DatabaseTransaction extends DatabaseConnection {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
