import React, { useState } from 'react';
import { ExerciseLogger } from '../components/ExerciseLogger';
import { SessionLogInput, ExerciseLogInput } from '@weightroom/shared-validation';
import { apiFetch } from '../lib/api';
import { Card, Button } from '@weightroom/ui-components';
import { Trash2, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SessionLog = ({ athleteId }: { athleteId: string }) => {
  const [session, setSession] = useState<Partial<SessionLogInput>>({
    athleteId,
    date: new Date().toISOString(),
    durationMin: 60,
    sessionType: 'Lift',
    sessionRPE: 7,
    exercises: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExercise = (log: ExerciseLogInput) => {
    setSession(prev => ({
      ...prev,
      exercises: [...(prev.exercises || []), log]
    }));
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = name === 'durationMin' || name === 'sessionRPE' ? parseInt(value) : value;
    setSession(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiFetch('sessions', {
        method: 'POST',
        body: JSON.stringify(session)
      });
      alert('Session logged successfully!');
      setSession(prev => ({ ...prev, exercises: [] }));
    } catch (err: any) {
      alert(`Failed to log session: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Log Session</h2>
          <p className="text-zinc-400 mt-1">Record your training volume and intensity.</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Date</span>
          <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString()}</p>
        </div>
      </header>
      
      <Card className="mb-8 border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Session Type</label>
            <select 
              name="sessionType" 
              value={session.sessionType} 
              onChange={handleSessionChange} 
              className="glass-input w-full"
            >
              <option>Lift</option>
              <option>Practice</option>
              <option>Conditioning</option>
              <option>Mixed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Duration (min)</label>
            <input 
              type="number" 
              name="durationMin" 
              value={session.durationMin} 
              onChange={handleSessionChange} 
              className="glass-input w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400 mb-2 block">Session RPE (1-10)</label>
            <input 
              type="number" 
              name="sessionRPE" 
              min="1" 
              max="10" 
              value={session.sessionRPE} 
              onChange={handleSessionChange} 
              className="glass-input w-full"
            />
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white">Exercises</h3>
          <span className="text-sm text-zinc-500">{session.exercises?.length || 0} Added</span>
        </div>

        <AnimatePresence>
          {session.exercises?.map((ex, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-[#8251EE]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#8251EE]/10 flex items-center justify-center text-[#8251EE] font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white">{ex.exerciseName}</p>
                    <p className="text-sm text-zinc-400">
                      {ex.sets} sets × {ex.reps} reps @ {ex.weight}kg <span className="mx-1">•</span> RPE {ex.rpe}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSession(prev => ({ ...prev, exercises: prev.exercises?.filter((_, i) => i !== idx) }))}
                  className="text-zinc-500 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Card className="mt-6 border-dashed border-white/10 bg-transparent">
          <h4 className="text-sm font-bold text-[#8251EE] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Plus size={16} /> Add Exercise
          </h4>
          <ExerciseLogger onAdd={addExercise} />
        </Card>
      </section>

      <div className="mt-12">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || (session.exercises?.length === 0)}
          className="w-full h-16 text-xl shadow-glow"
        >
          {isSubmitting ? 'Logging...' : (
            <span className="flex items-center justify-center gap-2">
              <Check size={24} /> Finish & Save Session
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
