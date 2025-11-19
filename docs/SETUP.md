# CampusConnect Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
```sql
CREATE DATABASE campusconnect;
```

3. Update `.env` with your database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/campusconnect"
```

#### Option B: Use a Cloud Database (Recommended for Production)

- **Supabase**: Free PostgreSQL hosting
- **Railway**: Easy PostgreSQL setup
- **AWS RDS**: Production-grade database
- **Neon**: Serverless PostgreSQL

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Generate a random secret (use `openssl rand -base64 32`)
- `NEXT_PUBLIC_SOCKET_URL`: WebSocket server URL (same as NEXTAUTH_URL for development)

### 4. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Database Migrations

For production, use migrations instead of `db push`:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Verify network/firewall settings

### Authentication Issues

- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Verify email validation is working

### WebSocket Issues

- Ensure Socket.io server is running
- Check NEXT_PUBLIC_SOCKET_URL is set correctly
- Verify CORS settings

## Next Steps

1. Set up email service for password resets (SendGrid, Resend, etc.)
2. Configure file storage (AWS S3, Cloudinary, etc.)
3. Set up monitoring (Sentry, LogRocket)
4. Configure backups for database
5. Set up SSL/HTTPS certificates

