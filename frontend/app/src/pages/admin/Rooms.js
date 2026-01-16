import React from 'react';

const Rooms = () => {
    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Аудитории</h1>
                <p className="admin-page-subtitle">Управление аудиториями для олимпиады</p>
            </div>

            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                </div>
                <h2>Раздел в разработке</h2>
                <p>Здесь можно будет добавлять и редактировать аудитории</p>
            </div>
        </div>
    );
};

export default Rooms;

