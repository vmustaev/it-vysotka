import React from 'react';
import { Outlet } from 'react-router-dom';
import VolunteerSidebar from './VolunteerSidebar';
import '../../styles/admin.css';

const VolunteerLayout = () => {
    return (
        <div className="admin-layout">
            <VolunteerSidebar />
            <div className="admin-main">
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default VolunteerLayout;

