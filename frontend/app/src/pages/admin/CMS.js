import React, { useState } from 'react';

const CMS = () => {
    const [showInfoModal, setShowInfoModal] = useState(false);
    
    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Управление контентом</h1>
                    <p className="admin-page-subtitle">Редактирование галереи, результатов и страниц</p>
                </div>
                <button
                    onClick={() => setShowInfoModal(true)}
                    style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#64748b';
                    }}
                    title="Информация"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                </button>
            </div>

            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                </div>
                <h2>Раздел в разработке</h2>
                <p>Здесь можно будет загружать фото, PDF файлы и редактировать контент</p>
            </div>

            {/* Модальное окно с инструкцией */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Полезные советы</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowInfoModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ lineHeight: '1.8' }}>
                            <ul style={{ marginLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                <li>Раздел управления контентом находится в разработке</li>
                                <li>В будущем здесь можно будет загружать фотографии с чемпионата</li>
                                <li>Планируется возможность редактирования страниц сайта</li>
                                <li>Будет доступен экспорт и импорт контента</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CMS;