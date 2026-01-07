import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  DollarSign,
  UserPlus
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import axios from 'axios';
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import enrollmentService from "../../services/enrollmentService";
import financeService from "../../services/financeService";


const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [levelData, setLevelData] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState("0%");
  const [studentGrowth, setStudentGrowth] = useState("0%");
  const [classGrowth, setClassGrowth] = useState("0%");
  const [enrollmentGrowth, setEnrollmentGrowth] = useState("0%");
  const [newEnrollmentsCount, setNewEnrollmentsCount] = useState(0);

  // Fetch data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Students
      const studentsResponse = await studentService.getAll();
      const students = studentsResponse || [];
      setTotalStudents(students.length);

      // Time variables
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastMonthYear = lastMonthDate.getFullYear();

      // Calc Student Growth
      const studentsPriorToThisMonth = students.filter(s => {
          if (!s.enrollmentDate) return false;
          const d = new Date(s.enrollmentDate);
          return d < new Date(thisYear, thisMonth, 1);
      }).length;

      if (studentsPriorToThisMonth > 0) {
          const growth = ((students.length - studentsPriorToThisMonth) / studentsPriorToThisMonth) * 100;
          setStudentGrowth((growth > 0 ? "+" : "") + growth.toFixed(0) + "%");
      } else {
          setStudentGrowth(students.length > 0 ? "+100%" : "0%");
      }

      // 2. Fetch Enrollments
      const enrollments = await enrollmentService.getAll();
      
      const enrollmentsThisMonth = enrollments.filter(e => {
          const d = new Date(e.enrollmentDate);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;
      setNewEnrollmentsCount(enrollmentsThisMonth);

      const enrollmentsLastMonth = enrollments.filter(e => {
          const d = new Date(e.enrollmentDate);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      }).length;

      if (enrollmentsLastMonth > 0) {
          const eGrowth = ((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100;
          setEnrollmentGrowth((eGrowth > 0 ? "+" : "") + eGrowth.toFixed(0) + "%");
      } else {
          setEnrollmentGrowth(enrollmentsThisMonth > 0 ? "+100%" : "0%");
      }

      // Recent Enrollments Table Data (Top 5 this month)
      const recentEnr = enrollments.filter(e => {
         const d = new Date(e.enrollmentDate);
         return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      recentEnr.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
      setRecentEnrollments(recentEnr.slice(0, 5));


      // 3. Process Level Data (Dynamic)
      if (students.length > 0) {
        const levelCounts = {};
        students.forEach(s => {
           const lvl = s.skillLevel || 'Chưa xếp hạng';
           levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
        });

        const COLORS = ['#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#FAAD14', '#52C41A'];

        const newLevelData = Object.keys(levelCounts).map((key, index) => ({
            name: `${key} (${Math.round((levelCounts[key] / students.length) * 100)}%)`,
            value: levelCounts[key],
            fill: COLORS[index % COLORS.length]
        }));
        
        setLevelData(newLevelData);
      } else {
        setLevelData([]);
      }

      // 4. Fetch Classes
      const classesResponse = await classService.getAll();
      const classes = classesResponse || [];
      setTotalClasses(classes.length);

      const classesNewThisMonth = classes.filter(c => {
          const dStr = c.startDate || c.createdAt || c.created_at;
          if (!dStr) return false;
          const d = new Date(dStr);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;
      
      const classesPrior = classes.length - classesNewThisMonth;
      if (classesPrior > 0) {
          const cGrowth = (classesNewThisMonth / classesPrior) * 100;
          setClassGrowth((cGrowth > 0 ? "+" : "") + cGrowth.toFixed(0) + "%");
      } else {
          setClassGrowth(classesNewThisMonth > 0 ? "+100%" : "0%");
      }

      // 5. Finance Stats & Chart via Service
      const financeStatsRes = await financeService.getFinanceStats();
      if (financeStatsRes.success && financeStatsRes.data.length > 0) {
          setTotalRevenue(financeStatsRes.data[0].value);
          setRevenueGrowth(financeStatsRes.data[0].change);
      }

      const financeChartRes = await financeService.getFinanceChart();
      if (financeChartRes.success) {
          const mappedChartData = financeChartRes.data.map(item => ({
              name: item.name,
              value: item.income
          }));
          setRevenueData(mappedChartData);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Stat Cards Data
  const stats = [
    {
      label: "Tổng số học viên",
      value: totalStudents.toString(),
      change: studentGrowth,
      type: studentGrowth.includes('-') ? "decrease" : (studentGrowth === '0%' || studentGrowth === '+0%') ? "neutral" : "increase",
      icon: Users,
      color: "#e0f2fe",
      iconColor: "#2563EB",
      sub: "",
    },
    {
      label: "Lớp đang mở",
      value: totalClasses.toString(),
      change: classGrowth,
      type: classGrowth.includes('-') ? "decrease" : (classGrowth === '0%' || classGrowth === '+0%') ? "neutral" : "increase",
      icon: BookOpen,
      color: "#f3e8ff",
      iconColor: "#9333ea",
      sub: "",
    },

    {
      label: "Doanh thu tháng",
      value:
        totalRevenue > 0 ? `${(totalRevenue / 1000000).toFixed(0)}tr` : "0tr",
      change: revenueGrowth,
      type: revenueGrowth.includes('-') ? "decrease" : (revenueGrowth === '0%' || revenueGrowth === '+0%') ? "neutral" : "increase",
      icon: DollarSign,
      color: "#dcfce7",
      iconColor: "#16a34a",
      sub: "",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Tổng quan trung tâm</h1>
        <p className="dashboard-subtitle">
          Chào mừng quay trở lại, đây là tình hình hoạt động hôm nay.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div className="dashboard-stat-card" key={index}>
            <div className="stat-card-top">
              <div
                className="stat-icon-wrapper"
                style={{ background: stat.color, color: stat.iconColor }}
              >
                <stat.icon size={20} />
              </div>
              <span className={`stat-change ${stat.type}`}>{stat.change}</span>
            </div>
            <div className="stat-card-bottom">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value-large">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Doanh thu 6 tháng gần nhất</h3>
            <div className="chart-filter">6 tháng qua</div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === revenueData.length - 1 ? "#2563EB" : "#E5E7EB"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Phân bổ trình độ</h3>
          </div>
          <div className="chart-body flex-center">
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={levelData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-label-center">
                <div className="pie-total">{totalStudents}</div>
                <div className="pie-sub">Học viên</div>
              </div>
            </div>
            <div className="chart-legend">
              {levelData.map((item, index) => (
                <div className="legend-item" key={index}>
                  <span
                    className="legend-dot"
                    style={{ background: item.fill }}
                  ></span>
                  <span className="legend-text">{item.name}</span>
                  <span className="legend-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sections removed as per user request */}

    </div>
  );
};
export default Dashboard;
