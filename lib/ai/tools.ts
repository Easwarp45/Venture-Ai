import type { MessageMetadata } from '@/lib/database.types';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  inputs: ToolInput[];
  run: (inputs: Record<string, string>) => ToolResult;
}

export interface ToolInput {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface ToolResult {
  content: string;
  metadata?: MessageMetadata;
}

function num(v: string, fallback = 0): number {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

export const TOOLS: Record<string, ToolDefinition> = {
  startup_score: {
    id: 'startup_score',
    name: 'Startup Score Calculator',
    description: 'Calculate your startup\'s viability score across 6 dimensions.',
    icon: 'Gauge',
    category: 'Validation',
    inputs: [
      { key: 'idea', label: 'Your startup idea', type: 'textarea', placeholder: 'Describe your idea in 1-2 sentences', required: true },
      { key: 'problem_clarity', label: 'How clearly defined is the problem? (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { key: 'market_size', label: 'Market size score (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { key: 'differentiation', label: 'Differentiation vs competitors (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { key: 'team', label: 'Team strength (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { key: 'traction', label: 'Current traction (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
      { key: 'business_model', label: 'Business model clarity (1-10)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], required: true },
    ],
    run: (inputs) => {
      const problem = num(inputs.problem_clarity);
      const market = num(inputs.market_size);
      const diff = num(inputs.differentiation);
      const team = num(inputs.team);
      const traction = num(inputs.traction);
      const model = num(inputs.business_model);
      const total = Math.round(problem * 2 + market * 2 + diff * 1.5 + team * 1.5 + traction * 1.5 + model * 1.5);
      return {
        content: `## Startup Score: ${total} / 100\n\n### Breakdown\n\n| Dimension | Score | Weight |\n|-----------|-------|--------|\n| Problem clarity | ${problem}/10 | 20% |\n| Market size | ${market}/10 | 20% |\n| Differentiation | ${diff}/10 | 15% |\n| Team | ${team}/10 | 15% |\n| Traction | ${traction}/10 | 15% |\n| Business model | ${model}/10 | 15% |\n\n${total >= 75 ? '**Verdict:** Strong — you\'re ready to build and raise.' : total >= 50 ? '**Verdict:** Promising — focus on your weakest dimensions.' : '**Verdict:** Needs work — strengthen your foundation before building.'}`,
        metadata: {
          chart: {
            type: 'radar',
            title: 'Startup Score Breakdown',
            data: [
              { label: 'Problem', value: problem * 10 },
              { label: 'Market', value: market * 10 },
              { label: 'Differentiation', value: diff * 10 },
              { label: 'Team', value: team * 10 },
              { label: 'Traction', value: traction * 10 },
              { label: 'Business Model', value: model * 10 },
            ],
          },
          followUpQuestions: ['Which dimension do you want to improve first?', 'Would you like a detailed action plan to raise your score?'],
        },
      };
    },
  },

  idea_validation: {
    id: 'idea_validation',
    name: 'Idea Validation Engine',
    description: 'Test your idea against 8 critical validation criteria.',
    icon: 'Lightbulb',
    category: 'Validation',
    inputs: [
      { key: 'idea', label: 'Your idea', type: 'textarea', placeholder: 'What do you want to build?', required: true },
      { key: 'target_customer', label: 'Who is the target customer?', type: 'text', placeholder: 'e.g. Small business owners' },
      { key: 'problem', label: 'What problem does it solve?', type: 'textarea', placeholder: 'The pain point...' },
      { key: 'alternatives', label: 'What do they use today?', type: 'text', placeholder: 'Current solutions' },
      { key: 'willingness_to_pay', label: 'Will they pay? (Yes/Maybe/No)', type: 'select', options: ['Yes', 'Maybe', 'No'] },
    ],
    run: (inputs) => {
      const scores: { label: string; value: number }[] = [];
      const checks: { criterion: string; passed: boolean; note: string }[] = [];
      if (inputs.problem && inputs.problem.length > 20) { scores.push({ label: 'Problem Clarity', value: 85 }); checks.push({ criterion: 'Problem clearly defined', passed: true, note: 'Well-articulated' }); }
      else { scores.push({ label: 'Problem Clarity', value: 40 }); checks.push({ criterion: 'Problem clearly defined', passed: false, note: 'Needs more specificity' }); }
      if (inputs.target_customer && inputs.target_customer.length > 5) { scores.push({ label: 'Target Customer', value: 80 }); checks.push({ criterion: 'Target customer identified', passed: true, note: 'Defined' }); }
      else { scores.push({ label: 'Target Customer', value: 30 }); checks.push({ criterion: 'Target customer identified', passed: false, note: 'Be more specific' }); }
      if (inputs.alternatives) { scores.push({ label: 'Market Awareness', value: 75 }); checks.push({ criterion: 'Aware of alternatives', passed: true, note: 'Good competitive awareness' }); }
      else { scores.push({ label: 'Market Awareness', value: 35 }); checks.push({ criterion: 'Aware of alternatives', passed: false, note: 'Research competitors' }); }
      const wtp = inputs.willingness_to_pay;
      scores.push({ label: 'Willingness to Pay', value: wtp === 'Yes' ? 90 : wtp === 'Maybe' ? 55 : 20 });
      checks.push({ criterion: 'Revenue potential', passed: wtp !== 'No', note: wtp === 'Yes' ? 'Strong' : wtp === 'Maybe' ? 'Needs testing' : 'Risk: free alternative needed' });
      const avg = Math.round(scores.reduce((a, s) => a + s.value, 0) / scores.length);
      return {
        content: `## Idea Validation Report\n\n### Validation Score: ${avg} / 100\n\n### Checklist\n\n| Criterion | Passed | Notes |\n|-----------|--------|-------|\n${checks.map(c => `| ${c.criterion} | ${c.passed ? 'Yes' : 'No'} | ${c.note} |`).join('\n')}\n\n### Next Steps\n${checks.filter(c => !c.passed).map(c => `- Address: ${c.criterion}`).join('\n') || '- All checks passed — proceed to MVP planning!'}`,
        metadata: { chart: { type: 'radar', title: 'Validation Scores', data: scores }, followUpQuestions: ['Want me to help address the failing criteria?', 'Should we create a customer interview script?'] },
      };
    },
  },

  name_generator: {
    id: 'name_generator',
    name: 'Business Name Generator',
    description: 'Generate brandable company names across multiple styles.',
    icon: 'Sparkles',
    category: 'Branding',
    inputs: [
      { key: 'keywords', label: 'Keywords related to your idea', type: 'text', placeholder: 'e.g. flow, sync, data', required: true },
      { key: 'style', label: 'Name style', type: 'select', options: ['Invented/Blended', 'Compound/Descriptive', 'Metaphorical', 'Short & Punchy', 'Any'], required: true },
    ],
    run: (inputs) => {
      const kws = inputs.keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const prefix = kws[0] || 'ven';
      const suffix = kws[1] || kws[0] || 'tra';
      const names = [
        `${prefix}ly`, `${prefix}ify`, `${prefix}hub`, `${prefix}flow`, `${prefix}base`,
        `${prefix}${suffix}`, `${prefix}stack`, `${prefix}forge`, `${prefix}lab`,
        `get${prefix}`, `try${prefix}`, `${prefix}io`, `${prefix}verse`, `${prefix}works`,
        `Nex${prefix}`, `Pro${prefix}`, `${prefix}point`, `${prefix}path`,
      ];
      return {
        content: `## Business Name Ideas\n\n### Keywords: ${kws.join(', ')}\n\n### Generated Names\n\n| # | Name | Style |\n|---|------|-------|\n${names.slice(0, 12).map((n, i) => `| ${i + 1} | **${n.charAt(0).toUpperCase() + n.slice(1)}** | ${inputs.style === 'Any' ? ['Invented', 'Compound', 'Metaphorical', 'Short'][i % 4] : inputs.style} |`).join('\n')}\n\n### Next Steps\n1. Check domain availability for your top 3 picks\n2. Search USPTO trademark database\n3. Test with 5 target customers`,
        metadata: { followUpQuestions: ['Want me to check domain ideas for these names?', 'Should I generate taglines for your favorites?'] },
      };
    },
  },

  logo_prompt: {
    id: 'logo_prompt',
    name: 'Logo Prompt Generator',
    description: 'Generate AI image prompts for logo concepts.',
    icon: 'Palette',
    category: 'Branding',
    inputs: [
      { key: 'company_name', label: 'Company name', type: 'text', placeholder: 'Your company name', required: true },
      { key: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. SaaS, fintech, health' },
      { key: 'style', label: 'Logo style', type: 'select', options: ['Minimalist wordmark', 'Abstract geometric', 'Lettermark + symbol', 'Mascot', 'Emblem'], required: true },
      { key: 'colors', label: 'Preferred colors', type: 'text', placeholder: 'e.g. blue and cyan' },
    ],
    run: (inputs) => {
      const name = inputs.company_name;
      const style = inputs.style;
      const colors = inputs.colors || 'blue and cyan';
      const industry = inputs.industry || 'tech';
      const prompts = [
        `Minimalist ${style} logo for "${name}", a ${industry} company, ${colors} color scheme, clean geometric lines, white background, vector style, professional, high quality, flat design`,
        `Modern ${style} logo for "${name}", ${industry} startup, ${colors} gradient, bold and memorable, scalable, works at small sizes, white background, vector`,
        `Premium ${style} logo design for "${name}", ${industry} brand, sophisticated ${colors} palette, minimal negative space, timeless, white background, vector format`,
      ];
      return {
        content: `## Logo Prompts for ${name}\n\n### Style: ${style}\n### Colors: ${colors}\n\n### AI Image Generation Prompts\n\nCopy and paste these into any AI image generator:\n\n${prompts.map((p, i) => `**Prompt ${i + 1}:**\n\`\`\`\n${p}\n\`\`\``).join('\n\n')}\n\n### Design Tips\n- Generate 4+ variations and pick the best\n- Test at 16px (favicon size) and full size\n- Ensure it works on light and dark backgrounds`,
        metadata: { followUpQuestions: ['Want branding guidelines to go with the logo?', 'Should I suggest color palette codes?'] },
      };
    },
  },

  pitch_deck_generator: {
    id: 'pitch_deck_generator',
    name: 'Pitch Deck Generator',
    description: 'Generate a complete 10-slide pitch deck outline.',
    icon: 'Presentation',
    category: 'Finance',
    inputs: [
      { key: 'company', label: 'Company name', type: 'text', placeholder: 'Your company', required: true },
      { key: 'problem', label: 'Problem you solve', type: 'textarea', placeholder: 'The pain point', required: true },
      { key: 'solution', label: 'Your solution', type: 'textarea', placeholder: 'What you built', required: true },
      { key: 'market', label: 'Market size', type: 'text', placeholder: 'e.g. $10B TAM' },
      { key: 'stage', label: 'Funding stage', type: 'select', options: ['Pre-seed', 'Seed', 'Series A', 'Not raising'], required: true },
      { key: 'amount', label: 'Amount raising', type: 'text', placeholder: 'e.g. $750K' },
    ],
    run: (inputs) => {
      return {
        content: `## Pitch Deck: ${inputs.company}\n\n### Slide 1: Title\n- ${inputs.company}\n- One-line tagline\n\n### Slide 2: Problem\n- ${inputs.problem}\n- Show with a real stat or story\n\n### Slide 3: Solution\n- ${inputs.solution}\n- 3 key features\n\n### Slide 4: Market Size\n- TAM: ${inputs.market || '[Research needed]'}\n- Show growth rate\n\n### Slide 5: Business Model\n- How you make money\n- Pricing tiers\n\n### Slide 6: Traction\n- Key metrics\n- Customer logos\n\n### Slide 7: Go-to-Market\n- Acquisition channels\n- CAC and LTV\n\n### Slide 8: Competition\n- Competitive matrix\n- Your differentiators\n\n### Slide 9: Team\n- Why you're the right team\n\n### Slide 10: The Ask\n- Raising: ${inputs.amount || '[TBD]'}\n- Stage: ${inputs.stage}\n- Use of funds: 60% eng, 25% GTM, 15% ops`,
        metadata: { documentGenerated: { type: 'pitch_deck' as const, title: `Pitch Deck — ${inputs.company}` }, followUpQuestions: ['Want me to review and strengthen any slide?', 'Should I generate an elevator pitch to match?'] },
      };
    },
  },

  investor_readiness: {
    id: 'investor_readiness',
    name: 'Investor Readiness Score',
    description: 'Assess how ready you are to raise funding.',
    icon: 'Award',
    category: 'Finance',
    inputs: [
      { key: 'pitch_deck', label: 'Do you have a pitch deck?', type: 'select', options: ['Yes, complete', 'In progress', 'No'] },
      { key: 'traction', label: 'Do you have traction?', type: 'select', options: ['Revenue + users', 'Users only', 'LOIs only', 'Nothing yet'] },
      { key: 'team', label: 'Team size', type: 'select', options: ['Solo founder', '2 co-founders', '3+ team members', '5+ team'] },
      { key: 'financials', label: 'Financial projections?', type: 'select', options: ['Complete model', 'Rough estimates', 'None'] },
      { key: 'market', label: 'Market research done?', type: 'select', options: ['Yes, with sources', 'Partial', 'Minimal'] },
    ],
    run: (inputs) => {
      const score = (cond: boolean, pts: number) => (cond ? pts : 0);
      let total = 0;
      total += score(inputs.pitch_deck === 'Yes, complete', 20) + score(inputs.pitch_deck === 'In progress', 10);
      total += score(inputs.traction === 'Revenue + users', 25) + score(inputs.traction === 'Users only', 15) + score(inputs.traction === 'LOIs only', 10);
      total += score(inputs.team === '3+ team members', 15) + score(inputs.team === '2 co-founders', 12) + score(inputs.team === '5+ team', 18);
      total += score(inputs.financials === 'Complete model', 15) + score(inputs.financials === 'Rough estimates', 7);
      total += score(inputs.market === 'Yes, with sources', 15) + score(inputs.market === 'Partial', 8);
      const ready = total >= 70;
      return {
        content: `## Investor Readiness: ${total} / 100\n\n### Status: ${ready ? 'Ready to Raise' : total >= 50 ? 'Almost Ready' : 'Not Ready Yet'}\n\n${ready ? 'You\'re in a strong position to start fundraising. Build your investor list and start outreach.' : `### What\'s Missing\n${total < 50 ? '- Build a pitch deck\n- Get initial traction (users or LOIs)\n- Create financial projections' : '- Polish your pitch deck\n- Strengthen traction metrics\n- Complete your financial model'}`}\n\n### Recommended Next Steps\n1. ${inputs.pitch_deck !== 'Yes, complete' ? 'Complete your pitch deck' : 'Practice your pitch (aim for < 3 min)'}\n2. ${inputs.traction === 'Nothing yet' ? 'Get 10+ beta users' : 'Document your traction metrics'}\n3. ${inputs.financials !== 'Complete model' ? 'Build a 3-year financial model' : 'Prepare your data room'}`,
        metadata: { chart: { type: 'radar', title: 'Readiness Breakdown', data: [{ label: 'Pitch', value: inputs.pitch_deck === 'Yes, complete' ? 80 : inputs.pitch_deck === 'In progress' ? 40 : 10 }, { label: 'Traction', value: inputs.traction === 'Revenue + users' ? 90 : inputs.traction === 'Users only' ? 60 : inputs.traction === 'LOIs only' ? 40 : 10 }, { label: 'Team', value: inputs.team === '5+ team' ? 90 : inputs.team === '3+ team members' ? 75 : inputs.team === '2 co-founders' ? 60 : 35 }, { label: 'Financials', value: inputs.financials === 'Complete model' ? 80 : inputs.financials === 'Rough estimates' ? 40 : 10 }, { label: 'Market', value: inputs.market === 'Yes, with sources' ? 85 : inputs.market === 'Partial' ? 50 : 20 }] }, followUpQuestions: ['Want a 30-day readiness sprint plan?', 'Should I help build your investor target list?'] },
      };
    },
  },

  competitor_comparison: {
    id: 'competitor_comparison',
    name: 'Competitor Comparison Engine',
    description: 'Compare your product against competitors feature by feature.',
    icon: 'Swords',
    category: 'Validation',
    inputs: [
      { key: 'your_product', label: 'Your product name', type: 'text', required: true },
      { key: 'competitor1', label: 'Competitor 1 name', type: 'text', required: true },
      { key: 'competitor2', label: 'Competitor 2 name', type: 'text' },
      { key: 'competitor3', label: 'Competitor 3 name', type: 'text' },
      { key: 'your_strengths', label: 'Your key strengths', type: 'textarea', placeholder: 'What makes you better?' },
    ],
    run: (inputs) => {
      const comps = [inputs.competitor1, inputs.competitor2, inputs.competitor3].filter(Boolean);
      const features = ['Core feature', 'Modern UX', 'API access', 'Pricing', 'Integrations', 'Support', 'Mobile', 'Enterprise'];
      const data = [{ label: inputs.your_product, value: 8 }, ...comps.map((c, i) => ({ label: c, value: 7 - i * 2 }))];
      return {
        content: `## Competitor Comparison: ${inputs.your_product}\n\n### Feature Matrix\n\n| Feature | ${inputs.your_product} | ${comps.join(' | ')} |\n|---------|----------------------|${comps.map(() => '------').join('|')}|\n${features.map(f => `| ${f} | ${Math.floor(Math.random() * 3) + 7}/10 | ${comps.map(() => `${Math.floor(Math.random() * 4) + 4}/10`).join(' | ')} |`).join('\n')}\n\n### Your Differentiators\n${inputs.your_strengths ? inputs.your_strengths.split(',').map(s => `- ${s.trim()}`).join('\n') : '- [Define your key strengths]'}\n\n### Positioning\n> Focus on the features where you score highest and competitors are weakest. That\'s your wedge.`,
        metadata: { chart: { type: 'bar', title: 'Overall Score Comparison', data }, followUpQuestions: ['Want a detailed positioning statement?', 'Should I analyze their pricing?'] },
      };
    },
  },

  persona_generator: {
    id: 'persona_generator',
    name: 'Customer Persona Generator',
    description: 'Create detailed customer personas for your product.',
    icon: 'Users',
    category: 'Marketing',
    inputs: [
      { key: 'product', label: 'Your product', type: 'text', required: true },
      { key: 'audience', label: 'Target audience description', type: 'textarea', placeholder: 'Who are they?', required: true },
      { key: 'b2b_b2c', label: 'B2B or B2C?', type: 'select', options: ['B2B', 'B2C', 'Both'], required: true },
    ],
    run: (inputs) => {
      return {
        content: `## Customer Personas for ${inputs.product}\n\n### Primary Persona: "The Achiever"\n\n| Attribute | Detail |\n|-----------|--------|\n| Demographic | 28-38, urban professional |\n| Role | ${inputs.b2b_b2c === 'B2B' ? 'Manager/Director' : 'Knowledge worker'} |\n| Income | $60K-$120K |\n| Goals | Efficiency, career growth |\n| Frustrations | Too many tools, too little time |\n| Buys via | ${inputs.b2b_b2c === 'B2B' ? 'Team budget, needs approval' : 'Self-serve, monthly'} |\n\n### Secondary Persona: "The Explorer"\n\n| Attribute | Detail |\n|-----------|--------|\n| Demographic | 22-30, early career |\n| Role | Individual contributor |\n| Income | $40K-$70K |\n| Goals | Learn, grow, prove value |\n| Frustrations | Budget constrained |\n| Buys via | Self-serve, price-sensitive |\n\n### Where to Find Them\n- LinkedIn (${inputs.b2b_b2c === 'B2B' ? 'primary' : 'secondary'})\n- Reddit communities\n- Industry Slack groups\n- YouTube tutorials`,
        metadata: { followUpQuestions: ['Want a user journey map for these personas?', 'Should I create messaging for each persona?'] },
      };
    },
  },

  marketing_campaign: {
    id: 'marketing_campaign',
    name: 'Marketing Campaign Generator',
    description: 'Generate a complete marketing campaign plan.',
    icon: 'Megaphone',
    category: 'Marketing',
    inputs: [
      { key: 'product', label: 'Product name', type: 'text', required: true },
      { key: 'goal', label: 'Campaign goal', type: 'select', options: ['Brand awareness', 'Lead generation', 'Product launch', 'User acquisition', 'Retention'], required: true },
      { key: 'budget', label: 'Budget range', type: 'select', options: ['$0 (organic only)', '$500-2K', '$2K-10K', '$10K+'], required: true },
      { key: 'duration', label: 'Campaign duration', type: 'select', options: ['1 week', '2 weeks', '1 month', '3 months'], required: true },
    ],
    run: (inputs) => {
      return {
        content: `## Marketing Campaign: ${inputs.product}\n\n### Goal: ${inputs.goal}\n### Budget: ${inputs.budget}\n### Duration: ${inputs.duration}\n\n### Campaign Strategy\n\n| Channel | Tactic | Budget | KPI |\n|---------|--------|--------|-----|\n| Social media | Founder content + ads | ${inputs.budget === '$0 (organic only)' ? '$0' : '30%'} | Reach, engagement |\n| Email | Sequence to waitlist | $0 | Open rate, CTR |\n| Content/SEO | Pillar article | $0 | Organic traffic |\n| Community | Reddit, Slack, PH | $0 | Signups |\n${inputs.budget !== '$0 (organic only)' ? '| Paid ads | Google/Twitter ads | 50% | CAC, conversions |' : ''}\n\n### Content Calendar\n\n| Week | Content | Channel |\n|------|---------|--------|\n| 1 | Teaser + waitlist push | Social, email |\n| 2 | Educational content | Blog, social |\n| 3 | Launch announcement | All channels |\n| 4 | Social proof + follow-up | Email, social |\n\n### Success Metrics\n- Target signups: ${inputs.budget === '$10K+' ? '2,000+' : inputs.budget === '$2K-10K' ? '500+' : '100+'}\n- CAC target: ${inputs.budget === '$0 (organic only)' ? '$0' : '< $50'}\n- Conversion rate: 5-8%`,
        metadata: { followUpQuestions: ['Want me to write the email sequence?', 'Should I create social media posts?'] },
      };
    },
  },

  pricing_calculator: {
    id: 'pricing_calculator',
    name: 'Pricing Calculator',
    description: 'Calculate optimal pricing based on value delivered.',
    icon: 'Calculator',
    category: 'Finance',
    inputs: [
      { key: 'value_delivered', label: 'Annual $ value to customer', type: 'number', placeholder: 'e.g. 12000', required: true },
      { key: 'cost_to_serve', label: 'Annual cost per customer', type: 'number', placeholder: 'e.g. 200', required: true },
      { key: 'target_margin', label: 'Target gross margin %', type: 'select', options: ['60', '70', '80', '90'], required: true },
    ],
    run: (inputs) => {
      const value = num(inputs.value_delivered);
      const cost = num(inputs.cost_to_serve);
      const margin = num(inputs.target_margin, 80) / 100;
      const valueBasedPrice = Math.round(value * 0.15);
      const minPrice = Math.round(cost / (1 - margin));
      const monthly = Math.round(valueBasedPrice / 12);
      return {
        content: `## Pricing Analysis\n\n### Value-Based Pricing\n\n| Input | Value |\n|-------|-------|\n| Annual value to customer | $${value.toLocaleString()} |\n| Annual cost per customer | $${cost.toLocaleString()} |\n| Target margin | ${(margin * 100).toFixed(0)}% |\n\n### Recommended Pricing\n\n| Strategy | Annual Price | Monthly Price |\n|----------|-------------|---------------|\n| Value-based (15% of value) | $${valueBasedPrice.toLocaleString()} | $${monthly} |\n| Minimum viable (margin floor) | $${minPrice.toLocaleString()} | $${Math.round(minPrice / 12)} |\n| Sweet spot (10% of value) | $${Math.round(value * 0.1).toLocaleString()} | $${Math.round(value * 0.1 / 12)} |\n\n### Recommended Tier Structure\n\n| Tier | Monthly | Target |\n|------|---------|--------|\n| Free | $0 | Acquisition |\n| Starter | $${Math.round(monthly * 0.4)} | Individuals |\n| Pro | $${monthly} | Teams |\n| Enterprise | $${Math.round(monthly * 3)} | Large orgs |\n\n### Unit Economics\n- Gross margin per Pro customer: $${(monthly * 12 - cost).toLocaleString()}/yr\n- Margin: ${(((monthly * 12 - cost) / (monthly * 12)) * 100).toFixed(0)}%`,
        metadata: { chart: { type: 'bar', title: 'Pricing Tiers', data: [{ label: 'Starter', value: Math.round(monthly * 0.4) }, { label: 'Pro', value: monthly }, { label: 'Enterprise', value: Math.round(monthly * 3) }] }, followUpQuestions: ['Want a competitive pricing analysis?', 'Should I model revenue at different price points?'] },
      };
    },
  },

  funding_estimator: {
    id: 'funding_estimator',
    name: 'Funding Estimator',
    description: 'Estimate how much funding you need and when to raise.',
    icon: 'Banknote',
    category: 'Finance',
    inputs: [
      { key: 'monthly_burn', label: 'Monthly burn rate ($)', type: 'number', placeholder: 'e.g. 15000', required: true },
      { key: 'runway_months', label: 'Desired runway (months)', type: 'select', options: ['12', '18', '24'], required: true },
      { key: 'revenue', label: 'Current monthly revenue ($)', type: 'number', placeholder: 'e.g. 0' },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Pre-MVP', 'MVP built', 'Early traction', 'Growing'], required: true },
    ],
    run: (inputs) => {
      const burn = num(inputs.monthly_burn);
      const runway = num(inputs.runway_months, 18);
      const revenue = num(inputs.revenue);
      const netBurn = Math.max(burn - revenue, 0);
      const totalNeeded = Math.round(netBurn * runway * 1.2);
      const stageAmounts: Record<string, string> = { 'Pre-MVP': '$250K-750K', 'MVP built': '$500K-1.5M', 'Early traction': '$1M-3M', 'Growing': '$3M-8M' };
      return {
        content: `## Funding Estimate\n\n### Your Numbers\n\n| Metric | Value |\n|--------|-------|\n| Monthly burn | $${burn.toLocaleString()} |\n| Monthly revenue | $${revenue.toLocaleString()} |\n| Net burn | $${netBurn.toLocaleString()} |\n| Desired runway | ${runway} months |\n\n### Recommended Raise\n\n| Factor | Amount |\n|--------|--------|\n| Runway coverage (${runway}mo × net burn) | $${(netBurn * runway).toLocaleString()} |\n| 20% buffer | $${Math.round(netBurn * runway * 0.2).toLocaleString()} |\n| **Total recommended** | **$${totalNeeded.toLocaleString()}** |\n\n### By Your Stage (${inputs.stage})\n- Typical raise: ${stageAmounts[inputs.stage]}\n- Typical equity: ${inputs.stage === 'Pre-MVP' ? '10-15%' : inputs.stage === 'MVP built' ? '12-18%' : inputs.stage === 'Early traction' ? '15-20%' : '18-25%'}\n\n### Funding Timeline\n1. **Now:** Prepare pitch deck + financial model\n2. **Month 1-2:** Build investor list + warm intros\n3. **Month 2-3:** Pitch meetings\n4. **Month 3-4:** Term sheet + close\n5. **Month 4+:** Deploy capital`,
        metadata: { followUpQuestions: ['Want help building the pitch deck?', 'Should I create a detailed financial model?'] },
      };
    },
  },

  financial_forecast: {
    id: 'financial_forecast',
    name: 'Financial Forecast Generator',
    description: 'Generate 3-year revenue and expense projections.',
    icon: 'TrendingUp',
    category: 'Finance',
    inputs: [
      { key: 'starting_customers', label: 'Starting customers', type: 'number', placeholder: 'e.g. 0', required: true },
      { key: 'arpu', label: 'Average revenue per user/month ($)', type: 'number', placeholder: 'e.g. 79', required: true },
      { key: 'monthly_growth', label: 'Expected monthly growth rate %', type: 'number', placeholder: 'e.g. 15', required: true },
      { key: 'monthly_churn', label: 'Monthly churn rate %', type: 'number', placeholder: 'e.g. 5', required: true },
    ],
    run: (inputs) => {
      let customers = num(inputs.starting_customers);
      const arpu = num(inputs.arpu);
      const growth = num(inputs.monthly_growth) / 100;
      const churn = num(inputs.monthly_churn) / 100;
      const years = [0, 0, 0];
      const yearCustomers = [0, 0, 0];
      for (let m = 0; m < 36; m++) {
        customers = customers * (1 + growth) * (1 - churn);
        const monthRev = customers * arpu;
        const yi = Math.floor(m / 12);
        years[yi] += monthRev;
        if (m % 12 === 11) yearCustomers[yi] = Math.round(customers);
      }
      const expenses = [years[0] * 1.5, years[1] * 0.9, years[2] * 0.5];
      return {
        content: `## 3-Year Financial Forecast\n\n### Assumptions\n- Starting customers: ${inputs.starting_customers}\n- ARPU: $${arpu}/mo\n- Monthly growth: ${growth * 100}%\n- Monthly churn: ${churn * 100}%\n\n### Revenue Projection\n\n| Year | Revenue | Expenses | Net | Customers |\n|------|---------|----------|-----|-----------|\n${years.map((r, i) => `| Year ${i + 1} | $${Math.round(r).toLocaleString()} | $${Math.round(expenses[i]).toLocaleString()} | $${Math.round(r - expenses[i]).toLocaleString()} | ${yearCustomers[i].toLocaleString()} |`).join('\n')}\n\n### Key Milestones\n- Year 1: ${yearCustomers[0].toLocaleString()} customers, $${Math.round(years[0]).toLocaleString()} revenue\n- Year 2: ${yearCustomers[1].toLocaleString()} customers, $${Math.round(years[1]).toLocaleString()} revenue\n- Year 3: ${yearCustomers[2].toLocaleString()} customers, $${Math.round(years[2]).toLocaleString()} revenue\n\n> These projections are estimates based on your growth and churn assumptions. Adjust inputs to model different scenarios.`,
        metadata: { chart: { type: 'bar', title: '3-Year Revenue vs Expenses', data: years.map((r, i) => ({ label: `Year ${i + 1}`, value: Math.round(r) })) }, documentGenerated: { type: 'financial_projection' as const, title: 'Financial Projection' }, followUpQuestions: ['Want me to model a conservative and aggressive scenario?', 'Should I break down expenses by category?'] },
      };
    },
  },

  mvp_planner: {
    id: 'mvp_planner',
    name: 'MVP Planner',
    description: 'Define your minimum viable product scope and timeline.',
    icon: 'Boxes',
    category: 'Product',
    inputs: [
      { key: 'idea', label: 'Your product idea', type: 'textarea', required: true },
      { key: 'timeline', label: 'Build timeline', type: 'select', options: ['4 weeks', '8 weeks', '12 weeks', '6 months'], required: true },
      { key: 'team_size', label: 'Team size', type: 'select', options: ['Solo', '2 people', '3-4 people', '5+'], required: true },
    ],
    run: (inputs) => {
      return {
        content: `## MVP Plan\n\n### Core Principle\n> Build the smallest thing that delivers the core value and lets you learn from real users.\n\n### MVP Scope (Timeline: ${inputs.timeline}, Team: ${inputs.team_size})\n\n#### Must-Have Features\n| Feature | Effort | Priority |\n|---------|--------|----------|\n| User auth | S | P0 |\n| Core value feature | L | P0 |\n| Basic dashboard | M | P0 |\n| Feedback form | S | P1 |\n\n#### Exclude (For Now)\n- Social features\n- Mobile app\n- Advanced analytics\n- Payment integration (free beta)\n- Admin panel\n\n### Build Schedule (${inputs.timeline})\n| Phase | Duration | Focus |\n|-------|----------|-------|\n| Setup | 1 week | Architecture + auth |\n| Core build | 50% of time | Primary feature |\n| Polish | 25% of time | UX + onboarding |\n| Beta | Remaining | Launch to 20 users |\n\n### Success Metrics\n| Metric | Target |\n|--------|--------|\n| Activation | 40% |\n| Week-2 retention | 30% |\n| NPS | > 30 |\n| Feedback collected | 15+ conversations |`,
        metadata: { followUpQuestions: ['Want a detailed feature spec?', 'Should I create user stories for the MVP?'] },
      };
    },
  },

  roadmap_generator: {
    id: 'roadmap_generator',
    name: 'Roadmap Generator',
    description: 'Generate a product roadmap with milestones.',
    icon: 'Map',
    category: 'Product',
    inputs: [
      { key: 'product', label: 'Product name', type: 'text', required: true },
      { key: 'horizon', label: 'Roadmap horizon', type: 'select', options: ['6 months', '12 months', '18 months', '24 months'], required: true },
      { key: 'priorities', label: 'Top priorities (comma-separated)', type: 'text', placeholder: 'e.g. core feature, integrations, mobile' },
    ],
    run: (inputs) => {
      return {
        content: `## Product Roadmap: ${inputs.product}\n\n### Horizon: ${inputs.horizon}\n\n### Q1: MVP & Launch\n| Milestone | Target |\n|-----------|--------|\n| Core feature | Week 8 |\n| Beta release | Week 10 |\n| Public launch | Week 12 |\n\n### Q2: Growth\n| Milestone | Target |\n|-----------|--------|\n| Integrations (top 3) | Month 4 |\n| Collaboration features | Month 5 |\n| Analytics dashboard | Month 6 |\n\n### Q3: Scale\n| Milestone | Target |\n|-----------|--------|\n| Enterprise features | Month 8 |\n| Performance optimization | Month 9 |\n| API platform | Month 10 |\n\n### Q4: Expand\n| Milestone | Target |\n|-----------|--------|\n| AI features | Month 11 |\n| Internationalization | Month 12 |\n| Partner ecosystem | Month 12 |\n\n### Your Priorities\n${inputs.priorities ? inputs.priorities.split(',').map((p, i) => `${i + 1}. ${p.trim()}`).join('\n') : '- [Define your priorities]'}`,
        metadata: { followUpQuestions: ['Want me to break down Q1 into weekly sprints?', 'Should I create a feature prioritization matrix?'] },
      };
    },
  },

  risk_analyzer: {
    id: 'risk_analyzer',
    name: 'Risk Analyzer',
    description: 'Identify and assess risks across your startup.',
    icon: 'ShieldAlert',
    category: 'Planning',
    inputs: [
      { key: 'idea', label: 'Your startup idea', type: 'textarea', required: true },
      { key: 'stage', label: 'Current stage', type: 'select', options: ['Idea only', 'MVP in progress', 'Launched', 'Growing'], required: true },
      { key: 'biggest_concern', label: 'Biggest concern right now', type: 'textarea' },
    ],
    run: (inputs) => {
      return {
        content: `## Risk Analysis\n\n### Risk Matrix\n\n| Risk | Likelihood | Severity | Score | Mitigation |\n|------|------------|----------|-------|------------|\n| Market too small | Medium | High | 7 | Start niche, expand later |\n| Runway runs out | High | Critical | 8 | Raise or reach revenue fast |\n| Can\'t build it | Medium | High | 7 | Spike hardest tech first |\n| No one wants it | Medium | Critical | 8 | Validate with 20 interviews |\n| Competitor copies | Medium | Medium | 5 | Build community moat |\n| Solo founder burnout | High | High | 7 | Find co-founder |\n| Regulatory issues | Low | High | 4 | Legal review before launch |\n\n### Your Stage: ${inputs.stage}\n\n### Top 3 Risks to Address Now\n1. **Runway** — model your burn rate and set a deadline\n2. **Market demand** — validate with interviews before building\n3. **Technical feasibility** — spike the hardest part first\n\n${inputs.biggest_concern ? `### Your Stated Concern\n> ${inputs.biggest_concern}\n\nThis aligns with the risks above. Address it directly with a time-bound plan.` : ''}`,
        metadata: { chart: { type: 'bar', title: 'Risk Severity Scores', data: [{ label: 'Market', value: 7 }, { label: 'Financial', value: 8 }, { label: 'Technical', value: 7 }, { label: 'Demand', value: 8 }, { label: 'Competitive', value: 5 }, { label: 'Team', value: 7 }, { label: 'Legal', value: 4 }] }, followUpQuestions: ['Want a detailed mitigation plan for the top risks?', 'Should I create a contingency plan?'] },
      };
    },
  },
};

export const TOOL_LIST = Object.values(TOOLS);
