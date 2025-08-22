import 'reflect-metadata';
import { serve } from '@hono/node-server';
import { createApp } from './app-simple';

async function bootstrap() {
  try {
    console.log('🌟 Starting HonoCom Core Application...');

    // Initialize the application
    const app = createApp();

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
      console.log('');
      console.log('📚 API Endpoints:');
      console.log(`   📦 Catalog: http://localhost:${info.port}/api/v1/catalog/products`);
      console.log(`   📋 Orders: http://localhost:${info.port}/api/v1/orders`);
      console.log(`   🛒 Checkout: http://localhost:${info.port}/api/v1/checkout`);
      console.log('');
      console.log('🎯 Test with:');
      console.log('   curl -X POST http://localhost:' + info.port + '/api/v1/catalog/products \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"name":"Test Product","sku":"TEST-001","listPrice":999,"currency":"SEK"}\'');
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