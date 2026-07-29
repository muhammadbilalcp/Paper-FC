import React from 'react';
import { PlayerCard } from '../types';
import { FCPlayerCard } from './FCPlayerCard';

interface CardVisualProps {
  card: PlayerCard;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  className?: string;
  badgeTag?: string;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  size = 'md',
  onClick,
  selected = false,
  showStats = true,
  className = ''
}) => {
  return (
    <div className={`relative ${selected ? 'ring-4 ring-green-400 rounded-[20px] scale-105' : ''}`}>
      <FCPlayerCard
        card={card}
        size={size}
        onClick={onClick}
        showStats={showStats}
        className={className}
      />
    </div>
  );
};

