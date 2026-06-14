# AI Marketing Copilot

A full-stack marketing automation platform powered by AI, built with Next.js 16, MongoDB, and the AI SDK.

## Features

- **Sharp-Edge UI Design** - Modern, clean interface with dark/light theme support
- **Campaign Management** - Create, manage, and optimize marketing campaigns
- **AI-Powered Chat Assistant** - Get AI recommendations for campaign optimization
- **Analytics Dashboard** - Real-time performance metrics and insights
- **MongoDB Integration** - Persistent data storage with Mongoose ORM
- **Theme System** - Seamless dark/light mode switching
- **Authentication** - User registration and login system

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ORM
- **AI**: AI SDK with OpenAI (GPT-3.5 Turbo)
- **Authentication**: Custom JWT-based auth system
- **Styling**: Sharp-edge UI with minimal border radius

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── campaigns/
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── ai/
│   │       └── chat/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── ai/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/
│       ├── sharp-button.tsx
│       ├── sharp-input.tsx
│       └── sharp-card.tsx
├── lib/
│   ├── mongodb.ts
│   ├── models.ts
│   └── utils.ts
└── public/
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB (local or cloud instance)
- OpenAI API key

### 1. Clone & Install

```bash
cd your-project
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# MongoDB - Use local or MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/marketing-copilot
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketing-copilot?retryWrites=true&w=majority

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk_your_key_here

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB server locally
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and add to `.env.local`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login

### Campaigns
- `GET /api/campaigns?userId=...` - Get user campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `DELETE /api/campaigns/[id]` - Delete campaign

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant

## Features Guide

### 1. Landing Page
- Overview of features and benefits
- Call-to-action buttons for registration
- Responsive design with theme toggle

### 2. Authentication
- Email/password registration
- Login with validation
- Session stored in localStorage
- Protected dashboard routes

### 3. Dashboard
- Overview of campaign statistics
- Recent campaigns table
- Quick access to all features
- User profile in sidebar

### 4. Campaign Management
- Create new campaigns
- View all campaigns
- Set campaign type (email, social, content, ads)
- Set status (draft, active, paused)
- Delete campaigns
- View campaign performance metrics

### 5. AI Assistant
- Chat interface with AI
- Campaign context selection
- Real-time responses
- Conversation history
- Suggestions for optimization

### 6. Settings
- Profile management
- Security settings
- Notification preferences
- Plan & billing information

## Customization

### Theme Customization

Edit `app/globals.css` to modify colors:

```css
:root {
  --background: oklch(1 0 0);        /* White in light mode */
  --foreground: oklch(0.145 0 0);    /* Black text */
  --primary: oklch(0.205 0 0);       /* Primary color */
  --primary-foreground: oklch(0.985 0 0);
}

.dark {
  --background: oklch(0.145 0 0);    /* Dark background */
  --foreground: oklch(0.985 0 0);    /* Light text */
  --primary: oklch(0.922 0 0);       /* Light primary */
}
```

### Sharp Edges

The UI uses sharp corners by default. All border-radius values are set to 0 in the Tailwind theme. Only buttons and inputs have minimal rounding (2-4px).

To adjust, modify in `globals.css`:

```css
--radius-sm: 0;      /* Sharp edges */
--radius-md: 2px;    /* Minimal curve (optional) */
```

## Development Workflow

1. **Create Components** in `components/ui/` for reusable pieces
2. **Add API Routes** in `app/api/` for backend logic
3. **Create Pages** in `app/` following Next.js file structure
4. **Database Operations** use models from `lib/models.ts`
5. **Theme Testing** use the theme toggle to check dark/light modes

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel
```

### Environment Variables for Vercel
- `MONGODB_URI` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_APP_URL` - Production URL

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Check MongoDB Atlas IP whitelist (if using cloud)
- Verify `MONGODB_URI` in `.env.local`

### AI Assistant Not Working
- Verify `OPENAI_API_KEY` is set
- Check API key is valid and has credits
- Review API rate limits

### Theme Not Switching
- Clear browser localStorage and cache
- Check `suppressHydrationWarning` is in `<html>` tag
- Verify next-themes is properly installed

## Future Enhancements

- Real-time analytics with charts
- Campaign templates
- A/B testing tools
- Team collaboration features
- Advanced analytics and reporting
- Integration with marketing platforms
- Scheduled campaign automation
- Custom branding options

## License

MIT - Feel free to use this project commercially and modify as needed.

## Support

For issues and questions, refer to the documentation or create an issue in your repository.
