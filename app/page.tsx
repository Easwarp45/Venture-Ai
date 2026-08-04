'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Rocket, Brain, MessageSquare, FileText, Users, TrendingUp,
  Shield, Zap, Target, Sparkles, ArrowRight, Check, Star,
  Lightbulb, Presentation, Calculator, Megaphone, Scale, Briefcase,
  Crown, Cpu, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FEATURES = [
  { icon: Lightbulb, title: 'Idea Validation', desc: 'Test your idea against 8 critical criteria before you build.' },
  { icon: Target, title: 'Market Research', desc: 'Size your TAM, SAM, SOM and analyze market dynamics.' },
  { icon: Users, title: 'Competitor Analysis', desc: 'Compare features, pricing, and positioning against rivals.' },
  { icon: FileText, title: 'Business Plan', desc: 'Generate complete, editable business plans in minutes.' },
  { icon: Presentation, title: 'Pitch Deck', desc: 'Create investor-ready 10-slide pitch decks instantly.' },
  { icon: TrendingUp, title: 'Financial Projections', desc: '3-year revenue, expense, and profitability forecasts.' },
  { icon: Megaphone, title: 'Marketing Strategy', desc: 'Full GTM plan with channels, tactics, and budgets.' },
  { icon: Calculator, title: 'Pricing Calculator', desc: 'Value-based pricing with tier recommendations.' },
  { icon: Shield, title: 'Risk Assessment', desc: 'Identify and mitigate risks before they kill your startup.' },
];

const PERSONAS = [
  { icon: Crown, name: 'Atlas', role: 'CEO AI', desc: 'Vision, strategy & leadership', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Cpu, name: 'Nova', role: 'CTO AI', desc: 'Architecture, MVP & tech', gradient: 'from-cyan-500 to-teal-500' },
  { icon: Megaphone, name: 'Vesper', role: 'CMO AI', desc: 'Brand, marketing & growth', gradient: 'from-amber-500 to-orange-500' },
  { icon: TrendingUp, name: 'Sterling', role: 'CFO AI', desc: 'Finance & fundraising', gradient: 'from-green-500 to-emerald-500' },
  { icon: Scale, name: 'Justice', role: 'Legal AI', desc: 'Structure & compliance', gradient: 'from-violet-500 to-purple-500' },
  { icon: Briefcase, name: 'Sage', role: 'Investor AI', desc: 'Pitch & investor readiness', gradient: 'from-pink-500 to-rose-500' },
];

