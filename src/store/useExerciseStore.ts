import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise } from '@/data/exercises-database';
import { EXERCISES_DATABASE } from '@/data/exercises-database';

interface ExerciseFilters {
  muscleGroup: string | null;
  equipment: string | null;
  difficulty: string | null;
  searchQuery: string;
}

interface ExerciseStore {
  // Filters
  filters: ExerciseFilters;
  setFilters: (filters: Partial<ExerciseFilters>) => void;
  resetFilters: () => void;

  // Favorites
  favoriteExerciseIds: string[];
  toggleFavorite: (exerciseId: string) => void;
  isFavorite: (exerciseId: string) => boolean;

  // Recently viewed
  recentlyViewedIds: string[];
  addToRecentlyViewed: (exerciseId: string) => void;

  // Custom exercises (user-created)
  customExercises: Exercise[];
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateCustomExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteCustomExercise: (id: string) => void;

  // Getters
  getAllExercises: () => Exercise[];
  getFilteredExercises: () => Exercise[];
  getFavoriteExercises: () => Exercise[];
  getRecentlyViewedExercises: () => Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
}

const initialFilters: ExerciseFilters = {
  muscleGroup: null,
  equipment: null,
  difficulty: null,
  searchQuery: '',
};

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: initialFilters,
      favoriteExerciseIds: [],
      recentlyViewedIds: [],
      customExercises: [],

      // Filter actions
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: initialFilters }),

      // Favorite actions
      toggleFavorite: (exerciseId) =>
        set((state) => ({
          favoriteExerciseIds: state.favoriteExerciseIds.includes(exerciseId)
            ? state.favoriteExerciseIds.filter((id) => id !== exerciseId)
            : [...state.favoriteExerciseIds, exerciseId],
        })),

      isFavorite: (exerciseId) => {
        return get().favoriteExerciseIds.includes(exerciseId);
      },

      // Recently viewed actions
      addToRecentlyViewed: (exerciseId) =>
        set((state) => {
          const filtered = state.recentlyViewedIds.filter((id) => id !== exerciseId);
          return {
            recentlyViewedIds: [exerciseId, ...filtered].slice(0, 10), // Keep last 10
          };
        }),

      // Custom exercise actions
      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [
            ...state.customExercises,
            {
              ...exercise,
              id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        })),

      updateCustomExercise: (id, updates) =>
        set((state) => ({
          customExercises: state.customExercises.map((ex) =>
            ex.id === id ? { ...ex, ...updates } : ex
          ),
        })),

      deleteCustomExercise: (id) =>
        set((state) => ({
          customExercises: state.customExercises.filter((ex) => ex.id !== id),
          favoriteExerciseIds: state.favoriteExerciseIds.filter((fid) => fid !== id),
          recentlyViewedIds: state.recentlyViewedIds.filter((rid) => rid !== id),
        })),

      // Getters
      getAllExercises: () => {
        const { customExercises } = get();
        return [...EXERCISES_DATABASE, ...customExercises];
      },

      getFilteredExercises: () => {
        const { filters, getAllExercises } = get();
        let exercises = getAllExercises();

        // Apply muscle group filter
        if (filters.muscleGroup) {
          exercises = exercises.filter(
            (ex) => ex.muscleGroup === filters.muscleGroup
          );
        }

        // Apply equipment filter
        if (filters.equipment) {
          exercises = exercises.filter((ex) => ex.equipment === filters.equipment);
        }

        // Apply difficulty filter
        if (filters.difficulty) {
          exercises = exercises.filter((ex) => ex.difficulty === filters.difficulty);
        }

        // Apply search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          exercises = exercises.filter(
            (ex) =>
              ex.name.toLowerCase().includes(query) ||
              ex.muscleGroup.toLowerCase().includes(query) ||
              ex.equipment.toLowerCase().includes(query) ||
              ex.type.toLowerCase().includes(query)
          );
        }

        return exercises;
      },

      getFavoriteExercises: () => {
        const { favoriteExerciseIds, getAllExercises } = get();
        const allExercises = getAllExercises();
        return favoriteExerciseIds
          .map((id) => allExercises.find((ex) => ex.id === id))
          .filter((ex): ex is Exercise => ex !== undefined);
      },

      getRecentlyViewedExercises: () => {
        const { recentlyViewedIds, getAllExercises } = get();
        const allExercises = getAllExercises();
        return recentlyViewedIds
          .map((id) => allExercises.find((ex) => ex.id === id))
          .filter((ex): ex is Exercise => ex !== undefined);
      },

      getExerciseById: (id) => {
        return get().getAllExercises().find((ex) => ex.id === id);
      },
    }),
    {
      name: 'exercise-store',
      partialize: (state) => ({
        favoriteExerciseIds: state.favoriteExerciseIds,
        recentlyViewedIds: state.recentlyViewedIds,
        customExercises: state.customExercises,
      }),
    }
  )
);

