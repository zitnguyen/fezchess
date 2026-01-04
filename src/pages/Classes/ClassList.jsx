import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classService from '../../services/classService';

const ClassList = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const data = await classService.getAll();
            const classList = Array.isArray(data) ? data : (data.classes || []);
            setClasses(classList);
        } catch (err) {
            console.error("Failed to fetch classes", err);
            setError("Có lỗi xảy ra khi tải danh sách lớp học.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await classService.delete(id);
            setClasses(classes.filter(c => c._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete class", err);
            setError("Lỗi khi xóa lớp học");
        }
    };

    const handleEdit = (id) => {
        navigate(`/classes/${id}/edit`);
    };

    const handleAdd = () => {
        navigate('/classes/new');
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'Active': return '● Đang diễn ra';
            case 'Pending': return '● Sắp khai giảng';
            case 'Finished': return '● Đã kết thúc';
            default: return status;
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Active': return 'studying';
            case 'Pending': return 'paused';
            case 'Finished': return 'paused'; // or a different style for finished
            default: return '';
        }
    };

    const getProgressColor = (current, max) => {
        if (!max) return '#10B981';
        const percentage = (current / max) * 100;
        if (percentage >= 100) return '#EF4444'; 
        if (percentage >= 80) return '#F59E0B'; 
        return '#10B981'; 
    };

    const filteredClasses = classes.filter(cls => 
        cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacherId?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
            <h1>Quản lý Lớp học</h1>
            <p className="page-subtitle">Danh sách các lớp học hiện tại, lịch dạy và thông tin giáo viên.</p>
        </div>
        <button className="btn-primary" onClick={handleAdd} style={{display: 'inline-flex', gap: '8px'}}>
            <Plus size={18} />
            <span>Thêm lớp học</span>
        </button>
      </div>

      <div className="control-bar">
        <div className="search-box">
             <Search size={18} className="search-icon"/>
             <input 
                type="text" 
                placeholder="Tìm kiếm tên lớp, giáo viên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
      </div>

        <div className="table-container">
             {loading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
            ) : error ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#EF4444' }}>{error}</div>
            ) : filteredClasses.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Chưa có lớp học nào.</div>
            ) : (
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{width: '40px'}}><input type="checkbox" /></th>
                        <th>Tên Lớp & Khóa</th>
                        <th>Giáo Viên</th>
                        <th>Lịch Học</th>
                        <th>Sĩ Số</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClasses.map(cls => (
                        <tr key={cls._id || cls.id}>
                            <td><input type="checkbox" /></td>
                            <td>
                                <div>
                                    <div style={{fontWeight: '600', color: '#111827'}}>{cls.className}</div>
                                    <div style={{fontSize: '12px', color: '#6B7280'}}>
                                        #{cls.courseId?.courseName || '---'} | ID: {cls.classId}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <div style={{width: '28px', height: '28px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#4338CA', fontWeight: 'bold'}}>
                                        {(cls.teacherId?.username || 'T').charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>{cls.teacherId?.username || 'Chưa phân công'}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{fontSize: '13px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'}}>
                                         <Calendar size={14} color="#6B7280"/>
                                         <span style={{fontWeight: '500', color: '#374151'}}>
                                            {cls.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : '---'}
                                         </span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280'}}>
                                         <Clock size={14}/>
                                         <span>{cls.schedule || 'Chưa có lịch'}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{width: '120px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px'}}>
                                        <span style={{fontWeight: '600', color: '#374151'}}>{cls.currentStudents || 0} <span style={{fontWeight: '400', color: '#9CA3AF'}}>/ {cls.courseId?.maxStudents || 20}</span></span>
                                        <Users size={14} color="#9CA3AF"/>
                                    </div>
                                    <div style={{width: '100%', height: '6px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden'}}>
                                        <div style={{
                                            width: `${Math.min(((cls.currentStudents || 0) / (cls.courseId?.maxStudents || 20)) * 100, 100)}%`,
                                            height: '100%',
                                            background: getProgressColor(cls.currentStudents || 0, cls.courseId?.maxStudents || 20),
                                            borderRadius: '4px'
                                        }}></div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className={`status-badge ${getStatusStyle(cls.status)}`}>
                                    {getStatusLabel(cls.status)}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                    <button 
                                        onClick={() => handleEdit(cls._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                    >
                                        <Edit size={16} color="#4B5563"/>
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirm(cls._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                    >
                                        <Trash2 size={16} color="#EF4444"/>
                                    </button>
                                    {deleteConfirm === cls._id && (
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
                                                    onClick={() => handleDelete(cls._id)}
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
             {!loading && !error && filteredClasses.length > 0 && (
                 <div className="pagination">
                    <div style={{fontSize: '14px', color: '#6B7280'}}>
                        Hiển thị <strong>{filteredClasses.length}</strong> lớp
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ClassList;
