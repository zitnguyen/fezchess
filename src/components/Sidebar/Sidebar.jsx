import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Calendar, Wallet, ClipboardCheck, LogOut, UserPlus, CalendarRange } from 'lucide-react';
import authService from '../../services/authService';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">♟️</div>
        <div>
           <div className="logo-title">Z CHESS</div>
           <div className="logo-subtitle">{user?.fullName || "Admin Dashboard"}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Học viên</span>
        </NavLink>
        <NavLink to="/classes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardCheck size={20} />
          <span>Lớp học</span>
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarRange size={20} />
          <span>Lịch học</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Khóa học</span>
        </NavLink>
        <NavLink to="/teachers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span style={{fontWeight: 'bold', fontSize: '18px', width: '20px', display:'flex', justifyContent:'center'}}>T</span>
          <span>Giáo viên</span>
        </NavLink>
        <NavLink to="/enrollments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Ghi danh">
          <UserPlus size={20} />
          <span>Ghi danh</span>
        </NavLink>
        <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={20} />
          <span>Tài chính</span>
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Điểm danh</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout" style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: 'flex-start'}}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;
