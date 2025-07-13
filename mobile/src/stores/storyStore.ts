import { create } from 'zustand';
import { FailureStory } from '../types';

interface StoryState {
  stories: FailureStory[];
  isLoading: boolean;
  selectedStory: FailureStory | null;
  setStories: (stories: FailureStory[]) => void;
  addStory: (story: FailureStory) => void;
  setSelectedStory: (story: FailureStory | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  isLoading: false,
  selectedStory: null,
  setStories: (stories) => set({ stories }),
  addStory: (story) => set((state) => ({ stories: [story, ...state.stories] })),
  setSelectedStory: (selectedStory) => set({ selectedStory }),
  setLoading: (isLoading) => set({ isLoading }),
})); 