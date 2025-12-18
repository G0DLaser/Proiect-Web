import { useState, useEffect } from 'react';
import { Box, Circle, Square, Trash2, Cylinder, Triangle, CircleDot, Pill, Undo2, Redo2, Copy, Save, FolderOpen, LogOut, Plus, Cloud, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Toolbar = () => {
  const { 
    addObject, clearScene, transformMode, setTransformMode,
    selectedId, duplicateObject, undo, redo, canUndo, canRedo,
    saveSceneToDb, loadSceneFromDb, loadUserScenes, createNewScene, deleteScene,
    currentSceneName, setSceneName, isSaving, currentSceneId
  } = useEditorStore();
  
  const { signOut, user } = useAuthStore();
  const [scenesOpen, setScenesOpen] = useState(false);
  const [scenes, setScenes] = useState<{ id: string; name: string; updated_at: string }[]>([]);
  const [newSceneName, setNewSceneName] = useState('');
  const [loadingScenes, setLoadingScenes] = useState(false);

  const fetchScenes = async () => {
    setLoadingScenes(true);
    const data = await loadUserScenes();
    setScenes(data);
    setLoadingScenes(false);
  };

  useEffect(() => {
    if (scenesOpen) {
      fetchScenes();
    }
  }, [scenesOpen]);

  const handleCreateScene = async () => {
    if (!newSceneName.trim()) return;
    await createNewScene(newSceneName.trim());
    setNewSceneName('');
    setScenesOpen(false);
  };

  const handleLoadScene = async (sceneId: string) => {
    await loadSceneFromDb(sceneId);
    setScenesOpen(false);
  };

  const handleDeleteScene = async (sceneId: string) => {
    await deleteScene(sceneId);
    fetchScenes();
  };

  return (
    <div className="h-[50px] bg-panel-header border-b border-panel-border flex items-center px-4 gap-3">
      <h1 className="text-foreground font-semibold text-lg mr-4">WebEditor Pro</h1>
      
      <div className="h-6 w-px bg-panel-border" />
      
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </button>
      </div>
      
      <div className="h-6 w-px bg-panel-border" />
      
      {/* Scene Name & Save */}
      <div className="flex items-center gap-2">
        <Input
          value={currentSceneName}
          onChange={(e) => setSceneName(e.target.value)}
          className="h-7 w-32 text-xs bg-muted border-panel-border"
          placeholder="Scene name"
        />
        <button
          onClick={saveSceneToDb}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent hover:bg-accent/80 rounded-sm text-xs text-accent-foreground transition-colors disabled:opacity-50"
          title="Save to Cloud (Ctrl+S)"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} />}
          Save
        </button>
        <Dialog open={scenesOpen} onOpenChange={setScenesOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
              title="My Scenes"
            >
              <FolderOpen size={14} />
              Scenes
            </button>
          </DialogTrigger>
          <DialogContent className="bg-panel-header border-panel-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">My Scenes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="New scene name..."
                  className="bg-muted border-panel-border"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateScene()}
                />
                <Button onClick={handleCreateScene} size="sm" className="shrink-0">
                  <Plus size={14} className="mr-1" />
                  New
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {loadingScenes ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : scenes.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No saved scenes yet</p>
                ) : (
                  scenes.map((scene) => (
                    <div
                      key={scene.id}
                      className={`flex items-center justify-between p-2 rounded-sm hover:bg-muted ${currentSceneId === scene.id ? 'bg-accent/20' : ''}`}
                    >
                      <button
                        onClick={() => handleLoadScene(scene.id)}
                        className="flex-1 text-left text-sm text-foreground"
                      >
                        {scene.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(scene.updated_at).toLocaleDateString()}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="p-1 text-destructive hover:bg-destructive/20 rounded-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="h-6 w-px bg-panel-border" />
      
      {/* Primitives */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => addObject('cube')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Cube"
        >
          <Box size={14} />
        </button>
        <button
          onClick={() => addObject('sphere')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Sphere"
        >
          <Circle size={14} />
        </button>
        <button
          onClick={() => addObject('plane')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Plane"
        >
          <Square size={14} />
        </button>
        <button
          onClick={() => addObject('cylinder')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Cylinder"
        >
          <Cylinder size={14} />
        </button>
        <button
          onClick={() => addObject('cone')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Cone"
        >
          <Triangle size={14} />
        </button>
        <button
          onClick={() => addObject('torus')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Torus"
        >
          <CircleDot size={14} />
        </button>
        <button
          onClick={() => addObject('capsule')}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors"
          title="Add Capsule"
        >
          <Pill size={14} />
        </button>
      </div>
      
      <div className="h-6 w-px bg-panel-border" />
      
      {/* Duplicate & Clear */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => selectedId && duplicateObject(selectedId)}
          disabled={!selectedId}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted hover:bg-muted/80 rounded-sm text-xs text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Duplicate (Ctrl+D)"
        >
          <Copy size={14} />
          Duplicate
        </button>
        <button
          onClick={clearScene}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-destructive/20 hover:bg-destructive/30 rounded-sm text-xs text-destructive transition-colors"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>
      
      <div className="h-6 w-px bg-panel-border" />
      
      {/* Transform Mode */}
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-xs mr-1">Transform:</span>
        {(['translate', 'rotate', 'scale'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setTransformMode(mode)}
            className={`px-2 py-1 rounded-sm text-xs uppercase transition-colors ${
              transformMode === mode
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            {mode === 'translate' ? 'W' : mode === 'rotate' ? 'E' : 'R'}
          </button>
        ))}
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* User & Logout */}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-xs truncate max-w-[150px]">
          {user?.email}
        </span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-600 hover:bg-zinc-500 rounded-sm text-xs text-zinc-100 transition-colors"
          title="Log Out"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
