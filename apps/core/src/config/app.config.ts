export interface AppConfig {
  server: {
    port: number;
    host: string;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    prettyPrint: boolean;
  };
  features: {
    healthChecks: boolean;
    metrics: boolean;
    swagger: boolean;
  };
}

export function createAppConfig(): AppConfig {
  return {
    server: {
      port: Number(process.env.PORT) || 3000,
      host: process.env.HOST || '0.0.0.0'
    },
    cors: {
      origins: [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        ...(process.env.CORS_ORIGINS?.split(',') || [])
      ],
      credentials: true
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      prettyPrint: process.env.NODE_ENV !== 'production'
    },
    features: {
      healthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
      metrics: process.env.ENABLE_METRICS === 'true',
      swagger: process.env.ENABLE_SWAGGER === 'true'
    }
  };
}