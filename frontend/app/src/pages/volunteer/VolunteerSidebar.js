import React from 'react';
import { NavLink } from 'react-router-dom';

const VolunteerSidebar = () => {
    const menuItems = [
        {
            path: '/volunteer',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
            ),
            label: 'Главная',
            end: true
        },
        {
            path: '/volunteer/attendance',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            ),
            label: 'Отметка присутствия'
        },
        {
            path: '/volunteer/edit-participants',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            ),
            label: 'Редактирование данных'
        }
    ];

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2 className="admin-sidebar-title">Панель волонтера</h2>
            </div>
            
            <nav className="admin-sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => 
                            `admin-nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="admin-nav-icon">{item.icon}</span>
                        <span className="admin-nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <NavLink to="/" className="admin-nav-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>На главную</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default VolunteerSidebar;

