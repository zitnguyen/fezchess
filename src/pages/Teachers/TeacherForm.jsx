import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import teacherService from '../../services/teacherService';

const TeacherForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const formRef = useRef(null);
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: isEditMode ? '' : '',
        phone: '',
        specialization: '',
        experienceYears: '',
        certification: '',
        role: 'Teacher'
    });

    useEffect(() => {
        if (isEditMode) {
            fetchTeacher();
        }
    }, [id]);

    const fetchTeacher = async () => {
        try {
            setLoading(true);
            console.log('Fetching teacher with id:', id);
            const response = await teacherService.getById(id);
            console.log('Fetched teacher data:', response);
            // Ensure all string fields are strings
            setFormData({
                username: String(response.username || ''),
                fullName: String(response.fullName || ''), // Thêm fullName
                email: String(response.email || ''),
                password: '',
                phone: String(response.phone || ''),
                specialization: String(response.specialization || ''),
                experienceYears: response.experienceYears ? String(response.experienceYears) : '',
                certification: String(response.certification || ''),
                role: response.role || 'Teacher'
            });
        } catch (err) {
            setError('Lỗi khi tải dữ liệu giáo viên');
            console.error('Error fetching teacher:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation - ensure required fields are strings before calling trim()
        const usernameStr = String(formData.username || '').trim();
        const emailStr = String(formData.email || '').trim();
        const passwordStr = String(formData.password || '').trim();
        
        if (!usernameStr) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!String(formData.fullName || '').trim()) {
            setError('Vui lòng nhập họ và tên');
            return;
        }
        if (!emailStr) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!isEditMode && !passwordStr) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            setSubmitting(true);
            console.log('Submitting form data:', formData);
            console.log('Is edit mode:', isEditMode);
            // Prepare clean data
            const cleanData = {
                ...formData,
                username: formData.username?.trim(),
                email: formData.email?.trim(),
                fullName: formData.fullName?.trim(),
                phone: formData.phone?.trim(),
                specialization: formData.specialization?.trim(),
                certification: formData.certification?.trim()
            };

            if (isEditMode) {
                console.log('Updating teacher with id:', id);
                const updateResponse = await teacherService.update(id, cleanData);
                console.log('Update response:', updateResponse);
                alert('Cập nhật giáo viên thành công!');
            } else {
                console.log('Creating new teacher');
                const createResponse = await teacherService.create(cleanData);
                console.log('Create response:', createResponse);
                alert('Thêm giáo viên thành công!');
            }
            navigate('/teachers');
        } catch (err) {
            console.error('Error saving teacher:', err);
            setError(err.response?.data?.message || 'Lỗi khi lưu dữ liệu: ' + err.message);
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
                        onClick={() => navigate('/teachers')}
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
                        <h1>{isEditMode ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</h1>
                        <p className="page-subtitle">
                            {isEditMode ? 'Cập nhật thông tin giáo viên' : 'Điền thông tin giáo viên mới'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => formRef.current?.requestSubmit()}
                    disabled={submitting}
                    className="btn-primary"
                    style={{ display: 'inline-flex', gap: '8px' }}
                    type="button"
                >
                    <Save size={18} />
                    <span>{submitting ? 'Đang lưu...' : 'Lưu'}</span>
                </button>
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

            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        {/* Tên đăng nhập */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Tên đăng nhập <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Email <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="VD: teacher@example.com"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>

                        {/* Họ và tên - Mới */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên giáo viên"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                                required
                            />
                        </div>

                        {/* Mật khẩu */}
                        {!isEditMode && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                    Mật khẩu <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    }}
                                    required
                                />
                            </div>
                        )}

                        {/* Số điện thoại */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="VD: 0912345678"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Chuyên môn */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Chuyên môn
                            </label>
                            <input
                                type="text"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="VD: Cờ Vua, Toán"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Năm kinh nghiệm */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Năm kinh nghiệm
                            </label>
                            <input
                                type="number"
                                name="experienceYears"
                                value={formData.experienceYears}
                                onChange={handleChange}
                                placeholder="VD: 5"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Chứng chỉ */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                                Chứng chỉ
                            </label>
                            <input
                                type="text"
                                name="certification"
                                value={formData.certification}
                                onChange={handleChange}
                                placeholder="VD: FIDE Master"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/teachers')}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #D1D5DB',
                                background: '#F9FAFB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151'
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                        >
                            {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
