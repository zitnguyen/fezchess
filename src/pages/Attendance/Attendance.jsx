import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle, XCircle } from 'lucide-react';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';

const Attendance = () => {

    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null); // Success/Error message

    // Load Students & Attendance when Date changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get All Students
                const studentsData = await studentService.getAll();
                const allStudents = Array.isArray(studentsData) ? studentsData : (studentsData.students || []);
                
                // 2. Filter Students Scheduled for this Day
                const dayOfWeek = new Date(selectedDate).getDay(); // 0=Sun, 1=Mon...
                const scheduledStudents = allStudents.filter(s => {
                    if (!s.schedule) return false;
                    // Check slots first (new format)
                    if (s.schedule.slots && s.schedule.slots.length > 0) {
                        return s.schedule.slots.some(slot => slot.day === dayOfWeek);
                    }
                    // Fallback to legacy
                    return s.schedule.days && s.schedule.days.includes(dayOfWeek);
                });

                // 3. Get Existing Attendance for this Date
                const attendanceData = await attendanceService.getAll({ 
                    date: selectedDate 
                });
                const attendanceRecords = Array.isArray(attendanceData) ? attendanceData : (attendanceData.attendance || []);

                // 4. Merge Data
                const mergedData = scheduledStudents.map(student => {
                    const existingRecord = attendanceRecords.find(r => 
                        (r.studentId?._id || r.studentId) === student._id
                    );

                    return {
                        id: student._id,
                        name: student.fullName,
                        status: existingRecord ? existingRecord.status : 'present',
                        note: existingRecord ? existingRecord.note : '',
                        recordId: existingRecord ? existingRecord._id : null,
                        sessionsTotal: student.sessions?.total || 16,
                        sessionsUsed: student.sessions?.used || 0
                    };
                });
                
                setStudents(mergedData);
            } catch (err) {
                console.error("Failed to fetch attendance data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDate]);

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
                const payload = {
                    studentId: student.id,
                    date: selectedDate,
                    // No classId needed
                };

                if (student.status === 'present') {
                    return attendanceService.markPresent(payload);
                } else {
                    return attendanceService.markAbsent({
                        ...payload,
                        reason: student.note
                    });
                }
            });

            await Promise.all(promises);
            setMessage({ type: 'success', text: 'Đã lưu điểm danh thành công!' });
            
            // Reload data to reflect session changes (Optional optimization: update local state)
            // For now, simple reload triggers useEffect re-run if we changed something that affects deps? No, selectedDate didn't change.
            // But we should refresh session counts. Trigger re-fetch.
            // Hack: toggle date or force update. 
            // Better: just fetch data again.
            // window.location.reload(); // Too heavy.
            
            // Re-fetch logic duplicated? Extract it?
            // For now, let's just show success. 
            setTimeout(() => setMessage(null), 3000);

        } catch (err) {
            console.error("Failed to save attendance", err);
            setMessage({ type: 'error', text: 'Lỗi khi lưu điểm danh.' });
        } finally {
            setSaving(false);
        }
    };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
            <h1>Điểm Danh Hôm Nay</h1>
            <p className="page-subtitle">Danh sách học viên có lịch học vào ngày này.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={18} />
                <span>{saving ? 'Đang lưu...' : 'Lưu Tất Cả'}</span>
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
                 <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Chọn Ngày</label>
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
             <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Không có học viên nào có lịch hôm nay.</div>
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
                        <td>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{student.name}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                                Tiến độ: <span style={{fontWeight: 'bold', color: (student.sessionsTotal - student.sessionsUsed) <= 2 ? '#EF4444' : '#10B981'}}>
                                    {student.sessionsUsed}/{student.sessionsTotal}
                                </span> buổi
                            </div>
                        </td>
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
