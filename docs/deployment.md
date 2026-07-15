# Production Deployment Plan (AWS + Serverless Cloud Services)

This document outlines the step-by-step procedure for deploying the Online Auction platform to a production-ready environment. 

To maximize portfolio impact while keeping monthly costs at ~**$3.60/month** (just the AWS public IPv4 fee), we host the heavy databases/brokers on free-tier cloud services and deploy the core application components on AWS.

---

## 1. Target Architecture

```mermaid
graph TD
    Client[Client Browser] -->|HTTPS / WSS| CF["AWS CloudFront (CDN)"]
    CF -->|Static Assets| S3["AWS S3 Bucket (Vite Frontend)"]
    Client -->|API / Socket.io| EC2["AWS EC2 / Lightsail Instance (API Server)"]
    
    subgraph EC2Instance ["AWS EC2 Container Stack"]
        EC2 -->|Reverse Proxy| Nginx["Nginx Reverse Proxy & SSL (Certbot)"]
        Nginx -->|Port 5000| APIContainer["Backend API Container"]
        Nginx -.->|WebSocket Upgrade| APIContainer
        WorkerContainer["Node Worker Container"]
    end
    
    subgraph ManagedServices ["External Managed Services"]
        APIContainer -->|Queries| Supabase[("Supabase PostgreSQL")]
        APIContainer -->|Cache & Rate Limit| UpstashRedis[("Upstash Redis")]
        APIContainer -->|Events| UpstashKafka[("Upstash Kafka")]
        WorkerContainer -->|Events| UpstashKafka
        WorkerContainer -->|Writes| Supabase
    end
```

---

## 2. Environment Variables & Credentials

Create a secure `.env` file on the production EC2 host. **Never commit this file to Git.**

### Backend API & Worker Settings
* `NODE_ENV=production`
* `PORT=5000`
* `JWT_SECRET=your_production_jwt_secret`
* `CORS_ORIGIN=https://your-frontend-domain.com`
* `COOKIE_DOMAIN=your-backend-domain.com`

### Database (Supabase PostgreSQL)
* `DB_HOST=your-supabase-db-host.supabase.co`
* `DB_PORT=5432`
* `DB_USER=postgres`
* `DB_PASSWORD=your_supabase_db_password`
* `DB_NAME=postgres`

### Cache & Rate Limiting (Upstash Redis)
* `REDIS_URL=rediss://default:your_upstash_redis_password@your-upstash-redis-endpoint.upstash.io:6379`

### Messaging Queue (Upstash Kafka or Confluent Cloud)
* `KAFKA_BROKERS=your-kafka-broker-endpoint.upstash.io:9092`
* `KAFKA_SASL_USERNAME=your_sasl_username`
* `KAFKA_SASL_PASSWORD=your_sasl_password`

---

## 3. Step-by-Step Deployment Instructions

### Phase 1: Deploy Frontend (AWS S3 + CloudFront)

Vite compiles the frontend into static assets (`HTML`, `JS`, `CSS`). We serve these via a content delivery network (CDN) to ensure fast load times worldwide.

1. **Build Frontend**:
   Build the Vite app locally or in CI:
   ```bash
   cd Frontend
   npm install
   VITE_API_URL=https://api.yourdomain.com npm run build
   ```
2. **Provision S3 Bucket**:
   * Create an S3 bucket named `online-auction-frontend`.
   * Enable static website hosting. Set the index document to `index.html`.
   * Upload the contents of your `dist/` directory directly to the bucket.
3. **Provision CloudFront CDN**:
   * Create a CloudFront Distribution with the S3 bucket static website endpoint as the **Origin**.
   * **Crucial for Single Page Apps (React Router)**: Create a custom error response rule:
     * **Error Code**: `403` and `404`.
     * **Response Page Path**: `/index.html`.
     * **HTTP Status Code**: `200` (Redirects client-side routing back to React).
   * Link your domain (e.g., `yourdomain.com`) using AWS Route 53 or your DNS provider.

---

### Phase 2: Set Up External Cloud Services

1. **Supabase (PostgreSQL)**:
   * Create a project on Supabase.
   * Run the SQL migration scripts located in your project's `/data` directory in the Supabase SQL editor to initialize tables and seed initial category data.
