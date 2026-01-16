import React from 'react';

const Settings = () => {
    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Настройки</h1>
                <p className="admin-page-subtitle">Управление системой и регистрацией</p>
            </div>

            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6m-7-7h6m6 0h6"/>
                    </svg>
                </div>
                <h2>Раздел в разработке</h2>
                <p>Здесь можно будет открывать/закрывать регистрацию и настраивать систему</p>
            </div>
        </div>
    );
};

export default Settings;

