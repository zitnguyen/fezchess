import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import classService from "../../services/classService";
import courseService from "../../services/courseService";
import teacherService from "../../services/teacherService";
import studentService from "../../services/studentService";

const SchedulePicker = ({ value, onChange }) => {
    // Parse existing value "T2/T4 (18:00)" -> days=["T2", "T4"], time="18:00"
    const [selectedDays, setSelectedDays] = useState([]);
    const [time, setTime] = useState("");

    useEffect(() => {
        if (value) {
            // Regex to extract time in parens ()
            const timeMatch = value.match(/\((.*?)\)/);
            if (timeMatch) {
                setTime(timeMatch[1]);
            }
            
            // Extract days part (before the parenthesis)
            const daysPart = value.split('(')[0];
            if (daysPart) {
                const days = daysPart.split('/').map(d => d.trim()).filter(d => d);
                setSelectedDays(days);
            }
        }
    }, []); // Run once on mount to init from existing (or we could depend on value but avoid loops)

    const daysOptions = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const handleDayToggle = (day) => {
        const newDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day].sort((a, b) => {
                const order = { "T2": 1, "T3": 2, "T4": 3, "T5": 4, "T6": 5, "T7": 6, "CN": 7 };
                return order[a] - order[b];
            });
        
        setSelectedDays(newDays);
        updateParent(newDays, time);
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        updateParent(selectedDays, newTime);
    };

    const updateParent = (days, t) => {
        if (days.length === 0 && !t) {
            onChange("");
            return;
        }
        const str = `${days.join('/')} (${t})`;
        onChange(str);
    };

    return (
        <div style={{border: '1px solid #D1D5DB', borderRadius: '6px', padding: '12px'}}>
            <div style={{marginBottom: '10px', fontWeight: '500', fontSize: '14px'}}>Chọn Ngày:</div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px'}}>
                {daysOptions.map(day => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: `1px solid ${selectedDays.includes(day) ? '#2563EB' : '#D1D5DB'}`,
                            background: selectedDays.includes(day) ? '#EFF6FF' : 'white',
                            color: selectedDays.includes(day) ? '#2563EB' : '#374151',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {day}
                    </button>
                ))}
            </div>
            
            <div style={{fontWeight: '500', fontSize: '14px', marginBottom: '6px'}}>Chọn Giờ:</div>
            <input 
                type="time" 
                value={time}
                onChange={handleTimeChange}
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #D1D5DB',
                    width: '150px'
                }}
            />
        </div>
    );
};

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Auxiliary data
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [formData, setFormData] = useState({
    classId: "",
    className: "",
    courseId: "",
    teacherId: "",
    startDate: "",
    schedule: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchAuxData();
    if (isEditMode) {
      fetchClass();
    }
  }, [id]);

  const fetchAuxData = async () => {
    try {
        const [coursesData, teachersData, studentsData] = await Promise.all([
            courseService.getAll(),
            teacherService.getAll(),
            studentService.getAll()
        ]);
        setCourses(Array.isArray(coursesData) ? coursesData : coursesData.courses || []);
        setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.users || []);
        setAllStudents(Array.isArray(studentsData) ? studentsData : studentsData || []);
    } catch (err) {
        console.error("Error fetching aux data:", err);
    }
  };

  const fetchClass = async () => {
    try {
      setLoading(true);
      const response = await classService.getById(id);
      setFormData({
        classId: response.classId || "",
        className: response.className || "",
        courseId: response.courseId?._id || response.courseId || "",
        teacherId: response.teacherId?._id || response.teacherId || "",
        startDate: response.startDate ? response.startDate.split("T")[0] : "",
        schedule: response.schedule || "",
        status: response.status || "Pending",
      });
      // Set selected students from response
      if (response.students && Array.isArray(response.students)) {
          setSelectedStudents(response.students.map(s => s._id));
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lớp học");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.classId || !formData.className || !formData.courseId) {
        setError("Vui lòng điền các trường bắt buộc (ID, Tên lớp, Khóa học)");
        return;
    }

    try {
      setSubmitting(true);
      const payload = { 
          ...formData, 
          classId: Number(formData.classId),
          students: selectedStudents // Send selected student IDs
      };
      if (isEditMode) {
        await classService.update(id, payload);
        alert("Cập nhật lớp học thành công!");
      } else {
        await classService.create(payload);
        alert("Thêm lớp học thành công!");
      }
      navigate("/classes");
    } catch (err) {
      console.error("Error saving class:", err);
      setError(err.response?.data?.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: '24px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/classes")} style={{ background: "none", border: "none", cursor: "pointer", padding: "0" }}>
            <ArrowLeft size={24} color="#374151" />
          </button>
          <div>
            <h1>{isEditMode ? "Chỉnh sửa Lớp học" : "Thêm Lớp học mới"}</h1>
            <p className="page-subtitle">Điền thông tin lớp học</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ display: "inline-flex", gap: "8px" }}>
          <Save size={18} />
          <span>{submitting ? "Đang lưu..." : "Lưu"}</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#FEE2E2", color: "#DC2626", borderRadius: "6px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div style={{ background: "white", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Class ID */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Mã Lớp (Số) *</label>
              <input type="number" name="classId" value={formData.classId} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }} required />
            </div>
            {/* Class Name */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Tên Lớp *</label>
              <input type="text" name="className" value={formData.className} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }} required />
            </div>
            {/* Course */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Khóa Học *</label>
              <select name="courseId" value={formData.courseId} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }} required>
                 <option value="">-- Chọn Khóa Học --</option>
                 {courses.map(c => (
                     <option key={c._id} value={c._id}>{c.courseName}</option>
                 ))}
              </select>
            </div>
             {/* Teacher */}
             <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Giáo Viên</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }}>
                 <option value="">-- Chọn Giáo Viên --</option>
                 {teachers.map(t => (
                     <option key={t._id} value={t._id}>{t.username} ({t.email})</option>
                 ))}
              </select>
            </div>
            {/* Start Date */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Ngày Khai Giảng</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }} />
            </div>
             {/* Status */}
             <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Trạng Thái</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ width: "100%", padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px" }}>
                 <option value="Pending">Sắp khai giảng</option>
                 <option value="Active">Đang diễn ra</option>
                 <option value="Finished">Đã kết thúc</option>
              </select>
            </div>
            {/* Schedule */}
            <div style={{gridColumn: 'span 2'}}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Lịch Học</label>
              <SchedulePicker 
                value={formData.schedule} 
                onChange={(newSchedule) => setFormData(prev => ({ ...prev, schedule: newSchedule }))} 
              />
              <div style={{fontSize:'12px', color:'#9CA3AF', marginTop:'6px'}}>
                 Kết quả lưu DB: {formData.schedule || '(Chưa chọn)'}
              </div>
            </div>

            {/* Student Selection */}
            <div style={{gridColumn: 'span 2', marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '20px'}}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "15px" }}>Chọn Học Viên</label>
                <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    padding: '12px'
                }}>
                    {allStudents.map(student => (
                        <label key={student._id} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px'}}>
                            <input 
                                type="checkbox" 
                                checked={selectedStudents.includes(student._id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedStudents([...selectedStudents, student._id]);
                                    } else {
                                        setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                                    }
                                }}
                                style={{width: '16px', height: '16px'}}
                            />
                            <span style={{fontSize: '14px'}}>
                                {student.fullName} <span style={{color: '#6B7280', fontSize: '12px'}}>(ID: {student.studentId})</span>
                            </span>
                        </label>
                    ))}
                    {allStudents.length === 0 && <div style={{color: '#6B7280', fontStyle: 'italic'}}>Chưa có học viên nào trong hệ thống</div>}
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
