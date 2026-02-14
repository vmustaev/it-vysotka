import React, { useState, useEffect } from 'react';
import UserService from '../services/UserService';
import '../styles/admin.css';

const ProfileHistoryModal = ({ isOpen, onClose, userId, participantName }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadHistory();
        }
    }, [isOpen, userId]);

    const loadHistory = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await UserService.getProfileHistory(userId);
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const fieldNames = {
        last_name: 'Фамилия',
        first_name: 'Имя',
        second_name: 'Отчество',
        birthday: 'Дата рождения',
        region: 'Регион',
        city: 'Город',
        school: 'Школа',
        programming_language: 'Язык программирования',
        phone: 'Телефон',
        grade: 'Класс'
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h2>История изменений</h2>
                    <button 
                        className="modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div style={{ padding: '24px 32px' }}>
                    {participantName && (
                        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Участник:</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                                {participantName}
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                            <p>Загрузка истории...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px', opacity: 0.5 }}>
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <p style={{ fontSize: '16px', margin: 0 }}>История изменений пуста</p>
                            <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>Данные участника не изменялись</p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {history.map((record) => (
                                <div 
                                    key={record.id} 
                                    style={{ 
                                        padding: '16px', 
                                        marginBottom: '12px', 
                                        background: '#f8fafc', 
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                        paddingBottom: '12px',
                                        borderBottom: '1px solid #e2e8f0'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                                                Изменено:
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                                                {record.editedBy ? (
                                                    <>
                                                        {record.editedBy.name}
                                                        {record.editedBy.role === 'volunteer' && (
                                                            <span style={{ 
                                                                marginLeft: '8px',
                                                                padding: '2px 8px',
                                                                background: '#dbeafe',
                                                                color: '#1e40af',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 500
                                                            }}>
                                                                Волонтер
                                                            </span>
                                                        )}
                                                        {record.editedBy.role === 'admin' && (
                                                            <span style={{ 
                                                                marginLeft: '8px',
                                                                padding: '2px 8px',
                                                                background: '#fef3c7',
                                                                color: '#92400e',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 500
                                                            }}>
                                                                Администратор
                                                            </span>
                                                        )}
                                                        {record.editedBy.role === 'participant' && (
                                                            <span style={{ 
                                                                marginLeft: '8px',
                                                                padding: '2px 8px',
                                                                background: '#e0e7ff',
                                                                color: '#3730a3',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                fontWeight: 500
                                                            }}>
                                                                Участник
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>Неизвестно</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                                                Дата и время:
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                                                {new Date(record.createdAt).toLocaleString('ru-RU', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '14px' }}>
                                        <div style={{ marginBottom: '8px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                                            Изменённые поля:
                                        </div>
                                        {Object.entries(record.changes).map(([field, change]) => (
                                            <div 
                                                key={field} 
                                                style={{ 
                                                    marginBottom: '8px',
                                                    padding: '8px 12px',
                                                    background: 'white',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>
                                                    {fieldNames[field] || field}:
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ color: '#64748b', marginBottom: '2px', fontSize: '12px' }}>Было:</div>
                                                        <div style={{ 
                                                            color: '#dc2626',
                                                            padding: '4px 8px',
                                                            background: '#fef2f2',
                                                            borderRadius: '4px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {change.old || '(пусто)'}
                                                        </div>
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '18px' }}>→</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ color: '#64748b', marginBottom: '2px', fontSize: '12px' }}>Стало:</div>
                                                        <div style={{ 
                                                            color: '#16a34a',
                                                            padding: '4px 8px',
                                                            background: '#f0fdf4',
                                                            borderRadius: '4px',
                                                            display: 'inline-block'
                                                        }}>
                                                            {change.new || '(пусто)'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHistoryModal;

