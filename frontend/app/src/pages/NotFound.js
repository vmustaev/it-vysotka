import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/not-found.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="not-found-card">
                    <div className="not-found-icon">🔍</div>
                    <div className="not-found-number">404</div>
                    <h1 className="not-found-title">
                        Страница не найдена
                    </h1>
                    <p className="not-found-text">
                        Извините, запрашиваемая страница не существует. Возможно, она была перемещена или удалена.
                    </p>
                    <div className="not-found-actions">
                        <button 
                            className="btn-not-found btn-not-found-primary"
                            onClick={() => navigate('/')}
                        >
                            Вернуться на главную
                        </button>
                        <button 
                            className="btn-not-found btn-not-found-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Назад
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;