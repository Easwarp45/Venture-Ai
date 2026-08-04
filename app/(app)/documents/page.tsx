'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText, Download, Trash2, Search, File, Presentation,
  LayoutGrid, Shield, Megaphone, TrendingUp, Award, CheckSquare,
  Loader2, ArrowLeft, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/components/auth-provider';
import { useDocuments } from '@/hooks/use-data';
import type { DocumentType } from '@/lib/database.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/chat/markdown';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const DOC_ICONS: Record<DocumentType, React.ComponentType<{ className?: string }>> = {
  business_plan: FileText,
  pitch_deck: Presentation,
  lean_canvas: LayoutGrid,
  swot: Shield,
  marketing_plan: Megaphone,
  financial_projection: TrendingUp,
  investor_summary: Award,
  launch_checklist: CheckSquare,
};

const DOC_LABELS: Record<DocumentType, string> = {
  business_plan: 'Business Plan',
  pitch_deck: 'Pitch Deck',
  lean_canvas: 'Lean Canvas',
  swot: 'SWOT Analysis',
  marketing_plan: 'Marketing Plan',
  financial_projection: 'Financial Projection',
  investor_summary: 'Investor Summary',
  launch_checklist: 'Launch Checklist',
};

export default function DocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { documents, loading, reload } = useDocuments();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<DocumentType | 'all'>('all');
  const [viewDoc, setViewDoc] = React.useState<typeof documents[0] | null>(null);

  const filtered = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || d.type === filter;
    return matchesSearch && matchesFilter;
  });

  const deleteDoc = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    reload();
    toast.success('Document deleted.');
  };

  const exportDoc = (doc: typeof documents[0]) => {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Document exported.');
  };

  const copyDoc = (doc: typeof documents[0]) => {
    navigator.clipboard.writeText(doc.content);
    toast.success('Content copied.');
  };

  const docTypes = Array.from(new Set(documents.map(d => d.type)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">
          AI-generated business plans, pitch decks, financials, and more.
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >All</Button>
          {docTypes.map(t => (
            <Button
              key={t}
              variant={filter === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(t)}
            >{DOC_LABELS[t]}</Button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No documents yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Chat with AI to generate business plans, pitch decks, and more.</p>
            <Link href="/chat">
              <Button className="mt-4">Start chatting</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const Icon = DOC_ICONS[doc.type] || File;
            return (
              <Card key={doc.id} className="group hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">{DOC_LABELS[doc.type]}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-2 cursor-pointer hover:text-primary" onClick={() => setViewDoc(doc)}>
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewDoc(doc)}>
                      View
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => exportDoc(doc)} title="Export">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyDoc(doc)} title="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc.id)} title="Delete" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewDoc} onOpenChange={(open) => !open && setViewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {viewDoc && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {React.createElement(DOC_ICONS[viewDoc.type] || File, { className: 'h-6 w-6 text-primary' })}
                  <div>
                    <DialogTitle>{viewDoc.title}</DialogTitle>
                    <Badge variant="outline" className="text-xs mt-1">{DOC_LABELS[viewDoc.type]}</Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="rounded-xl border border-border/40 bg-card/50 p-4 max-h-[60vh] overflow-y-auto">
                <Markdown content={viewDoc.content} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportDoc(viewDoc)}>
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
                <Button variant="outline" onClick={() => copyDoc(viewDoc)}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="ghost" className="ml-auto" onClick={() => setViewDoc(null)}>Close</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
