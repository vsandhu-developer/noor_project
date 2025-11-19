# CampusConnect - Student Collaboration Platform

A comprehensive web-based collaboration platform for college students to connect, form study groups, share learning resources, communicate in real-time, and schedule study activities.

## 📚 Documentation

All project documentation is located in the [`docs/`](./docs/) folder:

- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Environment Variables](./docs/ENV_VARIABLES.md)** - Required environment variables
- **[Requirements](./docs/requirements.md)** - Complete requirements specification
- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Architecture and API documentation

See the [docs README](./docs/README.md) for a complete documentation index.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/campusconnect"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
   ```
   
   See [ENV_VARIABLES.md](./docs/ENV_VARIABLES.md) for detailed configuration.

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

For detailed setup instructions, see [SETUP.md](./docs/SETUP.md).

## ✨ Features

- ✅ **Authentication** - Secure login with email verification
- ✅ **User Profiles** - Customizable profiles with visibility settings
- ✅ **Study Groups** - Create, search, and join study groups
- ✅ **File Sharing** - Upload, download, and preview files
- ✅ **Real-Time Messaging** - Group chat and direct messages with WebSockets
- ✅ **Notifications** - In-app notifications with email/push preferences
- ✅ **Calendar & Events** - Schedule meetings with RSVP and reminders
- ✅ **Search & Discovery** - Search groups, users, and files with recommendations

See [FEATURES_IMPLEMENTED.md](./docs/FEATURES_IMPLEMENTED.md) for complete feature list.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI

## 📖 Documentation

All documentation is in the [`docs/`](./docs/) folder:

- [Setup Guide](./docs/SETUP.md)
- [Environment Variables](./docs/ENV_VARIABLES.md)
- [Requirements](./docs/requirements.md)
- [Project Summary](./docs/PROJECT_SUMMARY.md)
- [Implementation Status](./docs/COMPLETE_REQUIREMENTS_STATUS.md)

## 🔒 Security

- Password hashing with bcrypt
- Input validation with Zod
- XSS and SQL injection protection
- Rate limiting
- Session management
- HTTPS ready (production)

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

For more information, see the [documentation](./docs/README.md).

