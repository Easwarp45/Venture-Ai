'use client';

import * as React from 'react';
import {
  Gauge, Lightbulb, Sparkles, Palette, Presentation, Award,
  Swords, Users, Megaphone, Calculator, Banknote, TrendingUp,
  Boxes, Map, ShieldAlert, Loader2, ArrowRight, X, Check,
} from 'lucide-react';
import { TOOL_LIST, TOOLS, type ToolDefinition, type ToolInput } from '@/lib/ai/tools';
import type { MessageMetadata } from '@/lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Markdown } from '@/components/chat/markdown';
import { ChartRenderer } from '@/components/chat/chart-renderer';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gauge, Lightbulb, Sparkles, Palette, Presentation, Award,
  Swords, Users, Megaphone, Calculator, Banknote, TrendingUp,
  Boxes, Map, ShieldAlert,
};

interface ToolResult {
  content: string;
  metadata?: MessageMetadata;
}

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = React.useState<ToolDefinition | null>(null);
  const [inputs, setInputs] = React.useState<Record<string, string>>({});
  const [result, setResult] = React.useState<ToolResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  const openTool = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setInputs({});
    setResult(null);
  };

  const closeTool = () => {
    setSelectedTool(null);
    setInputs({});
    setResult(null);
  };

  const runTool = async () => {
    if (!selectedTool) return;
    const required = selectedTool.inputs.filter(i => i.required);
    for (const req of required) {
      if (!inputs[req.key]) return;
    }
    setLoading(true);
    const toolResult = selectedTool.run(inputs);
    setResult(toolResult);
    setLoading(false);
  };

  const categories = Array.from(new Set(TOOL_LIST.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Tools</h1>
        <p className="text-muted-foreground mt-1">
          Interactive AI-powered calculators and generators for every startup need.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="h-1 w-6 rounded-full gradient-primary" /> {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOL_LIST.filter(t => t.category === category).map((tool) => {
              const Icon = ICON_MAP[tool.icon] || Sparkles;
              return (
                <Card
                  key={tool.id}
                  className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  onClick={() => openTool(tool)}
                >
                  <CardContent className="p-5">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 group-hover:gradient-primary flex items-center justify-center mb-3 transition-all">
                      <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-1">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    <Button variant="ghost" size="sm" className="mt-3 p-0 h-auto group-hover:text-primary">
                      Open tool <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tool dialog */}
      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && closeTool()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTool && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {React.createElement(ICON_MAP[selectedTool.icon] || Sparkles, { className: 'h-6 w-6 text-primary' })}
                  <div>
                    <DialogTitle>{selectedTool.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
                  </div>
                </div>
              </DialogHeader>

              {!result ? (
                <div className="space-y-4 py-2">
                  {selectedTool.inputs.map((field: ToolInput) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.key}
                          placeholder={field.placeholder}
                          value={inputs[field.key] || ''}
                          onChange={(e) => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                          rows={3}
                        />
                      ) : field.type === 'select' ? (
                        <Select value={inputs[field.key] || ''} onValueChange={(v) => setInputs(prev => ({ ...prev, [field.key]: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'number' ? (
                        <Input
                          id={field.key}
                          type="number"
                          placeholder={field.placeholder}
                          value={inputs[field.key] || ''}
                          onChange={(e) => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          type="text"
                          placeholder={field.placeholder}
                          value={inputs[field.key] || ''}
                          onChange={(e) => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                  <DialogFooter>
                    <Button variant="outline" onClick={closeTool}>Cancel</Button>
                    <Button onClick={runTool} disabled={loading}>
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <>Generate <Sparkles className="h-4 w-4 ml-1" /></>}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="py-2">
                  <div className="rounded-xl border border-border/40 bg-card/50 p-4 max-h-[55vh] overflow-y-auto">
                    <Markdown content={result.content} />
                    {result.metadata?.chart && <ChartRenderer chart={result.metadata.chart} />}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setResult(null)}>Run again</Button>
                    <Button onClick={closeTool}>Done</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
