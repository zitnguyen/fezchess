import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Admin Pages
import Dashboard from './pages/admin/Dashboard/Dashboard';
import TeacherList from './pages/admin/Teachers/TeacherList';
import TeacherForm from './pages/admin/Teachers/TeacherForm';
import StudentList from './pages/admin/Students/StudentList';
import StudentForm from './pages/admin/Students/StudentForm';
import Finance from './pages/admin/Finance/Finance';
import Attendance from './pages/admin/Attendance/Attendance';
import EnrollmentList from './pages/admin/Enrollments/EnrollmentList';
import EnrollmentForm from './pages/admin/Enrollments/EnrollmentForm';
import Schedule from './pages/admin/Schedule/Schedule';
import ParentList from './pages/admin/Parents/ParentList';
import ParentForm from './pages/admin/Parents/ParentForm';

// Layouts
import ParentLayout from './layouts/ParentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';
import PublicLayout from './components/layout/PublicLayout'; // Using the component version

// Portal Pages
import ParentDashboard from './pages/portal/Parent/ParentDashboard';
import ParentSchedule from './pages/portal/Parent/ParentSchedule';

import TeacherDashboard from './pages/portal/Teacher/Dashboard/TeacherDashboard';
import TeachingLogList from './pages/portal/Teacher/Payroll/TeachingLogList';
import AssessmentList from './pages/portal/Teacher/Assessment/AssessmentList';

import StudentDashboard from './pages/portal/Student/Dashboard/StudentDashboard';
import StudentSchedule from './pages/portal/Student/Schedule/StudentSchedule';
import StudentProfile from './pages/portal/Student/Profile/StudentProfile';

// Auth & Public
import Login from './pages/auth/Login/Login';
import HomePage from './pages/public/HomePage';
import TestRegisterPage from './pages/public/TestRegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/test-register" element={<TestRegisterPage />} />
          <Route path="/courses" element={<div className="pt-20 text-center text-gray-500">Courses Page Coming Soon</div>} /> 
          <Route path="/teachers" element={<div className="pt-20 text-center text-gray-500">Teachers Page Coming Soon</div>} />
          <Route path="/contact" element={<div className="pt-20 text-center text-gray-500">Contact Page Coming Soon</div>} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/teachers" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><TeacherList /></MainLayout></ProtectedRoute>} />
        <Route path="/teachers/new" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><TeacherForm /></MainLayout></ProtectedRoute>} />
        <Route path="/teachers/:id/edit" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><TeacherForm /></MainLayout></ProtectedRoute>} />
        
        <Route path="/students" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><StudentList /></MainLayout></ProtectedRoute>} />
        <Route path="/students/new" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><StudentForm /></MainLayout></ProtectedRoute>} />
        <Route path="/students/:id/edit" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><StudentForm /></MainLayout></ProtectedRoute>} />
        
        <Route path="/parents" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><ParentList /></MainLayout></ProtectedRoute>} />
        <Route path="/parents/new" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><ParentForm /></MainLayout></ProtectedRoute>} />
        <Route path="/parents/:id" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><ParentForm /></MainLayout></ProtectedRoute>} />

        <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><EnrollmentList /></MainLayout></ProtectedRoute>} />
        <Route path="/enrollments/new" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><EnrollmentForm /></MainLayout></ProtectedRoute>} />
        <Route path="/enrollments/:id/edit" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><EnrollmentForm /></MainLayout></ProtectedRoute>} />

        <Route path="/schedule" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><Schedule /></MainLayout></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><Attendance /></MainLayout></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout><Finance /></MainLayout></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherLayout>
                    <Routes>
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="payroll" element={<TeachingLogList />} />
                        <Route path="assessments" element={<AssessmentList />} />
                        <Route path="*" element={<div className="p-10">Teacher Page Coming Soon</div>} />
                    </Routes>
                </TeacherLayout>
            </ProtectedRoute>
        } />

        {/* Parent Routes */}
        <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="/parent/*" element={
            <ProtectedRoute allowedRoles={['Parent']}>
                <ParentLayout>
                    <Routes>
                        <Route path="dashboard" element={<ParentDashboard />} />
                        <Route path="schedule" element={<ParentSchedule />} />
                        <Route path="*" element={<div className="p-10">Parent Page Coming Soon</div>} />
                    </Routes>
                </ParentLayout>
            </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['Student']}>
                <StudentLayout>
                    <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="schedule" element={<StudentSchedule />} />
                        <Route path="profile" element={<StudentProfile />} />
                        <Route path="*" element={<div className="p-10">Student Page Coming Soon</div>} />
                    </Routes>
                </StudentLayout>
            </ProtectedRoute>
        } />
        
        <Route path="*" element={<div className="p-20 text-center">Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
