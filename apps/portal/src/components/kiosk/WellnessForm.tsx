import React, { useState } from 'react';
import { wellnessSchema, WellnessInput } from '@weightroom/shared-validation';
import { apiFetch } from '../../lib/api';
import { Card, Button, Input } from '@weightroom/ui-components';
import { motion } from 'framer-motion';

export const WellnessForm = ({ athleteId, onSuccess }: { athleteId: string, onSuccess?: () => void }) => {
  const [formData, setFormData] = useState<Partial<WellnessInput>>({
    athleteId,
    sleepHours: 8,
    sleepQuality: 7,
    soreness: 3,
    fatigue: 4,
    stress: 2,
    illness: false,
    pain: false
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validated = wellnessSchema.parse(formData);
      setErrors({});
      await apiFetch('wellness', {
        method: 'POST',
        body: JSON.stringify(validated)
      });
      alert('Wellness check-in recorded!');
      onSuccess?.();
    } catch (err: any) {
      if (err.name === 'ZodError') {
        const fieldErrors = err.flatten().fieldErrors;
        setErrors(fieldErrors);
      } else {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const sliderGroup = (label: string, name: keyof WellnessInput, min = 1, max = 10) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2 px-1">
        <label className="text-sm font-medium text-zinc-400">{label}</label>
        <span className="text-lg font-bold text-[#8251EE]">{formData[name]}</span>
      </div>
      <input 
        type="range" 
        name={name} 
        min={min} 
        max={max} 
        value={formData[name] as number} 
        onChange={handleChange}
        className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#8251EE]"
      />
      {errors[name] && <span className="text-xs text-red-500 ml-1">{errors[name]}</span>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-xl mx-auto shadow-2xl border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Daily Wellness</h2>
          <p className="text-zinc-400 text-sm mt-1">Tell us how you're feeling before today's session.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Sleep Hours"
            type="number" 
            name="sleepHours" 
            step="0.5"
            value={formData.sleepHours} 
            onChange={handleChange}
          />

          {sliderGroup('Sleep Quality', 'sleepQuality')}
          {sliderGroup('Muscle Soreness', 'soreness')}
          {sliderGroup('Fatigue Level', 'fatigue')}
          {sliderGroup('Stress Level', 'stress')}

          <div className="grid grid-cols-2 gap-4 py-2">
            <label className={`
              flex items-center justify-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
              ${formData.illness ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-zinc-400'}
            `}>
              <input type="checkbox" name="illness" className="hidden" checked={formData.illness} onChange={handleChange} />
              <span className="font-medium">Feeling Ill?</span>
            </label>
            <label className={`
              flex items-center justify-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
              ${formData.pain ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-zinc-400'}
            `}>
              <input type="checkbox" name="pain" className="hidden" checked={formData.pain} onChange={handleChange} />
              <span className="font-medium">Injury Pain?</span>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Recording...' : 'Submit Check-in'}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
};
