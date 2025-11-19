# Environment Variables Reference

## Required Environment Variables

### 1. Database Configuration (REQUIRED)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/campusconnect"
```
**Required**: Yes  
**Description**: PostgreSQL database connection string  
**Format**: `postgresql://username:password@host:port/database_name`  
**Example**: `postgresql://postgres:mypassword@localhost:5432/campusconnect`

---

### 2. NextAuth Configuration (REQUIRED)
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```
**Required**: Yes  
**Description**: 
- `NEXTAUTH_URL`: Your application URL (use full URL with protocol)
- `NEXTAUTH_SECRET`: Secret key for JWT encryption (generate with `openssl rand -base64 32`)

**Production Example**:
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-very-long-random-secret-key-here"
```

---

### 3. WebSocket Configuration (REQUIRED)
```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```
**Required**: Yes  
**Description**: WebSocket server URL (same as NEXTAUTH_URL for development)  
**Production Example**: `NEXT_PUBLIC_SOCKET_URL="https://yourdomain.com"`

---

## Optional Environment Variables

### 4. Email Service Configuration (OPTIONAL - for production emails)
```env
EMAIL_SERVICE="resend"
EMAIL_SERVICE_API_KEY="your-email-service-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```
**Required**: No (works in display mode without these)  
**Description**: 
- `EMAIL_SERVICE`: Email provider - `"resend"` or `"sendgrid"`
- `EMAIL_SERVICE_API_KEY`: API key from your email service provider
- `EMAIL_FROM`: Sender email address

**Note**: Without these, the app works in "display mode" - emails are logged to console and links shown in UI.

**Resend Setup**:
1. Sign up at https://resend.com
2. Get API key from dashboard
3. Set `EMAIL_SERVICE=resend` and `EMAIL_SERVICE_API_KEY=re_...`

**SendGrid Setup**:
1. Sign up at https://sendgrid.com
2. Create API key
3. Set `EMAIL_SERVICE=sendgrid` and `EMAIL_SERVICE_API_KEY=SG....`

---

### 5. Cron Job Secret (OPTIONAL - for scheduled tasks)
```env
CRON_SECRET="your-cron-secret-key"
```
**Required**: No (only if using cron jobs for event reminders)  
**Description**: Secret key to secure cron job endpoints  
**Generate**: Use any random string (e.g., `openssl rand -base64 32`)

---

### 6. Port Configuration (OPTIONAL)
```env
PORT=3000
```
**Required**: No (defaults to 3000)  
**Description**: Port for the application server

---

## Complete .env File Template

### Development (Display Mode - No Email Service)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/campusconnect"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# WebSocket
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# Optional: Email Service (leave out for display mode)
# EMAIL_SERVICE="resend"
# EMAIL_SERVICE_API_KEY="your-api-key"
# EMAIL_FROM="noreply@campusconnect.com"

# Optional: Cron Secret
# CRON_SECRET="your-cron-secret"
```

### Production (With Email Service)
```env
# Database
DATABASE_URL="postgresql://user:password@your-db-host:5432/campusconnect"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret-key-min-32-chars"

# WebSocket
NEXT_PUBLIC_SOCKET_URL="https://yourdomain.com"

# Email Service (Required for production)
EMAIL_SERVICE="resend"
EMAIL_SERVICE_API_KEY="re_your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"

# Cron Secret (Recommended)
CRON_SECRET="your-secure-cron-secret-key"
```

---

## Quick Setup Guide

### Step 1: Create .env file
```bash
cp .env.example .env
```

### Step 2: Set Required Variables
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Add to .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/campusconnect"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[paste-generated-secret]"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

### Step 3: Set Up Database
```bash
# Make sure PostgreSQL is running
# Update DATABASE_URL with your credentials
```

### Step 4: (Optional) Add Email Service
```bash
# For production, add email service
EMAIL_SERVICE="resend"
EMAIL_SERVICE_API_KEY="your-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

---

## Environment Variable Usage

| Variable | Used In | Required | Default |
|----------|---------|----------|---------|
| `DATABASE_URL` | Prisma, Database | ✅ Yes | None |
| `NEXTAUTH_URL` | NextAuth, Email links | ✅ Yes | None |
| `NEXTAUTH_SECRET` | NextAuth JWT | ✅ Yes | None |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket client | ✅ Yes | None |
| `EMAIL_SERVICE` | Email sending | ❌ No | `resend` |
| `EMAIL_SERVICE_API_KEY` | Email sending | ❌ No | Display mode |
| `EMAIL_FROM` | Email sending | ❌ No | `noreply@campusconnect.com` |
| `CRON_SECRET` | Cron endpoints | ❌ No | None |
| `PORT` | Server | ❌ No | `3000` |

---

## Security Notes

1. **Never commit .env file** - It's in `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Different secrets per environment** - Dev, staging, production
4. **Rotate secrets regularly** - Especially in production
5. **Use environment-specific values** - Different URLs for dev/prod

---

## Verification

### Check if variables are set:
```bash
# In your terminal
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
```

### In code (server-side only):
```typescript
// These work in API routes and server components
process.env.DATABASE_URL
process.env.NEXTAUTH_SECRET

// Client-side (must start with NEXT_PUBLIC_)
process.env.NEXT_PUBLIC_SOCKET_URL
```

---

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env` file exists in project root
- Check file name is exactly `.env` (not `.env.local` or `.env.example`)
- Restart dev server after adding variables

### "NEXTAUTH_SECRET is missing"
- Generate secret: `openssl rand -base64 32`
- Add to `.env` file
- Restart dev server

### "Email service not working"
- Check if `EMAIL_SERVICE_API_KEY` is set
- Verify API key is correct
- Check email service provider dashboard
- Without API key, app works in display mode (emails logged to console)

### "WebSocket connection failed"
- Ensure `NEXT_PUBLIC_SOCKET_URL` matches your app URL
- Check server is running
- Verify CORS settings in `server.js`

---

## Production Checklist

Before deploying to production:

- [ ] Set `DATABASE_URL` to production database
- [ ] Set `NEXTAUTH_URL` to production domain (HTTPS)
- [ ] Generate new `NEXTAUTH_SECRET` (don't reuse dev secret)
- [ ] Set `NEXT_PUBLIC_SOCKET_URL` to production domain
- [ ] Configure email service (Resend/SendGrid)
- [ ] Set `EMAIL_FROM` to verified domain
- [ ] Set `CRON_SECRET` for scheduled tasks
- [ ] Verify all secrets are strong and unique
- [ ] Never commit `.env` file to git

---

## Summary

**Minimum Required (Development)**:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SOCKET_URL`

**Recommended for Production**:
- All above +
- `EMAIL_SERVICE`
- `EMAIL_SERVICE_API_KEY`
- `EMAIL_FROM`
- `CRON_SECRET`

The application works in **display mode** without email service configuration, making it perfect for development and testing!

