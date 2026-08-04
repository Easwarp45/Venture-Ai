'use client';

import * as React from 'react';

interface MarkdownProps {
  content: string;
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      { match: boldMatch, type: 'bold' as const, end: boldMatch ? boldMatch.index! + boldMatch[0].length : Infinity },
      { match: codeMatch, type: 'code' as const, end: codeMatch ? codeMatch.index! + codeMatch[0].length : Infinity },
      { match: linkMatch, type: 'link' as const, end: linkMatch ? linkMatch.index! + linkMatch[0].length : Infinity },
    ].filter(m => m.match && m.match.index !== undefined).sort((a, b) => (a.match!.index! - b.match!.index!));

    if (matches.length === 0) {
      nodes.push(remaining);
      break;
    }

    const first = matches[0];
    if (first.match!.index! > 0) {
      nodes.push(remaining.slice(0, first.match!.index!));
    }

    if (first.type === 'bold') {
      nodes.push(<strong key={key++} className="font-semibold">{first.match![1]}</strong>);
    } else if (first.type === 'code') {
      nodes.push(<code key={key++} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{first.match![1]}</code>);
    } else if (first.type === 'link') {
      nodes.push(
        <a key={key++} href={first.match![2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
          {first.match![1]}
        </a>
      );
    }

    remaining = remaining.slice(first.end);
  }

  return nodes;
}

export function Markdown({ content }: MarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={key++} className="my-3 rounded-lg bg-muted p-4 overflow-x-auto text-xs font-mono">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').map(c => c.trim()).filter(c => c !== '');
        const rows = tableLines.slice(2).map(r => r.split('|').map(c => c.trim()).filter(c => c !== ''));

        elements.push(
          <div key={key++} className="my-3 overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left font-semibold border-b border-border/40">{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/20 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 border-r border-border/20 last:border-0">{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Headers
    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h4 = line.match(/^#### (.+)/);
    if (h1) { elements.push(<h2 key={key++} className="font-display text-2xl font-bold mt-5 mb-2">{renderInline(h1[1])}</h2>); i++; continue; }
    if (h2) { elements.push(<h3 key={key++} className="font-display text-xl font-bold mt-4 mb-2">{renderInline(h2[1])}</h3>); i++; continue; }
    if (h3) { elements.push(<h4 key={key++} className="font-semibold text-lg mt-3 mb-1.5">{renderInline(h3[1])}</h4>); i++; continue; }
    if (h4) { elements.push(<p key={key++} className="font-semibold mt-2 mb-1">{renderInline(h4[1])}</p>); i++; continue; }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="my-3 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
          {renderInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // List
    if (line.match(/^[-*] /) || line.match(/^\d+\. /)) {
      const isOrdered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (lines[i].match(/^[-*] /) || lines[i].match(/^\d+\. /))) {
        items.push(lines[i].replace(/^[-*] |^\d+\. /, ''));
        i++;
      }
      if (isOrdered) {
        elements.push(
          <ol key={key++} className="my-2 space-y-1 list-decimal list-inside">
            {items.map((item, ii) => <li key={ii} className="text-sm">{renderInline(item)}</li>)}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key++} className="my-2 space-y-1 list-disc list-inside">
            {items.map((item, ii) => <li key={ii} className="text-sm">{renderInline(item)}</li>)}
          </ul>
        );
      }
      continue;
    }

    // Checkbox list
    if (line.match(/^- \[ \] /) || line.match(/^- \[x\] /i)) {
      const items: { text: string; checked: boolean }[] = [];
      while (i < lines.length && (lines[i].match(/^- \[ \] /) || lines[i].match(/^- \[x\] /i))) {
        const checked = /^\- \[x\] /i.test(lines[i]);
        items.push({ text: lines[i].replace(/^- \[ \] |^- \[x\] /i, ''), checked });
        i++;
      }
      elements.push(
        <ul key={key++} className="my-2 space-y-1">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm flex items-start gap-2">
              <span className={`mt-0.5 ${item.checked ? 'text-success' : 'text-muted-foreground'}`}>
                {item.checked ? '✓' : '○'}
              </span>
              <span className={item.checked ? 'line-through text-muted-foreground' : ''}>{renderInline(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Regular paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^[#>-]/) && !lines[i].includes('|') && !lines[i].trim().startsWith('```') && !lines[i].match(/^[-*] /) && !lines[i].match(/^\d+\. /)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      elements.push(<p key={key++} className="text-sm leading-relaxed my-1.5">{renderInline(paraLines.join(' '))}</p>);
    } else {
      i++;
    }
  }

  return <div className="markdown-output">{elements}</div>;
}
