import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Context } from "./index";
import { observer } from "mobx-react-lite";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Regulations from "./pages/Regulations";
import Gallery from "./pages/Gallery";
import Results from "./pages/Results";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";

const App = observer(() => {
    const { store } = useContext(Context);

    useEffect(() => {
        store.checkAuth();
    }, [store]);

    if (store.isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/regulations" element={<Regulations />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/results" element={<Results />} />
                <Route path="/contacts" element={<Contacts />} />

                <Route path="/login" element={
                    store.isAuth ? <Navigate to="/" /> : <Login />
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

                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
});

export default App;