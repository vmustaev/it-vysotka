import React from 'react';

const Certificates = () => {
    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Сертификаты</h1>
                <p className="admin-page-subtitle">Генерация и отправка сертификатов участникам</p>
            </div>

            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                </div>
                <h2>Раздел в разработке</h2>
                <p>Здесь можно будет генерировать и отправлять сертификаты</p>
            </div>
        </div>
    );
};

export default Certificates;

