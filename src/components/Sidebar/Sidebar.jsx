import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Calendar, Wallet, ClipboardCheck, LogOut, UserPlus, CalendarRange } from 'lucide-react';
import authService from '../../services/authService';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      ></div>
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">♟️</div>
          <div>
             <div className="logo-title">Z CHESS</div>
             <div className="logo-subtitle">{user?.fullName || "Admin Dashboard"}</div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              display: 'none', // Hidden on desktop via CSS if needed, or inline logic
              cursor: 'pointer'
            }}
            className="mobile-close-btn"
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose} // Close on mobile when clicked
          >
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </NavLink>
          <NavLink to="/students" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Users size={20} />
            <span>Học viên</span>
          </NavLink>
          <NavLink to="/parents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Users size={20} />
            <span>Phụ huynh</span>
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Calendar size={20} />
            <span>Điểm danh</span>
          </NavLink>
          <NavLink to="/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <CalendarRange size={20} />
            <span>Lịch học</span>
          </NavLink>
          <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Wallet size={20} />
            <span>Tài chính</span>
          </NavLink>
          <NavLink to="/teachers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <span style={{fontWeight: 'bold', fontSize: '18px', width: '20px', display:'flex', justifyContent:'center'}}>T</span>
            <span>Giáo viên</span>
          </NavLink>

        </nav>
        
        <div className="sidebar-footer">
            <button onClick={handleLogout} className="nav-item logout" style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: 'flex-start'}}>
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
