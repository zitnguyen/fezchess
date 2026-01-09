import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Calendar, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import studentService from "../../../services/studentService";
import teacherService from "../../../services/teacherService";

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const formRef = useRef(null);
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  
  // Simplified Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    skillLevel: "",
    address: "",
    teacherId: "",
    
    // Parent Info (Direct)
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    
    // Schedule (Direct)
    scheduleDays: [], 
    scheduleTimes: {}, // { 1: "18:00", 3: "19:30" }
    sessionsTotal: 16
  });

  useEffect(() => {
    if (isEditMode) {
      fetchStudent();
    }
    fetchTeachers();
  }, [id]);

  const fetchTeachers = async () => {
      try {
          const res = await teacherService.getAll();
          setTeachers(res || []);
      } catch (err) {
          console.error("Failed to fetch teachers");
      }
  };

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await studentService.getById(id);
      
      // Parse Schedule Logic
      let days = [];
      let times = {};
      
      if (res.schedule && res.schedule.slots && res.schedule.slots.length > 0) {
          // New Format
          res.schedule.slots.forEach(slot => {
              days.push(slot.day);
              times[slot.day] = slot.time;
          });
      } else if (res.schedule && res.schedule.days) {
          // Legacy Format Fallback
          days = res.schedule.days || [];
          days.forEach(d => {
              times[d] = res.schedule.time || "18:00";
          });
      }

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
        scheduleDays: days,
        scheduleTimes: times,
        sessionsTotal: res.sessions?.total || 16,
        teacherId: res.teacherId || ""
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
          const exists = prev.scheduleDays.includes(dayVal);
          let newDays = exists 
             ? prev.scheduleDays.filter(d => d !== dayVal)
             : [...prev.scheduleDays, dayVal].sort();
          
          let newTimes = { ...prev.scheduleTimes };
          if (!exists && !newTimes[dayVal]) {
              // Default time for new day (copy from first existing or default 18:00)
              const firstKey = Object.keys(newTimes)[0];
              newTimes[dayVal] = firstKey ? newTimes[firstKey] : "18:00";
          }
          if (exists) {
              delete newTimes[dayVal];
          }

          return { ...prev, scheduleDays: newDays, scheduleTimes: newTimes };
      });
  };

  const handleTimeChange = (day, time) => {
      setFormData(prev => ({
          ...prev,
          scheduleTimes: {
              ...prev.scheduleTimes,
              [day]: time
          }
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName) return setError("Vui lòng nhập tên học viên");
    if (!formData.parentPhone) return setError("Vui lòng nhập SĐT phụ huynh");
    if (formData.scheduleDays.length === 0) return setError("Vui lòng chọn ít nhất 1 buổi học");

    // Construct slots
    const scheduleSlots = formData.scheduleDays.map(d => ({
        day: d,
        time: formData.scheduleTimes[d] || "18:00"
    }));

    const payload = { ...formData, scheduleSlots };
    // Remove temp fields
    delete payload.scheduleDays;
    delete payload.scheduleTimes;

    try {
      setSubmitting(true);
      if (isEditMode) {
        await studentService.update(id, payload);
      } else {
        await studentService.create(payload);
      }
      navigate("/students");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data) || "Lỗi khi lưu dữ liệu";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
      <div className="flex h-96 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/students")} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? "Chỉnh sửa hồ sơ" : "Tiếp nhận học viên mới"}</h1>
            <p className="text-sm text-gray-500">Điền đầy đủ thông tin để tạo hồ sơ học viên</p>
          </div>
        </div>
        <button
          onClick={() => formRef.current?.requestSubmit()}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          type="button"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{submitting ? "Đang lưu..." : "Lưu hồ sơ"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
            <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- SECTION 1: HỌC VIÊN --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User size={18}/></span>
                    Thông tin Học viên
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên học viên <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            required 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                            placeholder="VD: Nguyễn Văn A" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                        <input 
                            type="date" 
                            name="dateOfBirth" 
                            value={formData.dateOfBirth} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trình độ hiện tại</label>
                        <select 
                            name="skillLevel" 
                            value={formData.skillLevel} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none appearance-none"
                        >
                            <option value="">-- Chọn trình độ --</option>
                            <option value="Kid 1">Kid 1 (Cơ bản)</option>
                            <option value="Kid 2">Kid 2 (Nâng cao)</option>
                            {[...Array(10)].map((_, i) => (
                                <option key={i+1} value={`Level ${i+1}`}>Level {i+1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Giáo viên phụ trách</label>
                         <select 
                            name="teacherId" 
                            value={formData.teacherId} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                        >
                            <option value="">-- Chọn giáo viên --</option>
                            {teachers.map(t => (
                                <option key={t._id} value={t._id}>{t.fullName || t.username}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                                placeholder="Địa chỉ liên hệ" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: PHỤ HUYNH --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><User size={18}/></span>
                    Thông tin Phụ huynh
                </h3>
                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                      <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                          <input 
                            type="text" 
                            name="parentPhone" 
                            value={formData.parentPhone} 
                            onChange={handleChange} 
                            required 
                            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                            placeholder="0912..." 
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Dùng để tạo tài khoản đăng nhập cho phụ huynh</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên phụ huynh</label>
                      <input 
                        type="text" 
                        name="parentName" 
                        value={formData.parentName} 
                        onChange={handleChange} 
                        className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                        placeholder="Họ tên phụ huynh" 
                      />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Tùy chọn)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                                type="email" 
                                name="parentEmail" 
                                value={formData.parentEmail} 
                                onChange={handleChange} 
                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                                placeholder="email@example.com" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: LỊCH HỌC & HỌC PHÍ --- */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Calendar size={18}/></span>
                    Lịch học & Học phí
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Chọn ngày học trong tuần <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2 mb-4">
                             {[ {l:"CN",v:0}, {l:"T2",v:1}, {l:"T3",v:2}, {l:"T4",v:3}, {l:"T5",v:4}, {l:"T6",v:5}, {l:"T7",v:6} ].map(d => (
                                 <div 
                                    key={d.v}
                                    onClick={() => handleDayToggle(d.v)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all border
                                        ${formData.scheduleDays.includes(d.v) 
                                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105" 
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                                 >
                                     <span className="font-semibold text-sm">{d.l}</span>
                                 </div>
                             ))}
                        </div>

                        {/* Validated Time Inputs per Selected Day */}
                        {formData.scheduleDays.length > 0 && (
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Giờ học chi tiết</label>
                                {formData.scheduleDays.map(day => (
                                    <div key={day} className="flex items-center gap-3">
                                        <span className="text-sm font-medium w-12 text-gray-700">
                                            {['CN','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'][day]}:
                                        </span>
                                        <div className="relative flex-1">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                                            <input 
                                                type="time" 
                                                value={formData.scheduleTimes[day] || "18:00"} 
                                                onChange={(e) => handleTimeChange(day, e.target.value)}
                                                className="block w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tổng số buổi</label>
                        <input 
                            type="number" 
                            name="sessionsTotal" 
                            value={formData.sessionsTotal} 
                            onChange={handleChange} 
                            className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none" 
                        />
                        <p className="text-xs text-gray-400 mt-1.5">Số lượng buổi học của khóa (Mặc định 16)</p>
                    </div>
                </div>
            </div>

      </form>
    </div>
  );
};

export default StudentForm;

