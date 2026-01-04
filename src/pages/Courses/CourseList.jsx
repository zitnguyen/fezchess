import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';

const CourseList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [courses, searchTerm]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await courseService.getAll();
            setCourses(data);
        } catch (err) {
            console.error("Failed to fetch courses", err);
            setError("Có lỗi xảy ra khi tải danh sách khóa học.");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = courses.filter(course => 
            course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.level?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
    };

    const handleDelete = async (id) => {
        try {
            await courseService.delete(id);
            setCourses(courses.filter(c => c._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting course:', err);
            setError('Lỗi khi xóa khóa học');
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchCourses();
        setIsRefreshing(false);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

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
                    <h1>Danh Sách Khóa Học</h1>
                    <p className="page-subtitle">Quản lý các chương trình đào tạo và khóa học.</p>
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
                        onClick={() => navigate('/courses/new')}
                        className="btn-primary" 
                        style={{display: 'inline-flex'}}
                    >
                        <Plus size={18} />
                        <span>Thêm Khóa Học</span>
                    </button>
                </div>
            </div>

            <div className="control-bar">
                <div className="search-box">
                     <Search size={18} className="search-icon"/>
                     <input 
                        type="text" 
                        placeholder="Tìm kiếm khóa học..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="table-container">
                 {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
                ) : filteredCourses.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Chưa có khóa học nào.</div>
                ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tên Khóa Học</th>
                            <th>Cấp Độ</th>
                            <th>Thời Lượng</th>
                            <th>Học Phí</th>
                            <th>Sĩ Số Tối Đa</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course) => (
                            <tr key={course._id}>
                                <td style={{fontWeight: '500'}}>{course.courseName}</td>
                                <td>
                                    <span className={`status-badge ${course.level === 'Advanced' ? 'master' : course.level === 'Inter' ? 'coach' : 'active'}`}>
                                        {course.level}
                                    </span>
                                </td>
                                <td>{course.durationWeeks} tuần</td>
                                <td style={{fontFamily: 'monospace', fontWeight: 'bold'}}>{formatCurrency(course.fee)}</td>
                                <td>{course.maxStudents} học viên</td>
                                <td>
                                    <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                        <button 
                                            onClick={() => navigate(`/courses/${course._id}/edit`)}
                                            className="btn-icon-outline" 
                                            style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={16} color="#4B5563"/>
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirm(course._id)}
                                            className="btn-icon-outline" 
                                            style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} color="#EF4444"/>
                                        </button>
                                        {deleteConfirm === course._id && (
                                            <div style={{
                                                position: 'absolute', bottom: '40px', right: '0', background: 'white',
                                                border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px',
                                                whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                            }}>
                                                <div style={{fontSize: '12px', color: '#374151', marginBottom: '6px'}}>Xác nhận xóa?</div>
                                                <div style={{display: 'flex', gap: '4px'}}>
                                                    <button onClick={() => handleDelete(course._id)} style={{padding: '4px 8px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Xóa</button>
                                                    <button onClick={() => setDeleteConfirm(null)} style={{padding: '4px 8px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>Hủy</button>
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
            </div>
        </div>
    );
};

export default CourseList;
