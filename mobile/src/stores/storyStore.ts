import { create } from 'zustand';
import { FailureStory } from '../types';

interface StoryState {
  stories: FailureStory[];
  isLoading: boolean;
  selectedStory: FailureStory | null;
  setStories: (stories: FailureStory[]) => void;
  addStory: (story: FailureStory) => void;
  removeStory: (storyId: string) => void;
  updateStory: (storyId: string, updatedStory: Partial<FailureStory>) => void;
  setSelectedStory: (story: FailureStory | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  isLoading: false,
  selectedStory: null,
  setStories: (stories) => set({ stories }),
  addStory: (story) => set((state) => ({ stories: [story, ...state.stories] })),
  removeStory: (storyId) => set((state) => ({ 
    stories: state.stories.filter(story => story.id !== storyId) 
  })),
  updateStory: (storyId, updatedStory) => set((state) => ({
    stories: state.stories.map(story => 
      story.id === storyId ? { ...story, ...updatedStory } : story
    )
  })),
  setSelectedStory: (selectedStory) => set({ selectedStory }),
  setLoading: (isLoading) => set({ isLoading }),
})); 