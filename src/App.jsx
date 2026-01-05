import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import TeacherList from './pages/Teachers/TeacherList';
import TeacherForm from './pages/Teachers/TeacherForm';
import StudentList from './pages/Students/StudentList';
import StudentForm from './pages/Students/StudentForm';
import ClassList from './pages/Classes/ClassList';
import ClassForm from './pages/Classes/ClassForm';
import CourseList from './pages/Courses/CourseList';
import CourseForm from './pages/Courses/CourseForm';
import Finance from './pages/Finance/Finance';
import Attendance from './pages/Attendance/Attendance';
import EnrollmentList from './pages/Enrollments/EnrollmentList';
import EnrollmentForm from './pages/Enrollments/EnrollmentForm';
import Schedule from './pages/Schedule/Schedule';
import ParentList from './pages/Parents/ParentList';
import ParentForm from './pages/Parents/ParentForm';
import ParentLayout from './layouts/ParentLayout';
import ParentDashboard from './pages/ParentPortal/ParentDashboard';
import ParentSchedule from './pages/ParentPortal/ParentSchedule';
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboard from './pages/TeacherPortal/Dashboard/TeacherDashboard';
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/StudentPortal/Dashboard/StudentDashboard';
import StudentSchedule from './pages/StudentPortal/Schedule/StudentSchedule';
import StudentProfile from './pages/StudentPortal/Profile/StudentProfile';


import Login from './pages/Login/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <TeacherList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/teachers/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <TeacherForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/teachers/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <TeacherForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <StudentList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/students/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <StudentForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/parents" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ParentList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/parents/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ParentForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/parents/:id" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ParentForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/students/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <StudentForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ClassList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/classes/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ClassForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/classes/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <ClassForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <CourseList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <CourseForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <CourseForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/finance" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <Finance />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <Attendance />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/enrollments" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <EnrollmentList />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <Schedule />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/enrollments/new" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <EnrollmentForm />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/enrollments/:id/edit" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout>
               <EnrollmentForm />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherLayout>
                    <Routes>
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="*" element={<div>Teacher Page Coming Soon</div>} />
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
                        <Route path="*" element={<div>Parent Page Coming Soon</div>} />
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
                        <Route path="*" element={<div>Student Page Coming Soon</div>} />
                    </Routes>
                </StudentLayout>
            </ProtectedRoute>
        } />
        
        <Route path="*" element={<div>Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
