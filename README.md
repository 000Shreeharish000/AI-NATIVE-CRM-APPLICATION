# XENO CRM: AI-Native Mini CRM for Reaching Shoppers

A full-stack, AI-native marketing and customer engagement CRM built for Direct-to-Consumer (D2C) brands. This application organizes shopper data, listens to social trends, automates campaign creation, and routes personalized communications through an asynchronous, webhook-driven channel delivery simulator.

This project was built to satisfy the **Xeno Forward Deployment Engineer (FDE) Take-Home Assignment**.

---

## 🚀 Key Features

* **Omnichannel Callback-Driven Loop (Core Specification)**:
  * Exposes a CRM dispatch engine (`/api/campaigns/send`) that targets user segments.
  * Routes campaigns to a stubbed, external **Channel Service** (`/api/mock-channel/send`).
  * Simulates delivery lifecycle asynchronously: `Delivered` ➔ `Read` ➔ `Clicked` ➔ `Ordered`.
  * Reports updates back to the CRM's receipt webhook endpoint (`/api/callbacks/receipt`).
* **Visual Shopper Simulator & Live Log Terminal**:
  * An interactive visual phone workspace to view messages arriving in real-time.
  * Supports manual developer overrides to trigger delivery, read, click, and purchase events.
  * Real-time scrolling webhook event log feed.
* **AI Social Trend Scanner**:
  * Listens to spikes in social media mentions (Instagram, TikTok, Pinterest) using **Gemini 2.5 Flash**.
  * Recommends campaign strategies and provides one-click campaign launching with prefilled parameters and AI prompts.
* **CSV Shopper Ingest Tool**:
  * Batch CSV importer that parses, validates (email regex/empty field checks), and stores customer records directly into MongoDB.
* **Segment-Level Performance Analytics**:
  * Dashboard analytics comparing total sent messages, CTR%, and attributed revenue across segments (VIPs, Coffee Lovers, Frequent Buyers, etc.).
* **Dynamic Template Token Interpolation**:
  * Interpolates user attributes like name (`{{name}}`) and last order date (`{{lastPurchaseDate}}`) in real-time before messaging.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, Lucide Icons
* **Backend**: Next.js Route Handlers (Serverless API Functions)
* **Database**: MongoDB Atlas with Mongoose ORM
* **AI Model**: Google Gemini 2.5 Flash (via Vercel AI SDK)
* **Styling**: Modern, premium dark/light mode system with Outfit typography and minimal sharp-edge design guidelines

---

## 📂 Codebase Directory

```
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── chat/             # AI marketing chat advisor
│   │   │   └── generate-content/ # AI campaign copywriter
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── callbacks/
│   │   │   └── receipt/          # Webhook callback receiver
│   │   ├── campaigns/            # Campaign drafts CRUD and dispatch
│   │   ├── customers/            # Customer queries & batch CSV imports
│   │   ├── mock-channel/         # Stubbed simulator service
│   │   ├── seed/                 # Database sandbox seeder
│   │   ├── segments/             # Segment filter query aggregators
│   │   └── trends/               # Social trend analyzer route
│   ├── dashboard/                # CRM Control Panel pages
│   │   ├── ai/
│   │   ├── campaigns/
│   │   ├── customers/
│   │   ├── simulator/            # Visual mock phone simulator
│   │   └── trends/
│   ├── globals.css               # Outfit typography & theme overrides
│   └── page.tsx                  # Premium FDE-focused landing page
├── components/
│   ├── theme-toggle.tsx
│   └── ui/                       # Sharp-edge custom layout elements
├── lib/
│   ├── models.ts                 # MongoDB Mongoose collection definitions
│   └── mongodb.ts                # Cached database connection helper
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
* **Node.js** v18+ 
* **pnpm** (preferred) or **npm**
* **MongoDB** (local server or Atlas connection string)
* **Gemini API Key** (from Google AI Studio)

### 2. Environment Configurations
Create a `.env.local` file in the root directory and add the following keys:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/xeno-crm?retryWrites=true&w=majority

# Gemini API Key (Required for trend listening, drafting, and chat)
GEMINI_API_KEY=AIzaSy...

# Public Application URL (required for local webhook callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view your CRM.

---

## 🚀 Deploying to Vercel

1. Push your project files to your GitHub repository (verify `.env.local` is ignored in `.gitignore`).
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository.
4. Under **Environment Variables**, add:
   * `MONGODB_URI`
   * `GEMINI_API_KEY`
   * `NEXT_PUBLIC_APP_URL` (Set this to your Vercel deployment URL)
5. Click **Deploy**. Vercel will compile the React dashboard and mount the serverless API endpoints instantly.

---

## 🛡️ Scalability & Reliability Highlights (Evaluator Reference)

* **Concurrency Lock Prevention**: Webhook stats are updated using MongoDB's atomic `$inc` operator inside `/api/callbacks/receipt`, preventing race conditions and document write conflicts.
* **Callback Idempotency**: Status updates verify the log history trace before execution to prevent counting duplicate read/click webhook posts.
* **Decoupled Queue Architecture**: As documented in the accompanying system design sheet, production scaling routes messages through AWS SQS/RabbitMQ queues to process backpressure and manage retries with Exponential Backoff policies.
