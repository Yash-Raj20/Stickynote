import Navbar from '@/components/board/Navbar';
import SearchModal from '@/components/board/SearchModal';
import Sidebar from '@/components/board/Sidebar';
import ProfileModal from '@/components/board/ProfileModal';
import SettingsModal from '@/components/board/SettingsModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden premium-canvas-bg">
          {children}
        </main>
      </div>
      
      {/* Global Modals rendered at root to guarantee they overlay everything */}
      <SearchModal />
      <ProfileModal />
      <SettingsModal />
    </div>
  );
}
