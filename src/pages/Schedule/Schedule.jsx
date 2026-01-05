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
                background: '#1F2937', // Dark background as per image
                borderRadius: '12px', 
                border: '1px solid #374151',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                color: '#E5E7EB'
            }}>
                {/* Header Row */}
                <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
                    <div style={{ width: '60px', borderRight: '1px solid #374151', flexShrink: 0 }}></div>
                    {daysInView.map((day, index) => {
                        const isToday = new Date().toDateString() === day.toDateString();
                        return (
                             <div key={index} style={{ flex: 1, padding: '12px', textAlign: 'center', borderRight: index < 6 ? '1px solid #374151' : 'none' }}>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#9CA3AF', marginBottom: '4px' }}>
                                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}
                                </div>
                                <div style={{ 
                                    fontSize: '24px', 
                                    fontWeight: 'bold', 
                                    width: '36px', 
                                    height: '36px', 
                                    lineHeight: '36px',
                                    borderRadius: '50%',
                                    background: isToday ? '#2563EB' : 'transparent',
                                    color: isToday ? 'white' : '#F3F4F6',
                                    margin: '0 auto'
                                }}>
                                    {day.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Body - Scrollable */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {hours.map((hour) => (
                        <div key={hour} style={{ display: 'flex', minHeight: '80px', borderBottom: '1px solid #374151' }}>
                            {/* Time Column */}
                            <div style={{ 
                                width: '60px', 
                                borderRight: '1px solid #374151', 
                                flexShrink: 0,
                                padding: '8px',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#9CA3AF',
                                position: 'relative'
                            }}>
                                {hour.toString().padStart(2, '0')}:00
                            </div>

                            {/* Day Cells */}
                            {daysInView.map((day, index) => {
                                const events = getEventsForCell(day, hour);
                                return (
                                    <div key={index} style={{ flex: 1, borderRight: index < 6 ? '1px solid #374151' : 'none', position: 'relative', padding: '4px' }}>
                                         {events.map(student => (
                                             <div key={student._id || student.id} style={{
                                                 background: 'rgba(59, 130, 246, 0.2)',
                                                 borderLeft: '3px solid #3B82F6',
                                                 padding: '4px 8px',
                                                 borderRadius: '4px',
                                                 fontSize: '12px',
                                                 color: '#93C5FD',
                                                 marginBottom: '4px',
                                                 cursor: 'pointer'
                                             }}>
                                                <div style={{fontWeight: '600'}}>
                                                    {student.fullName}
                                                </div>
                                                 <div style={{fontSize: '10px'}}>{student.schedule?.time}</div>
                                             </div>
                                         ))}
                                         
                                         {/* Red line for current time - approximate */}
                                         {/* Logic for red line would go here if needed */}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Schedule;
