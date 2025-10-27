# CineVerse - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Code editor (VS Code recommended)

---

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

---

## Step 2: Environment Setup

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:

```env
# Get these from https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API is already configured
NEXT_PUBLIC_API_BASE_URL=https://cinevserse-api.nhatquang.shop
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "SQL Editor"
3. Copy contents from `docs/database-schema.sql`
4. Paste and run the SQL

✅ Database is now ready!

---

## Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open: http://localhost:3000

---

## 🎯 What's Included?

### ✅ Ready to Use
- Movie browsing and streaming
- Search with advanced filters
- User authentication (email + OAuth)
- Profile management
- Admin dashboard
- Responsive design
- Dark/light themes

### 🎬 Try These Features

1. **Browse Movies**: Visit homepage to see trending movies
2. **Search**: Use search bar for keyword search
3. **Filter**: Click categories to filter by genre
4. **Sign Up**: Create account with email or OAuth
5. **Profile**: Manage favorites and watch history

---

## 📚 Key Files

```
cineverse-streaming/
├── app/                    # Pages and routes
│   ├── page.tsx           # Homepage
│   ├── movies/[slug]/     # Movie details
│   ├── search/            # Search page
│   ├── profile/           # User profile
│   └── admin/             # Admin dashboard
├── components/            # UI components
├── lib/api/              # API client
│   └── movies-v2.ts      # CineVerse API
├── proxy.ts              # Auth middleware
└── next.config.ts        # Next.js config
```

---

## 🔧 Configuration

### Already Configured
- ✅ Next.js 16 with React 19.2
- ✅ TypeScript strict mode
- ✅ Tailwind CSS + shadcn/ui
- ✅ Supabase authentication
- ✅ API v2 integration
- ✅ Image optimization
- ✅ PWA ready

### Optional Setup
- OAuth providers (Google, Facebook, Twitter)
- Custom domain
- Analytics
- Payment integration

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [README.md](./README.md) | Project overview |
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | Detailed setup |
| [FEATURES.md](./docs/FEATURES.md) | Complete feature list |
| [API_V2_GUIDE.md](./docs/API_V2_GUIDE.md) | API documentation |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deploy to production |

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: "your-color",
    },
  },
}
```

### Add OAuth Provider
1. Configure in Supabase dashboard
2. Add credentials to `.env.local`
3. Provider button already implemented!

### Customize Layout
Edit `app/layout.tsx` for global changes

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Then start again
npm run dev
```

### Environment Variables Not Loading
- Restart dev server after changing `.env.local`
- Ensure file is in root directory
- Check for typos in variable names

### Supabase Connection Error
- Verify credentials in `.env.local`
- Check Supabase project is active
- Ensure database schema is created

---

## 🚀 Deploy to Production

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Netlify
- Railway
- Docker
- Self-hosting

---

## 🎓 Next Steps

1. **Explore Features**
   - Browse movies
   - Try search and filters
   - Create an account
   - Test video player

2. **Customize**
   - Change branding
   - Modify colors
   - Add custom features

3. **Deploy**
   - Set up production environment
   - Configure custom domain
   - Enable analytics

4. **Extend**
   - Add payment system
   - Implement recommendations
   - Create mobile app

---

## 💡 Tips

- Use `npm run dev` for fast refresh
- Check browser console for errors
- Read API docs for advanced queries
- Join Supabase Discord for help

---

## 📞 Need Help?

- 📖 Check [documentation](./docs/)
- 🐛 Open GitHub issue
- 💬 Ask in community forums
- 📧 Contact support

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Database schema created
- [ ] Dev server running
- [ ] Can access http://localhost:3000
- [ ] Movies displaying on homepage
- [ ] Search working
- [ ] Can sign up/login

---

**Congratulations! You're ready to build with CineVerse!** 🎉

Start developing: `npm run dev`

Visit: http://localhost:3000