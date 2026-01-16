import React from 'react';

const Seating = () => {
    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Рассадка</h1>
                <p className="admin-page-subtitle">Автоматическая и ручная рассадка участников</p>
            </div>

            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="15" rx="2"/>
                        <polyline points="17 2 12 7 7 2"/>
                    </svg>
                </div>
                <h2>Раздел в разработке</h2>
                <p>Здесь будет интерфейс для распределения участников по аудиториям</p>
            </div>
        </div>
    );
};

export default Seating;

