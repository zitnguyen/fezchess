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
            padding: '12px 16px', 
            background: 'white', 
            borderBottom: '1px solid #E5E7EB',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }} className="mobile-header">
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '8px', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#374151'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ fontSize: '20px' }}>♟️</span>
                    <span style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>Z CHESS</span>
                </div>
            </div>
            {/* Optional: Add user avatar or notification icon here for mobile */}
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
