import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ChevronLeft } from 'lucide-react';
import enrollmentService from '../../services/enrollmentService';
import studentService from '../../services/studentService';
import classService from '../../services/classService';

const EnrollmentForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        studentId: '',
        classId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        paymentStatus: 'pending',
        feeAmount: 0 // Optional, maybe fetch from class
    });

    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch master data (students, classes) and enrollment if edit mode
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [studentsRes, classesRes] = await Promise.all([
                    studentService.getAll(),
                    classService.getAll()
                ]);
                setStudents(studentsRes || []);
                setClasses(classesRes || []);

                if (isEditMode) {
                    // Since specific getById might not exist or we can filter from all? 
                    // Usually we need a getById endpoint. I'll check if I need to add it or if the backend supports it.
                    // For now, I'll assume I can find it in the "Get All" list or if a new endpoint is needed.
                    // Ideally, enrollmentService should have getById. 
                    // The backend controller has updateEnrollment(req.params.id), so we can probably GET it too?
                    // Let's assume we might need to implement getById in service or find it from a passed state.
                    // Actually, let's try to fetch all and find it for now to avoid blocking if getById specific API is missing in service.
                    const allEnrollments = await enrollmentService.getAll();
                    const enrollment = allEnrollments.find(e => e._id === id);
                    if (enrollment) {
                        setFormData({
                            studentId: enrollment.studentId._id || enrollment.studentId, // Handle populated vs raw
                            classId: enrollment.classId._id || enrollment.classId,
                            enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toISOString().split('T')[0] : '',
                            status: enrollment.status || 'active',
                            paymentStatus: enrollment.paymentStatus || 'pending',
                            feeAmount: enrollment.feeAmount || 0
                        });
                    } else {
                        setError('Không tìm thấy thông tin ghi danh');
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEditMode) {
                await enrollmentService.update(id, formData); // Assuming update method exists/will exist
            } else {
                await enrollmentService.create(formData);
            }
            navigate('/enrollments');
        } catch (err) {
            console.error("Error saving enrollment:", err);
            setError(err.response?.data?.message || 'Lỗi khi lưu thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <button onClick={() => navigate('/enrollments')} className="btn-back" style={{display:'flex', alignItems:'center', gap:'5px', border:'none', background:'transparent', color:'#6B7280', cursor:'pointer', marginBottom:'8px'}}>
                        <ChevronLeft size={18} /> Quay lại danh sách
                    </button>
                    <h1>{isEditMode ? 'Chỉnh Sửa Ghi Danh' : 'Ghi Danh Mới'}</h1>
                </div>
            </div>

            <div className="form-container" style={{maxWidth: '800px', background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                {error && (
                    <div style={{padding: '12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', marginBottom: '20px'}}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        {/* Student Selection */}
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Học Viên <span style={{color:'red'}}>*</span></label>
                            <select 
                                name="studentId" 
                                value={formData.studentId} 
                                onChange={handleChange} 
                                required 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                                disabled={isEditMode} // Usually we don't change student in edit, but can be flexible
                            >
                                <option value="">-- Chọn học viên --</option>
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.studentId ? `[${s.studentId}] ` : ''}{s.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class Selection */}
                        <div className="form-group" style={{gridColumn: '1 / -1'}}>
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Lớp Học <span style={{color:'red'}}>*</span></label>
                            <select 
                                name="classId" 
                                value={formData.classId} 
                                onChange={handleChange} 
                                required 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                            >
                                <option value="">-- Chọn lớp học --</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.className} ({c.schedule})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Enrollment Date */}
                        <div className="form-group">
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Ngày Ghi Danh <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="date" 
                                name="enrollmentDate" 
                                value={formData.enrollmentDate} 
                                onChange={handleChange} 
                                required 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                            />
                        </div>

                        {/* Fee Amount */}
                        <div className="form-group">
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Học Phí</label>
                            <input 
                                type="number" 
                                name="feeAmount" 
                                value={formData.feeAmount} 
                                onChange={handleChange} 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                            />
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Trạng Thái Học</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                            >
                                <option value="active">Đang học</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="dropped">Đã nghỉ</option>
                                <option value="reserved">Bảo lưu</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div className="form-group">
                            <label style={{display: 'block', marginBottom: '8px', fontWeight: '500'}}>Trạng Thái Thanh Toán</label>
                            <select 
                                name="paymentStatus" 
                                value={formData.paymentStatus} 
                                onChange={handleChange} 
                                style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB'}}
                            >
                                <option value="pending">Chờ thanh toán</option>
                                <option value="paid">Đã thanh toán</option>
                                <option value="overdue">Quá hạn</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions" style={{marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                        <button 
                            type="button" 
                            onClick={() => navigate('/enrollments')}
                            className="btn-secondary"
                            style={{padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
                        >
                            <X size={18} /> Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary"
                            style={{padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#2563EB', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}
                        >
                            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrollmentForm;
