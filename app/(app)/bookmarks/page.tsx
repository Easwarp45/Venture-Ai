'use client';

import * as React from 'react';
import { Bookmark, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { useBookmarks } from '@/hooks/use-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/chat/markdown';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function BookmarksPage() {
  const { bookmarks, loading, reload } = useBookmarks();
  const [search, setSearch] = React.useState('');
  const [viewBookmark, setViewBookmark] = React.useState<typeof bookmarks[0] | null>(null);

  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id);
    reload();
    toast.success('Bookmark removed.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Saved insights and AI responses from your chats.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No bookmarks yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Bookmark AI responses in chat to save them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((bm) => (
            <Card key={bm.id} className="group hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <Bookmark className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary" onClick={() => setViewBookmark(bm)}>
                      {bm.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bm.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBookmark(bm.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewBookmark} onOpenChange={(open) => !open && setViewBookmark(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewBookmark && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-warning" /> {viewBookmark.title}
                </DialogTitle>
              </DialogHeader>
              <div className="rounded-xl border border-border/40 bg-card/50 p-4 max-h-[60vh] overflow-y-auto">
                <Markdown content={viewBookmark.content} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
