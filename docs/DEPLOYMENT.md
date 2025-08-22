# Deployment Guide

## Översikt

Denna guide beskriver hur man deployer HonoCom till olika miljöer från utveckling till produktion.

## Miljöer

### Utveckling (Development)

- Lokal utvecklingsmiljö
- Hot reload aktiverat
- Mock services
- Local PostgreSQL via Docker

### Staging

- Testmiljö som speglar produktion
- Verkliga externa tjänster
- Load testing
- Managed PostgreSQL

### Produktion (Production)

- Live miljö
- Skalbar infrastruktur
- Monitoring och logging
- Backup och disaster recovery

## Environment Variables

### Databas

```bash
# Databasanslutning
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=honocom
DB_SSL=true

# Connection pool
DB_MIN_CONNECTIONS=5
DB_MAX_CONNECTIONS=20
```

### Server

```bash
# Server konfiguration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# CORS
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true
```

### Säkerhet

```bash
# API Keys
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here

# Encryption
ENCRYPTION_KEY=your_encryption_key
SALT_ROUNDS=12
```

### Externa tjänster

```bash
# Payment provider
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email service
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@yourdomain.com

# File storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your-bucket
AWS_REGION=eu-north-1
```

### Monitoring

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Metrics
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30000

# APM
NEW_RELIC_LICENSE_KEY=your_license_key
DATADOG_API_KEY=your_datadog_key
```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build för optimal image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/*/
COPY apps/*/package.json apps/*/

# Install dependencies
RUN npm install -g pnpm@9.0.0
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json packages/*/
COPY apps/*/package.json apps/*/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/core/dist ./apps/core/dist
COPY --from=builder /app/packages/*/dist ./packages/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S honocom -u 1001

# Change ownership
RUN chown -R honocom:nodejs /app
USER honocom

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE 3000

CMD ["node", "apps/core/dist/main.js"]
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  honocom-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=honocom
      - DB_USER=postgres
      - DB_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=honocom
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - honocom-api
    restart: unless-stopped

secrets:
  db_password:
    file: ./secrets/db_password.txt

volumes:
  postgres_data:
```

### Build och Deploy

```bash
# Bygg Docker image
docker build -t honocom:latest .

# Tag för registry
docker tag honocom:latest your-registry.com/honocom:v1.0.0

# Push till registry
docker push your-registry.com/honocom:v1.0.0

# Deploy med compose
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: honocom
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: honocom-config
  namespace: honocom
data:
  NODE_ENV: "production"
  PORT: "3000"
  DB_HOST: "postgres-service"
  DB_PORT: "5432"
  DB_NAME: "honocom"
  LOG_LEVEL: "info"
```

### Secret

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: honocom-secrets
  namespace: honocom
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  STRIPE_SECRET_KEY: <base64-encoded-stripe-key>
```

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: honocom-api
  namespace: honocom
spec:
  replicas: 3
  selector:
    matchLabels:
      app: honocom-api
  template:
    metadata:
      labels:
        app: honocom-api
    spec:
      containers:
        - name: honocom-api
          image: your-registry.com/honocom:v1.0.0
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: honocom-config
            - secretRef:
                name: honocom-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: honocom-api-service
  namespace: honocom
spec:
  selector:
    app: honocom-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: honocom-ingress
  namespace: honocom
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: honocom-tls
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: honocom-api-service
                port:
                  number: 80
```

### Deploy till Kubernetes

```bash
# Skapa namespace
kubectl apply -f k8s/namespace.yaml

# Skapa secrets
kubectl apply -f k8s/secret.yaml

# Deploy applikationen
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Kontrollera status
kubectl get pods -n honocom
kubectl get services -n honocom
kubectl get ingress -n honocom
```

## Cloud Deployment

### AWS (ECS + RDS)

#### Task Definition

```json
{
  "family": "honocom-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "honocom-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/honocom:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:honocom/db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/honocom-api",
          "awslogs-region": "eu-north-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Google Cloud (Cloud Run + Cloud SQL)

#### Dockerfile för Cloud Run

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Build
RUN npm run build

# Start
CMD ["npm", "start"]
```

#### Deploy till Cloud Run

```bash
# Bygg och pusha till GCR
gcloud builds submit --tag gcr.io/PROJECT-ID/honocom

# Deploy till Cloud Run
gcloud run deploy honocom \
  --image gcr.io/PROJECT-ID/honocom \
  --platform managed \
  --region europe-north1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-cloudsql-instances PROJECT-ID:europe-north1:honocom-db
```