const TOOLS = [
  'Startup Score Calculator', 'Idea Validation Engine', 'Business Name Generator',
  'Logo Prompt Generator', 'Pitch Deck Generator', 'Investor Readiness Score',
  'Competitor Comparison Engine', 'Customer Persona Generator', 'Marketing Campaign Generator',
  'Pricing Calculator', 'Funding Estimator', 'Financial Forecast Generator',
  'MVP Planner', 'Roadmap Generator', 'Risk Analyzer',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="VentureAI Logo" 
              className="h-9 w-9 shrink-0 object-contain rounded-lg"
              style={{ filter: 'invert(1) hue-rotate(180deg)', mixBlendMode: 'screen' }}
            />
            <span className="font-display text-xl font-bold">VentureAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Team</a>
            <a href="#tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Tools</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <div className="animate-fade-up">
            <Badge variant="secondary" className="mb-6 glass">
              <Sparkles className="h-3 w-3 mr-1 text-primary" /> Your AI Co-Founder from Idea to Launch
            </Badge>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Transform your idea into a
            <br />
            <span className="gradient-text">launch-ready startup</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Converse with an AI team of CEO, CTO, CMO, CFO, Legal Advisor, and Investor.
            Get market research, business plans, pitch decks, financials, and a complete roadmap — all through chat.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Start building free <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                View dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> 15 AI tools included</span>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="glass-strong rounded-2xl p-6 shadow-2xl animate-float">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">Atlas — CEO AI</span>
                  <span className="text-xs text-muted-foreground">just now</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  I&apos;ve analyzed your idea for an AI-powered task manager. Here&apos;s my initial assessment: your problem is well-defined (78/100), but traction is the gap (40/100). I recommend starting with 10 customer interviews this week before building...
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline" className="text-xs">Idea Validation</Badge>
                  <Badge variant="outline" className="text-xs">3 follow-up questions</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { value: '6', label: 'AI Team Members' },
            { value: '15+', label: 'AI Tools' },
            { value: '34', label: 'Startup Topics' },
            { value: '8', label: 'Document Types' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">
              Everything you need to <span className="gradient-text">build a startup</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea validation to launch day — our AI guides you through every stage of building a company.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:gradient-primary group-hover:text-white transition-all">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Team */}
      <section id="team" className="py-24 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 glass"><Users className="h-3 w-3 mr-1" /> Your AI Executive Team</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-bold">
              Meet your <span className="gradient-text">AI co-founders</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Each AI persona provides specialized expertise from their domain. Switch between them anytime in chat.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERSONAS.map((p, i) => (
              <Card key={p.name} className="group hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-4`}>
                    <p.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <p className="text-sm font-medium text-primary mb-2">{p.role}</p>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 glass"><Zap className="h-3 w-3 mr-1" /> Specialized AI Tools</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-bold">
              15+ <span className="gradient-text">AI-powered tools</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive calculators and generators that produce structured, actionable outputs.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {TOOLS.map((tool, i) => (
              <Badge key={tool} variant="outline" className="text-sm py-2 px-4 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-default animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">
              From idea to launch in <span className="gradient-text">3 steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: MessageSquare, title: 'Chat with your AI team', desc: 'Describe your idea. The AI asks smart follow-up questions and generates professional outputs.' },
              { step: '02', icon: FileText, title: 'Generate documents & plans', desc: 'Get business plans, pitch decks, financials, and roadmaps — all saved to your dashboard.' },
              { step: '03', icon: Rocket, title: 'Track progress to launch', desc: 'Follow your AI-generated task checklist from idea to launch day.' },
            ].map((item, i) => (
              <div key={item.step} className="relative animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="glass-strong rounded-2xl p-8 h-full">
                  <div className="text-5xl font-bold gradient-text mb-4">{item.step}</div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold">
              Simple, <span className="gradient-text">startup-friendly</span> pricing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 'Free', desc: 'For exploring your idea', features: ['3 AI chat conversations', '5 generated documents', '1 project', 'Basic AI tools', 'Community support'], cta: 'Start free', highlight: false },
              { name: 'Builder', price: '$29', desc: 'For serious founders', features: ['Unlimited AI chats', 'Unlimited documents', '5 projects', 'All 15+ AI tools', 'Voice chat & export', 'Priority support'], cta: 'Start 14-day trial', highlight: true },
              { name: 'Team', price: '$79', desc: 'For startup teams', features: ['Everything in Builder', 'Unlimited projects', 'Collaborative workspace', 'AI team personas', 'Custom branding', 'Dedicated support'], cta: 'Contact us', highlight: false },
            ].map((plan) => (
              <Card key={plan.name} className={`relative ${plan.highlight ? 'border-primary shadow-xl scale-105' : ''}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Free' && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <Button className="w-full" variant={plan.highlight ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass-strong rounded-3xl p-12 text-center shadow-2xl">
            <Rocket className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Ready to build your startup?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of founders using VentureAI to go from idea to launch faster than ever.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Get started free <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="VentureAI Logo" 
                className="h-8 w-8 shrink-0 object-contain rounded-lg"
                style={{ filter: 'invert(1) hue-rotate(180deg)', mixBlendMode: 'screen' }}
              />
              <span className="font-display font-bold">VentureAI</span>
              <span className="text-sm text-muted-foreground ml-2">Your AI Co-Founder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VentureAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
