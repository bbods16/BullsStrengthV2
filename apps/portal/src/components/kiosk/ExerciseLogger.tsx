import React, { useState } from 'react';
import { ExerciseLogInput } from '@weightroom/shared-validation';
import { Button, Input } from '@weightroom/ui-components';
import { Plus } from 'lucide-react';

export const ExerciseLogger = ({ onAdd }: { onAdd: (log: ExerciseLogInput) => void }) => {
  const [log, setLog] = useState<ExerciseLogInput>({
    exerciseName: '',
    sets: 1,
    reps: 1,
    weight: 0,
    rpe: 7
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    setLog(prev => ({ ...prev, [name]: val }));
  };

  const handleAdd = () => {
    if (!log.exerciseName) return;
    onAdd(log);
    setLog({ exerciseName: '', sets: 1, reps: 1, weight: 0, rpe: 7 });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Exercise Name"
          type="text" 
          name="exerciseName" 
          value={log.exerciseName} 
          onChange={handleChange} 
          placeholder="e.g. Back Squat"
        />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Sets" type="number" name="sets" value={log.sets} onChange={handleChange} />
          <Input label="Reps" type="number" name="reps" value={log.reps} onChange={handleChange} />
          <Input label="Weight (kg)" type="number" name="weight" value={log.weight} onChange={handleChange} />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Target RPE</label>
            <span className="text-sm font-bold text-[#8251EE]">{log.rpe}</span>
          </div>
          <input 
            type="range" 
            name="rpe" 
            min="1" 
            max="10" 
            value={log.rpe} 
            onChange={handleChange} 
            className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#8251EE]"
          />
        </div>
        <Button 
          variant="secondary"
          onClick={handleAdd}
          className="h-12 flex items-center gap-2"
        >
          <Plus size={18} /> Add to Session
        </Button>
      </div>
    </div>
  );
};