## Database Migration

### Produktionsmigration

```bash
# Backup innan migration
pg_dump -h production-db-host -U username -d honocom > backup.sql

# Kör migration
pnpm db:migrate

# Verifiera migration
pnpm db:status
```

### Zero-downtime Deployment

1. **Blue-Green Deployment**
   - Deploy till parallell miljö
   - Växla trafik efter verifiering
   - Behåll gammal miljö som backup

2. **Rolling Updates**
   - Uppdatera en instans i taget
   - Verifiera hälsa innan nästa
   - Automatisk rollback vid fel

3. **Database Migrations**
   - Bakåtkompatibla schemaändringar
   - Feature flags för nya kolumner
   - Separata deployments för schema och kod

## Monitoring

### Health Checks

```typescript
// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  });
});

// Readiness check
app.get("/ready", async (c) => {
  try {
    // Kontrollera databasanslutning
    await db.raw("SELECT 1");

    return c.json({
      ready: true,
      services: {
        database: "ok",
        cache: "ok",
      },
    });
  } catch (error) {
    return c.json(
      {
        ready: false,
        error: error.message,
      },
      503
    );
  }
});
```

### Logging

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
        }
      : undefined,
});

// Structured logging
logger.info(
  {
    action: "product_created",
    productId: product.id,
    userId: request.userId,
    timestamp: new Date().toISOString(),
  },
  "Product created successfully"
);
```

### Metrics

```typescript
import promClient from "prom-client";

// Application metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

// Business metrics
const ordersTotal = new promClient.Counter({
  name: "orders_total",
  help: "Total number of orders",
  labelNames: ["status"],
});
```

## Säkerhet

### SSL/TLS

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://honocom-api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Secrets Management

```bash
# Använd secrets management
kubectl create secret generic honocom-secrets \
  --from-literal=db-password=your-secure-password \
  --from-literal=jwt-secret=your-jwt-secret

# Docker secrets
echo "your-secure-password" | docker secret create db_password -
```

## Backup & Recovery

### Database Backup

```bash
# Automatisk backup (cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER -d honocom > "/backups/honocom_$DATE.sql"

# Rensa gamla backups (behåll 30 dagar)
find /backups -name "honocom_*.sql" -mtime +30 -delete
```

### Recovery Plan

1. **Identifiera problem**
2. **Stoppa trafik till problemtjänst**
3. **Återställ från backup**
4. **Kör data integrity checks**
5. **Dirigera trafik tillbaka**
6. **Verifiera funktionalitet**

## Performance Optimization

### Load Testing

```bash
# Artillery.io
artillery run load-test.yml

# Load test konfiguration
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
scenarios:
  - name: "Create product"
    weight: 70
    flow:
      - post:
          url: "/api/v1/catalog/products"
          json:
            name: "Test Product"
            sku: "TEST-{{ $randomString() }}"
            listPrice: 999
```

### Caching

```typescript
// Redis caching
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function getCachedProduct(productId: string) {
  const cached = await redis.get(`product:${productId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const product = await productRepository.findById(productId);
  if (product) {
    await redis.setex(`product:${productId}`, 300, JSON.stringify(product));
  }

  return product;
}
```

## Troubleshooting

### Vanliga produktionsproblem

#### Högt minnesanvändning

```bash
# Kontrollera memory leaks
kubectl top pods -n honocom
docker stats

# Profiling
node --inspect=0.0.0.0:9229 dist/main.js
```

#### Databas-performance

```sql
-- Kontrollera långsamma queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index användning
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'products';
```

#### Network issues

```bash
# Kontrollera connectivity
kubectl exec -it pod-name -- nslookup postgres-service
curl -v http://api.yourdomain.com/health

# Trace network calls
tcpdump -i eth0 port 5432
```

## Rollback Strategy

### Automated Rollback

```bash
# Kubernetes rollback
kubectl rollout undo deployment/honocom-api -n honocom

# Docker swarm rollback
docker service rollback honocom-api

# Verify rollback
kubectl rollout status deployment/honocom-api -n honocom
```

### Database Rollback

```bash
# Restore från backup
pg_restore -h $DB_HOST -U $DB_USER -d honocom backup.sql

# Migration rollback
pnpm db:rollback
```

Detta kompletterar dokumentationen med detaljerad information om deployment, monitoring och drift av HonoCom i produktionsmiljö.
