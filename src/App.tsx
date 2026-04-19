import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';
import Login from './pages/public/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import LecturerOnboarding from './pages/Admin/lecturer/LecturerOnboarding';
import Announcements from './pages/Admin/communication/Announcements';
import NewAnnounce from './pages/Admin/communication/NewAnnounce';
import Messages from './pages/Admin/communication/Messages';
import Establishment from './pages/Admin/university/establishment/Establishment';
import NewEstablishment from './pages/Admin/university/establishment/NewEstablishment';
import EstablishmentDetails from './pages/Admin/university/establishment/EstablishmentDetails';
import Cycle from './pages/Admin/university/cycle/Cycle';
import NewCycle from './pages/Admin/university/cycle/NewCycle';
import CycleDetails from './pages/Admin/university/cycle/CycleDetails';
import Class from './pages/Admin/university/class/Class';
import NewClass from './pages/Admin/university/class/NewClass';
import ClassDetails from './pages/Admin/university/class/ClassDetails';
import Genie from './pages/Admin/university/genie/Genie';
import NewGenie from './pages/Admin/university/genie/NewGenie';
import GenieDetails from './pages/Admin/university/genie/GenieDetails';
import Course from './pages/Admin/university/course/Course';
import PrivateRoute from './services/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Department from './pages/Admin/university/department/Department';
import NewDepartment from './pages/Admin/university/department/NewDepartment';
import DepartmentDetails from './pages/Admin/university/department/DepartmentDetails';
import NewCourse from "./pages/Admin/university/course/NewCourse";
import CourseDetails from "./pages/Admin/university/course/CourseDetails";
import NotFound from "./pages/public/NotFound";
import Dashboard from "./pages/Admin/dashboard/Dashboard";
import Module from "./pages/Admin/university/modules/Module";
import NewModule from "./pages/Admin/university/modules/NewModule";
import ModuleDetails from "./pages/Admin/university/modules/ModuleDetails";
import Unauthorized from "./pages/public/Unauthorized";
import StudentLayout from "./pages/Student/StudentLayout";
import LecturerLayout from './pages/Lecturer/LecturerLayout';
import Home from "./pages/Student/Home/Home";
import Materials from "./pages/Student/Materials/materials";
import StudentQuiz from "./pages/Student/Quiz/Quiz";
import StudentForum from "./pages/Student/Forum/Forum";
import StudentModuleDetail from "./pages/Student/ModuleDetail/ModuleDetail";
import EnrolledStudent from "./pages/Admin/student/EnrolledStudent";
import StudentDetails from "./pages/Admin/student/StudentDetails";
import LecturerDetails from "./pages/Admin/lecturer/LecturerDetails";
import NewStudent from "./pages/Admin/student/NewStudent";
import NewLecturer from "./pages/Admin/lecturer/NewLecturer";
import Profile from "./pages/Student/Profile/Profile";
import Grades from "./pages/Student/Grades/Grades";
import Leaderboard from "./pages/Student/Leaderboard/Leaderboard";
import Mentorship from "./pages/Student/Mentorship/Mentorship";
import LecturerHome from "./pages/Lecturer/Home/Home";
import LecturerMaterials from "./pages/Lecturer/Materials/materials";
import LecturerQuiz from "./pages/Lecturer/Quiz/Quiz";
import LecturerForum from "./pages/Lecturer/Forum/Forum";
import LecturerModuleDetail from "./pages/Lecturer/ModuleDetail/ModuleDetail";
import LecturerProfile from "./pages/Lecturer/Profile/Profile";
import AllLecturers from "./pages/Admin/lecturer/AllLecturers";
import Settings from "./pages/Admin/others/Settings";
import Support from "./pages/Admin/others/Support";
import Certificates from "./pages/Student/Certificates/Certificates";
import Analytics from "./pages/Student/Analytics/Analytics";

