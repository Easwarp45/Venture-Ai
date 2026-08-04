import type { DocumentType } from '@/lib/database.types';

export type IntentType =
  | 'idea_validation'
  | 'market_research'
  | 'competitor_analysis'
  | 'business_model'
  | 'lean_canvas'
  | 'business_model_canvas'
  | 'swot'
  | 'revenue_model'
  | 'pricing_strategy'
  | 'product_roadmap'
  | 'mvp_planning'
  | 'ui_ux_suggestions'
  | 'feature_prioritization'
  | 'risk_assessment'
  | 'customer_persona'
  | 'user_journey'
  | 'branding'
  | 'logo_concept'
  | 'company_naming'
  | 'domain_suggestion'
  | 'tagline_generation'
  | 'marketing_strategy'
  | 'go_to_market'
  | 'social_media_plan'
  | 'seo_strategy'
  | 'email_marketing'
  | 'sales_strategy'
  | 'pitch_deck'
  | 'elevator_pitch'
  | 'financial_projections'
  | 'funding_recommendation'
  | 'hiring_roadmap'
  | 'legal_checklist'
  | 'launch_checklist'
  | 'startup_score'
  | 'investor_readiness'
  | 'general_question'
  | 'general_advice';

export interface IntentMatch {
  type: IntentType;
  confidence: number;
  label: string;
  category: 'validation' | 'planning' | 'branding' | 'marketing' | 'finance' | 'product' | 'legal' | 'launch' | 'general';
  documentType?: DocumentType;
  toolId?: string;
}

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  label: string;
  category: IntentMatch['category'];
  documentType?: DocumentType;
  toolId?: string;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    type: 'idea_validation',
    patterns: [/validat\w* (?:my |the |this )?(?:idea|concept)/i, /is my idea (?:good|viable|worth)/i, /test (?:my |the )?idea/i, /idea validation/i],
    label: 'Idea Validation',
    category: 'validation',
    toolId: 'idea_validation',
  },
  {
    type: 'market_research',
    patterns: [/market research/i, /market (?:size|analysis|data|trends)/i, /tam sam som/i, /industry analysis/i, /market opportunity/i],
    label: 'Market Research',
    category: 'validation',
  },
  {
    type: 'competitor_analysis',
    patterns: [/competitor/i, /competitive (?:analysis|landscape)/i, /who (?:are |is )?(?:my |the )?competitor/i, /alternatives to/i],
    label: 'Competitor Analysis',
    category: 'validation',
    toolId: 'competitor_comparison',
  },
  {
    type: 'business_model',
    patterns: [/business model/i, /how (?:do|should) (?:i |we )?make money/i, /monetization/i, /revenue stream/i],
    label: 'Business Model Generation',
    category: 'planning',
    documentType: 'business_plan',
  },
  {
    type: 'lean_canvas',
    patterns: [/lean canvas/i, /lean startup canvas/i],
    label: 'Lean Canvas',
    category: 'planning',
    documentType: 'lean_canvas',
  },
  {
    type: 'business_model_canvas',
    patterns: [/business model canvas/i, /bmc canvas/i],
    label: 'Business Model Canvas',
    category: 'planning',
    documentType: 'business_plan',
  },
  {
    type: 'swot',
    patterns: [/\bswot\b/i, /strengths weaknesses/i, /swot analysis/i],
    label: 'SWOT Analysis',
    category: 'planning',
    documentType: 'swot',
  },
  {
    type: 'revenue_model',
    patterns: [/revenue model/i, /how (?:should|will) (?:i|we) (?:charge|price|monetize)/i, /subscription vs /i, /freemium/i],
    label: 'Revenue Model',
    category: 'finance',
  },
  {
    type: 'pricing_strategy',
    patterns: [/pricing strateg/i, /how much should i charge/i, /price (?:my |the )?(?:product|service)/i, /pricing tier/i, /pricing calculator/i],
    label: 'Pricing Strategy',
    category: 'finance',
    toolId: 'pricing_calculator',
  },
  {
    type: 'product_roadmap',
    patterns: [/product roadmap/i, /roadmap/i, /development roadmap/i, /feature roadmap/i],
    label: 'Product Roadmap',
    category: 'product',
    toolId: 'roadmap_generator',
  },
  {
    type: 'mvp_planning',
    patterns: [/\bmvp\b/i, /minimum viable product/i, /what to build first/i, /mvp feature/i],
    label: 'MVP Planning',
    category: 'product',
    toolId: 'mvp_planner',
  },
  {
    type: 'ui_ux_suggestions',
    patterns: [/ui[ /]?ux/i, /user (?:interface|experience) (?:design|suggestion)/i, /design (?:the )?(?:app|interface|ui)/i, /wireframe/i],
    label: 'UI/UX Suggestions',
    category: 'product',
  },
  {
    type: 'feature_prioritization',
    patterns: [/prioriti\w* feature/i, /which feature/i, /feature (?:prioritization|ranking)/i, /what to build/i],
    label: 'Feature Prioritization',
    category: 'product',
  },
  {
    type: 'risk_assessment',
    patterns: [/risk (?:assessment|analysis)/i, /what (?:could |are the )?risk/i, /risk analyzer/i],
    label: 'Risk Assessment',
    category: 'planning',
    toolId: 'risk_analyzer',
  },
  {
    type: 'customer_persona',
    patterns: [/customer persona/i, /user persona/i, /target (?:customer|audience) persona/i, /buyer persona/i, /ideal customer/i],
    label: 'Customer Persona',
    category: 'marketing',
    toolId: 'persona_generator',
  },
  {
    type: 'user_journey',
    patterns: [/user journey/i, /customer journey/i, /journey map/i],
    label: 'User Journey Mapping',
    category: 'marketing',
  },
  {
    type: 'branding',
    patterns: [/brand(?:ing)? (?:ideas|strategy|identity|guide)/i, /brand (?:identity|guideline|style)/i, /how (?:should|do) (?:i )?brand/i],
    label: 'Branding Ideas',
    category: 'branding',
  },
  {
    type: 'logo_concept',
    patterns: [/logo (?:concept|idea|design)/i, /logo prompt/i, /design (?:a |my )?logo/i],
    label: 'Logo Concepts',
    category: 'branding',
    toolId: 'logo_prompt',
  },
  {
    type: 'company_naming',
    patterns: [/company name/i, /business name/i, /name (?:my |the )?(?:startup|company|business)/i, /naming (?:ideas|options)/i, /name generator/i],
    label: 'Company Naming',
    category: 'branding',
    toolId: 'name_generator',
  },
  {
    type: 'domain_suggestion',
    patterns: [/domain name/i, /domain suggestion/i, /available domain/i, /\.com (?:name|suggestion)/i],
    label: 'Domain Name Suggestions',
    category: 'branding',
  },
  {
    type: 'tagline_generation',
    patterns: [/tagline/i, /slogan/i, /catchphrase/i, /brand (?:statement|phrase)/i],
    label: 'Tagline Generation',
    category: 'branding',
  },
  {
    type: 'marketing_strategy',
    patterns: [/marketing strateg/i, /marketing plan/i, /overall marketing/i],
    label: 'Marketing Strategy',
    category: 'marketing',
    documentType: 'marketing_plan',
  },
  {
    type: 'go_to_market',
    patterns: [/go[ -]?to[ -]?market/i, /\bgtm\b/i, /launch strategy/i, /take (?:it|my product) to market/i],
    label: 'Go-to-Market Strategy',
    category: 'marketing',
  },
  {
    type: 'social_media_plan',
    patterns: [/social media/i, /content calendar/i, /instagram|twitter|linkedin|tiktok/i],
    label: 'Social Media Planning',
    category: 'marketing',
  },
  {
    type: 'seo_strategy',
    patterns: [/\bseo\b/i, /search engine optimization/i, /keyword strateg/i, /organic (?:search|traffic)/i],
    label: 'SEO Strategy',
    category: 'marketing',
  },
  {
    type: 'email_marketing',
    patterns: [/email (?:marketing|campaign|sequence|drip)/i, /newsletter/i, /cold email/i, /email automation/i],
    label: 'Email Marketing Campaign',
    category: 'marketing',
  },
  {
    type: 'sales_strategy',
    patterns: [/sales strateg/i, /sales (?:funnel|pipeline|process)/i, /how to sell/i, /sales (?:playbook|tactic)/i],
    label: 'Sales Strategy',
    category: 'marketing',
  },
  {
    type: 'pitch_deck',
    patterns: [/pitch deck/i, /investor deck/i, /presentation for investor/i, /slide deck/i],
    label: 'Investor Pitch Deck',
    category: 'finance',
    documentType: 'pitch_deck',
    toolId: 'pitch_deck_generator',
  },
  {
    type: 'elevator_pitch',
    patterns: [/elevator pitch/i, /quick pitch/i, /30 second pitch/i, /one minute pitch/i],
    label: 'Elevator Pitch',
    category: 'finance',
  },
  {
    type: 'financial_projections',
    patterns: [/financial projection/i, /financial forecast/i, /revenue projection/i, /3 year (?:financial|projection)/i, /financial model/i],
    label: 'Financial Projections',
    category: 'finance',
    documentType: 'financial_projection',
    toolId: 'financial_forecast',
  },
  {
    type: 'funding_recommendation',
    patterns: [/funding (?:recommend|advice|need)/i, /how much (?:funding|capital) (?:do|should) i (?:need|raise)/i, /funding estimator/i, /raise (?:money|capital|funding)/i],
    label: 'Funding Recommendations',
    category: 'finance',
    toolId: 'funding_estimator',
  },
  {
    type: 'hiring_roadmap',
    patterns: [/hiring (?:roadmap|plan|strategy)/i, /who (?:should|do) (?:i )?hire/i, /first hire/i, /team (?:building|plan)/i],
    label: 'Hiring Roadmap',
    category: 'planning',
  },
  {
    type: 'legal_checklist',
    patterns: [/legal checklist/i, /legal (?:requirement|step|to.do)/i, /what legal (?:do|should) i/i],
    label: 'Legal Checklist',
    category: 'legal',
  },
  {
    type: 'launch_checklist',
    patterns: [/launch checklist/i, /pre.launch/i, /what to do before launching/i, /launch (?:plan|step)/i],
    label: 'Launch Checklist',
    category: 'launch',
    documentType: 'launch_checklist',
  },
  {
    type: 'startup_score',
    patterns: [/startup score/i, /score my startup/i, /rate my (?:startup|idea)/i, /how (?:strong|good) is my startup/i],
    label: 'Startup Score Calculator',
    category: 'validation',
    toolId: 'startup_score',
  },
  {
    type: 'investor_readiness',
    patterns: [/investor readiness/i, /am i ready (?:to raise|for investor)/i, /investor readiness score/i, /fundraise ready/i],
    label: 'Investor Readiness Score',
    category: 'finance',
    toolId: 'investor_readiness',
  },
];

export function detectIntent(message: string): IntentMatch {
  const lower = message.toLowerCase().trim();
  let bestMatch: IntentMatch | null = null;
  let bestScore = 0;

  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(lower)) {
        const score = regex.source.length / lower.length + 0.5;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            type: pattern.type,
            confidence: Math.min(score, 1),
            label: pattern.label,
            category: pattern.category,
            documentType: pattern.documentType,
            toolId: pattern.toolId,
          };
        }
      }
    }
  }

  if (!bestMatch) {
    if (/^(hi|hello|hey|start|help)/i.test(lower)) {
      return {
        type: 'general_question',
        confidence: 0.5,
        label: 'General',
        category: 'general',
      };
    }
    return {
      type: 'general_advice',
      confidence: 0.3,
      label: 'General Advice',
      category: 'general',
    };
  }

  return bestMatch;
}
