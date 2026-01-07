import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Dynamic import to avoid circular dependency issues if any, or just standard import
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

    // Helper to get days in the current week view
    const getDaysInView = () => {
        const days = [];
        const start = new Date(currentDate);
        const day = start.getDay();
        // Adjust to Monday (1) - Sunday (7) view, or Sunday(0) based.
        // Vietnamese calendars often start Monday. 
        // Screenshot shows "Thứ 2", "Thứ 3"... "Chủ Nhật".
        // Let's assume start.getDay() returns 0 for Sunday.
        // We want to verify if 'currentDate' is in the week we want to show.
        // Let's just find the Monday of the current week.
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(start.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const daysInView = getDaysInView();
    const today = new Date();

    // Helper to check if a student is on a specific day and time
    const getEventsForCell = (day, hour) => {
        const currentDayVal = day.getDay(); // 0-6

        return students.filter(student => {
            if (!student.schedule) return false;
            
            // Handle "slots" format (new)
            if (student.schedule.slots && student.schedule.slots.length > 0) {
                return student.schedule.slots.some(slot => {
                    if (slot.day !== currentDayVal) return false;
                    const [h] = slot.time.split(':').map(Number);
                    return h === hour;
                });
            }
            
            // Handle "days/time" format (legacy)
            const days = student.schedule.days || [];
            if (!days.includes(currentDayVal)) return false;
            const time = student.schedule.time;
            if (!time) return false;
            const [h] = time.split(':').map(Number);
            return h === hour;
        });
    };

    // Calculate active hours to display
    const getActiveHours = () => {
        const activeHoursSet = new Set();
        students.forEach(s => {
            if (s.schedule) {
                 if (s.schedule.slots && s.schedule.slots.length > 0) {
                    s.schedule.slots.forEach(slot => {
                        if (slot.time) {
                            const [h] = slot.time.split(':').map(Number);
                            if (!isNaN(h)) activeHoursSet.add(h);
                        }
                    });
                } else if (s.schedule.time) {
                    const [h] = s.schedule.time.split(':').map(Number);
                    if (!isNaN(h)) activeHoursSet.add(h);
                }
            }
        });
        const hrs = Array.from(activeHoursSet).sort((a, b) => a - b);
        return hrs.length > 0 ? hrs : [8, 9, 10, 11, 14, 15, 16, 17, 18, 19]; // Default fallback
    };

    const activeHours = getActiveHours();

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const getDayName = (date) => {
        const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    return (
        <div className="page-container">
             {/* Header Section */}
             <div className="page-header" style={{marginBottom: '20px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div>
                        <h1>Lịch Học Viên</h1>
                        <p className="page-subtitle">Xem lịch học chi tiết của từng học viên theo tuần.</p>
                   </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigateWeek(-1)} className="btn-icon-outline"><ChevronLeft size={20}/></button>
                         <h3 style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
                            {formatDate(daysInView[0])} - {formatDate(daysInView[6])}
                        </h3>
                        <button onClick={() => navigateWeek(1)} className="btn-icon-outline"><ChevronRight size={20}/></button>
                        <button 
                            onClick={() => setCurrentDate(new Date())}
                            className="btn-secondary"
                            style={{ fontSize: '13px', padding: '6px 12px', marginLeft: '8px' }}
                        >
                            Hôm nay
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div style={{ 
                background: 'white', 
                borderRadius: '8px', 
                border: '1px solid #000000', 
                overflow: 'hidden' 
            }}>
                {/* Header Row */}
                <div style={{ display: 'flex', borderBottom: '1px solid #000000' }}>
                     {/* Empty Corner Cell for Time */}
                    <div style={{ 
                        width: '100px', 
                        flexShrink: 0, 
                        borderRight: '1px solid #000000',
                        background: '#F9FAFB'
                    }}></div>
                    
                    {/* Days Headers */}
                    {daysInView.map((day, index) => {
                        const isToday = day.toDateString() === today.toDateString();
                        return (
                            <div key={index} style={{ 
                                flex: 1, 
                                textAlign: 'center', 
                                borderRight: index < 6 ? '1px solid #000000' : 'none',
                                padding: '12px 4px',
                                background: '#F9FAFB'
                            }}>
                                <div style={{ 
                                    fontWeight: 'bold', 
                                    color: isToday ? '#2563EB' : '#374151',
                                    marginBottom: '4px'
                                }}>
                                    {getDayName(day)}
                                </div>
                                <div style={{ 
                                    fontSize: '13px', 
                                    color: isToday ? '#2563EB' : '#6B7280' 
                                }}>
                                    {formatDate(day)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Grid Body */}
                <div>
                    {activeHours.map((hour) => (
                        <div key={hour} style={{ display: 'flex', borderBottom: '1px solid #000000', minHeight: '120px' }}>
                            {/* Time Column */}
                            <div style={{ 
                                width: '100px', 
                                flexShrink: 0, 
                                borderRight: '1px solid #000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                color: '#111827'
                            }}>
                                {hour}:00
                            </div>

                            {/* Cells */}
                            {daysInView.map((day, index) => {
                                const events = getEventsForCell(day, hour);
                                return (
                                    <div key={index} style={{ 
                                        flex: 1, 
                                        borderRight: index < 6 ? '1px solid #000000' : 'none',
                                        padding: '8px',
                                        background: 'white'
                                    }}>
                                        {events.map(student => (
                                            <div key={student._id} style={{
                                                border: '1px solid #000000',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                background: 'white',
                                                boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                                                marginBottom: '8px',
                                                minHeight: '60px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    fontWeight: '700',
                                                    color: '#047857', // Green text as per image
                                                    fontSize: '14px',
                                                    marginBottom: '2px',
                                                    lineHeight: '1.2'
                                                }}>
                                                    {student.fullName}
                                                </div>
                                                <div style={{
                                                    fontSize: '12px',
                                                    color: '#6B7280'
                                                }}>
                                                    {student.skillLevel || 'Chưa xếp hạng'}
                                                </div>
                                            </div>
                                        ))}
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
