'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send, Sparkles, Bookmark, Copy, Check, Download, Trash2,
  Plus, MessageSquare, ChevronDown, Mic, MicOff, Volume2,
  CornerDownLeft, BookOpen, FileText, Loader2, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/components/auth-provider';
import { PERSONAS, PERSONA_LIST } from '@/lib/ai/personas';
import type { PersonaDefinition } from '@/lib/ai/personas';
import { runAIEngine } from '@/lib/ai/engine';
import type { Message as DbMessage, AIPersona, MessageMetadata } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Markdown } from '@/components/chat/markdown';
import { ChartRenderer } from '@/components/chat/chart-renderer';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const chatId = params?.chatId as string | undefined;

  const [chats, setChats] = React.useState<{ id: string; title: string; persona: AIPersona }[]>([]);
  const [messages, setMessages] = React.useState<DbMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [currentPersona, setCurrentPersona] = React.useState<AIPersona>('general');
  const [listening, setListening] = React.useState(false);
  const [speakingId, setSpeakingId] = React.useState<string | null>(null);
  const [personaPickerOpen, setPersonaPickerOpen] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);
  const originalInputRef = React.useRef('');

  // Cleanup speech recognition on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error aborting speech recognition on unmount:', e);
        }
      }
    };
  }, []);

  const persona = PERSONAS[currentPersona];

  // Load chat list
  React.useEffect(() => {
    if (!user) return;
    supabase.from('chats').select('id, title, persona').order('updated_at', { ascending: false })
      .then(({ data }: { data: any }) => { if (data) setChats(data); });
  }, [user]);

  // Load messages when chatId changes
  React.useEffect(() => {
    if (!chatId || !user) return;
    supabase.from('chats').select('*').eq('id', chatId).maybeSingle().then(({ data }: { data: any }) => {
      if (data) setCurrentPersona(data.persona as AIPersona);
    });
    supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
      .then(({ data }: { data: any }) => { if (data) setMessages(data); });
  }, [chatId, user]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createChat = async (persona: AIPersona): Promise<string> => {
    const p = PERSONAS[persona];
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: user!.id,
        title: `Chat with ${p.name}`,
        persona,
      })
      .select()
      .single();
    if (error) { toast.error('Failed to create chat'); return ''; }
    setChats(prev => [{ id: data.id, title: data.title, persona: data.persona as AIPersona }, ...prev]);
    return data.id;
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;
    const messageText = input.trim();
    setInput('');
    setLoading(true);

    let activeChatId = chatId;
    if (!activeChatId) {
      activeChatId = await createChat(currentPersona);
      if (!activeChatId) { setLoading(false); return; }
      router.push(`/chat/${activeChatId}`);
    }

    // Save user message
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ chat_id: activeChatId, user_id: user.id, role: 'user', content: messageText, persona: currentPersona })
      .select()
      .single();
    if (userMsg) setMessages(prev => [...prev, userMsg]);

    // Generate AI response via server API, falling back to local engine if needed
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    let result;
    try {
      const apiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          persona: currentPersona,
          history: [...history, { role: 'user', content: messageText }],
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Server API failed or key missing');
      }

      result = await apiResponse.json();
    } catch (e) {
      console.log('Falling back to offline rule-based AI engine:', e);
      result = runAIEngine({
        message: messageText,
        persona: currentPersona,
        history: [...history, { role: 'user', content: messageText }],
      });
    }

    // Save AI response
    const { data: aiMsg } = await supabase
      .from('messages')
      .insert({
        chat_id: activeChatId,
        user_id: user.id,
        role: 'assistant',
        content: result.content,
        persona: currentPersona,
        metadata: result.metadata as any,
      })
      .select()
      .single();
    if (aiMsg) setMessages(prev => [...prev, aiMsg]);

    // Save document if generated
    if (result.metadata?.documentGenerated) {
      const docMeta = result.metadata.documentGenerated;
      await supabase.from('documents').insert({
        user_id: user.id,
        chat_id: activeChatId,
        type: docMeta.type,
        title: docMeta.title,
        content: result.content,
      });
      toast.success('Document generated and saved.');
    }

    // Save suggested tasks
    if (result.metadata?.suggestedTasks && result.metadata.suggestedTasks.length > 0) {
      for (const taskTitle of result.metadata.suggestedTasks) {
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: taskTitle,
          category: 'AI Suggested',
          chat_id: null,
        });
      }
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    // Abort existing session if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.error('Error aborting previous SpeechRecognition:', e);
      }
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Save the input text before starting transcription
    originalInputRef.current = input;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      let sessionTranscript = '';
      for (let i = 0; i < e.results.length; i++) {
        sessionTranscript += e.results[i][0].transcript;
      }
      
      const prefix = originalInputRef.current;
      const separator = prefix && !prefix.endsWith(' ') ? ' ' : '';
      setInput(prefix + separator + sessionTranscript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error:', event);
      setListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please click the microphone icon in your browser address bar to allow access.');
      } else if (event.error === 'no-speech') {
        toast.error('No speech detected. Please check your mic and speak clearly.');
      } else if (event.error === 'network') {
        toast.error('Network error. Speech recognition requires an active internet connection.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    try {
      recognition.start();
      setListening(true);
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start SpeechRecognition:', e);
      toast.error('Could not start voice recognition.');
      setListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping SpeechRecognition:', e);
      }
    }
    setListening(false);
  };

  const speakMessage = (id: string, text: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    if (!window.speechSynthesis) { toast.error('Text-to-speech not supported.'); return; }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*|>`\[\]()]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard.');
  };

  const bookmarkMessage = async (msg: DbMessage) => {
    const title = msg.content.slice(0, 60).replace(/[#*|>`]/g, '').trim();
    await supabase.from('bookmarks').insert({
      user_id: user!.id,
      message_id: msg.id,
      chat_id: msg.chat_id,
      title,
      content: msg.content,
    });
    toast.success('Bookmarked.');
  };

  const exportChat = () => {
    const text = messages.map(m => `## ${m.role === 'user' ? 'You' : PERSONAS[m.persona as AIPersona]?.name || 'AI'}\n\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${chatId || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported.');
  };

  const deleteChat = async (id: string) => {
    await supabase.from('chats').delete().eq('id', id);
    setChats(prev => prev.filter(c => c.id !== id));
    if (id === chatId) router.push('/chat');
    toast.success('Chat deleted.');
  };

  const newChat = () => {
    router.push('/chat');
    setMessages([]);
  };

  const personaChats = chats.filter(c => c.persona === currentPersona || !chatId);
  const visibleChats = chatId ? chats : chats;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes voice-bar-bounce {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1.0); }
        }
        .voice-pulse-active {
          animation: pulse-ring 1.5s infinite;
        }
        .voice-wave-bar {
          display: inline-block;
          width: 3.5px;
          height: 18px;
          background-color: hsl(var(--destructive));
          border-radius: 9999px;
          transform-origin: center;
          animation: voice-bar-bounce 1s ease-in-out infinite;
        }
      `}</style>
      {/* Chat list sidebar */}
      <div className={cn(
        'shrink-0 w-64 border-r border-border/40 rounded-xl glass overflow-hidden flex-col',
        showSidebar ? 'flex fixed inset-0 z-50 w-full md:relative md:w-64' : 'hidden md:flex'
      )}>
        <div className="p-3 border-b border-border/40">
          <Button onClick={newChat} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {visibleChats.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No chats yet.</p>
          ) : (
            visibleChats.map((c) => {
              const cp = PERSONAS[c.persona];
              return (
                <div key={c.id} className="group flex items-center">
                  <Link
                    href={`/chat/${c.id}`}
                    className={cn(
                      'flex-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                      c.id === chatId ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'
                    )}
                  >
                    <div className={cn('h-6 w-6 rounded-md bg-gradient-to-br', cp.gradient, 'flex items-center justify-center shrink-0')}>
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    <span className="truncate">{c.title}</span>
                  </Link>
                  <button
                    onClick={() => deleteChat(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col rounded-xl glass overflow-hidden">
        {/* Persona header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSidebar(true)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br', persona.gradient, 'flex items-center justify-center')}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">{persona.name}</p>
              <p className="text-xs text-muted-foreground">{persona.role} · {persona.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chatId && (
              <Button variant="ghost" size="icon" onClick={exportChat} title="Export chat">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu open={personaPickerOpen} onOpenChange={setPersonaPickerOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Switch persona <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Choose your AI advisor</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PERSONA_LIST.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => { setCurrentPersona(p.id); setPersonaPickerOpen(false); }}
                    className={cn(currentPersona === p.id && 'bg-primary/10')}
                  >
                    <div className={cn('h-7 w-7 rounded-lg bg-gradient-to-br', p.gradient, 'flex items-center justify-center mr-2')}>
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg">
                <div className={cn('h-16 w-16 rounded-2xl bg-gradient-to-br mx-auto mb-4 flex items-center justify-center animate-float', persona.gradient)}>
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Chat with {persona.name}</h2>
                <p className="text-muted-foreground mb-6">{persona.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {persona.starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-left text-sm rounded-lg border border-border/40 p-3 hover:bg-accent/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const msgPersona = PERSONAS[msg.persona as AIPersona] || persona;
              const meta = msg.metadata as MessageMetadata | null;
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
                  <div className={cn(
                    'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                    isUser ? 'bg-secondary' : cn('bg-gradient-to-br', msgPersona.gradient)
                  )}>
                    {isUser ? (
                      <span className="text-xs font-bold">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                    ) : (
                      <Sparkles className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={cn('flex-1 min-w-0', isUser && 'flex flex-col items-end')}>
                    <div className={cn(
                      'inline-block max-w-full rounded-xl px-4 py-3',
                      isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/40'
                    )}>
                      {isUser ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="prose-sm max-w-none">
                          <Markdown content={msg.content} />
                          {meta?.chart && <ChartRenderer chart={meta.chart} />}
                          {meta?.followUpQuestions && meta.followUpQuestions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-border/40">
                              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                <CornerDownLeft className="h-3 w-3" /> Follow-up questions
                              </p>
                              <div className="space-y-1.5">
                                {meta.followUpQuestions.map((q, qi) => (
                                  <button
                                    key={qi}
                                    onClick={() => setInput(q)}
                                    className="block w-full text-left text-sm rounded-lg bg-primary/5 hover:bg-primary/10 px-3 py-2 transition-colors"
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {meta?.suggestedTasks && meta.suggestedTasks.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {meta.suggestedTasks.map((t, ti) => (
                                <Badge key={ti} variant="outline" className="text-xs">
                                  <Check className="h-3 w-3 mr-1 text-success" /> {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {meta?.documentGenerated && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-success">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Saved to Documents: {meta.documentGenerated.title}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {!isUser && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <button onClick={() => copyMessage(msg.content)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all" title="Copy">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => bookmarkMessage(msg)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all" title="Bookmark">
                          <Bookmark className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => speakMessage(msg.id, msg.content)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all" title="Speak">
                          <Volume2 className={cn('h-3.5 w-3.5', speakingId === msg.id && 'text-primary')} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex gap-3">
              <div className={cn('h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', persona.gradient)}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-card border border-border/40 rounded-xl px-4 py-3 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary typing-dot" />
                <span className="h-2 w-2 rounded-full bg-primary typing-dot" style={{ animationDelay: '0.2s' }} />
                <span className="h-2 w-2 rounded-full bg-primary typing-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              className={cn(
                'p-2.5 rounded-lg border border-border/40 transition-all shrink-0',
                listening 
                  ? 'bg-destructive/20 text-destructive border-destructive/60 scale-105 voice-pulse-active' 
                  : 'hover:bg-accent/10'
              )}
              title={listening ? 'Stop recording' : 'Voice input'}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            {listening && (
              <div className="flex items-center gap-1 px-2.5 h-[42px] shrink-0 border border-destructive/30 rounded-lg bg-destructive/5 select-none transition-all duration-300">
                <span className="voice-wave-bar" style={{ animationDelay: '0.1s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.3s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.5s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.2s' }} />
                <span className="voice-wave-bar" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? 'Listening... speak now.' : `Message ${persona.name}...`}
              rows={1}
              className="flex-1 resize-none rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
              style={{ minHeight: '42px' }}
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} size="icon" className="shrink-0 h-[42px] w-[42px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line. Voice input supported.
          </p>
        </div>
      </div>

      {/* Mobile sidebar overlay close */}
      {showSidebar && (
        <button onClick={() => setShowSidebar(false)} className="fixed inset-0 z-40 md:hidden bg-black/50" />
      )}
    </div>
  );
}
