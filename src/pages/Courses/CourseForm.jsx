import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import courseService from '../../services/courseService';

const CourseForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        level: 'Beginner',
        durationWeeks: 12,
        fee: 0,
        maxStudents: 10
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const data = await courseService.getById(id);
            setFormData({
                courseName: data.courseName || '',
                description: data.description || '',
                level: data.level || 'Beginner',
                durationWeeks: data.durationWeeks || 0,
                fee: data.fee || 0,
                maxStudents: data.maxStudents || 0
            });
        } catch (err) {
            console.error("Failed to fetch course", err);
            setError("Không thể tải thông tin khóa học.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (isEditMode) {
                await courseService.update(id, formData);
                alert('Cập nhật khóa học thành công!');
            } else {
                await courseService.create(formData);
                alert('Thêm khóa học thành công!');
            }
            navigate('/courses');
        } catch (err) {
            console.error('Error saving course:', err);
            setError('Lỗi khi lưu thông tin khóa học.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/courses')}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={24} color="#374151" />
                    </button>
                    <div>
                        <h1>{isEditMode ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}</h1>
                        <p className="page-subtitle">
                            {isEditMode ? 'Cập nhật thông tin khóa học' : 'Điền thông tin khóa học mới'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => formRef.current?.requestSubmit()}
                    disabled={submitting}
                    className="btn-primary"
                    style={{ display: 'inline-flex', gap: '8px' }}
                >
                    <Save size={18} />
                    <span>{submitting ? 'Đang lưu...' : 'Lưu'}</span>
                </button>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: '#FEE2E2', color: '#DC2626', borderRadius: '6px', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        
                        {/* Tên Khóa Học - Full Width */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Tên khóa học <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="courseName"
                                value={formData.courseName}
                                onChange={handleChange}
                                placeholder="VD: Nhập môn Cờ Vua"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Mô tả - Full Width */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Mô tả</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả nội dung khóa học..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Cấp độ */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Cấp độ</label>
                            <select 
                                name="level" 
                                value={formData.level} 
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="Beginner">Người mới (Beginner)</option>
                                <option value="Intermediate">Trung cấp (Intermediate)</option>
                                <option value="Advanced">Nâng cao (Advanced)</option>
                                <option value="Master">Master</option>
                            </select>
                        </div>

                        {/* Thời lượng */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Thời lượng (Tuần)</label>
                            <input
                                type="number"
                                name="durationWeeks"
                                value={formData.durationWeeks}
                                onChange={handleChange}
                                min="1"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Học phí */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Học phí (VND)</label>
                            <input
                                type="number"
                                name="fee"
                                value={formData.fee}
                                onChange={handleChange}
                                min="0"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {/* Sĩ số tối đa */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Sĩ số tối đa</label>
                            <input
                                type="number"
                                name="maxStudents"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                min="1"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseForm;
