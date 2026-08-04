'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  MessageSquare, FileText, CheckSquare, TrendingUp, Rocket,
  Target, Lightbulb, ArrowRight, Plus, Sparkles, Award,
  AlertCircle, CheckCircle2, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProjects, useChats, useDocuments, useTasks } from '@/hooks/use-data';
import { PERSONAS } from '@/lib/ai/personas';

export default function DashboardPage() {
  const { projects } = useProjects();
  const { chats } = useChats();
  const { documents } = useDocuments();
  const { tasks, toggleTask } = useTasks();

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const avgStartupScore = projects.length > 0
    ? Math.round(projects.reduce((a, p) => a + p.startup_score, 0) / projects.length)
    : 0;
  const avgInvestorReadiness = projects.length > 0
    ? Math.round(projects.reduce((a, p) => a + p.investor_readiness, 0) / projects.length)
    : 0;

  const recentChats = chats.slice(0, 5);
  const recentDocs = documents.slice(0, 4);
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 5);

  const recommendations = [
    { icon: Lightbulb, title: 'Validate your idea', desc: 'Run the Idea Validation Engine to test your concept.', action: '/tools', actionLabel: 'Open tool' },
    { icon: FileText, title: 'Create a business plan', desc: 'Generate a complete, editable business plan with AI.', action: '/chat', actionLabel: 'Start chat' },
    { icon: Award, title: 'Check investor readiness', desc: 'See how ready you are to raise funding.', action: '/tools', actionLabel: 'Check now' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your startup progress and AI recommendations.</p>
        </div>
        <Link href="/chat">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> New chat
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Rocket, label: 'Projects', value: projects.length, color: 'text-primary' },
          { icon: MessageSquare, label: 'AI Chats', value: chats.length, color: 'text-accent' },
          { icon: FileText, label: 'Documents', value: documents.length, color: 'text-warning' },
          { icon: CheckSquare, label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, color: 'text-success' },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-display text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Startup score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Startup Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text mb-2">{avgStartupScore}/100</div>
            <Progress value={avgStartupScore} className="mb-3" />
            <p className="text-sm text-muted-foreground">
              {avgStartupScore >= 75 ? 'Strong — ready to build and raise' :
               avgStartupScore >= 50 ? 'Promising — focus on weak areas' :
               'Early stage — validate your idea'}
            </p>
          </CardContent>
        </Card>

        {/* Investor readiness */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-success" /> Investor Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text mb-2">{avgInvestorReadiness}/100</div>
            <Progress value={avgInvestorReadiness} className="mb-3" />
            <p className="text-sm text-muted-foreground">
              {avgInvestorReadiness >= 70 ? 'Ready to start fundraising' :
               avgInvestorReadiness >= 40 ? 'Getting close — polish your pitch' :
               'Focus on traction and financials first'}
            </p>
          </CardContent>
        </Card>

        {/* Task progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-warning" /> Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text mb-2">{taskProgress}%</div>
            <Progress value={taskProgress} className="mb-3" />
            <p className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent chats + AI recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Recent Chats
              </CardTitle>
              <Link href="/chat">
                <Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No chats yet.</p>
                <Link href="/chat">
                  <Button size="sm" className="mt-3">Start your first chat</Button>
                </Link>
              </div>
            ) : (
              recentChats.map((chat) => {
                const persona = PERSONAS[chat.persona];
                return (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/10 transition-colors group"
                  >
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${persona.gradient} flex items-center justify-center shrink-0`}>
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">{persona.name} · {persona.role}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-3 border border-border/40 hover:border-primary/30 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <rec.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                  <Link href={rec.action}>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs">
                      {rec.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent docs + pending tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Recent Documents
              </CardTitle>
              <Link href="/documents">
                <Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDocs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No documents generated yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Chat with AI to generate business plans, pitch decks, and more.</p>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/10 transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{doc.type.replace(/_/g, ' ')}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" /> Pending Tasks
              </CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-10 w-10 mx-auto text-success/40 mb-3" />
                <p className="text-sm text-muted-foreground">All tasks done!</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/10 transition-colors">
                  <button
                    onClick={() => toggleTask(task.id, true)}
                    className="h-5 w-5 rounded border-2 border-muted-foreground/30 hover:border-primary transition-colors shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{task.title}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{task.category}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