const App: React.FC = () => {


    useEffect(() => {
        if (window.location.pathname.startsWith('/student')) {
            document.body.className = 'hold-transition layout-top-nav';
        } else {
            document.body.className = 'hold-transition sidebar-mini layout-fixed layout-navbar-fixed';
        }
    }, [window.location.pathname]);

    return (
        <Router>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute element={<div />} allowedGroups={['ADMIN', 'STUDENT', 'LECTURER']} />
                        }
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <PrivateRoute element={
                                <AdminLayout>
                                    <Routes>
                                        <Route path="index" element={<Dashboard />} />
                                        <Route path="university/establishment" element={<Establishment />} />
                                        <Route path="university/establishment/new" element={<NewEstablishment />} />
                                        <Route path="university/establishment/:id/details" element={<EstablishmentDetails />} />
                                        <Route path="university/cycle" element={<Cycle />} />
                                        <Route path="university/cycle/new" element={<NewCycle />} />
                                        <Route path="university/cycle/:id/details" element={<CycleDetails />} />
                                        <Route path="university/class" element={<Class />} />
                                        <Route path="university/class/new" element={<NewClass />} />
                                        <Route path="university/class/:id/details" element={<ClassDetails />} />
                                        <Route path="university/genie" element={<Genie />} />
                                        <Route path="university/genie/new" element={<NewGenie />} />
                                        <Route path="university/genie/:id/details" element={<GenieDetails />} />
                                        <Route path="university/department" element={<Department />} />
                                        <Route path="university/department/new" element={<NewDepartment />} />
                                        <Route path="university/department/:id/details" element={<DepartmentDetails />} />
                                        <Route path="university/course" element={<Course />} />
                                        <Route path="university/course/new" element={<NewCourse />} />
                                        <Route path="university/course/:id/details" element={<CourseDetails />} />
                                        <Route path="university/module" element={<Module />} />
                                        <Route path="university/module/new" element={<NewModule />} />
                                        <Route path="university/module/:id/details" element={<ModuleDetails />} />
                                        <Route path="student/enrolled" element={<EnrolledStudent />} />
                                        <Route path="student/:id/details" element={<StudentDetails />} />
                                        <Route path="student/new" element={<NewStudent />} />
                                        <Route path="lecturer/onboarding" element={<LecturerOnboarding />} />
                                        <Route path="lecturer/new" element={<NewLecturer />} />
                                        <Route path="lecturer/all" element={<AllLecturers />} />
                                        <Route path="lecturer/:id/details" element={<LecturerDetails />} />
                                        <Route path="announcements" element={<Announcements />} />
                                        <Route path="announcements/new" element={<NewAnnounce />} />
                                        <Route path="messages" element={<Messages />} />
                                        <Route path="settings" element={<Settings />} />
                                        <Route path="support" element={<Support />} />
                                    </Routes>
                                </AdminLayout>
                            } allowedGroups={['ADMIN']} />
                        }
                    />
                    <Route
                        path="/student/*"
                        element={
                            <PrivateRoute element={
                                <StudentLayout>
                                    <Routes>
                                        <Route path="" element={<Home />} />
                                        <Route path=":id" element={<StudentModuleDetail />} />
                                        <Route path=":id/materials" element={<Materials />} />
                                        <Route path=":id/quiz" element={<StudentQuiz />} />
                                        <Route path=":id/forum" element={<StudentForum />} />
                                        <Route path="grades" element={<Grades />} />
                                        <Route path="profile" element={<Profile />} />
                                        <Route path="leaderboard" element={<Leaderboard />} />
                                        <Route path="mentorship" element={<Mentorship />} />
                                        <Route path="certificates" element={<Certificates />} />
                                        <Route path="analytics" element={<Analytics />} />
                                    </Routes>
                                </StudentLayout>
                            } allowedGroups={['STUDENT']} />
                        }
                    />
                    <Route
                        path="/lecturer/*"
                        element={
                            <PrivateRoute element={
                                <LecturerLayout>
                                    <Routes>
                                        <Route path="" element={<LecturerHome />} />
                                        <Route path=":id" element={<LecturerModuleDetail />} />
                                        <Route path=":id/materials" element={<LecturerMaterials />} />
                                        <Route path=":id/quiz" element={<LecturerQuiz />} />
                                        <Route path=":id/forum" element={<LecturerForum />} />
                                        <Route path="profile" element={<LecturerProfile />} />
                                    </Routes>
                                </LecturerLayout>
                            } allowedGroups={['LECTURER']} />
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App;
