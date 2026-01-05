import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import classService from '../../services/classService';

const Schedule = () => {
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Assuming studentService.getAll() exists and returns list of students
                // You might need to import studentService if not already
                const studentService = (await import('../../services/studentService')).default;
                const data = await studentService.getAll();
                setStudents(Array.isArray(data) ? data : data.students || []);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Generate days for the current view
    const getDaysInView = () => {
        const days = [];
        const start = new Date(currentDate);
        
        if (viewMode === 'week') {
            // Adjust to Monday of current week
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            start.setDate(diff);

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                days.push(d);
            }
        } else {
             // Month view logic (Simplified: First to Last day of month)
             // For now just showing week logic as it was default, 
             // or implementing simple month logic if needed. 
             // Let's stick to week loop for now but initialized for month?
             // Reverting to original week logic for safety as viewMode state default is 'week'
             // If month view needed, we need more logic. 
        }
        return days;
    };

    const daysInView = getDaysInView();
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 to 23:00

    // Helper to check if a student is on a specific day and time
    const getEventsForCell = (day, hour) => {
        // day.getDay(): 0=Sun, 1=Mon...6=Sat
        const currentDayVal = day.getDay();

        return students.filter(student => {
            if (!student.schedule) return false;
            
            // Check day
            const days = student.schedule.days || [];
            if (!days.includes(currentDayVal)) return false;

            // Check time "18:00"
            if (!student.schedule.time) return false;
            const [h, m] = student.schedule.time.split(':').map(Number);
            
            // Matches if hour is same (simple logic)
            // Or if within range (assuming 1.5h duration?)
            // Let's assume hour match for start time for now
            return h === hour;
        });
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    return (
        <div className="page-container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Controls */}
            <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
                <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                    <div>
                        <h1>Lịch Học</h1>
                        <p className="page-subtitle">Quản lý thời khóa biểu các lớp học.</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     {/* View Mode Toggle */}
                    <div style={{ background: '#F3F4F6', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                        <button 
                            onClick={() => setViewMode('week')}
                            style={{ 
                                padding: '6px 16px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                background: viewMode === 'week' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'week' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                                color: viewMode === 'week' ? '#111827' : '#6B7280'
                            }}
                        >
                            Tuần
                        </button>
                        <button 
                             onClick={() => setViewMode('month')}
                             style={{ 
                                padding: '6px 16px', 
                                border: 'none', 
                                borderRadius: '6px', 
                                background: viewMode === 'month' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'month' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                                color: viewMode === 'month' ? '#111827' : '#6B7280'
                            }}
                        >
                            Tháng
                        </button>
                    </div>

                    <div style={{ borderLeft: '1px solid #E5E7EB', height: '32px' }}></div>

                    {/* Filter Removed */}
                </div>
            </div>

            {/* Calendar Controls (Nav) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => navigateWeek(-1)} className="btn-icon-outline"><ChevronLeft size={20}/></button>
                        <button onClick={() => navigateWeek(1)} className="btn-icon-outline"><ChevronRight size={20}/></button>
                    </div>
                    <h3 style={{ margin: 0 }}>
                        Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
                    </h3>
                </div>
                <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="btn-secondary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                >
                    Hôm nay
                </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ 
                flex: 1, 
                background: '#FFFFFF', 
                borderRadius: '12px', 
                border: '2px solid #000000', // Black border as requested
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                color: '#000000'
            }}>
                {/* Header Row */}
                <div style={{ display: 'flex', borderBottom: '2px solid #000000' }}>
                    <div style={{ width: '80px', borderRight: '1px solid #000000', flexShrink: 0, padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                        THỜI GIAN
                    </div>
                    {daysInView.map((day, index) => {
                        const isToday = new Date().toDateString() === day.toDateString();
                        // Check if this day has ANY events
                        // Not strictly requested to hide empty DAY columns but to hide empty "slots". 
                        // Keeping 7 days structure is safer for "Calendar".
                        return (
                             <div key={index} style={{ flex: 1, padding: '12px', textAlign: 'center', borderRight: index < 6 ? '1px solid #000000' : 'none', background: isToday ? '#EFF6FF' : 'white' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    {['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day.getDay()]}
                                </div>
                                <div style={{ 
                                    fontSize: '24px', 
                                    fontWeight: 'bold', 
                                    color: isToday ? '#2563EB' : '#111827',
                                }}>
                                    {day.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Body - Auto Height based on content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {(() => {
                        // 1. Calculate Active Hours from Students schedules
                        const activeHoursSet = new Set();
                        students.forEach(s => {
                            if (s.schedule) {
                                // Support new 'slots' format
                                if (s.schedule.slots && s.schedule.slots.length > 0) {
                                    s.schedule.slots.forEach(slot => {
                                        if (slot.time) {
                                            const [h] = slot.time.split(':').map(Number);
                                            if (!isNaN(h)) activeHoursSet.add(h);
                                        }
                                    });
                                } 
                                // Support legacy 'time' format
                                else if (s.schedule.time) {
                                    const [h] = s.schedule.time.split(':').map(Number);
                                    if (!isNaN(h)) activeHoursSet.add(h);
                                }
                            }
                        });
                        
                        let activeHours = Array.from(activeHoursSet).sort((a, b) => a - b);

                        if (activeHours.length === 0) {
                            return (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                                    Chưa có lịch học nào.
                                </div>
                            );
                        }

                        // Helper to filter students for a cell
                        const getEventsForCell = (day, hour) => {
                            const currentDayVal = day.getDay();
                            
                            return students.filter(student => {
                                if (!student.schedule) return false;
                                
                                // New Format: Slots
                                if (student.schedule.slots && student.schedule.slots.length > 0) {
                                    return student.schedule.slots.some(slot => {
                                        if (slot.day !== currentDayVal) return false;
                                        const [h] = slot.time.split(':').map(Number);
                                        return h === hour;
                                    });
                                }
                                
                                // Legacy Format
                                const days = student.schedule.days || [];
                                if (!days.includes(currentDayVal)) return false;
                                const time = student.schedule.time;
                                if (!time) return false;
                                const [h] = time.split(':').map(Number);
                                return h === hour;
                            });
                        };

                        return activeHours.map((hour) => (
                            <div key={hour} style={{ display: 'flex', minHeight: '100px', borderBottom: '1px solid #000000' }}>
                                {/* Time Column */}
                                <div style={{ 
                                    width: '80px', 
                                    borderRight: '1px solid #000000', 
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    background: '#F9FAFB'
                                }}>
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                {/* Day Cells */}
                                {daysInView.map((day, index) => {
                                    const events = getEventsForCell(day, hour);
                                    return (
                                        <div key={index} style={{ 
                                            flex: 1, 
                                            borderRight: index < 6 ? '1px solid #000000' : 'none', 
                                            padding: '8px',
                                            background: events.length > 0 ? '#F0FDF4' : 'white' 
                                        }}>
                                             {events.map(student => (
                                                 <div key={student._id || student.id} style={{
                                                     background: 'white',
                                                     border: '1px solid #000000',
                                                     padding: '8px',
                                                     borderRadius: '4px',
                                                     marginBottom: '8px',
                                                     boxShadow: '2px 2px 0px #000000' 
                                                 }}>
                                                    <div style={{fontWeight: 'bold'}}>
                                                        {student.fullName}
                                                    </div>
                                                 </div>
                                             ))}
                                        </div>
                                    );
                                })}
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
