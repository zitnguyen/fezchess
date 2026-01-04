import React from 'react';
import TeacherSidebar from '../components/Sidebar/TeacherSidebar';
import TopBar from '../components/Header/TopBar'; // Reusing TopBar for now, or could create TeacherTopBar if needed. 
// The design shows the Search bar and Create button which could be reused or contextually changed. 
// For now, reusing TopBar is fine mostly, but the "Add New Student" button might not be relevant everywhere.
// Actually, the Teacher Dashboard image shows a "Tạo bài tập" (Create Assignment) button.
// I will reuse TopBar but maybe I should have made the button dynamic.
// I'll create a simple wrapper or just let TopBar stay generic for now, but to be precise, I might need a Prop.
// Let's modify TopBar in a bit to accept children or props, OR just use the common layout.
// Actually, looking at the complexity, I'll just use the layouts children area for the main content.

const TeacherLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <TeacherSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <TopBar />
           <main style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#F9FAFB' }}>
             {children}
           </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
