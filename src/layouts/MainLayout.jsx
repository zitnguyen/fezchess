import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import TopBar from '../components/Header/TopBar';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Mobile Header Trigger */}
        <div style={{ 
            display: 'none', // Hidden on desktop
            padding: '16px', 
            background: 'white', 
            borderBottom: '1px solid #E5E7EB',
            alignItems: 'center',
            gap: '12px'
        }} className="mobile-header">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Z CHESS</span>
        </div>

        <TopBar />
        <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
            .mobile-header { display: flex !important; }
            /* Hide Desktop Sidebar placeholder if any? Actually Sidebar handles its own hiding via CSS transform. 
               But we might want to ensure 'flex: 1' works when sidebar is fixed. 
               MainLayout flex container expects Sidebar to take space. 
               On mobile, Sidebar is fixed, so it takes 0 flow space. This is fine.
            */
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
