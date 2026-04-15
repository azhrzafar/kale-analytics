# Kale Analytics Dashboard

A unified analytics dashboard that consolidates data from **Instantly** and **Email Bison** into a single source of truth in Supabase, providing actionable insights for email outreach decision-making.

## Core Mission

Unify data from Instantly + Email Bison into Supabase, then visualize it to enable the team for decision-making -- without being limited by the native dashboards of those tools -- with accurate syncing, historical data, and actionable insights.

**Key Business Context:**
- **Two Main Platforms**: Instantly and Email Bison (same purpose, different UIs)
- **Lead Management**: Lists built outside sequencers, manually mapped into campaigns
- **Campaign Structure**: Multiple steps with A/B testing (e.g., 5 variations in step 2)
- **Reply Processing**: Missive consolidates all replies with GPT sentiment analysis
- **Unique Email Identifier**: "True email address" system for cross-platform deduplication
- **Weekly Monitoring**: Track performance changes and detect deliverability issues

## Core Metrics Tracked

1. **Reply Rate (%)** and raw reply count
2. **Positive Reply Rate (%)** and positive reply count
3. **Bounce Rate (%)** and raw count
4. **Emails Sent (total)** and unique leads contacted
5. **Send-to-Positive Reply Ratio** (number of sends per positive reply)
6. **Inbox Sending Capacity Usage** (daily send allowance utilization)

## Pages

| Route | Purpose |
|---|---|
| `/dashboard` | Executive overview -- core KPIs, charts, alerts, and drill-down affordances |
| `/clients` | Client-specific analytics, performance ranking, and health scores (137 clients) |
| `/clients/[id]` | Individual client detail with campaign breakdown |
| `/campaigns` | Campaign performance, success rates, and A/B testing results (15K+ campaigns) |
| `/campaigns/[id]` | Per-campaign analysis with step-level insights and variant comparison |
| `/inboxes` | Inbox capacity utilization, warmup status, and domain reputation (606K+ inboxes) |
| `/leads` | Lead management and quality analysis (602K+ leads) |
| `/platforms` | Cross-platform performance comparison (Instantly, Bison, Missive) |
| `/users` | User management |
| `/settings` | Application settings |

## API Routes

| Endpoint | Description |
|---|---|
| `/api/clients` | Client listing and management |
| `/api/clients/[id]` | Individual client data |
| `/api/campaigns` | Campaign listing and management |
| `/api/campaigns/[id]` | Individual campaign data |
| `/api/analytics/kpi` | Core KPI aggregations |
| `/api/analytics/platform-performance` | Cross-platform metrics |
| `/api/analytics/send-volume-trends` | Send volume over time |
| `/api/analytics/client-statistics` | Client-level statistics |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18, Headless UI, Heroicons, Lucide React
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Database**: Supabase (PostgreSQL)
- **Date Handling**: date-fns, react-datepicker
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project with the required schema

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── dashboard/     # Executive overview
│   │   ├── clients/       # Client analytics
│   │   ├── campaigns/     # Campaign performance
│   │   ├── inboxes/       # Inbox health
│   │   ├── leads/         # Lead management
│   │   ├── platforms/     # Platform comparison
│   │   ├── users/         # User management
│   │   └── settings/      # App settings
│   ├── api/               # API routes
│   └── auth/              # Authentication
├── components/            # Reusable UI components
│   ├── Auth/
│   ├── Common/
│   ├── Dashboard/
│   ├── Layout/
│   ├── Settings/
│   └── Users/
└── lib/                   # Utilities, hooks, types, Supabase client
```

## Design System

- **Glassmorphism**: Frosted glass effect (`bg-white/80 backdrop-blur-sm`)
- **KPI Cards**: 6-column grid with icons, values, and trend indicators
- **Data Tables**: Sortable, filterable with hover effects
- **Charts**: Time series and platform breakdown visualizations
- **Alerts**: Color-coded system (warning, error, info)
