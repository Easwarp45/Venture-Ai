'use client';

import * as React from 'react';
import { CheckSquare, Trash2, Plus, Loader2, Check, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { useTasks } from '@/hooks/use-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function TasksPage() {
  const { tasks, loading, toggleTask, addTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('general');

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    await addTask(newTask.trim(), newCategory);
    setNewTask('');
    toast.success('Task added.');
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Task Checklist</h1>
        <p className="text-muted-foreground mt-1">Track your startup-building tasks, including AI-suggested ones.</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{completed} of {total} completed</span>
          </div>
          <Progress value={progress} />
          <p className="text-2xl font-bold gradient-text mt-3">{progress}%</p>
        </CardContent>
      </Card>

      {/* Add task */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Input
              placeholder="Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="sm:w-40"
            />
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No tasks yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add tasks manually or chat with AI to get suggested tasks.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catTasks = tasks.filter(t => t.category === cat);
            const catDone = catTasks.filter(t => t.completed).length;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-semibold text-sm">{cat}</h2>
                  <Badge variant="outline" className="text-xs">{catDone}/{catTasks.length}</Badge>
                </div>
                <Card>
                  <CardContent className="p-2 space-y-1">
                    {catTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent/10 transition-colors"
                      >
                        <button
                          onClick={() => toggleTask(task.id, !task.completed)}
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            task.completed
                              ? 'bg-success border-success text-white'
                              : 'border-muted-foreground/30 hover:border-primary'
                          }`}
                        >
                          {task.completed && <Check className="h-3 w-3" />}
                        </button>
                        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
