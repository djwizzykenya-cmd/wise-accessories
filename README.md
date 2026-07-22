# Wise Accessories - E-Commerce Marketplace for Motorcycle Spares

A full-stack e-commerce platform similar to Kilimall/Jumia, built specifically for selling motorcycle spares in Kenya.

## Project Structure

This is a monorepo with multiple services:

```
wise-accessories/
├── backend/          # Express.js API server with TypeScript
├── web/              # Next.js customer & seller platform
├── mobile/           # React Native mobile app
├── shared/           # Shared TypeScript types and utilities
├── .github/          # GitHub configurations
├── .env.example      # Environment variables template
├── package.json      # Root package.json with workspaces
└── README.md         # This file
```

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (with Prisma ORM)
- **Cache**: Redis
- **Auth**: JWT
- **Payments**: Stripe + Pesapal (M-Pesa)

### Web Platform
- **Framework**: Next.js 14+ (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Context API + Zustand (optional)
- **Deployment**: Vercel

### Mobile App
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Deployment**: TestFlight + Google Play Console

### Shared
- TypeScript type definitions
- Constants and enums
- Utility functions

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+
- Redis (optional for development)
- Git

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd wise-accessories
```

2. Install dependencies for all workspaces
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
# Update .env.local with your configuration
```

4. Set up the database
```bash
cd backend
npm run db:migrate
cd ..
```

### Development

Start all services in development mode:
```bash
npm run dev
```

Or run services individually:

**Backend**
```bash
cd backend
npm run dev
```

**Web**
```bash
cd web
npm run dev
```

**Mobile**
```bash
cd mobile
npm run dev
```

### Building

Build all services:
```bash
npm run build
```

### Testing

Run tests across all workspaces:
```bash
npm run test
```

## Features

### Phase 1 (MVP - Weeks 1-4)
- ✅ Product catalog with search & filters
- ✅ Multi-seller storefronts
- ✅ Shopping cart & checkout
- ✅ Order management
- ✅ User authentication (customer/seller/admin)
- ✅ Seller dashboard (product & order management)
- ✅ Admin dashboard
- ✅ Reviews & ratings
- ✅ Wishlist
- ✅ Payment integration (card + mobile money)

### Phase 2 (Post-MVP)
- 🔜 Delivery tracking with logistics integration
- 🔜 Advanced analytics
- 🔜 AI-powered recommendations
- 🔜 Live chat & customer support
- 🔜 Multi-currency support

## API Documentation

Full API documentation available at `/docs` once backend is running.

## Deployment

- **Backend**: Docker container on AWS ECS, DigitalOcean, or Railway
- **Web**: Vercel
- **Mobile**: TestFlight (iOS) + Google Play Console (Android)
- **Database**: AWS RDS PostgreSQL
- **Cache**: Redis Cloud

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT

## Contact

For questions or support, reach out to [your-email@example.com]
