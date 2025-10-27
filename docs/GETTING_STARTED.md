# Getting Started with CineVerse

## 🚀 Quick Start Guide

Follow these steps to get CineVerse up and running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cineverse-streaming.git
cd cineverse-streaming
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment example file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External API
NEXT_PUBLIC_API_BASE_URL=https://cinevserse-api.nhatquang.shop
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional OAuth (configure in Supabase dashboard)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Database Setup

1. **Create a new Supabase project**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Click "New Project"
   - Choose your organization and enter project details

2. **Run the database schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `docs/database-schema.sql`
   - Paste and execute the SQL

3. **Configure Authentication Providers** (Optional)
   - Go to Authentication > Providers
   - Enable and configure Google, Facebook, Twitter OAuth
   - Add your OAuth credentials

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration Guide

### Supabase Setup

1. **Get your Supabase credentials:**
   - Project URL: Found in Project Settings > API
   - Anon Key: Found in Project Settings > API
   - Service Role Key: Found in Project Settings > API (keep this secret!)

2. **Authentication Setup:**
   - Go to Authentication > Settings
   - Configure your site URL: `http://localhost:3000`
   - Add redirect URLs for OAuth providers

3. **Database Policies:**
   - The schema includes Row Level Security (RLS) policies
   - Users can only access their own data
   - Admin users have elevated permissions

### OAuth Configuration

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URI

#### Twitter OAuth
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Configure OAuth settings
4. Add callback URL

## 🎯 Key Features Setup

### 1. Movie Data
- The app uses the CineVerse API for movie data
- No additional setup required for movie content
- Data is fetched dynamically from the external API

### 2. User Profiles
- Automatically created when users sign up
- Stored in Supabase `profiles` table
- Includes preferences and settings

### 3. Admin Access
- Set user role to 'admin' in the profiles table
- Access admin dashboard at `/admin`
- Manage users, content, and analytics

### 4. PWA Features
- Service worker ready (needs registration)
- Manifest file included
- Offline capabilities can be added

## 🧪 Testing

### Run Development Tests
```bash
npm run test
# or
yarn test
```

### Type Checking
```bash
npm run type-check
# or
yarn type-check
```

### Linting
```bash
npm run lint
# or
yarn lint
```

## 📦 Building for Production

### Build the Application
```bash
npm run build
# or
yarn build
```

### Start Production Server
```bash
npm start
# or
yarn start
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables:**
   - Go to Vercel dashboard
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

3. **Deploy:**
   - Push to GitHub
   - Vercel auto-deploys on push

### Other Platforms

The app can be deployed to:
- **Netlify**: Configure build settings
- **Railway**: Connect GitHub repo
- **DigitalOcean App Platform**: Use Docker or buildpacks
- **Self-hosted**: Use Docker or PM2

## 🔍 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server
   - Check variable names match exactly

2. **Supabase Connection Issues**
   - Verify your Supabase URL and keys
   - Check if your IP is allowed (if using restrictions)
   - Ensure RLS policies are correctly set

3. **OAuth Not Working**
   - Check redirect URLs match exactly
   - Verify OAuth app is in production mode
   - Ensure credentials are correctly set

4. **Build Errors**
   - Run `npm run type-check` to find TypeScript errors
   - Check for missing dependencies
   - Verify environment variables are set

### Getting Help

- Check the [documentation](./README.md)
- Review [deployment guide](./DEPLOYMENT.md)
- Open an issue on GitHub
- Check Supabase documentation

## 📚 Next Steps

After getting the app running:

1. **Customize the Design**
   - Modify colors in `tailwind.config.ts`
   - Update branding and logos
   - Customize component styles

2. **Add Features**
   - Implement additional OAuth providers
   - Add payment integration
   - Create mobile app with React Native

3. **Scale the Application**
   - Set up CDN for images
   - Implement caching strategies
   - Add monitoring and analytics

4. **Security Enhancements**
   - Enable additional Supabase security features
   - Add rate limiting
   - Implement content moderation

## 🎉 You're Ready!

Your CineVerse movie streaming platform is now ready for development and customization. Enjoy building your movie streaming experience!

---

For more detailed information, check out:
- [Feature Documentation](./FEATURES.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md)