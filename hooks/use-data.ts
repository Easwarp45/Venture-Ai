'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/components/auth-provider';
import type { Project, Chat, Message, GeneratedDocument, Bookmark, Task } from '@/lib/database.types';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    setProjects(data ?? []);
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return { projects, loading, reload: load };
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });
    setChats(data ?? []);
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return { chats, loading, reload: load };
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = React.useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    setDocuments(data ?? []);
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return { documents, loading, reload: load };
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false });
    setBookmarks(data ?? []);
    setLoading(false);
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  return { bookmarks, loading, reload: load };
}

export function useTasks(projectId?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    if (!user) return;
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);
    const { data } = await query;
    setTasks(data ?? []);
    setLoading(false);
  }, [user, projectId]);

  React.useEffect(() => { load(); }, [load]);

  const toggleTask = React.useCallback(async (id: string, completed: boolean) => {
    await supabase.from('tasks').update({ completed }).eq('id', id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  }, []);

  const addTask = React.useCallback(async (title: string, category: string, projId?: string) => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, category, project_id: projId ?? null })
      .select()
      .single();
    if (data) setTasks(prev => [data, ...prev]);
  }, [user]);

  const deleteTask = React.useCallback(async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, reload: load, toggleTask, addTask, deleteTask };
}
