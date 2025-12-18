import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid } from '@react-three/drei';
import { useEditorStore, SceneObject } from '@/stores/editorStore';
import * as THREE from 'three';

interface SceneObjectMeshProps {
  object: SceneObject;
  isSelected: boolean;
  onSelect: () => void;
}

const SceneObjectMesh = ({ object, isSelected, onSelect }: SceneObjectMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { transformMode, updateObject } = useEditorStore();

  const handleTransformChange = () => {
    if (!meshRef.current) return;
    updateObject(object.id, {
      position: meshRef.current.position.toArray() as [number, number, number],
      rotation: meshRef.current.rotation.toArray().slice(0, 3) as [number, number, number],
      scale: meshRef.current.scale.toArray() as [number, number, number],
    });
  };

  const geometry = () => {
    switch (object.type) {
      case 'cube': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'plane': return <planeGeometry args={[1, 1]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'torus': return <torusGeometry args={[0.4, 0.15, 16, 48]} />;
      case 'capsule': return <capsuleGeometry args={[0.3, 0.5, 8, 16]} />;
    }
  };

  return (
    <>
      <mesh
        ref={meshRef}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {geometry()}
        <meshStandardMaterial 
          color={isSelected ? '#5a9fd4' : object.color} 
          side={object.type === 'plane' ? THREE.DoubleSide : THREE.FrontSide}
        />
      </mesh>
      
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={handleTransformChange}
        />
      )}
    </>
  );
};

const KeyboardHandler = () => {
  const { setTransformMode, selectedId, selectObject, removeObject, duplicateObject, undo, redo, saveSceneToDb } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      // Handle Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            if (selectedId) duplicateObject(selectedId);
            break;
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            saveSceneToDb();
            break;
        }
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'w': setTransformMode('translate'); break;
        case 'e': setTransformMode('rotate'); break;
        case 'r': setTransformMode('scale'); break;
        case 'escape': selectObject(null); break;
        case 'delete':
        case 'backspace':
          if (selectedId) {
            removeObject(selectedId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTransformMode, selectedId, selectObject, removeObject, duplicateObject, undo, redo, saveSceneToDb]);

  return null;
};

const Scene = () => {
  const { objects, selectedId, selectObject } = useEditorStore();
  const { gl } = useThree();

  useEffect(() => {
    const handleClick = () => {
      // Deselect on canvas click (not on object)
    };
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#505050"
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.5, 0]}
        infiniteGrid
      />
      
      {objects.map((obj) => (
        <SceneObjectMesh
          key={obj.id}
          object={obj}
          isSelected={selectedId === obj.id}
          onSelect={() => selectObject(obj.id)}
        />
      ))}
      
      <OrbitControls makeDefault />
    </>
  );
};

const SceneView = () => {
  const { selectObject } = useEditorStore();

  return (
    <div 
      className="h-full w-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]"
      onClick={() => selectObject(null)}
    >
      <div className="h-8 bg-panel-header border-b border-panel-border flex items-center px-3">
        <span className="text-xs font-medium text-foreground">Scene View</span>
      </div>
      
      <div className="h-[calc(100%-32px)]">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          onClick={(e) => e.stopPropagation()}
        >
          <KeyboardHandler />
          <Scene />
        </Canvas>
      </div>
    </div>
  );
};

export default SceneView;
