import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, Calendar, Clock } from "lucide-react";
import studentService from "../../services/studentService";

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const formRef = useRef(null);
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Simplified Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    skillLevel: "",
    address: "",
    
    // Parent Info (Direct)
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    
    // Schedule (Direct)
    scheduleDays: [], // [1, 3] for Mon, Wed
    scheduleTime: "18:00",
    sessionsTotal: 16
  });

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await studentService.getById(id);
      setFormData({
        fullName: res.fullName || "",
        dateOfBirth: res.dateOfBirth ? res.dateOfBirth.split("T")[0] : "",
        enrollmentDate: res.enrollmentDate ? res.enrollmentDate.split("T")[0] : "",
        skillLevel: res.skillLevel || "",
        address: res.address || "",
        
        // Map existing parent
        parentName: res.parentId?.fullName || "",
        parentPhone: res.parentId?.phone || "",
        parentEmail: res.parentId?.email || "",
        
        // Map schedule
        scheduleDays: res.schedule?.days || [],
        scheduleTime: res.schedule?.time || "18:00",
        sessionsTotal: res.sessions?.total || 16
      });
    } catch (err) {
      setError("Lỗi khi tải dữ liệu học viên");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDayToggle = (dayVal) => {
      setFormData(prev => {
          const days = prev.scheduleDays.includes(dayVal)
            ? prev.scheduleDays.filter(d => d !== dayVal)
            : [...prev.scheduleDays, dayVal].sort();
          return { ...prev, scheduleDays: days };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName) return setError("Vui lòng nhập tên học viên");
    if (!formData.parentPhone) return setError("Vui lòng nhập SĐT phụ huynh");
    if (formData.scheduleDays.length === 0) return setError("Vui lòng chọn ít nhất 1 buổi học");

    try {
      setSubmitting(true);
      if (isEditMode) {
        await studentService.update(id, formData);
        alert("Cập nhật thành công!");
      } else {
        await studentService.create(formData);
        alert("Thêm học viên thành công!");
      }
      navigate("/students");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: '24px', textAlign: 'center'}}>Đang tải...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/students")} className="btn-icon">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{isEditMode ? "Chỉnh sửa học viên" : "Tiếp nhận học viên mới"}</h1>
            <p className="page-subtitle">Nhập thông tin học viên, phụ huynh và lịch học</p>
          </div>
        </div>
        <button
          onClick={() => formRef.current?.requestSubmit()}
          disabled={submitting}
          className="btn-primary"
          type="button"
        >
          <Save size={18} /> {submitting ? "Đang lưu..." : "Lưu hồ sơ"}
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <div style={{ background: "white", padding: "24px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* --- SECTION 1: HỌC VIÊN --- */}
            <div style={{ gridColumn: "span 2" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
                    1. Thông tin Học viên
                </h3>
            </div>
            
            <div>
              <label className="form-label">Họ tên học viên <span style={{color:'red'}}>*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input" placeholder="Nguyễn Văn A" />
            </div>
            
            <div>
              <label className="form-label">Mã học viên</label>
              <input type="text" disabled value={isEditMode ? formData.studentId : "Tự động sinh (VD: 1001)"} className="form-input" style={{background: '#F3F4F6', color: '#6B7280'}} />
            </div>

            <div>
              <label className="form-label">Ngày sinh</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input" />
            </div>
            
             <div>
              <label className="form-label">Trình độ</label>
              <input type="text" name="skillLevel" value={formData.skillLevel} onChange={handleChange} className="form-input" placeholder="Nhập môn / Cơ bản..." />
            </div>

            {/* --- SECTION 2: PHỤ HUYNH --- */}
             <div style={{ gridColumn: "span 2", marginTop: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
                    2. Thông tin Phụ huynh
                </h3>
            </div>

            <div>
              <label className="form-label">Số điện thoại PH <span style={{color:'red'}}>*</span></label>
              <input type="text" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required className="form-input" placeholder="09xxxx (Sẽ dùng để tạo tài khoản)" />
            </div>

            <div>
              <label className="form-label">Tên phụ huynh</label>
              <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="form-input" placeholder="Nếu chưa có, hệ thống sẽ tạo mới" />
            </div>

            {/* --- SECTION 3: LỊCH HỌC & HỌC PHÍ --- */}
             <div style={{ gridColumn: "span 2", marginTop: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", marginBottom: "16px", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
                    3. Lịch học & Khóa học
                </h3>
            </div>

            <div style={{ gridColumn: "span 2", background: "#F9FAFB", padding: "16px", borderRadius: "8px" }}>
                <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        <label className="form-label" style={{marginBottom: "12px"}}>Chọn lịch học trong tuần <span style={{color:'red'}}>*</span></label>
                        <div style={{ display: "flex", gap: "8px" }}>
                             {[ {l:"CN",v:0}, {l:"T2",v:1}, {l:"T3",v:2}, {l:"T4",v:3}, {l:"T5",v:4}, {l:"T6",v:5}, {l:"T7",v:6} ].map(d => (
                                 <div 
                                    key={d.v}
                                    onClick={() => handleDayToggle(d.v)}
                                    style={{
                                        width: "40px", height: "40px", 
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        borderRadius: "6px",
                                        border: formData.scheduleDays.includes(d.v) ? "2px solid #2563EB" : "1px solid #D1D5DB",
                                        background: formData.scheduleDays.includes(d.v) ? "#DBEAFE" : "white",
                                        color: formData.scheduleDays.includes(d.v) ? "#1E40AF" : "#374151",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        userSelect: "none"
                                    }}
                                 >
                                     {d.l}
                                 </div>
                             ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="form-label">Giờ học</label>
                        <div className="input-with-icon">
                            <Clock size={18} color="#6B7280" />
                            <input type="time" name="scheduleTime" value={formData.scheduleTime} onChange={handleChange} className="form-input" style={{width: "140px"}} />
                        </div>
                    </div>
                    
                    <div>
                         <label className="form-label">Tổng số buổi</label>
                         <input type="number" name="sessionsTotal" value={formData.sessionsTotal} onChange={handleChange} className="form-input" style={{width: "100px"}} />
                    </div>
                </div>
            </div>

        </form>
      </div>
      
      <style>{`
        .form-label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
        .form-input { width: 100%; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; }
        .error-alert { padding: 12px; background: #fee2e2; color: #dc2626; border-radius: 6px; margin-bottom: 16px; }
        .input-with-icon { position: relative; display: flex; alignItems: center; }
        .input-with-icon svg { position: absolute; left: 10px; }
        .input-with-icon input { padding-left: 36px; }
      `}</style>
    </div>
  );
};

export default StudentForm;

