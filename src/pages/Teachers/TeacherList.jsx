import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, RotateCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import teacherService from '../../services/teacherService';


const TeacherList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch teachers when component mounts or when returning to this page
    useEffect(() => {
        fetchTeachers();
    }, [location.pathname]);

    // Apply filters whenever search or filter values change
    useEffect(() => {
        applyFilters();
    }, [teachers, searchTerm, filterRole, filterStatus]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const data = await teacherService.getAll({ role: 'Teacher' });
            const userList = Array.isArray(data) ? data : (data.users || []);
            console.log('Fetched all teachers:', userList);
            setTeachers(userList);
        } catch (err) {
            console.error("Failed to fetch teachers", err);
            setError("Có lỗi xảy ra khi tải danh sách giáo viên.");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = teachers.filter(teacher => {
            const matchSearch = searchTerm === '' || 
                (teacher.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (teacher.phone?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchRole = filterRole === 'all' || teacher.role === filterRole;
            
            return matchSearch && matchRole;
        });

        setFilteredTeachers(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (teacherId) => {
        try {
            await teacherService.delete(teacherId);
            setTeachers(teachers.filter(t => t._id !== teacherId));
            setDeleteConfirm(null);
            console.log('Xóa giáo viên thành công');
        } catch (err) {
            console.error('Error deleting teacher:', err);
            setError('Lỗi khi xóa giáo viên');
        }
    };

    const handleEdit = (teacherId) => {
        navigate(`/teachers/${teacherId}/edit`);
    };

    const handleAdd = () => {
        navigate('/teachers/new');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchTeachers();
        setIsRefreshing(false);
    };

    const handleExportExcel = async () => {
        try {
            const csvContent = generateCSV(filteredTeachers);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error exporting data:', err);
            setError('Lỗi khi xuất dữ liệu');
        }
    };

    const generateCSV = (data) => {
        const headers = ['Username', 'Email', 'Điện thoại', 'Chuyên môn', 'Năm kinh nghiệm', 'Chứng chỉ', 'Vai trò'];
        const rows = data.map(teacher => [
            teacher.username || 'N/A',
            teacher.email || 'N/A',
            teacher.phone || 'N/A',
            teacher.specialization || 'N/A',
            teacher.experienceYears || 'N/A',
            teacher.certification || 'N/A',
            teacher.role === 'Teacher' ? 'Giáo viên' : 'Quản trị viên'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  return (
    <div className="page-container">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="page-header">
        <div>
            <h1>Danh Sách Giáo Viên</h1>
            <p className="page-subtitle">Quản lý thông tin, chuyên môn và lịch giảng dạy của đội ngũ giáo viên.</p>
        </div>
        <div>
            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-icon-outline" 
                style={{display: 'inline-flex', marginRight: '12px', width: 'auto', padding: '0 12px', gap: '8px'}}
                title="Cập nhật dữ liệu"
            >
                <RotateCw size={18} style={{animation: isRefreshing ? 'spin 1s linear infinite' : 'none'}} />
                <span>Cập nhật</span>
            </button>
            <button 
                onClick={handleExportExcel}
                className="btn-icon-outline" 
                style={{display: 'inline-flex', marginRight: '12px', width: 'auto', padding: '0 12px', gap: '8px'}}
            >
                <Download size={18} />
                <span>Xuất Excel</span>
            </button>
            <button 
                onClick={handleAdd}
                className="btn-primary" 
                style={{display: 'inline-flex'}}
            >
                <Plus size={18} />
                <span>Thêm Giáo Viên</span>
            </button>
        </div>
      </div>

      <div className="control-bar">
        <div className="search-box">
             <Search size={18} className="search-icon"/>
             <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, mã số, số điện thoại..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
        

      </div>

      {error && (
        <div style={{
            padding: '12px 16px', 
            background: '#FEE2E2', 
            color: '#DC2626', 
            borderRadius: '6px',
            marginBottom: '16px'
        }}>
            {error}
        </div>
      )}

        <div className="table-container">
             {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
            ) : filteredTeachers.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                    {teachers.length === 0 ? 'Chưa có giáo viên nào.' : 'Không tìm thấy giáo viên phù hợp.'}
                </div>
            ) : (
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{width: '40px'}}><input type="checkbox" /></th>
                        <th>Giáo Viên</th>
                        <th>Chuyên Môn</th>
                        <th>Lớp Đang Dạy</th>
                        <th>Liên Hệ</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((teacher, index) => (
                        <tr key={teacher._id || teacher.id}>
                            <td><input type="checkbox" /></td>
                            <td>
                                <div className="teacher-info-cell">
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: '#E0E7FF', color: '#4338CA',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '16px', marginRight: '12px'
                                    }}>
                                        {(teacher.fullName || teacher.username || 'T').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="teacher-name">{teacher.fullName || teacher.username}</div>
                                        <div className="teacher-id">ID: {teacher._id?.substring(0,6) || index + 1}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className={`specialty-badge ${teacher.role === 'Admin' ? 'master' : 'coach'}`}>
                                    <span className="sc-icon">{teacher.role === 'Admin' ? '✪' : '🎓'}</span>
                                    <div>
                                         <div className="role-text">{teacher.specialization || 'Giáo viên'}</div>
                                         <div className="elo-text">{teacher.experienceYears ? `${teacher.experienceYears} năm kinh nghiệm` : 'Mới'}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="class-count">
                                    <span className="count-number">{teacher.assignedClasses?.length || 0}</span>
                                    <span className="count-label">lớp</span>
                                </div>
                            </td>
                            <td>
                                <div className="contact-info">
                                    <div className="contact-row">
                                        <span className="c-icon">📞</span> {teacher.phone || '---'}
                                    </div>
                                    <div className="contact-row">
                                        <span className="c-icon">✉️</span> {teacher.email || '---'}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${teacher.role === 'Teacher' ? 'active' : 'leave'}`}>
                                    {teacher.role === 'Teacher' ? '● Giáo viên' : '● Quản trị viên'}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                    <button 
                                        onClick={() => handleEdit(teacher._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={16} color="#4B5563"/>
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirm(teacher._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                        title="Xóa"
                                    >
                                        <Trash2 size={16} color="#EF4444"/>
                                    </button>
                                    {deleteConfirm === teacher._id && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '40px',
                                            right: '0',
                                            background: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <div style={{fontSize: '12px', color: '#374151', marginBottom: '6px'}}>Xác nhận xóa?</div>
                                            <div style={{display: 'flex', gap: '4px'}}>
                                                <button 
                                                    onClick={() => handleDelete(teacher._id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#EF4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteConfirm(null)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#F3F4F6',
                                                        color: '#374151',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
            
            {!loading && filteredTeachers.length > 0 && (
                 <div className="pagination">
                    <div style={{fontSize: '14px', color: '#6B7280'}}>
                        Hiển thị <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTeachers.length)}</strong> trong <strong>{filteredTeachers.length}</strong> giáo viên
                    </div>
                    <div className="pagination-controls">
                        <button 
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                            Trước
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i + 1}
                                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button 
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>

      <div className="stats-row">
        <div className="stat-card">
            <div className="stat-content">
                 <div className="stat-label">Tổng số giáo viên</div>
                 <div className="stat-value">{teachers.length}</div>
                 <div className="stat-trend positive">↗ +2 trong tháng này</div>
            </div>
            <div className="stat-icon bg-blue">👥</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherList;
