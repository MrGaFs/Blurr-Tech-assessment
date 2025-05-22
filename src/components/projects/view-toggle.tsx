'use client';

import { LayoutList, Trello } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: 'list' | 'kanban';
  onChange: (view: 'list' | 'kanban') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          "px-3 py-1 h-auto",
          view === 'list' ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
        )}
      >
        <LayoutList className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">List</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('kanban')}
        className={cn(
          "px-3 py-1 h-auto",
          view === 'kanban' ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
        )}
      >
        <Trello className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Kanban</span>
      </Button>
    </div>
  );
} 