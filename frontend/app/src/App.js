import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Context } from "./index";
import { observer } from "mobx-react-lite";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutChampionship from "./pages/AboutChampionship";
import Regulations from "./pages/Regulations";
import Gallery from "./pages/Gallery";
import Results from "./pages/Results";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Consent from "./pages/Consent";
import ParticipantConsent from "./pages/ParticipantConsent";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Participants from "./pages/admin/Participants";
import Rooms from "./pages/admin/Rooms";
import Seating from "./pages/admin/Seating";
import CMS from "./pages/admin/CMS";
import Certificates from "./pages/admin/Certificates";
import Settings from "./pages/admin/Settings";
import FileManager from "./pages/admin/FileManager";
import ResultsManagement from "./pages/admin/ResultsManagement";
import Volunteers from "./pages/admin/Volunteers";

import VolunteerLayout from "./pages/volunteer/VolunteerLayout";
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import AttendanceList from "./pages/volunteer/AttendanceList";
import EditParticipants from "./pages/volunteer/EditParticipants";

const App = observer(() => {
    const { store } = useContext(Context);
    const location = useLocation();

    useEffect(() => {
        store.checkAuth();
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [location.pathname]);

    if (store.isLoading) {
        return (
            <div style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(59, 130, 246, 0.4)), url(/assets/img/background_new.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh'
            }}>
                <Navbar />
                <div style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                }}>
                    Загрузка...
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(59, 130, 246, 0.4)), url(/assets/img/background_new.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh'
        }}>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutChampionship />} />
                <Route path="/regulations" element={<Regulations />} />
                <Route path="/consent" element={<Consent />} />
                <Route path="/participant-consent" element={<ParticipantConsent />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/results" element={<Results />} />
                <Route path="/contacts" element={<Contacts />} />

                <Route path="/login" element={
                    store.isAuth ? (
                        store.user.role === 'admin' ? <Navigate to="/admin" /> :
                        store.user.role === 'volunteer' ? <Navigate to="/volunteer" /> :
                        <Navigate to="/profile" />
                    ) : <Login />
                } />
                <Route path="/register" element={
                    store.isAuth ? <Navigate to="/" /> : <Register />
                } />

                <Route path="/reset-password-request" element={
                    store.isAuth ? <Navigate to="/" /> : <ResetPasswordRequest />
                } />
                <Route path="/reset-password" element={
                    store.isAuth ? <Navigate to="/" /> : <ResetPassword />
                } />

                <Route path="/profile" element={
                    !store.isAuth ? <Navigate to="/login" /> :
                    store.user.role === 'admin' ? <Navigate to="/admin" /> :
                    store.user.role === 'volunteer' ? <Navigate to="/volunteer" /> :
                    <Profile />
                } />

                <Route path="/admin" element={
                    !store.isAuth ? <Navigate to="/login" /> :
                    store.user.role !== 'admin' ? <Navigate to="/profile" /> :
                    <AdminLayout />
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="participants" element={<Participants />} />
                    <Route path="rooms" element={<Rooms />} />
                    <Route path="seating" element={<Seating />} />
                    <Route path="cms" element={<CMS />} />
                    <Route path="certificates" element={<Certificates />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="results" element={<ResultsManagement />} />
                    <Route path="files" element={<FileManager />} />
                    <Route path="volunteers" element={<Volunteers />} />
                </Route>

                <Route path="/volunteer" element={
                    !store.isAuth ? <Navigate to="/login" /> :
                    store.user.role !== 'volunteer' ? <Navigate to="/profile" /> :
                    <VolunteerLayout />
                }>
                    <Route index element={<VolunteerDashboard />} />
                    <Route path="attendance" element={<AttendanceList />} />
                    <Route path="edit-participants" element={<EditParticipants />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />
        </div>
    );
});

export default App;