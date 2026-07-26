'use client';

import { Search, X, Filter, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { useState, useRef } from 'react';
import { MUSCLE_GROUPS } from '@/data/muscle-groups';
import { EXERCISE_TYPES, EQUIPMENT } from '@/data/exercise-types';

interface ExerciseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMuscleGroup: string;
  onMuscleGroupChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedEquipment: string;
  onEquipmentChange: (value: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  resultsCount: number;
}

// Map for human-readable labels
const MUSCLE_OPTIONS = ['all', ...Object.values(MUSCLE_GROUPS)];
const TYPE_OPTIONS = ['all', ...Object.values(EXERCISE_TYPES)];
const EQUIPMENT_TYPES = ['all', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Cardio Equipment', 'Other'];
const DIFFICULTY_OPTIONS = ['all', 'Beginner', 'Intermediate', 'Advanced'];

// Quick chip selector component
function FilterChips({
  options,
  selected,
  onChange,
  label,
}: {
  options: string[]
  selected: string
  onChange: (v: string) => void
  label: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1"
      >
        {options.map((opt) => {
          const isActive = selected === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`
                shrink-0 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all
                touch-target min-w-[44px]
                ${isActive
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:border-slate-500 hover:text-slate-200'
                }
              `}
            >
              {opt === 'all' ? 'All' : opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ExerciseFilters({
  searchTerm,
  onSearchChange,
  selectedMuscleGroup,
  onMuscleGroupChange,
  selectedType,
  onTypeChange,
  selectedEquipment,
  onEquipmentChange,
  selectedDifficulty,
  onDifficultyChange,
  showFavoritesOnly,
  onToggleFavorites,
  resultsCount,
}: ExerciseFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters =
    selectedMuscleGroup !== 'all' ||
    selectedType !== 'all' ||
    selectedEquipment !== 'all' ||
    selectedDifficulty !== 'all' ||
    showFavoritesOnly;

  const clearAllFilters = () => {
    onMuscleGroupChange('all');
    onTypeChange('all');
    onEquipmentChange('all');
    onDifficultyChange('all');
    if (showFavoritesOnly) onToggleFavorites();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm bài tập..."
          className="w-full pl-12 pr-12 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all font-mono"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-700/50 rounded-xl transition-colors touch-target"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="lg:hidden w-full flex items-center justify-between px-5 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-slate-300 hover:border-amber-400/40 transition-all aura-glass"
      >
        <span className="flex items-center gap-2 font-mono font-bold text-sm">
          <Filter className="w-4 h-4 text-amber-400" />
          BỘ LỌC
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-400 rounded-full border border-amber-400/30">
              {resultsCount}
            </span>
          )}
        </span>
        {showMobileFilters ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Filter Grid - Desktop always visible, Mobile toggled */}
      <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FilterChips
            options={MUSCLE_OPTIONS}
            selected={selectedMuscleGroup}
            onChange={onMuscleGroupChange}
            label="Muscle Group"
          />
          <FilterChips
            options={TYPE_OPTIONS}
            selected={selectedType}
            onChange={onTypeChange}
            label="Type"
          />
          <FilterChips
            options={EQUIPMENT_TYPES}
            selected={selectedEquipment}
            onChange={onEquipmentChange}
            label="Equipment"
          />
          <FilterChips
            options={DIFFICULTY_OPTIONS}
            selected={selectedDifficulty}
            onChange={onDifficultyChange}
            label="Level"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Favorites Toggle */}
        <button
          onClick={onToggleFavorites}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all touch-target ${
            showFavoritesOnly
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-slate-600/50 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 inline mr-1.5 ${showFavoritesOnly ? 'fill-rose-500' : ''}`} />
          Favorites
        </button>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-amber-500/30 hover:text-amber-400 transition-all touch-target"
          >
            <X className="w-3.5 h-3.5 inline mr-1" />
            Clear
          </button>
        )}

        {/* Results Count */}
        <span className="text-xs font-mono text-slate-500 ml-auto">
          {resultsCount} bài tập
        </span>
      </div>
    </div>
  );
}
