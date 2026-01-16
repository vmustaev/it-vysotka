import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../styles/admin.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;

