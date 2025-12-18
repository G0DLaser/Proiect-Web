import { useEffect } from 'react';
import Toolbar from '@/components/editor/Toolbar';
import Hierarchy from '@/components/editor/Hierarchy';
import SceneView from '@/components/editor/SceneView';
import Inspector from '@/components/editor/Inspector';
import AuthPage from '@/components/AuthPage';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { session, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Toolbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Hierarchy (20%) */}
        <div className="w-[20%] min-w-[200px]">
          <Hierarchy />
        </div>
        
        {/* Center Panel - Scene View (60%) */}
        <div className="flex-1">
          <SceneView />
        </div>
        
        {/* Right Panel - Inspector (20%) */}
        <div className="w-[20%] min-w-[250px]">
          <Inspector />
        </div>
      </div>
    </div>
  );
};

export default Index;
