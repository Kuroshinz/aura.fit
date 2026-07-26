'use client';

import { useState, useMemo } from 'react';
import { Heart, Dumbbell, Clock, Plus, TrendingUp } from 'lucide-react';
import { useExerciseStore } from '@/store/useExerciseStore';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters';

type ViewMode = 'all' | 'favorites' | 'recent' | 'custom';

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const {
    filters,
    setFilters,
    getFilteredExercises,
    getFavoriteExercises,
    getRecentlyViewedExercises,
    customExercises,
  } = useExerciseStore();

  // Get exercises based on view mode
  const displayedExercises = useMemo(() => {
    switch (viewMode) {
      case 'favorites':
        return getFavoriteExercises();
      case 'recent':
        return getRecentlyViewedExercises();
      case 'custom':
        return customExercises;
      default:
        return getFilteredExercises();
    }
  }, [viewMode, getFavoriteExercises, getRecentlyViewedExercises, customExercises, getFilteredExercises]);

  // Apply local filters
  const filteredExercises = useMemo(() => {
    let exercises = displayedExercises;

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      exercises = exercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.muscleGroup.toLowerCase().includes(query) ||
          ex.equipment.toLowerCase().includes(query)
      );
    }

    if (selectedMuscleGroup !== 'all') {
      exercises = exercises.filter((ex) => ex.muscleGroup === selectedMuscleGroup);
    }

    if (selectedType !== 'all') {
      exercises = exercises.filter((ex) => ex.type === selectedType);
    }

    if (selectedEquipment !== 'all') {
      exercises = exercises.filter((ex) => ex.equipment === selectedEquipment);
    }

    if (selectedDifficulty !== 'all') {
      exercises = exercises.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    return exercises;
  }, [displayedExercises, searchTerm, selectedMuscleGroup, selectedType, selectedEquipment, selectedDifficulty]);

  const viewModeConfig = [
    {
      id: 'all' as ViewMode,
      label: 'All Exercises',
      icon: Dumbbell,
      count: getFilteredExercises().length,
    },
    {
      id: 'favorites' as ViewMode,
      label: 'Favorites',
      icon: Heart,
      count: getFavoriteExercises().length,
    },
    {
      id: 'recent' as ViewMode,
      label: 'Recently Viewed',
      icon: Clock,
      count: getRecentlyViewedExercises().length,
    },
    {
      id: 'custom' as ViewMode,
      label: 'My Exercises',
      icon: Plus,
      count: customExercises.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800/50 bg-[#0B0E14]/95 backdrop-blur-sm">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-50">
                Exercise Library
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Browse and manage your exercise collection
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span>{filteredExercises.length} exercises</span>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {viewModeConfig.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`
                    group relative flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium
                    transition-all duration-200 hover:scale-[1.02]
                    ${
                      isActive
                        ? 'border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-lg shadow-sky-500/5'
                        : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{mode.label}</span>
                  <span
                    className={`
                      ml-1 rounded-full px-2 py-0.5 text-xs font-semibold
                      ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-slate-700/50 text-slate-500'
                      }
                    `}
                  >
                    {mode.count}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <ExerciseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedMuscleGroup={selectedMuscleGroup}
          onMuscleGroupChange={setSelectedMuscleGroup}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedEquipment={selectedEquipment}
          onEquipmentChange={setSelectedEquipment}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          showFavoritesOnly={false}
          onToggleFavorites={() => {}}
          resultsCount={filteredExercises.length}
        />
      </div>

      {/* Exercise Grid */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        {filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/50 bg-slate-900/20 py-16">
            <div className="rounded-full bg-slate-800/50 p-4">
              <Dumbbell className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-300">No exercises found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {viewMode === 'favorites' && 'Start marking exercises as favorites to see them here'}
              {viewMode === 'recent' && 'Recently viewed exercises will appear here'}
              {viewMode === 'custom' && 'Create custom exercises to see them here'}
              {viewMode === 'all' && 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                showDetails={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
