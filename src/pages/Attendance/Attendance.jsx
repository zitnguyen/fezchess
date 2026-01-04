import React, { useState, useEffect } from 'react';
import { Calendar, Search, ChevronDown, Save, ClipboardCheck, Filter, CheckCircle, XCircle } from 'lucide-react';
import classService from '../../services/classService';
import enrollmentService from '../../services/enrollmentService';
import attendanceService from '../../services/attendanceService';

const Attendance = () => {

    // State
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // Success/Error message

    // Load Classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classService.getAll();
                const classList = Array.isArray(data) ? data : (data.classes || []);
                setClasses(classList);
                if (classList.length > 0) {
                    setSelectedClass(classList[0]._id || classList[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
            }
        };
        fetchClasses();
    }, []);

    // Load Students & Attendance when Class or Date changes
    useEffect(() => {
        if (!selectedClass) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get Students (Enrollments)
                const enrollmentsData = await enrollmentService.getAll({ classId: selectedClass });
                const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData.enrollments || []);
                
                // 2. Get Existing Attendance
                const attendanceData = await attendanceService.getAll({ 
                    classId: selectedClass, 
                    date: selectedDate 
                });
                const attendanceRecords = Array.isArray(attendanceData) ? attendanceData : (attendanceData.attendance || []);

                // 3. Merge Data
                const mergedData = enrollments.map(enrollment => {
                    if (!enrollment) return null;
                    const studentId = enrollment.studentId?._id || enrollment.studentId;
                    const existingRecord = attendanceRecords.find(r => 
                        (r.studentId?._id || r.studentId) === studentId
                    );

                    return {
                        id: studentId,
                        name: enrollment.studentId?.fullName || 'Unknown',
                        status: existingRecord ? existingRecord.status : 'present', // Default to present
                        note: existingRecord ? existingRecord.note : '',
                        recordId: existingRecord ? existingRecord._id : null
                    };
                }).filter(Boolean); // Filter out nulls
                
                setStudents(mergedData);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedClass, selectedDate]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudents(students.map(s => 
            s.id === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleNoteChange = (studentId, note) => {
        setStudents(students.map(s => 
            s.id === studentId ? { ...s, note } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // Save each student's attendance
            const promises = students.map(student => {
                if (student.status === 'present') {
                    return attendanceService.markPresent({
                        classId: selectedClass,
                        studentId: student.id,
                        date: selectedDate
                    });
                } else {
                    return attendanceService.markAbsent({
                        classId: selectedClass,
                        studentId: student.id,
                        date: selectedDate,
                        reason: student.note
                    });
                }
            });

            await Promise.all(promises);
            setMessage({ type: 'success', text: 'Đã lưu điểm danh thành công!' });
            
            // Clear message after 3s
            setTimeout(() => setMessage(null), 3000);

        } catch (err) {
            console.error("Failed to save attendance", err);
            setMessage({ type: 'error', text: 'Lỗi khi lưu điểm danh.' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'present': return '#10B981'; // Green
            case 'late': return '#F59E0B'; // Orange
            case 'absent': return '#EF4444'; // Red
            default: return '#6B7280';
        }
    };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
            <h1>Điểm Danh Lớp Học</h1>
            <p className="page-subtitle">Quản lý chuyên cần học viên theo ngày và lớp học.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={18} />
                <span>{saving ? 'Đang lưu...' : 'Lưu Điểm Danh'}</span>
            </button>
        </div>
      </div>

      {message && (
          <div style={{
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
              border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`
          }}>
              {message.text}
          </div>
      )}

      <div className="control-bar" style={{ alignItems: 'end' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Chọn Lớp Học</label>
                <div style={{ position: 'relative' }}>
                    <select 
                        style={{ width: '240px', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', appearance: 'none', background: 'white' }}
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {classes.map(cls => (
                            <option key={cls._id || cls.id} value={cls._id || cls.id}>{cls.className || cls.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none', color: '#6B7280' }} />
                </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
                 <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Ngày điểm danh</label>
                 <div style={{ position: 'relative' }}>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '180px', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E5E7EB' }} 
                    />
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                 </div>
            </div>
        </div>

        <div className="stats" style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: '500' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981' }}>
                <CheckCircle size={18} />
                <span>Có mặt: {students.filter(s => s.status === 'present').length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
                <XCircle size={18} />
                <span>Vắng: {students.filter(s => s.status === 'absent').length}</span>
            </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Đang tải danh sách học viên...</div>
        ) : students.length === 0 ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Lớp này chưa có học viên nào.</div>
        ) : (
        <table className="data-table">
            <thead>
                <tr>
                    <th style={{ width: '60px' }}>STT</th>
                    <th>Học viên</th>
                    <th style={{ textAlign: 'center' }}>Trạng thái</th>
                    <th>Ghi chú / Lý do vắng</th>
                </tr>
            </thead>
            <tbody>
                {students.map((student, index) => (
                    <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td style={{ fontWeight: '600', color: '#111827' }}>{student.name}</td>
                        <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', background: '#F3F4F6', padding: '4px', borderRadius: '8px' }}>
                                <button 
                                    onClick={() => handleStatusChange(student.id, 'present')}
                                    style={{ 
                                        padding: '6px 16px', borderRadius: '6px', border: 'none', 
                                        fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                        background: student.status === 'present' ? 'white' : 'transparent',
                                        color: student.status === 'present' ? '#10B981' : '#6B7280',
                                        boxShadow: student.status === 'present' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Có mặt
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(student.id, 'absent')}
                                    style={{ 
                                        padding: '6px 16px', borderRadius: '6px', border: 'none', 
                                        fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                        background: student.status === 'absent' ? 'white' : 'transparent',
                                        color: student.status === 'absent' ? '#EF4444' : '#6B7280',
                                        boxShadow: student.status === 'absent' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Vắng
                                </button>
                            </div>
                        </td>
                        <td>
                            <input 
                                type="text" 
                                placeholder={student.status === 'absent' ? "Nhập lý do vắng..." : "Ghi chú thêm..."}
                                value={student.note}
                                onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                style={{ 
                                    width: '100%', padding: '8px 12px', borderRadius: '6px', 
                                    border: '1px solid #E5E7EB', fontSize: '14px',
                                    outlineColor: '#2563EB'
                                }} 
                            />
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

export default Attendance;
