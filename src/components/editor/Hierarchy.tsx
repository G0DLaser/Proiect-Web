import { Box, Circle, Square, ChevronRight, Cylinder, Triangle, CircleDot, Pill } from 'lucide-react';
import { useEditorStore, SceneObject } from '@/stores/editorStore';

const getIcon = (type: SceneObject['type']) => {
  switch (type) {
    case 'cube': return Box;
    case 'sphere': return Circle;
    case 'plane': return Square;
    case 'cylinder': return Cylinder;
    case 'cone': return Triangle;
    case 'torus': return CircleDot;
    case 'capsule': return Pill;
  }
};

const Hierarchy = () => {
  const { objects, selectedId, selectObject } = useEditorStore();

  return (
    <div className="h-full bg-panel border-r border-panel-border flex flex-col">
      <div className="h-8 bg-panel-header border-b border-panel-border flex items-center px-3">
        <span className="text-xs font-medium text-foreground">Hierarchy</span>
      </div>
      
      <div className="flex-1 overflow-auto p-1">
        {objects.length === 0 ? (
          <div className="text-muted-foreground text-xs text-center py-4">
            No objects in scene
          </div>
        ) : (
          objects.map((obj) => {
            const Icon = getIcon(obj.type);
            const isSelected = selectedId === obj.id;
            
            return (
              <button
                key={obj.id}
                onClick={() => selectObject(obj.id)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-selection text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <ChevronRight size={12} className="text-muted-foreground" />
                <Icon size={14} />
                <span className="truncate">{obj.name}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Hierarchy;
