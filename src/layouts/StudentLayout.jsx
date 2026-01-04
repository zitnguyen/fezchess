import React from 'react';
import StudentSidebar from '../components/Sidebar/StudentSidebar';
import TopBar from '../components/Header/TopBar'; // Reusing TopBar for now, or create a specific one if needed

const StudentLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <StudentSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
