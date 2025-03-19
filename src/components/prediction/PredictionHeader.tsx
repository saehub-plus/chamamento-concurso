
import React from 'react';
import { User } from 'lucide-react';

interface PredictionHeaderProps {
  userName: string;
  userPosition: number;
}

export function PredictionHeader({ userName, userPosition }: PredictionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <User className="h-5 w-5 text-primary" />
      <h3 className="font-semibold text-lg">{userName}</h3>
      <span className="text-muted-foreground text-sm">
        (Posição #{userPosition})
      </span>
    </div>
  );
}