2. **Upstash Redis**:
   * Create a Redis database. Enable SSL/TLS encryption.
   * Copy the connection string (`REDIS_URL`).
3. **Upstash Kafka**:
   * Create a Kafka cluster.
   * Create the required topics: `bid-placed`, `auction-ended`, and `email-notifications`.
   * Copy the SASL credentials and Broker connection string.

---

### Phase 3: Setup EC2 Host (Ubuntu Server)

1. **Launch Instance**:
   * Select `t3.micro` (Free Tier) or `t2.micro` running **Ubuntu Server 22.04 LTS**.
   * Assign a **Security Group** allowing incoming traffic on:
     * Port `22` (SSH - restrict access to your IP)
     * Port `80` (HTTP - required for Certbot challenge)
     * Port `443` (HTTPS - secure web traffic)
2. **Install Docker Engine**:
   Execute the following on the EC2 host:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```
   *Log out and log back in to apply Docker group permissions.*

---

### Phase 4: Deploy Backend Containers

Instead of compiling code on the EC2 instance, use a Docker Compose profile configured for production. Create a [docker-compose.prod.yml](file:///D:/HCMUS/Third%20Year/Ultra%20Web%20Skills/ReflourishedOnlineAuction/Online-Auction/docs/deployment.md) file:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ../Backend
      dockerfile: Dockerfile
    container_name: production-api
    command: node dist/server.js
    ports:
      - "5000:5000"
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - REDIS_URL=${REDIS_URL}
      - KAFKA_BROKERS=${KAFKA_BROKERS}
      - KAFKA_SASL_USERNAME=${KAFKA_SASL_USERNAME}
      - KAFKA_SASL_PASSWORD=${KAFKA_SASL_PASSWORD}

  worker:
    build:
      context: ../Backend
      dockerfile: Dockerfile
    container_name: production-worker
    command: node dist/worker.js
    restart: always
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - REDIS_URL=${REDIS_URL}
      - KAFKA_BROKERS=${KAFKA_BROKERS}
      - KAFKA_SASL_USERNAME=${KAFKA_SASL_USERNAME}
      - KAFKA_SASL_PASSWORD=${KAFKA_SASL_PASSWORD}
```

Start the containers on the EC2 host:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env up -d --build
```

---

### Phase 5: Nginx Reverse Proxy & SSL (Let's Encrypt)

1. **Install Nginx**:
   ```bash
   sudo apt install -y nginx
   ```
2. **Configure Nginx**:
   Edit `/etc/nginx/sites-available/default` to forward incoming traffic and upgrade Socket.io connections:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           
           # Crucial headers for WebSockets / Socket.io
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```
3. **Acquire SSL Certificate**:
   Use Certbot to automatically configure Let's Encrypt HTTPS support:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```
   *Certbot will automatically modify the Nginx configuration to support SSL on port 443 and auto-renew the certificates.*

---

## 4. Release Smoke Test & Verification Checklist

Once deployed, execute the following smoke checks to verify system health:

* **Basic Connection Check**:
  ```bash
  curl -i https://api.yourdomain.com/health
  curl -i https://api.yourdomain.com/ready
  ```
  Expected: `/ready` returns `200 OK` with all databases, cache, and broker connections marked true.
* **WebSocket Connection Test**:
  Open the browser console on the frontend website. Verify that Socket.io successfully establishes a WebSocket transport connection rather than falling back to HTTP long polling.
* **Cookie Auth Verification**:
  Ensure login tokens are securely set with `Secure`, `HttpOnly`, and `SameSite=Lax` headers.
* **Worker Logs Check**:
  SSH into the EC2 instance and inspect worker processes to ensure active consumption of Kafka topics:
  ```bash
  docker logs production-worker --tail 100
  ```

---

## 5. Degradation & Rollback Plan

* **Redis Cache/Rate Limit Outage**:
  If Redis goes down, `express-rate-limit` will gracefully degrade to memory-based local rate-limiting, and key read paths should fall back directly to database queries.
* **Database Rollback Plan**:
  Keep full backups via Supabase before running any schema migrations. If a migration fails, run down-migrations or restore the DB snapshot.
* **API/Worker Rollback**:
  To roll back code to a previous version on the server, update the Docker image tags or pull the previous stable git commit on the host machine and run:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d --build
  ```
