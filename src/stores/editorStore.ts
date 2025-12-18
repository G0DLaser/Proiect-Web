import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SceneObject {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'plane' | 'cylinder' | 'cone' | 'torus' | 'capsule';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';

interface EditorState {
  objects: SceneObject[];
  selectedId: string | null;
  transformMode: TransformMode;
  history: SceneObject[][];
  historyIndex: number;
  currentSceneId: string | null;
  currentSceneName: string;
  isSaving: boolean;
  isLoading: boolean;
  
  addObject: (type: SceneObject['type']) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  clearScene: () => void;
  setTransformMode: (mode: TransformMode) => void;
  duplicateObject: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveSceneToFile: () => void;
  loadSceneFromFile: () => void;
  saveSceneToDb: () => Promise<void>;
  loadSceneFromDb: (sceneId: string) => Promise<void>;
  loadUserScenes: () => Promise<{ id: string; name: string; updated_at: string }[]>;
  createNewScene: (name: string) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  setSceneName: (name: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

let objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };

const pushHistory = (state: EditorState, newObjects: SceneObject[]) => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newObjects)));
  return {
    history: newHistory.slice(-50),
    historyIndex: Math.min(newHistory.length - 1, 49),
  };
};

export const useEditorStore = create<EditorState>((set, get) => ({
  objects: [],
  selectedId: null,
  transformMode: 'translate',
  history: [[]],
  historyIndex: 0,
  currentSceneId: null,
  currentSceneName: 'Untitled Scene',
  isSaving: false,
  isLoading: false,

  addObject: (type) => {
    objectCounter[type]++;
    const newObject: SceneObject = {
      id: `${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${objectCounter[type]}`,
      type,
      position: type === 'plane' ? [0, -0.5, 0] : [0, 0, 0],
      rotation: [0, 0, 0],
      scale: type === 'plane' ? [10, 10, 1] : [1, 1, 1],
      color: '#808080',
    };
    set((state) => {
      const newObjects = [...state.objects, newObject];
      return { 
        objects: newObjects,
        ...pushHistory(state, newObjects),
      };
    });
  },

  removeObject: (id) => {
    set((state) => {
      const newObjects = state.objects.filter((obj) => obj.id !== id);
      return {
        objects: newObjects,
        selectedId: state.selectedId === id ? null : state.selectedId,
        ...pushHistory(state, newObjects),
      };
    });
  },

  selectObject: (id) => {
    set({ selectedId: id });
  },

  updateObject: (id, updates) => {
    set((state) => {
      const newObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      );
      return {
        objects: newObjects,
        ...pushHistory(state, newObjects),
      };
    });
  },

  clearScene: () => {
    objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };
    set((state) => ({
      objects: [],
      selectedId: null,
      currentSceneId: null,
      currentSceneName: 'Untitled Scene',
      ...pushHistory(state, []),
    }));
  },

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  duplicateObject: (id) => {
    const state = get();
    const obj = state.objects.find((o) => o.id === id);
    if (!obj) return;
    
    objectCounter[obj.type]++;
    const newObject: SceneObject = {
      ...obj,
      id: `${obj.type}-${Date.now()}`,
      name: `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} ${objectCounter[obj.type]}`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2]] as [number, number, number],
    };
    
    set((state) => {
      const newObjects = [...state.objects, newObject];
      return {
        objects: newObjects,
        selectedId: newObject.id,
        ...pushHistory(state, newObjects),
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    
    const newIndex = state.historyIndex - 1;
    set({
      objects: JSON.parse(JSON.stringify(state.history[newIndex])),
      historyIndex: newIndex,
      selectedId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    
    const newIndex = state.historyIndex + 1;
    set({
      objects: JSON.parse(JSON.stringify(state.history[newIndex])),
      historyIndex: newIndex,
      selectedId: null,
    });
  },

  saveSceneToFile: () => {
    const state = get();
    const sceneData = JSON.stringify(state.objects, null, 2);
    const blob = new Blob([sceneData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.currentSceneName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadSceneFromFile: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const objects = JSON.parse(event.target?.result as string) as SceneObject[];
          objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };
          objects.forEach(obj => {
            const match = obj.name.match(/\d+$/);
            if (match) {
              const num = parseInt(match[0]);
              if (num > objectCounter[obj.type]) {
                objectCounter[obj.type] = num;
              }
            }
          });
          
          set((state) => ({
            objects,
            selectedId: null,
            currentSceneId: null,
            currentSceneName: file.name.replace('.json', ''),
            ...pushHistory(state, objects),
          }));
          toast.success('Scene loaded from file');
        } catch (err) {
          console.error('Failed to load scene:', err);
          toast.error('Failed to load scene file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  saveSceneToDb: async () => {
    const state = get();
    set({ isSaving: true });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save');
        return;
      }

      if (state.currentSceneId) {
        // Update existing scene
        const { error } = await supabase
          .from('scenes')
          .update({ 
            objects: JSON.parse(JSON.stringify(state.objects)),
            name: state.currentSceneName 
          })
          .eq('id', state.currentSceneId);

        if (error) throw error;
        toast.success('Scene saved');
      } else {
        // Create new scene
        const { data, error } = await supabase
          .from('scenes')
          .insert([{ 
            user_id: user.id,
            objects: JSON.parse(JSON.stringify(state.objects)),
            name: state.currentSceneName 
          }])
          .select()
          .single();

        if (error) throw error;
        set({ currentSceneId: data.id });
        toast.success('Scene created and saved');
      }
    } catch (error) {
      console.error('Failed to save scene:', error);
      toast.error('Failed to save scene');
    } finally {
      set({ isSaving: false });
    }
  },

  loadSceneFromDb: async (sceneId: string) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', sceneId)
        .single();

      if (error) throw error;

      const objects = (data.objects as unknown as SceneObject[]) || [];
      
      // Reset counters based on loaded objects
      objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };
      objects.forEach(obj => {
        const match = obj.name.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0]);
          if (num > objectCounter[obj.type]) {
            objectCounter[obj.type] = num;
          }
        }
      });

      set((state) => ({
        objects,
        selectedId: null,
        currentSceneId: data.id,
        currentSceneName: data.name,
        history: [objects],
        historyIndex: 0,
      }));
      toast.success('Scene loaded');
    } catch (error) {
      console.error('Failed to load scene:', error);
      toast.error('Failed to load scene');
    } finally {
      set({ isLoading: false });
    }
  },

  loadUserScenes: async () => {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('id, name, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load scenes:', error);
      toast.error('Failed to load scenes');
      return [];
    }
  },

  createNewScene: async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { data, error } = await supabase
        .from('scenes')
        .insert({ 
          user_id: user.id,
          objects: [],
          name 
        })
        .select()
        .single();

      if (error) throw error;

      objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };
      set({
        objects: [],
        selectedId: null,
        currentSceneId: data.id,
        currentSceneName: name,
        history: [[]],
        historyIndex: 0,
      });
      toast.success('New scene created');
    } catch (error) {
      console.error('Failed to create scene:', error);
      toast.error('Failed to create scene');
    }
  },

  deleteScene: async (sceneId: string) => {
    try {
      const { error } = await supabase
        .from('scenes')
        .delete()
        .eq('id', sceneId);

      if (error) throw error;

      const state = get();
      if (state.currentSceneId === sceneId) {
        objectCounter = { cube: 0, sphere: 0, plane: 0, cylinder: 0, cone: 0, torus: 0, capsule: 0 };
        set({
          objects: [],
          selectedId: null,
          currentSceneId: null,
          currentSceneName: 'Untitled Scene',
          history: [[]],
          historyIndex: 0,
        });
      }
      toast.success('Scene deleted');
    } catch (error) {
      console.error('Failed to delete scene:', error);
      toast.error('Failed to delete scene');
    }
  },

  setSceneName: (name: string) => {
    set({ currentSceneName: name });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
