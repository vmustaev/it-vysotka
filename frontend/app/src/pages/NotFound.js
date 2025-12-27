import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '72px', marginBottom: '20px' }} className="text-primary">404</h1>
            <h2 style={{ marginBottom: '20px' }}>Страница не найдена</h2>
            <p style={{ marginBottom: '30px', fontSize: '18px' }} className="text-secondary">
                Извините, запрашиваемая страница не существует.
            </p>
            <button
                onClick={() => navigate('/')}
                className="btn btn-primary btn-lg"
            >
                Вернуться на главную
            </button>
        </div>
    );
};

export default NotFound;