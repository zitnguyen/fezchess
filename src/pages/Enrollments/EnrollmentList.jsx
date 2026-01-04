import React, { useState, useEffect } from 'react';
import { Plus, Download, Search, ChevronLeft, ChevronRight, Edit, Trash2, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import enrollmentService from '../../services/enrollmentService';

const EnrollmentList = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch enrollments
    useEffect(() => {
        fetchEnrollments();
    }, []);

    // Apply filters
    useEffect(() => {
        applyFilters();
    }, [enrollments, searchTerm]);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await enrollmentService.getAll();
            setEnrollments(response || []);
        } catch (err) {
            setError('Lỗi khi tải dữ liệu ghi danh');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchEnrollments();
        setIsRefreshing(false);
    };

    const applyFilters = () => {
        let filtered = enrollments.filter(item => {
            const term = searchTerm.toLowerCase();
            const studentName = item.studentId?.fullName?.toLowerCase() || '';
            const className = item.classId?.className?.toLowerCase() || '';
            return studentName.includes(term) || className.includes(term);
        });
        setFilteredEnrollments(filtered);
        setCurrentPage(1);
    };

    const handleDelete = async (id) => {
        try {
            await enrollmentService.delete(id);
            setEnrollments(prev => prev.filter(e => e._id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error("Error deleting enrollment:", err);
            setError('Lỗi khi xóa bản ghi');
        }
    };

    const handleEdit = (id) => {
        navigate(`/enrollments/${id}/edit`);
    };

    const handleExportExcel = () => {
        // Simple CSV export
        const headers = ['Học viên', 'Lớp', 'Ngày đăng ký', 'Học phí', 'Trạng thái'];
        const rows = filteredEnrollments.map(e => [
            e.studentId?.fullName || 'N/A',
            e.classId?.className || 'N/A',
            e.enrollmentDate ? new Date(e.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A',
            e.feeAmount || 0,
            e.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
    
    // State for delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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
                    <h1>Danh Sách Ghi Danh</h1>
                    <p className="page-subtitle">Quản lý việc đăng ký lớp học của học viên.</p>
                </div>
                <div>
                     <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="btn-icon-outline" 
                        style={{display: 'inline-flex', marginRight: '12px', width: 'auto', padding: '0 12px', gap: '8px'}}
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
                        onClick={() => navigate('/enrollments/new')}
                        className="btn-primary" 
                        style={{display: 'inline-flex'}}
                    >
                        <Plus size={18} />
                        <span>Ghi danh mới</span>
                    </button>
                </div>
            </div>

            <div className="control-bar">
                <div className="search-box" style={{maxWidth: '400px'}}>
                     <Search size={18} className="search-icon"/>
                     <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên học viên, tên lớp..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
                ) : filteredEnrollments.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Chưa có bản ghi nào.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Học Viên</th>
                                <th>Lớp Đăng Ký</th>
                                <th>Ngày Ghi Danh</th>
                                <th>Học Phí</th>
                                <th>Trạng Thái Thanh Toán</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div style={{fontWeight: '600', color: '#111827'}}>
                                            {item.studentId?.fullName || "N/A"}
                                        </div>
                                        <div style={{fontSize: '12px', color: '#6B7280'}}>
                                            ID: {item.studentId?.studentId || item.studentId?._id?.slice(-6)}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{fontWeight: '500', color: '#4F46E5'}}>
                                            {item.classId?.className || "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        {item.enrollmentDate ? new Date(item.enrollmentDate).toLocaleDateString('vi-VN') : 'N/A'}
                                    </td>
                                    <td>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.feeAmount || 0)}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: item.paymentStatus === 'paid' ? '#DEF7EC' : '#FFF3CD',
                                            color: item.paymentStatus === 'paid' ? '#03543F' : '#997404',
                                            border: `1px solid ${item.paymentStatus === 'paid' ? '#BCF0DA' : '#FCE96A'}`
                                        }}>
                                            {item.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', gap: '8px', position: 'relative'}}>
                                            <button 
                                                onClick={() => handleEdit(item._id)}
                                                className="btn-icon-outline" 
                                                style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                                title="Sửa"
                                            >
                                                <Edit size={16} color="#4B5563"/>
                                            </button>
                                            <button 
                                                onClick={() => setDeleteConfirm(item._id)}
                                                className="btn-icon-outline" 
                                                style={{width: '32px', height: '32px', border: 'none', cursor: 'pointer'}}
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} color="#EF4444"/>
                                            </button>

                                            {/* Delete Confirmation Popup */}
                                            {deleteConfirm === item._id && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '100%',
                                                    right: '0',
                                                    marginBottom: '5px',
                                                    background: 'white',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '6px',
                                                    padding: '12px',
                                                    width: '200px',
                                                    zIndex: 10,
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                    <div style={{fontSize: '13px', marginBottom: '8px', fontWeight: '500'}}>Xóa ghi danh này?</div>
                                                    <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                                        <button 
                                                            onClick={() => setDeleteConfirm(null)}
                                                            style={{padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer'}}
                                                        >Hủy</button>
                                                        <button 
                                                            onClick={() => handleDelete(item._id)}
                                                            style={{padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer'}}
                                                        >Xóa</button>
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

                {/* Pagination (Simplified) */}
                {totalPages > 1 && (
                     <div className="pagination">
                        <div style={{fontSize: '14px', color: '#6B7280'}}>
                            Trang {currentPage} / {totalPages}
                        </div>
                        <div className="pagination-controls">
                            <button 
                                className="page-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                className="page-btn"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default EnrollmentList;
