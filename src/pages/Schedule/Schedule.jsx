import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import classService from '../../services/classService';

const Schedule = () => {
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classService.getAll();
                setClasses(Array.isArray(data) ? data : data.classes || []);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
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
        }
        return days;
    };

    const daysInView = getDaysInView();
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 to 23:00

    // Helper to check if a class is on a specific day and time (approximate parsing)
    const getEventsForCell = (day, hour) => {
        const dayStrMap = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };
        const currentDayStr = dayStrMap[day.getDay()];

        return classes.filter(cls => {
            if (selectedClass !== 'all' && cls._id !== selectedClass) return false;
            
            // Parse schedule string: "T2/T4 (18:00)"
            if (!cls.schedule) return false;

            const isDayMatch = cls.schedule.includes(currentDayStr);
            if (!isDayMatch) return false;

            // Parse time: (18:00) or (18:00 - 19:30)
            const timeMatch = cls.schedule.match(/\((\d{1,2}):/);
            if (timeMatch) {
                const startHour = parseInt(timeMatch[1], 10);
                return startHour === hour;
            }
            return false;
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

                    {/* Filter */}
                    <div style={{position:'relative'}}>
                        <select 
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{
                                padding: '8px 12px 8px 36px',
                                borderRadius: '6px',
                                border: '1px solid #D1D5DB',
                                appearance: 'none',
                                background: 'white',
                                minWidth: '200px'
                            }}
                        >
                            <option value="all">Tất cả các lớp</option>
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                        <Filter size={16} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#6B7280'}} />
                    </div>
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
                                         {events.map(ev => (
                                             <div key={ev._id} style={{
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
                                                    {ev.students && ev.students.length > 0
                                                        ? ev.students.map(s => s.fullName).join(', ')
                                                        : ev.className
                                                    }
                                                </div>
                                                 {/* <div style={{fontSize: '10px'}}>{ev.schedule}</div> */}
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
