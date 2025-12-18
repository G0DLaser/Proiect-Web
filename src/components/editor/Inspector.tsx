import { useEditorStore } from '@/stores/editorStore';
import { Move, RotateCw, Maximize, Palette } from 'lucide-react';

const Inspector = () => {
  const { objects, selectedId, updateObject } = useEditorStore();
  const selectedObject = objects.find((obj) => obj.id === selectedId);

  const handlePositionChange = (axis: number, value: string) => {
    if (!selectedObject) return;
    const newPosition = [...selectedObject.position] as [number, number, number];
    newPosition[axis] = parseFloat(value) || 0;
    updateObject(selectedObject.id, { position: newPosition });
  };

  const handleRotationChange = (axis: number, value: string) => {
    if (!selectedObject) return;
    const newRotation = [...selectedObject.rotation] as [number, number, number];
    newRotation[axis] = parseFloat(value) || 0;
    updateObject(selectedObject.id, { rotation: newRotation });
  };

  const handleScaleChange = (axis: number, value: string) => {
    if (!selectedObject) return;
    const newScale = [...selectedObject.scale] as [number, number, number];
    newScale[axis] = parseFloat(value) || 0;
    updateObject(selectedObject.id, { scale: newScale });
  };

  const handleColorChange = (color: string) => {
    if (!selectedObject) return;
    updateObject(selectedObject.id, { color });
  };

  return (
    <div className="h-full bg-panel border-l border-panel-border flex flex-col">
      <div className="h-8 bg-panel-header border-b border-panel-border flex items-center px-3">
        <span className="text-xs font-medium text-foreground">Inspector</span>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        {!selectedObject ? (
          <div className="text-muted-foreground text-xs text-center py-4">
            No object selected
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-panel-header rounded-sm p-3 border border-panel-border">
              <div className="text-sm font-medium text-foreground mb-1">
                {selectedObject.name}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                Type: {selectedObject.type}
              </div>
            </div>

            {/* Transform Section */}
            <div className="bg-panel-header rounded-sm border border-panel-border">
              <div className="px-3 py-2 border-b border-panel-border flex items-center gap-2">
                <Move size={14} className="text-accent" />
                <span className="text-xs font-medium text-foreground">Transform</span>
              </div>
              
              <div className="p-3 space-y-3">
                {/* Position */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Position</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${
                          i === 0 ? 'text-red-400' : i === 1 ? 'text-green-400' : 'text-blue-400'
                        }`}>{axis}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedObject.position[i].toFixed(2)}
                          onChange={(e) => handlePositionChange(i, e.target.value)}
                          className="unity-input w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <RotateCw size={12} />
                    Rotation
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${
                          i === 0 ? 'text-red-400' : i === 1 ? 'text-green-400' : 'text-blue-400'
                        }`}>{axis}</span>
                        <input
                          type="number"
                          step="1"
                          value={(selectedObject.rotation[i] * (180 / Math.PI)).toFixed(0)}
                          onChange={(e) => handleRotationChange(i, String(parseFloat(e.target.value) * (Math.PI / 180)))}
                          className="unity-input w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Maximize size={12} />
                    Scale
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${
                          i === 0 ? 'text-red-400' : i === 1 ? 'text-green-400' : 'text-blue-400'
                        }`}>{axis}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedObject.scale[i].toFixed(2)}
                          onChange={(e) => handleScaleChange(i, e.target.value)}
                          className="unity-input w-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Material Section */}
            <div className="bg-panel-header rounded-sm border border-panel-border">
              <div className="px-3 py-2 border-b border-panel-border flex items-center gap-2">
                <Palette size={14} className="text-accent" />
                <span className="text-xs font-medium text-foreground">Material</span>
              </div>
              
              <div className="p-3">
                <div className="text-xs text-muted-foreground mb-1.5">Color</div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-panel-border bg-transparent"
                  />
                  <input
                    type="text"
                    value={selectedObject.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="unity-input flex-1 uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspector;
