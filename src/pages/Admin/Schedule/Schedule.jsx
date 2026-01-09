import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calculator, Calendar as CalendarIcon, Clock, Users, Loader2 } from 'lucide-react';
import studentService from '../../../services/studentService';

const Schedule = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
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
        // Adjust to Monday (1) - Sunday (7) view
        // In JS Date, Sunday is 0. If current day is Sunday (0), we need to go back 6 days to Monday.
        // If current day is Mon (1), we go back 0 days.
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
        // Default range if no data or sparse data, ensuring a reasonable calendar view
        if (hrs.length === 0) return [8, 9, 10, 11, 14, 15, 16, 17, 18, 19];
        
        // Fill in gaps to make the calendar look continuous if needed, or just show active hours
        // Let's create a continuous range from min to max hour found, plus some padding?
        // Actually, just showing specific active hours is efficient for sparse schedules.
        // But for a calendar look, continuous is better.
        const min = Math.min(...hrs, 8);
        const max = Math.max(...hrs, 19);
        const continuousHrs = [];
        for(let i=min; i<=max; i++) continuousHrs.push(i);
        return continuousHrs;
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
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col space-y-4">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="text-primary" size={24} />
                        Lịch Học Viên
                    </h1>
                     <p className="text-sm text-gray-500 mt-1">Xem chi tiết lịch học của tất cả học viên trong tuần</p>
                </div>
                 <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                     <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                        <ChevronLeft size={20}/>
                     </button>
                      <h3 className="min-w-[160px] text-center font-semibold text-gray-800 text-sm select-none">
                         {formatDate(daysInView[0])} - {formatDate(daysInView[6])}
                         <span className="text-xs font-normal text-gray-500 ml-2">({daysInView[0].getFullYear()})</span>
                     </h3>
                     <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                        <ChevronRight size={20}/>
                     </button>
                 </div>
                 <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm active:scale-95"
                 >
                     Hôm nay
                 </button>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
                {/* Header Row */}
                <div className="flex border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                     {/* Empty Corner Cell for Time */}
                    <div className="w-20 lg:w-24 flex-shrink-0 border-r border-gray-200 p-4 flex items-center justify-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Giờ
                    </div>
                    
                    {/* Days Headers */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200">
                        {daysInView.map((day, index) => {
                            const isToday = day.toDateString() === today.toDateString();
                            return (
                                <div key={index} className={`flex flex-col items-center justify-center py-4 ${isToday ? 'bg-blue-50/50' : ''}`}>
                                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                                        {getDayName(day)}
                                    </div>
                                    <div className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all
                                        ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-gray-700'}
                                    `}>
                                        {day.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mb-3 text-primary" size={32} />
                            <span className="text-sm">Đang tải lịch học...</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {activeHours.map((hour) => (
                                <div key={hour} className="flex min-h-[140px] group">
                                    {/* Time Column */}
                                    <div className="w-20 lg:w-24 flex-shrink-0 border-r border-gray-100 bg-gray-50/30 flex flex-col items-center justify-start py-4 group-hover:bg-gray-50 transition-colors">
                                        <span className="text-sm font-bold text-gray-700 font-mono">{hour}:00</span>
                                        <span className="text-xs text-gray-400 mt-1">{hour}:45</span>
                                    </div>

                                    {/* Cells */}
                                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100">
                                        {daysInView.map((day, index) => {
                                            const events = getEventsForCell(day, hour);
                                            const isToday = day.toDateString() === today.toDateString();
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`
                                                        p-2 transition-colors relative
                                                        ${isToday ? 'bg-blue-50/10' : 'bg-white'}
                                                        hover:bg-gray-50
                                                    `}
                                                >
                                                    {events.length > 0 ? (
                                                        <div className="flex flex-col gap-2 h-full">
                                                            {events.map(student => (
                                                                <div key={student._id} className="
                                                                    bg-white border text-[13px] border-l-4 border-l-primary/70 border-gray-200 rounded-r-lg p-2.5 shadow-sm hover:shadow-md transition-all 
                                                                    group/card cursor-pointer hover:-translate-y-0.5
                                                                ">
                                                                    <div className="font-bold text-gray-800 line-clamp-1 group-hover/card:text-primary transition-colors">
                                                                        {student.fullName}
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                                                                        <Users size={12} />
                                                                        <span className="truncate max-w-[80px]">
                                                                            {student.skillLevel || 'Chưa xếp hạng'}
                                                                        </span>
                                                                    </div>

                                                                    {student.teacherId && (
                                                                         <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-600/80 font-medium">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                                            <span className="truncate">
                                                                                GV: {student.teacherId.fullName || student.teacherId.username}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            {/* Placeholder for empty slot interaction if needed */}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {/* Empty state if no active hours but loaded */}
                             {!loading && activeHours.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    Không có lịch học nào để hiển thị.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #CBD5E1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94A3B8;
                }
            `}</style>
        </div>
    );
};

export default Schedule;
