import type { IntentType } from '@/lib/ai/intent-router';
import type { MessageMetadata, DocumentType } from '@/lib/database.types';

export interface AIResponse {
  content: string;
  metadata?: MessageMetadata;
  followUpQuestions?: string[];
  suggestedTasks?: string[];
}

interface GeneratorContext {
  idea: string;
  personaName: string;
  history: { role: string; content: string }[];
}

function extractIdea(history: { role: string; content: string }[]): string {
  const firstUserMsg = history.find((m) => m.role === 'user');
  if (firstUserMsg) {
    const cleaned = firstUserMsg.content
      .replace(/^(help me|can you|i want to|i'd like to|i need to|please)\s+/i, '')
      .trim();
    if (cleaned.length > 10) return cleaned;
  }
  return 'your startup idea';
}

function followUps(intent: IntentType): string[] {
  const map: Record<IntentType, string[]> = {
    idea_validation: [
      'Who is your specific target customer?',
      'What problem does this solve that existing solutions don\'t?',
      'Have you talked to potential customers about this?',
    ],
    market_research: [
      'Which geographic market are you targeting first?',
      'Do you have data on current market growth rate?',
      'Who are the top 3 players in this space?',
    ],
    competitor_analysis: [
      'Who are your closest direct competitors?',
      'What do you think is their biggest weakness?',
      'How will you differentiate — price, features, or niche?',
    ],
    business_model: [
      'Will you charge per-user, per-usage, or flat subscription?',
      'Is there a free tier to drive adoption?',
      'What\'s the expected customer lifetime value?',
    ],
    lean_canvas: [
      'What is the single biggest problem you\'re solving?',
      'Who is your early-adopter customer segment?',
      'What\'s your unfair advantage?',
    ],
    business_model_canvas: [
      'What are your key partnerships?',
      'What are the core activities you must excel at?',
      'What cost structure makes sense — fixed or variable?',
    ],
    swot: [
      'What is your team\'s biggest strength?',
      'Which external threat worries you most?',
      'What opportunity could you capture in the next 12 months?',
    ],
    revenue_model: [
      'Are you B2B, B2C, or marketplace?',
      'What\'s your average deal size or price point?',
      'Would a freemium model fit your audience?',
    ],
    pricing_strategy: [
      'What\'s the value you deliver to the customer in dollar terms?',
      'What are competitors charging?',
      'Are you targeting budget-conscious or premium buyers?',
    ],
    product_roadmap: [
      'What\'s your timeline — months or quarters?',
      'Do you have engineering resources lined up?',
      'Which feature is the must-have for launch?',
    ],
    mvp_planning: [
      'What\'s the one core action a user must complete?',
      'How much time do you have to build the MVP?',
      'Will you build it yourself or hire a team?',
    ],
    ui_ux_suggestions: [
      'Is this a web app, mobile app, or both?',
      'Who is the primary user — consumer or professional?',
      'Do you have any brand colors or design references?',
    ],
    feature_prioritization: [
      'List the top 5 features you\'re considering.',
      'Which feature do users ask for most?',
      'Which feature is hardest to build?',
    ],
    risk_assessment: [
      'What\'s the biggest risk you see right now?',
      'Are there regulatory or legal risks?',
      'How long is your current runway?',
    ],
    customer_persona: [
      'Is your customer an individual or a business?',
      'What job are they hiring your product to do?',
      'Where do they spend time online?',
    ],
    user_journey: [
      'How will users first discover your product?',
      'What\'s the aha-moment you want them to reach?',
      'What could cause them to churn?',
    ],
    branding: [
      'What feeling should your brand evoke?',
      'Are there brands you admire and want to emulate?',
      'Is your brand playful, professional, or bold?',
    ],
    logo_concept: [
      'Do you prefer a wordmark, icon, or combination mark?',
      'Should the logo feel modern, classic, or playful?',
      'Any symbols or imagery meaningful to your brand?',
    ],
    company_naming: [
      'Do you want a real word, an invented word, or a compound name?',
      'Should it be short and punchy or descriptive?',
      'Any words or themes to avoid?',
    ],
    domain_suggestion: [
      'Do you need a .com, or are .io/.ai/.co acceptable?',
      'Should the domain match the company name exactly?',
      'Any keywords you want in the domain?',
    ],
    tagline_generation: [
      'Should the tagline be descriptive or emotional?',
      'Who is the primary audience for the tagline?',
      'Any key benefit or feature to highlight?',
    ],
    marketing_strategy: [
      'What\'s your monthly marketing budget?',
      'Are you focused on acquisition or retention first?',
      'Which channels have you tried already?',
    ],
    go_to_market: [
      'Are you launching to a warm audience or cold market?',
      'Will you charge from day one or offer a free beta?',
      'What\'s your target launch date?',
    ],
    social_media_plan: [
      'Which platforms does your audience use most?',
      'Do you have content creation capacity?',
      'What\'s your posting cadence goal?',
    ],
    seo_strategy: [
      'What are the top 5 keywords you want to rank for?',
      'Do you have a blog or content hub planned?',
      'Are you targeting informational or transactional search intent?',
    ],
    email_marketing: [
      'Are you building a waitlist, nurturing leads, or onboarding?',
      'Do you have an email tool picked out?',
      'What\'s your target open rate?',
    ],
    sales_strategy: [
      'Are you doing self-serve or sales-led growth?',
      'What\'s your average contract value?',
      'Do you have sales experience on the team?',
    ],
    pitch_deck: [
      'What stage are you raising — pre-seed, seed, or Series A?',
      'Do you have traction metrics to share?',
      'How much are you raising?',
    ],
    elevator_pitch: [
      'Who will you be pitching to?',
      'Do you have 30 seconds or 60 seconds?',
      'What\'s the one thing you want them to remember?',
    ],
    financial_projections: [
      'What\'s your expected first-year revenue?',
      'What are your main cost categories?',
      'Are you bootstrapping or raising funding?',
    ],
    funding_recommendation: [
      'What stage is your company at right now?',
      'How much runway do you need — 12 or 18 months?',
      'Do you have revenue or are you pre-revenue?',
    ],
    hiring_roadmap: [
      'What\'s your hiring budget for the next 12 months?',
      'Are you hiring full-time, contractors, or both?',
      'Which role is most urgent — engineering, sales, or marketing?',
    ],
    legal_checklist: [
      'What country and state are you operating in?',
      'Are there co-founders or are you solo?',
      'Will you be raising funding soon?',
    ],
    launch_checklist: [
      'What\'s your target launch date?',
      'Will it be a soft launch or a public launch?',
      'Do you have a press or media plan?',
    ],
    startup_score: [
      'Do you have a working prototype?',
      'Have you talked to at least 10 potential customers?',
      'Do you have a co-founder or team?',
    ],
    investor_readiness: [
      'Do you have a pitch deck ready?',
      'What traction can you show — users, revenue, or LOIs?',
      'Do you have financial projections?',
    ],
    general_question: [
      'Tell me more about your startup idea.',
      'What stage are you at right now?',
      'What specific help do you need today?',
    ],
    general_advice: [
      'Can you share more details about your idea?',
      'What stage are you at — idea, MVP, or launched?',
      'What\'s the biggest challenge you\'re facing?',
    ],
  };
  return map[intent] ?? map.general_advice;
}

function tasksForIntent(intent: IntentType): string[] | undefined {
  const map: Partial<Record<IntentType, string[]>> = {
    idea_validation: [
      'Interview 10 potential customers about the problem',
      'Write a one-sentence problem statement',
      'List 3 existing alternatives customers use today',
    ],
    market_research: [
      'Estimate TAM, SAM, and SOM for your market',
      'Find 3 industry reports on market growth',
      'Identify the top 5 competitors and their market share',
    ],
    competitor_analysis: [
      'Create a feature comparison matrix vs top 3 competitors',
      'Sign up for each competitor\'s product',
      'Read 20 competitor customer reviews for pain points',
    ],
    mvp_planning: [
      'Define the single core user action for the MVP',
      'Write user stories for the top 3 features',
      'Set a 4-week deadline for the first MVP build',
    ],
    pitch_deck: [
      'Draft the 10-slide pitch deck outline',
      'Design the problem and solution slides',
      'Practice the pitch in under 3 minutes',
    ],
    financial_projections: [
      'List all cost categories for year 1',
      'Estimate monthly recurring revenue at month 12',
      'Calculate your break-even point',
    ],
    launch_checklist: [
      'Set up analytics tracking before launch',
      'Prepare a launch-day social media plan',
      'Write a press kit and founder bio',
    ],
    legal_checklist: [
      'Choose a business entity type',
      'File for an EIN/tax ID',
      'Draft a founder agreement if co-founding',
    ],
    branding: [
      'Define 3 brand personality traits',
      'Create a mood board of 15 reference images',
      'Write your brand voice guidelines',
    ],
    go_to_market: [
      'Identify your top 2 acquisition channels',
      'Set a launch-week signup goal',
      'Prepare a welcome email sequence',
    ],
  };
  return map[intent];
}

function chartForIntent(intent: IntentType, idea: string): MessageMetadata['chart'] | undefined {
  switch (intent) {
    case 'financial_projections':
      return {
        type: 'bar',
        title: '3-Year Revenue Projection',
        data: [
          { label: 'Year 1', value: 50000 },
          { label: 'Year 2', value: 280000 },
          { label: 'Year 3', value: 950000 },
        ],
      };
    case 'startup_score':
      return {
        type: 'radar',
        title: 'Startup Score Breakdown',
        data: [
          { label: 'Problem', value: 78 },
          { label: 'Market', value: 65 },
          { label: 'Solution', value: 70 },
          { label: 'Team', value: 55 },
          { label: 'Traction', value: 40 },
          { label: 'Business Model', value: 72 },
        ],
      };
    case 'investor_readiness':
      return {
        type: 'radar',
        title: 'Investor Readiness Breakdown',
        data: [
          { label: 'Pitch', value: 60 },
          { label: 'Traction', value: 45 },
          { label: 'Team', value: 70 },
          { label: 'Market', value: 75 },
          { label: 'Product', value: 55 },
          { label: 'Financials', value: 40 },
        ],
      };
    case 'competitor_analysis':
      return {
        type: 'bar',
        title: 'Competitor Feature Comparison',
        data: [
          { label: 'You', value: 8 },
          { label: 'Competitor A', value: 7 },
          { label: 'Competitor B', value: 5 },
          { label: 'Competitor C', value: 6 },
        ],
      };
    case 'pricing_strategy':
      return {
        type: 'bar',
        title: 'Pricing Tier Comparison',
        data: [
          { label: 'Starter', value: 29 },
          { label: 'Pro', value: 79 },
          { label: 'Enterprise', value: 249 },
        ],
      };
    case 'risk_assessment':
      return {
        type: 'bar',
        title: 'Risk Severity by Category',
        data: [
          { label: 'Market', value: 7 },
          { label: 'Financial', value: 6 },
          { label: 'Technical', value: 5 },
          { label: 'Team', value: 4 },
          { label: 'Legal', value: 3 },
        ],
      };
    case 'swot':
      return {
        type: 'bar',
        title: 'SWOT Impact Scores',
        data: [
          { label: 'Strengths', value: 8 },
          { label: 'Weaknesses', value: 5 },
          { label: 'Opportunities', value: 7 },
          { label: 'Threats', value: 6 },
        ],
      };
    default:
      return undefined;
  }
}

export function generateResponse(
  intent: IntentType,
  ctx: GeneratorContext
): AIResponse {
  const idea = ctx.idea || extractIdea(ctx.history);
  const persona = ctx.personaName;
  const chart = chartForIntent(intent, idea);
  const fu = followUps(intent);
  const tasks = tasksForIntent(intent);

  const generators: Record<IntentType, () => string> = {
    idea_validation: () => `## Idea Validation: ${idea}

I'll evaluate this idea across five critical dimensions. Here's my initial assessment — I'll refine it as you answer my follow-up questions.

### 1. Problem Validation
| Criterion | Rating | Notes |
|-----------|--------|-------|
| Pain severity | Medium | Needs validation through customer interviews |
| Frequency of pain | Unknown | How often does the target user experience this? |
| Willingness to pay | Unknown | Critical to test with a pricing survey |

### 2. Market Opportunity
- **Target segment:** Identify your most specific niche first
- **Market trend:** Is this a growing or shrinking market?
- **Timing:** Why now? What changed that makes this possible today?

### 3. Solution Fit
Your idea addresses a real need, but the key question is whether your specific solution is meaningfully better than what exists. A 10x improvement in one dimension (speed, cost, or ease) is typically needed to switch users from existing solutions.

### 4. Competitive Landscape
There are almost certainly existing alternatives — even if indirect. Before building, map out what people do today to solve this problem.

### 5. Go/No-Go Signals
| Signal | Green Light | Red Light |
|--------|-------------|-----------|
| Customer interviews | 8+ confirm the pain | Vague "that's nice" reactions |
| Existing solutions | Users frustrated with them | Users satisfied with alternatives |
| Your access | You know the target user | You're far from the problem |

> **Verdict:** Promising, but requires customer validation before building. Start with 10 customer interviews this week.

*— ${persona}, AI Co-Founder*`,

    market_research: () => `## Market Research: ${idea}

### Market Size Framework
| Layer | Definition | Estimate |
|-------|-----------|----------|
| **TAM** | Total Addressable Market | All potential users globally |
| **SAM** | Serviceable Addressable Market | Users in your reachable geography/segment |
| **SOM** | Serviceable Obtainable Market | Realistic capture in 3 years |

### Key Market Dynamics
1. **Growth rate:** Research the CAGR for your industry — aim for >10% growth
2. **Market timing:** Identify the catalyst making this viable now (tech shift, regulation, behavior change)
3. **Market structure:** Fragmented markets are easier to enter; concentrated markets require differentiation

### Research Sources to Explore
- Industry reports (Gartner, IBISWorld, Statista)
- Google Trends for search interest over time
- Competitor funding announcements (Crunchbase)
- Reddit, LinkedIn, and niche forums for user sentiment
- Government census and economic data

### Action Plan
1. **Size the market** — find reports quantifying your TAM
2. **Map the trends** — identify 3 macro trends supporting your idea
3. **Find the whitespace** — where are competitors under-serving customers?

*— ${persona}, AI Co-Founder*`,

    competitor_analysis: () => `## Competitor Analysis: ${idea}

### Competitive Landscape Overview

| Competitor | Strengths | Weaknesses | Your Edge |
|-----------|-----------|------------|-----------|
| Direct Competitor A | Established brand, funding | Slow, expensive, poor UX | Faster, simpler, modern |
| Direct Competitor B | Niche feature depth | Limited market, no API | Broader integration play |
| Indirect: Status Quo | Free, familiar | Manual, time-consuming | Automation saves hours |

### Differentiation Strategy
1. **Focus on an underserved niche** — win a beachhead segment first
2. **Compete on simplicity** — reduce onboarding friction to near-zero
3. **Compete on price** — undercut incumbents by 30-50% to drive switching
4. **Compete on integration** — connect to tools incumbents ignore

### Feature Gap Analysis
| Feature | You | Comp A | Comp B | Priority |
|---------|-----|--------|--------|----------|
| Core problem solver | Yes | Yes | Yes | Must-have |
| Modern UX | Yes | No | Partial | Differentiator |
| API access | Yes | No | No | Wedge |
| Enterprise SSO | Later | Yes | No | Later |

### Positioning Statement
> For [target user] who [has this problem], [your product] is a [category] that [key benefit]. Unlike [top competitor], we [differentiator].

*— ${persona}, AI Co-Founder*`,

    business_model: () => `## Business Model: ${idea}

### Recommended Revenue Models

| Model | Fit | Pros | Cons |
|-------|-----|------|------|
| **SaaS Subscription** | High | Predictable revenue, high LTV | High CAC, churn risk |
| **Usage-based** | Medium | Aligns cost with value | Unpredictable revenue |
| **Freemium** | High | Low acquisition friction | Conversion challenges |
| **Marketplace fees** | Depends | Network effects | Cold-start problem |

### Recommended Hybrid: Freemium → Subscription
1. **Free tier:** Core feature with usage limits — drives adoption
2. **Pro tier ($29-79/mo):** Power features, higher limits — main revenue
3. **Enterprise ($249+/mo):** SSO, SLA, custom integrations — high ACV

### Key Unit Economics to Target
| Metric | Target | Why |
|--------|--------|-----|
| CAC | < $50 | Efficient acquisition |
| LTV | > $300 | 6:1 LTV:CAC ratio |
| Gross margin | > 70% | Healthy software economics |
| Monthly churn | < 5% | Sustainable growth |
| Payback period | < 6 months | Capital efficient |

### Revenue Stream Architecture
\`\`\`
Free Users (100%)
    ↓ 5-8% conversion
Pro Subscribers ($79/mo)
    ↓ 10% upgrade
Enterprise ($249+/mo)
    + Add-ons: API calls, premium support, training
\`\`\`

*— ${persona}, AI Co-Founder*`,

    lean_canvas: () => `## Lean Canvas: ${idea}

### Problem
1. [Top problem your customer faces]
2. [Secondary problem]
3. [Third problem]

**Existing Alternatives:** How do people solve this today? (manual workarounds, competitors, spreadsheets)

### Customer Segments
1. **Early adopters:** [Most specific niche who feels the pain most acutely]
2. **Mass market (later):** [Broader segment after beachhead]

### Unique Value Proposition
> A single, clear message that turns your target user's head: "[Benefit] for [audience] who [pain point]"

### Solution
1. [Top feature addressing top problem]
2. [Feature addressing problem #2]
3. [Feature addressing problem #3]

### Channels
- Direct: Website, app stores
- Community: Niche forums, Reddit, LinkedIn
- Content: SEO blog, YouTube tutorials
- Partnerships: Integrations with adjacent tools

### Revenue Streams
| Stream | Pricing | Timing |
|--------|---------|--------|
| Subscription | $29-79/mo | Launch |
| Enterprise | $249+/mo | Post-traction |
| Add-ons | Usage-based | Year 2 |

### Cost Structure
- Fixed: Salaries, hosting, tools (~$15K/mo)
- Variable: Cloud compute, payment fees, support

### Key Metrics
1. Customer acquisition cost (CAC)
2. Monthly active users (MAU)
3. Monthly recurring revenue (MRR)
4. Net revenue retention

### Unfair Advantage
> What can't be easily copied? (domain expertise, network effects, exclusive data, brand)

*— ${persona}, AI Co-Founder*`,

    business_model_canvas: () => `## Business Model Canvas: ${idea}

| Key Partners | Key Activities | Value Propositions | Customer Relationships | Customer Segments |
|-------------|----------------|-------------------|----------------------|-------------------|
| Cloud providers | Product development | Solve [core problem] faster | Self-serve onboarding | Primary: [niche] |
| Integration partners | Customer support | Save [time/money] vs alternatives | Community & content | Secondary: [broader] |
| Distribution channels | Marketing & sales | Modern, simple UX | Email nurture | |
| | Platform engineering | Affordable pricing | Proactive support (paid) | |

| Key Resources | | Revenue Streams | | Cost Structure |
|-------------|---|----------------|---|----------------|
| Engineering team | | Subscriptions | | Personnel (60%) |
| Brand & IP | | Enterprise contracts | | Cloud/infra (15%) |
| Customer data | | Add-on services | | Marketing (15%) |
| | | | | Tools & ops (10%) |

*— ${persona}, AI Co-Founder*`,

    swot: () => `## SWOT Analysis: ${idea}

### Strengths (Internal)
- Innovative approach to a real problem
- Agility of a small, focused team
- Modern tech stack enabling fast iteration
- Direct access to [target market]

### Weaknesses (Internal)
- Limited resources and runway
- No brand recognition yet
- Small team — single points of failure
- Lack of proven distribution channels

### Opportunities (External)
- Growing market demand for [category]
- Competitors are slow to innovate
- New technology enabling better solutions
- Underserved niche segments

### Threats (External)
- Well-funded incumbents could enter
- Economic downturn reducing spend
- Rapid technology shifts
- Regulatory changes

### Strategic Recommendations
| Strategy | Action |
|----------|--------|
| **S-O** (Strengths → Opportunities) | Use agility to capture the underserved niche fast |
| **W-O** (Weaknesses → Opportunities) | Leverage market growth to attract funding despite small size |
| **S-T** (Strengths → Threats) | Differentiate on UX to defend against incumbents |
| **W-T** (Weaknesses → Threats) | Build community and content moat before competitors notice |

*— ${persona}, AI Co-Founder*`,

    revenue_model: () => `## Revenue Model Analysis: ${idea}

### Top Revenue Model Recommendations

#### 1. SaaS Subscription (Recommended)
| Tier | Price | Target | Features |
|------|-------|--------|----------|
| Free | $0 | Acquisition | Core feature, 100 uses/mo |
| Starter | $29/mo | Individuals | Unlimited use, email support |
| Pro | $79/mo | Small teams | Collaboration, API, priority support |
| Business | $249/mo | Mid-market | SSO, SLA, custom limits |

#### 2. Alternative: Usage-Based
- Charge $0.10 per [action/API call]
- Pro: aligns price with value, low barrier
- Con: unpredictable revenue, harder to forecast

#### 3. Alternative: Transaction Fee
- Take 5-15% of transactions processed
- Best for marketplace/fintech models

### Why Subscription Wins Here
- Predictable MRR makes fundraising easier
- Higher valuations (SaaS multiples)
- Simpler to model and forecast
- Builds compounding revenue base

### Revenue Projection (Conservative)
| Period | MRR | ARR | Customers |
|--------|-----|-----|-----------|
| Month 3 | $2K | $24K | 50 |
| Month 6 | $8K | $96K | 150 |
| Month 12 | $30K | $360K | 500 |
| Month 18 | $80K | $960K | 1,200 |

*— ${persona}, AI Co-Founder*`,

    pricing_strategy: () => `## Pricing Strategy: ${idea}

### Value-Based Pricing Framework

**Step 1: Quantify the value you deliver**
| Value Driver | Est. Annual Value to Customer |
|-------------|-------------------------------|
| Time saved (10 hrs/mo × $50/hr) | $6,000 |
| Error reduction | $2,000 |
| Productivity gain | $3,000 |
| **Total annual value** | **$11,000** |

**Step 2: Set price at 10-20% of value delivered**
- Target annual price: $1,100 - $2,200
- Monthly equivalent: $92 - $183
- Recommended sweet spot: **$79/mo**

### Recommended Pricing Tiers

| Tier | Price | Value | Target |
|------|-------|-------|--------|
| Free | $0 | Try before buy | Trial users |
| Starter | $29/mo | Individual productivity | Solo users |
| Pro | $79/mo | Full features + API | Small teams |
| Team | $149/mo/user | Collaboration + admin | Growing teams |
| Enterprise | Custom | SSO, SLA, dedicated | 50+ seats |

### Pricing Psychology Tips
1. **Anchor high:** Show Enterprise first to make Pro feel affordable
2. **Decoy pricing:** Offer a mid-tier most users skip (Team at $149 makes Pro at $79 look great)
3. **Annual discount:** 20% off for annual = improves cash flow and retention
4. **Free trial > freemium:** 14-day full-feature trial converts better for B2B

*— ${persona}, AI Co-Founder*`,

    product_roadmap: () => `## Product Roadmap: ${idea}

### 12-Month Roadmap

#### Q1: MVP Foundation
| Week | Milestone |
|------|-----------|
| 1-2 | Core architecture + auth |
| 3-4 | Primary feature build |
| 5-6 | Onboarding flow + basic dashboard |
| 7-8 | Beta release to 20 design partners |
| 9-12 | Iterate on feedback, polish, launch v1 |

#### Q2: Growth Features
- Collaboration features
- API and integrations (top 3 requested)
- Analytics dashboard
- Onboarding optimization

#### Q3: Scale
- Enterprise features (SSO, roles, audit logs)
- Performance optimization
- Mobile-responsive improvements
- Marketplace/integration ecosystem

#### Q4: Expansion
- Advanced AI features
- Vertical-specific templates
- Partner program
- Internationalization

### Prioritization Framework
| Priority | Criteria |
|----------|----------|
| P0 — Must ship | Core value prop, blocks launch |
| P1 — High | Major user requests, revenue-driving |
| P2 — Medium | Nice-to-have, retention-improving |
| P3 — Later | Strategic bets, post-traction |

*— ${persona}, AI Co-Founder*`,

    mvp_planning: () => `## MVP Plan: ${idea}

### MVP Definition Principle
> The MVP is the smallest thing you can build that delivers the core value and lets you learn from real users.

### MVP Scope

#### Must-Have (Ship these)
| Feature | Effort | Why |
|---------|--------|-----|
| User signup/login | S | Required to identify users |
| Core value feature | L | The one thing that solves the problem |
| Basic dashboard | M | Let users see their data |
| Feedback mechanism | S | Collect user input directly |

#### Explicitly Exclude (For now)
- Social features
- Mobile app (web-first)
- Advanced analytics
- Payment integration (free beta first)
- Admin panel
- Email campaigns

### Build Timeline (6 Weeks)
| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Setup + auth | Working login |
| 2-3 | Core feature | Primary user flow works |
| 4 | Dashboard + polish | Usable end-to-end |
| 5 | Bug fixes + onboarding | Smooth first-run experience |
| 6 | Beta launch | 20 design partners onboarded |

### Success Metrics for MVP
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Activation | 40% complete core action | Analytics event |
| Retention (W2) | 30% return | Weekly active tracking |
| NPS | > 30 | In-app survey |
| Feedback collected | 15+ conversations | Direct outreach |

*— ${persona}, AI Co-Founder*`,

    ui_ux_suggestions: () => `## UI/UX Suggestions: ${idea}

### Design Principles
1. **Clarity over cleverness** — users should understand the value in 5 seconds
2. **Progressive disclosure** — show complexity only when needed
3. **Feedback for every action** — loading states, confirmations, errors
4. **Mobile-first thinking** — design for the smallest screen, expand up

### Recommended Screen Architecture
\`\`\`
Onboarding (3 steps max)
    ↓
Dashboard (home base)
    ├── Core feature workspace
    ├── Recent activity
    └── Quick actions
Settings
    ├── Profile
    ├── Billing
    └── Integrations
\`\`\`

### Key UX Patterns to Implement
| Screen | Pattern | Why |
|--------|---------|-----|
| Onboarding | Progressive profiling | Reduce signup friction |
| Dashboard | Empty states with CTAs | Guide first action |
| Core feature | Inline help + tooltips | Reduce learning curve |
| Results | Skeleton loaders | Perceived performance |
| Errors | Friendly, actionable messages | Reduce frustration |

### Visual Design Direction
- **Color:** Primary blue/cyan for trust, accent for CTAs
- **Typography:** Clean sans-serif (Inter), clear hierarchy
- **Spacing:** 8px grid system, generous whitespace
- **Components:** Cards with subtle shadows, rounded corners (12px)
- **Dark mode:** Essential for modern SaaS — plan from day one

### Accessibility Checklist
- WCAG AA color contrast (4.5:1 for text)
- Keyboard navigation for all interactive elements
- Screen reader labels on icon-only buttons
- Focus indicators visible

*— ${persona}, AI Co-Founder*`,

    feature_prioritization: () => `## Feature Prioritization: ${idea}

### Prioritization Matrix (Impact vs. Effort)

| | Low Effort | High Effort |
|---|-----------|-------------|
| **High Impact** | **Quick Wins** — Do first | **Big Bets** — Plan carefully |
| **Low Impact** | **Fill-ins** — Do when free | **Avoid** — Don't build |

### RICE Scoring Framework
Score each feature: **(Reach × Impact × Confidence) / Effort**

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|------------|--------|------------|
| Core feature | 10 | 3 | 0.9 | 5 | 5.4 |
| Onboarding tour | 8 | 2 | 0.8 | 2 | 6.4 |
| API access | 3 | 3 | 0.7 | 8 | 0.8 |
| Social sharing | 5 | 1 | 0.5 | 3 | 0.8 |
| Analytics | 6 | 2 | 0.8 | 4 | 2.4 |

### Recommended Build Order
1. **Onboarding tour** (Quick win, high RICE)
2. **Core feature** (Must-have)
3. **Analytics** (Informs future decisions)
4. **API access** (Big bet for expansion)
5. **Social sharing** (Fill-in)

### Anti-Feature List (What NOT to build)
- Custom themes/skins (low impact, high maintenance)
- Complex admin panel (use existing tools)
- Native mobile app (web-first until traction)
- Multi-language (until international demand proven)

*— ${persona}, AI Co-Founder*`,

    risk_assessment: () => `## Risk Assessment: ${idea}

### Risk Matrix (Severity × Likelihood)

| Risk Category | Risk Description | Likelihood | Severity | Score |
|--------------|-----------------|------------|----------|-------|
| **Market** | Market too small to sustain | Medium | High | 7 |
| **Financial** | Runway runs out before revenue | High | Critical | 8 |
| **Technical** | Core tech proves too hard to build | Medium | High | 7 |
| **Team** | Solo founder burnout | High | High | 7 |
| **Competitive** | Incumbent copies your feature | Medium | Medium | 5 |
| **Legal** | Regulatory compliance issues | Low | High | 4 |
| **Adoption** | Users don't switch from status quo | Medium | High | 6 |

### Mitigation Strategies

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Market too small | Start niche, expand to adjacent segments | Founder |
| Runway risk | Raise funding or get to revenue in 6 months | Founder |
| Technical risk | Build a prototype of the hardest part first | Tech lead |
| Burnout | Find a co-founder or hire part-time help | Founder |
| Competitive | Build community and content moat | Marketing |
| Legal | Consult a lawyer before launch | Legal |
| Adoption | Offer free migration from competitors | Marketing |

### Top 3 Risks to Address Now
1. **Financial runway** — model your burn rate and set a fundraising deadline
2. **Technical feasibility** — spike the hardest technical challenge this week
3. **Market demand** — validate with 10 customer interviews before building

*— ${persona}, AI Co-Founder*`,

    customer_persona: () => `## Customer Personas: ${idea}

### Primary Persona: "Driven Dana"

| Attribute | Detail |
|-----------|--------|
| **Name** | Dana Chen |
| **Age** | 32 |
| **Role** | Operations Manager at a 50-person company |
| **Location** | Urban, tech-forward city |
| **Income** | $75K-$90K |
| **Tech comfort** | High — uses 10+ SaaS tools daily |

**Goals:**
- Save 5+ hours per week on [repetitive task]
- Look good to leadership by improving efficiency
- Find tools that "just work" without IT involvement

**Frustrations:**
- Current tools are clunky and require training
- Too many tools, not enough integration
- Budget approval is slow for enterprise software

**Where she spends time:** LinkedIn, industry Slack communities, product review sites

**How she buys:** Trials a free version, advocates internally, gets budget approval in 2-4 weeks

### Secondary Persona: "Founder Felipe"

| Attribute | Detail |
|-----------|--------|
| **Name** | Felipe Martinez |
| **Age** | 28 |
| **Role** | Solo founder / small business owner |
| **Location** | Remote, global |
| **Income** | Variable |
| **Tech comfort** | Very high — early adopter |

**Goals:** Maximize productivity with minimal budget. Move fast.

**Frustrations:** Enterprise tools are too expensive. Most tools overcomplicate simple needs.

**How he buys:** Self-serve, monthly subscription, cancels easily if no value.

*— ${persona}, AI Co-Founder*`,

    user_journey: () => `## User Journey Map: ${idea}

### Journey Stages

| Stage | User Action | Emotion | Touchpoint | Pain Point | Opportunity |
|-------|------------|---------|------------|------------|-------------|
| **Awareness** | Searches for solution | Frustrated | Google, Reddit | Doesn't know your product exists | SEO content + community presence |
| **Consideration** | Compares options | Curious | Review sites, website | Hard to compare alternatives | Clear comparison page |
| **Sign-up** | Creates account | Hopeful | Onboarding flow | Too many steps | 3-step signup max |
| **Activation** | First use | Excited | Core feature | Doesn't know what to do first | Guided first-run experience |
| **Retention** | Regular use | Satisfied | Dashboard | Forgets to use it | Email reminders, integrations |
| **Advocacy** | Recommends | Loyal | Word of mouth | No easy way to share | Referral program |

### Key Moments of Truth
1. **First 60 seconds:** User must reach the "aha moment" — the core value must be felt immediately
2. **Day 7:** User must have formed a habit — check-in email + in-app nudges
3. **Day 30:** User must see measurable ROI — show them their saved time/money

### Conversion Funnel Targets
| Stage | Target Conversion |
|-------|-------------------|
| Visit → Sign-up | 5-8% |
| Sign-up → Activation | 40% |
| Activation → Paid | 5-10% |
| Paid → Retained (90d) | 70% |

*— ${persona}, AI Co-Founder*`,

    branding: () => `## Branding Strategy: ${idea}

### Brand Personality
| Trait | Rating (1-5) | Description |
|-------|-------------|-------------|
| Trustworthy | 5 | Reliable, secure, professional |
| Innovative | 4 | Forward-thinking, modern |
| Approachable | 4 | Friendly, not corporate |
| Bold | 3 | Confident but not aggressive |

### Brand Voice Guidelines
- **Tone:** Confident, clear, human — not corporate or hypey
- **Language:** Simple and direct. No jargon unless audience uses it.
- **Pronouns:** "You" focused, not "we" focused
- **Humor:** Light and situational. Never forced.

### Visual Identity Direction
- **Primary color:** Deep blue/cyan (trust + innovation)
- **Accent:** Vibrant teal or amber (energy + differentiation)
- **Typography:** Inter for body, Sora or similar for headlines
- **Imagery:** Clean, product-focused. Real screenshots over abstract graphics.
- **Logo style:** Minimal, geometric, works at small sizes

### Brand Assets to Create
1. Logo (horizontal + icon versions)
2. Color palette (primary, secondary, neutral, semantic)
3. Typography scale
4. UI component library
5. Social media templates
6. Email templates
7. Pitch deck template

### Brand Statement
> [Brand] helps [target audience] [achieve goal] by [unique approach], so they can [emotional benefit].

*— ${persona}, AI Co-Founder*`,

    logo_concept: () => `## Logo Concepts: ${idea}

### Concept 1: Minimalist Wordmark
**Description:** Clean, custom-set typography with a subtle geometric modification to one letter.
**Style:** Modern, premium, timeless
**Best for:** SaaS, B2B, enterprise
**Colors:** Primary blue with a single accent dot

### Concept 2: Abstract Geometric Icon
**Description:** A simple geometric shape (circle, triangle, or combined) that metaphorically represents [core concept].
**Style:** Tech-forward, scalable, memorable
**Best for:** Tech startups, developer tools
**Colors:** Gradient from primary to accent

### Concept 3: Lettermark + Symbol
**Description:** Stylized first letter combined with a meaningful symbol.
**Style:** Bold, distinctive, versatile
**Best for:** Consumer brands, lifestyle products
**Colors:** High-contrast palette

### AI Image Generation Prompts
Use these prompts with any AI image generator:

\`\`\`
Prompt 1: Minimalist logo design for a tech startup, custom wordmark
typography, deep blue and cyan, clean geometric accent, white background,
vector style, professional, high quality

Prompt 2: Abstract geometric logo icon for a SaaS platform, simple
overlapping shapes representing connection and growth, gradient blue
to teal, flat design, minimal, scalable, white background

Prompt 3: Modern lettermark logo, bold sans-serif initial, incorporated
symbol, professional tech brand, blue primary with amber accent,
clean lines, vector, white background
\`\`\`

### Logo Design Principles
1. **Simplicity:** Must work at 16px (favicon) and billboard size
2. **Scalability:** Test in black/white and single color
3. **Timelessness:** Avoid trends that date quickly
4. **Versatility:** Works on light and dark backgrounds

*— ${persona}, AI Co-Founder*`,

    company_naming: () => `## Company Name Ideas: ${idea}

### Naming Categories

#### 1. Invented / Blended Words (Modern & brandable)
| Name | Rationale |
|------|-----------|
| Ventra | Suggests venture + forward motion |
| Nexora | Next + aurora (new dawn) |
| Stratos | Implies high altitude, ambition |
| Lumio | Light, clarity, illumination |

#### 2. Compound / Descriptive (Clear & functional)
| Name | Rationale |
|------|-----------|
| FlowForge | Building flows, craftsmanship |
| TaskHive | Productivity, collective, buzzing |
| SyncStack | Synchronization + tech stack |
| PeakPath | Achievement, direction, journey |

#### 3. Metaphorical (Evocative & memorable)
| Name | Rationale |
|------|-----------|
| Compass | Guidance, direction-finding |
| Catalyst | Sparking change, acceleration |
| Beacon | Guiding light, visibility |
| Apex | Peak performance, top tier |

### Naming Evaluation Framework
| Criterion | Weight | Why it matters |
|-----------|--------|---------------|
| Memorability | 25% | Can someone recall it after hearing once? |
| Pronounceability | 20% | Easy to say over the phone |
| Domain availability | 20% | Can you get a reasonable domain? |
| Trademark risk | 15% | Legal clearance |
| Length | 10% | Shorter is better (2-3 syllables) |
| Meaning | 10% | Does it connect to your mission? |

### Next Steps
1. Pick your top 3 names
2. Check domain availability (.com, .io, .ai)
3. Search USPTO trademark database
4. Test with 5 target customers — do they remember it?
5. Check social media handle availability

*— ${persona}, AI Co-Founder*`,

    domain_suggestion: () => `## Domain Name Suggestions: ${idea}

### Strategy
1. **Ideal:** Exact brand name as .com
2. **Acceptable:** Brand + modifier (.io, .ai, .co for tech)
3. **Fallback:** get[brand].com, [brand]app.com, use[brand].com

### Domain Ideas by Category

| Category | Domains to Check |
|----------|-----------------|
| Exact match | [brand].com, [brand].io, [brand].ai |
| Modifier | [brand]app.com, [brand]hq.com, [brand]co.com |
| Action | get[brand].com, use[brand].com, try[brand].com |
| Descriptive | [keyword][brand].com, [brand][keyword].com |

### Domain Selection Rules
- **Keep it short:** Under 15 characters ideal
- **No hyphens:** Looks spammy and hard to say
- **No numbers:** Ambiguous (is it "5" or "five"?)
- **Easy to spell:** If you have to spell it out, reconsider
- **.com first:** If .com is taken, consider rebranding vs. using .io/.ai

### How to Check Availability
1. Use a domain registrar (Namecheap, Porkbun, Cloudflare)
2. Search your top 5 candidates
3. If .com is available — grab it immediately
4. Also register common typos and alternate TLDs

### Budget Guidance
| Type | Price Range |
|------|-------------|
| New registration | $10-15/year |
| Premium .com (short) | $2,000-50,000 |
| .io / .ai domain | $30-90/year |

*— ${persona}, AI Co-Founder*`,

    tagline_generation: () => `## Tagline Ideas: ${idea}

### Tagline Options by Tone

#### Professional & Trustworthy
- "Built for what's next."
- "Where great ideas take shape."
- "The smarter way to [achieve goal]."
- "Precision tools for ambitious teams."

#### Bold & Confident
- "Stop guessing. Start building."
- "Your unfair advantage."
- "Move fast. Build smart. Win big."
- "The future, built today."

#### Friendly & Approachable
- "We make [hard thing] easy."
- "Your idea, supercharged."
- "Less work. More wow."
- "Building made simple."

#### Action-Oriented
- "Turn ideas into impact."
- "Launch faster. Grow smarter."
- "From concept to launch, faster."
- "Build. Ship. Scale."

### How to Choose
| Criterion | Question |
|-----------|----------|
| Clarity | Does it communicate what you do? |
| Brevity | Is it under 6 words? |
| Memorable | Will it stick after one read? |
| Differentiating | Could a competitor use it? (If yes, reject) |
| Emotional | Does it evoke a feeling? |

### Tagline + Name Pairings to Test
Test 3 pairings with 5 target customers. Ask them: "What does this company do?"

*— ${persona}, AI Co-Founder*`,

    marketing_strategy: () => `## Marketing Strategy: ${idea}

### Marketing Framework: Attract → Engage → Convert → Retain

#### Phase 1: Attract (Awareness)
| Channel | Tactic | Cost | Expected CAC |
|---------|--------|------|---------------|
| Content/SEO | 2 blog posts/mo targeting buyer keywords | Time | $0-20 |
| Community | Answer questions on Reddit, Slack, forums | Time | $0-10 |
| Social | LinkedIn thought leadership (3x/week) | Time | $5-15 |
| Paid | Google Ads on high-intent keywords | $500-2000/mo | $30-80 |

#### Phase 2: Engage (Consideration)
- Email newsletter (weekly, high-value content)
- Free tool or template as lead magnet
- Webinars or live demos (monthly)
- Case studies from early customers

#### Phase 3: Convert (Decision)
- 14-day free trial (no credit card)
- Onboarding email sequence (5 emails)
- In-app activation guidance
- Sales-assist for high-value leads

#### Phase 4: Retain (Loyalty)
- Monthly product updates
- Customer community (Slack/Discord)
- Referral program (give 20%, get 20%)
- NPS surveys + follow-up on detractors

### 90-Day Marketing Plan
| Week | Focus | Metric |
|------|-------|--------|
| 1-2 | Set up analytics + email tool | Tracking live |
| 3-6 | Publish 4 SEO blog posts | Organic traffic |
| 7-8 | Launch lead magnet | Email signups |
| 9-10 | Start LinkedIn content cadence | Engagement rate |
| 11-12 | Run first paid campaign | CAC < $50 |
| 13 | Review & optimize | CAC, conversion |

*— ${persona}, AI Co-Founder*`,

    go_to_market: () => `## Go-to-Market Strategy: ${idea}

### GTM Motion: Product-Led + Sales-Assist

### Step 1: Define the Wedge
- **Beachhead segment:** [Most specific niche]
- **Wedge feature:** [The one thing that gets them in the door]
- **Expansion path:** Once they trust the wedge, sell the full platform

### Step 2: Channel Strategy

| Channel | Motion | Why |
|---------|--------|-----|
| Product-led (self-serve) | Free trial → paid | Low CAC, scalable |
| Content/SEO | Attract organic search | Long-term, compounding |
| Community | Build in public, engage forums | Trust, word of mouth |
| Outbound (later) | Cold email to high-value accounts | Enterprise expansion |

### Step 3: Launch Sequence

| Phase | Duration | Goal |
|-------|----------|------|
| **Pre-launch** | 4 weeks | Build waitlist of 200+ |
| **Private beta** | 4 weeks | 20 design partners, gather feedback |
| **Public launch** | 1 week | Product Hunt + press + community |
| **Post-launch** | Ongoing | Optimize conversion, scale channels |

### Step 4: Launch Day Checklist
- [ ] Product Hunt launch prepared (hunter lined up, assets ready)
- [ ] Press kit and founder bio ready
- [ ] Email waitlist (500+ contacts)
- [ ] Social media content scheduled (10 posts across platforms)
- [ ] Community announcements (Slack, Reddit, Discord)
- [ ] Analytics tracking confirmed working
- [ ] Support channels ready (chat, email)
- [ ] Pricing page live and tested

### Success Metrics
| Metric | 90-Day Target |
|--------|---------------|
| Signups | 1,000 |
-> Activation rate | 40% |
| Paid conversion | 5% |
| MRR | $5K |

*— ${persona}, AI Co-Founder*`,

    social_media_plan: () => `## Social Media Plan: ${idea}

### Platform Prioritization

| Platform | Priority | Content Type | Frequency | Target |
|----------|----------|-------------|-----------|--------|
| LinkedIn | 1 | Founder content, product updates | 3x/week | B2B decision-makers |
| Twitter/X | 2 | Build in public, tips, threads | 5x/week | Tech community |
| YouTube | 3 | Tutorials, demos, founder stories | 1x/week | Search + discovery |
| Instagram | 4 | Behind-the-scenes, visual tips | 3x/week | Consumer audience |

### 30-Day Content Calendar Template

| Day | LinkedIn | Twitter | Type |
|-----|----------|---------|------|
| Mon | Founder story/lesson | Tip thread | Educational |
| Tue | Product feature highlight | Customer quote | Social proof |
| Wed | Industry insight | Build-in-public update | Authority |
| Thu | How-to post | Poll/question | Engagement |
| Fri | Customer success | Weekend thought | Inspiration |

### Content Pillars
1. **Educational (40%):** Teach your audience something useful
2. **Behind-the-scenes (25%):** Show the journey, build trust
3. **Social proof (20%):** Customer stories, testimonials
4. **Product (10%):** Feature announcements, demos
5. **Culture (5%):** Team, values, mission

### Growth Tactics
- Engage 30 min/day commenting on industry posts
- Repurpose 1 blog post into 5 social posts
- Use trending audio/formats on each platform
- Track which posts drive signups (UTM links)

*— ${persona}, AI Co-Founder*`,

    seo_strategy: () => `## SEO Strategy: ${idea}

### Keyword Targeting Framework

| Intent | Example Keywords | Content Type | Priority |
|--------|-----------------|-------------|----------|
| **Informational** | "how to [solve problem]" | Blog guides | High |
| **Comparison** | "[your product] vs [competitor]" | Comparison pages | High |
| **Transactional** | "best [category] tool" | Listicle/landing | Medium |
| **Navigational** | "[your brand name]" | Homepage | Auto |

### Keyword Research Process
1. **Seed keywords:** Brainstorm 10 core terms
2. **Expand:** Use Google Suggest, Ahrefs, Ubersuggest for variations
3. **Filter:** Target keywords with >100 monthly searches and <30 KD (keyword difficulty)
4. **Cluster:** Group keywords by search intent for content planning

### Content Production Plan
| Content Type | Frequency | Goal |
|-------------|-----------|------|
| Pillar article (2,000+ words) | 1/month | Rank for head terms |
| Supporting articles (1,000 words) | 2/month | Rank for long-tail |
| Comparison/alternative pages | As needed | Capture comparison intent |
| Landing pages | 1/quarter | Convert organic traffic |

### On-Page SEO Checklist
- [ ] Title tag < 60 chars, includes primary keyword
- [ ] Meta description < 155 chars, compelling
- [ ] H1 matches primary keyword
- [ ] Subheadings (H2/H3) include related keywords
- [ ] Internal links to 3+ related pages
- [ ] Image alt text descriptive
- [ ] Page loads in < 2 seconds
- [ ] Mobile-friendly (responsive)

### Technical SEO Basics
- Submit XML sitemap to Google Search Console
- Implement schema markup (Organization, Article)
- Ensure clean URL structure
- Set up canonical tags
- Monitor Core Web Vitals (LCP, FID, CLS)

*— ${persona}, AI Co-Founder*`,

    email_marketing: () => `## Email Marketing Campaign: ${idea}

### Campaign Architecture

#### 1. Welcome / Onboarding Sequence (5 emails)
| Email | Timing | Subject | Goal |
|-------|--------|---------|------|
| 1 | Immediately | Welcome — here's how to get started | Activate |
| 2 | Day 1 | The #1 thing to do first | Guide |
| 3 | Day 3 | How [customer] got results with us | Inspire |
| 4 | Day 5 | Pro tip: [advanced feature] | Educate |
| 5 | Day 7 | Ready to upgrade? Here's 20% off | Convert |

#### 2. Nurture Newsletter (Weekly)
- **Format:** One tip + one tool + one story
- **Goal:** Stay top-of-mind, build authority
- **Metric:** Open rate > 30%, CTR > 5%

#### 3. Re-engagement (Triggered)
- Trigger: No login in 14 days
- Email 1: "We miss you — here's what's new"
- Email 2: "Quick question — what's blocking you?"

### Email Design Principles
- **From name:** A person, not a brand (higher open rates)
- **Preheader:** Compelling preview text (40-80 chars)
- **Mobile-first:** 60%+ read on mobile — single column, 16px font
- **One CTA:** One clear action per email
- **Plain text > HTML:** For nurture emails, plain text feels personal

### Subject Line Formulas
| Formula | Example |
|---------|---------|
| Question | "Are you making this mistake?" |
| Curiosity | "The one thing that changed everything" |
| Benefit | "Save 5 hours this week" |
| Specificity | "How we got 1,000 users in 30 days" |
| Urgency | "Last chance: 20% off ends tonight" |

*— ${persona}, AI Co-Founder*`,

    sales_strategy: () => `## Sales Strategy: ${idea}

### Sales Motion: Product-Led Sales

| Segment | Motion | Team | Tools |
|---------|--------|------|-------|
| Self-serve (<$100/mo) | No sales — product-led | None | In-app, email |
| Sales-assist ($100-500/mo) | Light touch, demos on request | 1 AE | CRM, email |
| Enterprise ($500+/mo) | Outbound + demos + negotiation | AE + SE | CRM, call scheduling |

### Sales Funnel

\`\`\`
Leads (MQLs from marketing)
    ↓ Qualify (BANT: Budget, Authority, Need, Timing)
Qualified Leads (SQLs)
    ↓ Demo call
Opportunities
    ↓ Proposal + negotiation
Customers
    ↓ Onboarding + expansion
\`\`\`

### Qualification Framework: BANT + MEDDIC
- **Budget:** Do they have budget? When?
- **Authority:** Who signs the check?
- **Need:** What's the pain? How severe?
- **Timing:** When do they need to implement?
- **Metrics:** What outcome do they need to see?
- **Decision criteria:** How will they evaluate?
- **Decision process:** Who's involved in the decision?

### Sales Materials to Prepare
1. **Demo script** — tailored to buyer persona
2. **One-pager** — problem, solution, pricing
3. **ROI calculator** — show value in dollars
4. **Case studies** — 3 customer stories
5. **Objection handling doc** — top 10 objections + responses
6. **Proposal template** — scoping + pricing

### Sales Metrics to Track
| Metric | Target |
|--------|--------|
| Lead → Demo | 20% |
| Demo → Close | 25% |
| Sales cycle | < 30 days (SMB) |
| Average deal size | $X |
| Win rate | > 20% |

*— ${persona}, AI Co-Founder*`,

    pitch_deck: () => `## Investor Pitch Deck: ${idea}

### 10-Slide Pitch Deck Structure

#### Slide 1: Title
- Company name + one-line tagline
- Your name and contact

#### Slide 2: Problem
- The painful, expensive problem your target customer faces
- Show it with a real story or stat

#### Slide 3: Solution
- Your product in one sentence
- 3 key features that solve the problem

#### Slide 4: Market Size
- TAM / SAM / SOM with sources
- Show growth rate

#### Slide 5: Business Model
- How you make money (pricing + revenue model)
- Unit economics (CAC, LTV)

#### Slide 6: Traction
- Key metrics: users, MRR, growth rate
- Logos of early customers

#### Slide 7: Go-to-Market
- Your acquisition channels
- Why your GTM is efficient

#### Slide 8: Competition
- Competitive matrix (you vs. them)
- Your differentiators

#### Slide 9: Team
- Why YOU are the right team
- Relevant experience + domain expertise

#### Slide 10: The Ask
- How much you're raising
- What you'll use it for (hiring, product, GTM)
- 18-month milestones you'll hit

### Deck Design Rules
- **1 idea per slide** — don't cram
- **Visual > text** — use charts, diagrams, screenshots
- **10/20/30 rule:** 10 slides, 20 minutes, 30pt font
- **Consistent design** — same template throughout
- **Numbers with sources** — every stat needs a citation

### What Investors Will Ask
1. "Why now?" — What changed that makes this possible?
2. "Why you?" — What's your unfair advantage?
3. "How do you acquire customers?" — Show your CAC
4. "What's your moat?" — How do you stay defensible?
5. "What if [competitor] enters?" — Have a ready answer

*— ${persona}, AI Co-Founder*`,

    elevator_pitch: () => `## Elevator Pitch: ${idea}

### 30-Second Pitch Template
> "We help [target customer] who struggle with [problem] to [achieve outcome] by [your solution]. Unlike [alternative], we [differentiator]. We're [stage] and looking to [ask]."

### Example Pitch
> "We help operations teams who waste 10+ hours a week on manual data entry to automate their workflows in minutes, not weeks. Unlike enterprise tools that cost thousands and need IT setup, our platform is self-serve and starts at $79/month. We're in private beta with 20 companies and raising a pre-seed to scale our go-to-market."

### 60-Second Extended Pitch
1. **Hook (10s):** State the problem with a surprising stat
2. **Solution (15s):** What you do, in plain language
3. **Traction (15s):** Proof it works (users, revenue, logos)
4. **Market (10s):** Size the opportunity
5. **Differentiation (5s):** Why you win
6. **Ask (5s):** What you need (intro, funding, feedback)

### Pitch Delivery Tips
- **Memorize the opening** — first 10 seconds set the tone
- **Pause after the problem** — let it land
- **Use numbers** — specifics beat adjectives
- **End with a clear ask** — don't trail off
- **Practice 50 times** — until it feels natural, not scripted

### Pitches for Different Audiences
| Audience | Focus |
|----------|-------|
| Investors | Market size, traction, team, ask |
| Customers | Problem, solution, pricing, ROI |
| Partners | Mutual benefit, integration, distribution |
| Hires | Vision, mission, growth opportunity |

*— ${persona}, AI Co-Founder*`,

    financial_projections: () => `## 3-Year Financial Projections: ${idea}

### Revenue Projection

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Customers (end of year) | 500 | 2,000 | 6,000 |
| Average revenue/user | $79/mo | $85/mo | $92/mo |
| **ARR** | **$474K** | **$2.04M** | **$6.62M** |
| Monthly recurring (Dec) | $39.5K | $170K | $552K |

### Cost Structure

| Category | Year 1 | Year 2 | Year 3 |
|----------|--------|--------|--------|
| Engineering (salaries) | $180K | $420K | $900K |
| Sales & marketing | $120K | $350K | $800K |
| Cloud & infrastructure | $24K | $60K | $150K |
| G&A (legal, tools, office) | $36K | $80K | $180K |
| **Total expenses** | **$360K** | **$910K** | **$2.03M** |

### Profitability Path

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Revenue | $237K | $1.02M | $4.1M |
| Expenses | $360K | $910K | $2.03M |
| **Net profit (loss)** | **($123K)** | **$110K** | **$2.07M** |
| Gross margin | 78% | 82% | 85% |

### Funding Assumption
- **Pre-seed raise:** $750K at Year 0
- **Runway:** 18 months
- **Seed raise:** $2.5M at Month 12 (on $1M ARR)
- **Burn rate (Year 1):** ~$10K/month net

### Key Assumptions
| Assumption | Value | Risk |
|-----------|-------|------|
| Monthly growth rate | 15% | Medium |
| Monthly churn | 5% → 3% | Medium |
| CAC | $45 → $35 | Low |
| Gross margin | 78% → 85% | Low |

> These are illustrative projections. Real numbers depend on your specific market, pricing, and growth rate.

*— ${persona}, AI Co-Founder*`,

    funding_recommendation: () => `## Funding Recommendations: ${idea}

### Funding Stage Assessment

| Checkpoint | Your Status | Investor Expectation |
|-----------|-------------|---------------------|
| Problem validated | Unknown | Yes — customer interviews |
| MVP built | Unknown | Working prototype |
| Early traction | Unknown | 10+ active users or LOIs |
| Team | Unknown | 2+ founders or key hires |
| Pitch deck | Unknown | 10-slide deck ready |

### Funding Options by Stage

| Stage | Type | Amount | Equity | Best For |
|-------|------|--------|--------|----------|
| Pre-revenue | Pre-seed | $250K-750K | 10-15% | Build MVP, validate |
| Early traction | Seed | $1M-3M | 15-20% | Reach PMF, grow |
| $1M+ ARR | Series A | $5M-15M | 20-25% | Scale GTM |
| $10M+ ARR | Series B | $15M-50M | 15-20% | Expand market |

### Funding Need Estimator

**If pre-revenue (build MVP):**
- Target: $500K for 12 months
- Use: 60% engineering, 25% marketing, 15% ops
- Source: Angels, pre-seed funds, accelerators

**If early traction (find PMF):**
- Target: $2M for 18 months
- Use: 40% sales/marketing, 35% engineering, 25% ops
- Source: Seed VCs, strategic angels

### Funding Readiness Checklist
- [ ] Problem validated with 20+ customer interviews
- [ ] MVP shipped and used by real customers
- [ ] Pitch deck complete and practiced
- [ ] Financial model built and defensible
- [ ] Data room organized (financials, metrics, legal)
- [ ] Target investor list (50+ relevant funds)
- [ ] Warm intros secured to 10+ funds

### Investor Types to Target
| Type | Check Size | What They Bring |
|------|-----------|----------------|
| Angel investors | $25K-100K | Expertise, network |
| Accelerators | $50K-150K | Mentorship, demo day |
| Pre-seed funds | $250K-750K | Capital, hands-off |
| Seed VCs | $1M-3M | Board, scaling help |

*— ${persona}, AI Co-Founder*`,

    hiring_roadmap: () => `## Hiring Roadmap: ${idea}

### First 12 Months

| Month | Role | Type | Why |
|-------|------|------|-----|
| 0-3 | Senior Engineer #1 | Full-time or contract | Build the MVP |
| 3-6 | Growth/Marketing Lead | Full-time | Drive user acquisition |
| 6-9 | Engineer #2 | Full-time | Scale product development |
| 9-12 | Customer Success | Part-time → Full-time | Support + retention |

### Hiring by Stage

#### Pre-Seed (< $500K raised)
- **You (CEO):** Product, fundraising, sales
- **Engineer #1:** Build the product
- **Total team:** 2 people
- **Monthly burn:** $15-20K

#### Seed ($1-3M raised)
- CEO, 2 engineers, 1 growth/marketing, 1 designer
- **Total team:** 5 people
- **Monthly burn:** $40-60K

#### Series A ($5-15M raised)
- CEO, CTO, VP Sales, VP Marketing, 5+ engineers, 3+ sales, CS
- **Total team:** 15-20 people
- **Monthly burn:** $150-200K

### First Hire: Why It Should Be Engineering
1. **You can't sell what doesn't exist** — product first
2. **Engineering bottleneck is the #1 startup killer**
3. **A great engineer is 10x a mediocre one** — invest in quality
4. **Founder should stay close to customers** — not heads-down coding

### Hiring Best Practices
- **Hire slow, fire fast** — take time, but act quickly on mistakes
- **Culture add > culture fit** — hire people who bring new strengths
- **Test with paid projects** — for contractors, do a 1-week trial
- **Reference checks are mandatory** — talk to 2+ past managers
- **Equity for early hires:** 0.5-2% for first 5 engineers

### Where to Find Early Hires
- Your network (highest quality)
- Y Combinator "Work at a Startup" board
- LinkedIn outreach (personalized, not generic)
- Niche communities (Hacker News, Discord, Slack)
- Referrals from advisors and investors

*— ${persona}, AI Co-Founder*`,

    legal_checklist: () => `## Legal Checklist: ${idea}

> **Disclaimer:** I am an AI, not a licensed attorney. This checklist is educational guidance. Consult a qualified startup lawyer in your jurisdiction before making legal decisions.

### Pre-Launch Legal Checklist

#### 1. Company Formation
- [ ] Choose entity type (LLC vs. C-Corp — C-Corp if raising VC)
- [ ] Register in your state (Delaware C-Corp is VC standard)
- [ ] Obtain EIN / Tax ID
- [ ] File initial board consents and bylaws

#### 2. Founder Agreements
- [ ] Sign founder agreements (roles, equity, vesting)
- [ ] Implement 4-year vesting with 1-year cliff
- [ ] Assign all IP to the company (IP assignment agreement)
- [ ] Document equity split and contributions

#### 3. Intellectual Property
- [ ] Search USPTO trademark database for your name
- [ ] File trademark application for company name
- [ ] Protect code via copyright (automatic, but register for key works)
- [ ] File patents only if you have a defensible, novel invention
- [ ] Use NDAs for sensitive discussions

#### 4. Contracts & Agreements
- [ ] Terms of Service (for users)
- [ ] Privacy Policy (GDPR + CCPA compliant)
- [ ] Customer/Master Services Agreement (for B2B)
- [ ] Contractor agreements (with IP assignment)
- [ ] Employee offer letters

#### 5. Compliance
- [ ] Data protection compliance (GDPR if EU users, CCPA if CA)
- [ ] Industry-specific compliance (HIPAA, SOC 2, PCI if applicable)
- [ ] Sales tax registration (if selling to multiple states)
- [ ] Business licenses and permits

#### 6. Fundraising Legal
- [ ] Incorporate as Delaware C-Corp (if raising VC)
- [ ] Set up a 409A valuation for stock options
- [ ] Create an ESOP (Employee Stock Option Plan) pool (10-15%)
- [ ] Prepare SAFE or convertible note documents
- [ ] Accredited investor verification process

### Estimated Legal Costs (Pre-seed)
| Item | Cost |
|------|------|
| Incorporation (Clerky/LegalZoom) | $300-800 |
| Trademark filing (per class) | $250-350 |
| Startup lawyer (package) | $2,000-5,000 |
| 409A valuation | $1,000-3,000 |

*— ${persona}, AI Legal Advisor*`,

    launch_checklist: () => `## Launch Checklist: ${idea}

### Pre-Launch (4 Weeks Before)

#### Product
- [ ] Core feature tested end-to-end
- [ ] Onboarding flow works smoothly
- [ ] Payment/billing tested (if applicable)
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics tracking confirmed (GA, Mixpanel)

#### Marketing
- [ ] Landing page live with email capture
- [ ] Product Hunt listing prepared (title, tagline, makers)
- [ ] Press kit ready (screenshots, logo, founder bio)
- [ ] Social media content scheduled (10+ posts)
- [ ] Email list of 200+ contacts compiled
- [ ] Influencer/partner outreach sent

#### Operations
- [ ] Support channel ready (chat, email, help docs)
- [ ] FAQ/knowledge base published
- [ ] Status page set up
- [ ] Backup and recovery plan tested

### Launch Week

#### Day Before
- [ ] Final QA pass on critical paths
- [ ] Schedule all social posts
- [ ] Prepare launch email
- [ ] Brief team on roles (support, monitoring)

#### Launch Day
- [ ] Submit to Product Hunt (12:01 AM PT)
- [ ] Send launch email to waitlist
- [ ] Post on all social channels
- [ ] Share in relevant communities (Reddit, Slack, Discord)
- [ ] Email press contacts
- [ ] Monitor for bugs and support tickets
- [ ] Respond to every comment and review

### Post-Launch (First Week)
- [ ] Send thank-you email to all supporters
- [ ] Collect user feedback (survey + interviews)
- [ ] Fix critical bugs within 24 hours
- [ ] Write a "lessons learned" post
- [ ] Analyze metrics: signups, activation, feedback
- [ ] Plan first iteration based on feedback

### Launch Metrics Dashboard
| Metric | Target | Tool |
|--------|--------|------|
| Signups (Day 1) | 200+ | Analytics |
| Activation (Day 7) | 40% | Product analytics |
| Press mentions | 3+ | Media monitoring |
| Product Hunt rank | Top 5 | Product Hunt |
| Support tickets | < 20 | Help desk |
| Bug reports | < 10 critical | Sentry |

*— ${persona}, AI Co-Founder*`,

    startup_score: () => `## Startup Score Calculator: ${idea}

### Overall Score: **62 / 100**

### Score Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Problem clarity | 78 | 20% | 15.6 |
| Market opportunity | 65 | 20% | 13.0 |
| Solution differentiation | 70 | 15% | 10.5 |
| Team readiness | 55 | 15% | 8.3 |
| Current traction | 40 | 15% | 6.0 |
| Business model viability | 72 | 15% | 10.8 |
| **Total** | | **100%** | **64.2** |

### What This Score Means
| Score Range | Status | Action |
|-------------|--------|--------|
| 80-100 | Strong — build now | Full speed ahead |
| 60-79 | Promising — validate more | Customer interviews + MVP |
| 40-59 | Needs work | Sharpen problem + find co-founder |
| 0-39 | High risk | Rethink the core idea |

### Your Score: Promising (62) — Next Steps
1. **Problem clarity is strong (78)** — you understand the problem well
2. **Traction is the gap (40)** — get to 10 customer interviews + a landing page
3. **Team needs strengthening (55)** — consider finding a co-founder

### How to Improve Your Score
| Dimension | Current | Target | How |
|-----------|---------|--------|-----|
| Traction | 40 | 70 | Interview 20 customers, build landing page |
| Team | 55 | 75 | Find a complementary co-founder |
| Market | 65 | 80 | Research and document TAM with sources |

*— ${persona}, AI Co-Founder*`,

    investor_readiness: () => `## Investor Readiness Score: ${idea}

### Overall Readiness: **48 / 100** — Not Ready Yet

### Readiness Breakdown

| Dimension | Score | What Investors Check |
|-----------|-------|---------------------|
| Pitch & narrative | 60 | Can you tell a compelling story? |
| Traction | 45 | Do you have users, revenue, or LOIs? |
| Team | 70 | Is this the right team to win? |
| Market opportunity | 75 | Is the market big and growing? |
| Product | 55 | Is the product built and working? |
| Financial model | 40 | Do you have defensible projections? |

### What You Need Before Fundraising

#### Must-Have (Score < 50 in these = not ready)
- [ ] **Traction:** 10+ active users OR signed LOIs
- [ ] **Financial model:** 3-year projections with assumptions
- [ ] **Pitch deck:** 10-slide deck, practiced < 3 minutes

#### Should-Have (Boosts readiness significantly)
- [ ] Customer testimonials or case studies
- [ ] Clear unit economics (CAC, LTV calculated)
- [ ] Competitive analysis with differentiation
- [ ] 18-month use of funds breakdown

#### Nice-to-Have (Closes deals faster)
- [ ] Warm intro to the target fund
- [ ] Previous startup experience or domain expertise
- [ ] Advisory board with industry credibility
- [ ] Early revenue ($1K+ MRR)

### 30-Day Readiness Sprint
| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Financial model | 3-year projection spreadsheet |
| 2 | Pitch deck | 10-slide deck, v1 |
| 3 | Traction proof | 10 customer interviews documented |
| 4 | Investor list + outreach | 50 funds identified, 10 intros requested |

> **Bottom line:** You're ~60-90 days from investor-ready. Focus on traction and financials first.

*— ${persona}, AI Investor*`,

    general_question: () => `Hello! I'm ${persona}, your AI Co-Founder. I'm here to help you transform your idea into a launch-ready startup.

I can help you with:
- **Validating your idea** — is it worth building?
- **Market research** — how big is the opportunity?
- **Business planning** — business model, lean canvas, SWOT
- **Product planning** — MVP, roadmap, feature prioritization
- **Branding** — naming, taglines, logo concepts
- **Marketing** — GTM strategy, social media, SEO, email
- **Finance** — revenue model, pricing, financial projections, funding
- **Pitching** — pitch deck, elevator pitch, investor readiness

Tell me about your startup idea, and I'll guide you through every stage — from idea to launch.

*— ${persona}, AI Co-Founder*`,

    general_advice: () => `Here's my guidance on that:

When building a startup, the most important principle is to **validate before you build**. Too many founders spend months building a product nobody wants. Here's the framework I recommend:

### The Build-Measure-Learn Loop
1. **Form a hypothesis** — "I believe [target customer] has [problem] and will pay [amount] for [solution]"
2. **Test cheapest first** — customer interviews before code, landing page before product
3. **Measure** — did they confirm the problem? Would they pay?
4. **Learn & pivot** — adjust based on what you learned, then repeat

### The 5 Questions Every Founder Must Answer
| Question | Why It Matters |
|----------|---------------|
| What problem am I solving? | No problem = no business |
| Who has this problem? | Be specific — "everyone" is no one |
| How are they solving it today? | Your real competition is the status quo |
| Why will they switch to me? | You need a 10x improvement in one dimension |
| How will I make money? | Revenue model must be clear from day one |

Share more about your specific situation and I'll give you tailored, actionable guidance. What's your idea, and what stage are you at?

*— ${persona}, AI Co-Founder*`,
  };

  const content = (generators[intent] || generators.general_advice)();
  const docType = getDocumentType(intent);
  const documentGenerated = docType
    ? { type: docType, title: getDocumentTitle(intent, idea) }
    : undefined;

  return {
    content,
    metadata: {
      tool: undefined,
      chart,
      followUpQuestions: fu,
      documentGenerated,
      suggestedTasks: tasks,
    },
    followUpQuestions: fu,
    suggestedTasks: tasks,
  };
}

function getDocumentType(intent: IntentType): DocumentType | undefined {
  const map: Partial<Record<IntentType, DocumentType>> = {
    business_model: 'business_plan',
    lean_canvas: 'lean_canvas',
    business_model_canvas: 'business_plan',
    swot: 'swot',
    marketing_strategy: 'marketing_plan',
    pitch_deck: 'pitch_deck',
    financial_projections: 'financial_projection',
    launch_checklist: 'launch_checklist',
    elevator_pitch: 'investor_summary',
    funding_recommendation: 'investor_summary',
  };
  return map[intent];
}

function getDocumentTitle(intent: IntentType, idea: string): string {
  const map: Partial<Record<IntentType, string>> = {
    business_model: `Business Plan — ${idea}`,
    lean_canvas: `Lean Canvas — ${idea}`,
    business_model_canvas: `Business Model Canvas — ${idea}`,
    swot: `SWOT Analysis — ${idea}`,
    marketing_strategy: `Marketing Plan — ${idea}`,
    pitch_deck: `Pitch Deck — ${idea}`,
    financial_projections: `Financial Projections — ${idea}`,
    launch_checklist: `Launch Checklist — ${idea}`,
    elevator_pitch: `Investor Summary — ${idea}`,
    funding_recommendation: `Investor Summary — ${idea}`,
  };
  return map[intent] || idea;
}
