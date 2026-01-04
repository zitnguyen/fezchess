import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, ChevronLeft, ChevronRight, Edit, Trash2, RotateCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import studentService from '../../services/studentService';

const StudentList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch students when component mounts or when returning to this page
    useEffect(() => {
        fetchStudents();
    }, [location.pathname]);

    // Apply filters whenever search changes
    useEffect(() => {
        applyFilters();
    }, [students, searchTerm]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.getAll();
            console.log('Fetched all students:', response);
            setStudents(response || []);
        } catch (err) {
            setError('Lỗi khi tải dữ liệu học viên');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = students.filter(student => {
            const term = searchTerm.toLowerCase();
            return (
                (student.fullName && student.fullName.toLowerCase().includes(term)) ||
                (student.studentId && String(student.studentId).includes(term)) ||
                (student.address && student.address.toLowerCase().includes(term))
            );
        });

        setFilteredStudents(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (studentId) => {
        try {
            await studentService.delete(studentId);
            setStudents(students.filter(s => s._id !== studentId));
            setDeleteConfirm(null);
            console.log('Xóa học viên thành công');
        } catch (err) {
            console.error('Error deleting student:', err);
            setError('Lỗi khi xóa học viên');
        }
    };

    const handleEdit = (studentId) => {
        navigate(`/students/${studentId}/edit`);
    };

    const handleAdd = () => {
        navigate('/students/new');
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchStudents();
        setIsRefreshing(false);
    };

    const handleExportExcel = async () => {
        try {
            const csvContent = generateCSV(filteredStudents);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
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
        const headers = ['Mã HV', 'Tên', 'Ngày sinh', 'Địa chỉ', 'Ngày nhập học', 'Trình độ'];
        const rows = data.map(student => [
            student.studentId || 'N/A',
            student.fullName || 'N/A',
            student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A',
            student.address || 'N/A',
            student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A',
            student.skillLevel || 'N/A'
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
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

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
            <h1>Danh Sách Học Viên</h1>
            <p className="page-subtitle">Quản lý thông tin học viên.</p>
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
                <span>Thêm học viên</span>
            </button>
        </div>
      </div>

      <div className="control-bar">
        <div className="search-box" style={{maxWidth: '400px'}}>
             <Search size={18} className="search-icon"/>
             <input 
                type="text" 
                placeholder="Tìm kiếm tên, mã học viên, địa chỉ..." 
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
            ) : filteredStudents.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                    {students.length === 0 ? 'Chưa có học viên nào.' : 'Không tìm thấy học viên phù hợp.'}
                </div>
            ) : (
            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{width: '40px'}}><input type="checkbox" /></th>
                        <th>Học Viên</th>
                        <th>Mã HV</th>
                        <th>Ngày sinh</th>
                        <th>Địa chỉ</th>
                        <th>Ngày nhập học</th>
                        <th>Trình độ</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((student) => (
                        <tr key={student._id || student.id}>
                            <td><input type="checkbox" /></td>
                            <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: '#E0E7FF', color: '#4F46E5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '600', flexShrink: 0
                                    }}>
                                        {(student.fullName || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{fontWeight: '600', fontSize: '14px', color: '#111827'}}>{student.fullName}</div>
                                </div>
                            </td>
                            <td>
                                <div style={{fontSize: '14px', color: '#374151', fontWeight: '500'}}>
                                    {student.studentId || 'N/A'}
                                </div>
                            </td>
                            <td>
                                <div style={{fontSize: '14px', color: '#374151'}}>
                                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                                </div>
                            </td>
                            <td>
                                <div style={{fontSize: '14px', color: '#374151'}}>
                                    {student.address || 'N/A'}
                                </div>
                            </td>
                            <td>
                                <div style={{fontSize: '14px', color: '#374151'}}>
                                    {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                                </div>
                            </td>
                            <td>
                                <span style={{
                                    padding: '4px 12px', 
                                    borderRadius: '6px', 
                                    fontSize: '12px', 
                                    fontWeight: '500',
                                    background: '#F3F4F6',
                                    color: '#374151'
                                }}>
                                    {student.skillLevel || 'N/A'}
                                </span>
                            </td>
                            <td>
                                <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                    <button 
                                        onClick={() => handleEdit(student._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={16} color="#4B5563"/>
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirm(student._id)}
                                        className="btn-icon-outline" 
                                        style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                        title="Xóa"
                                    >
                                        <Trash2 size={16} color="#EF4444"/>
                                    </button>
                                    {deleteConfirm === student._id && (
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
                                                    onClick={() => handleDelete(student._id)}
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
            
           {!loading && filteredStudents.length > 0 && (
                 <div className="pagination">
                    <div style={{fontSize: '14px', color: '#6B7280'}}>
                        Hiển thị <strong>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredStudents.length)}</strong> trong <strong>{filteredStudents.length}</strong> học viên
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
    </div>
  );
};

export default StudentList;
