import 'reflect-metadata';
import { serve } from '@hono/node-server';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('🌟 Starting HonoCom Core Application...');

    // Initialize the main application module
    const appModule = new AppModule();
    const app = appModule.getApp();

    // Get port from environment or default to 3000
    const port = Number(process.env.PORT) || 3000;

    // Start the server
    serve({
      fetch: app.fetch,
      port: port
    }, (info) => {
      console.log('');
      console.log('🚀 HonoCom Core API is running!');
      console.log('');
      console.log(`📍 Server: http://localhost:${info.port}`);
      console.log(`🏥 Health: http://localhost:${info.port}/health`);
      console.log(`📋 Ready: http://localhost:${info.port}/ready`);
      console.log('');
      console.log('📚 API Endpoints:');
      console.log(`   📦 Catalog: http://localhost:${info.port}/api/v1/catalog`);
      console.log(`   📋 Orders: http://localhost:${info.port}/api/v1/orders`);
      console.log(`   🛒 Checkout: http://localhost:${info.port}/api/v1/checkout`);
      console.log('');
      console.log('🎯 Test endpoints:');
      console.log(`   POST http://localhost:${info.port}/api/v1/catalog/products`);
      console.log(`   POST http://localhost:${info.port}/api/v1/orders`);
      console.log(`   POST http://localhost:${info.port}/api/v1/checkout`);
      console.log('');
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 SIGTERM received, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('📴 SIGINT received, shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('💥 Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();