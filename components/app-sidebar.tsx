'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Wrench, FileText, Bookmark,
  CheckSquare, Rocket, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/tools', label: 'AI Tools', icon: Wrench },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border/40 glass-strong transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border/40 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-bold whitespace-nowrap">VentureAI</span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-border/40 p-2 shrink-0">
          <div className={cn('flex items-center gap-3 px-2 py-2', collapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.email}</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5"
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('w-full mt-1', collapsed ? 'justify-center' : 'justify-end')}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
