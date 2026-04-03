import React from 'react';
import { Athlete } from '@weightroom/shared-types';
import { Card } from '@weightroom/ui-components';
import { User, Activity } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
  onClick?: (athlete: Athlete) => void;
}

export const AthleteCard = ({ athlete, onClick }: AthleteCardProps) => {
  const statusColors = {
    GREEN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    YELLOW: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    RED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <Card 
      className="cursor-pointer hover:border-[#8251EE]/50 hover:bg-white/[0.07] transition-all group"
      onClick={() => onClick?.(athlete)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-[#8251EE]/20 transition-all">
          <User size={24} />
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${statusColors[athlete.statusTag]}`}>
          {athlete.statusTag}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white group-hover:text-[#8251EE] transition-colors">
        {athlete.firstName} {athlete.lastName}
      </h3>
      <p className="text-zinc-400 text-sm mb-4">{athlete.sport} • {athlete.team}</p>

      <div className="pt-4 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <Activity size={14} className="text-[#8251EE]" />
          <span>Last active: Today</span>
        </div>
      </div>
    </Card>
  );
};
