'use client';

import { Heart, Info, Dumbbell } from 'lucide-react';
import { useExerciseStore } from '@/store/useExerciseStore';
import type { Exercise } from '@/data/exercises-database';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  showDetails?: boolean;
}

export function ExerciseCard({ exercise, onSelect, showDetails = false }: ExerciseCardProps) {
  const { isFavorite, toggleFavorite } = useExerciseStore();
  const isLiked = isFavorite(exercise.id);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getEquipmentIcon = (equipment: string) => {
    const icons: Record<string, string> = {
      'Barbell': '🏋️',
      'Dumbbell': '💪',
      'Cable': '🎯',
      'Machine': '⚙️',
      'Bodyweight': '🧘',
      'Cardio Equipment': '🏃',
      'Other': '🔧',
    };
    return icons[equipment] || '💪';
  };

  return (
    <div
      className="group relative holo-border aura-glass rounded-2xl sm:rounded-3xl p-5 cursor-pointer will-change-transform transition-all duration-200 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)] active:scale-[0.98]"
      onClick={() => onSelect?.(exercise)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(exercise); }}
      aria-label={`View details for ${exercise.name}`}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(exercise.id);
        }}
        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-sm transition-colors z-10 touch-target"
        aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isLiked ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]' : 'text-slate-400 hover:text-rose-400'
          }`}
        />
      </button>

      {/* Equipment Icon */}
      <div className="text-4xl mb-4">{getEquipmentIcon(exercise.equipment)}</div>

      {/* Exercise Name */}
      <h3 className="text-lg font-bold text-white mb-2.5 pr-8 leading-tight">
        {exercise.name}
      </h3>

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600/30 font-mono font-bold">
          {exercise.muscleGroup}
        </span>
        <span
          className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${getDifficultyColor(
            exercise.difficulty
          )}`}
        >
          {exercise.difficulty}
        </span>
      </div>

      {/* Exercise Type */}
      <p className="text-xs font-mono text-slate-500 mb-3">
        {exercise.type} • {exercise.equipment}
      </p>

      {/* Primary Muscles */}
      {showDetails && exercise.metadata?.musclesWorked?.primary && exercise.metadata.musclesWorked.primary.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider mb-1.5">Primary Muscles:</p>
          <div className="flex flex-wrap gap-1.5">
            {exercise.metadata.musclesWorked.primary.map((m: string) => (
              <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hover Indicator */}
      <div className="mt-4 flex items-center gap-2 text-xs font-mono font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="w-3.5 h-3.5" />
        <span>Xem chi tiết →</span>
      </div>
    </div>
  );
}
