import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>404</h1>
            <h2 style={{ marginBottom: '20px' }}>Страница не найдена</h2>
            <p style={{ marginBottom: '30px', fontSize: '18px' }}>
                Извините, запрашиваемая страница не существует.
            </p>
            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Вернуться на главную
            </button>
        </div>
    );
};

export default NotFound;