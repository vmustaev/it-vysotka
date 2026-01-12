import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
    const [openInfo, setOpenInfo] = useState(null);

    const toggleInfo = (index) => {
        setOpenInfo(openInfo === index ? null : index);
    };

    const infoData = [
        {
            title: 'Языки программирования',
            content: 'C++, Python, Java'
        },
        {
            title: 'Продолжительность',
            content: '4 часа'
        },
        {
            title: 'Формат проведения',
            content: 'Очно, для иногородних возможно участие онлайн'
        },
        {
            title: 'Состав команд',
            content: '1-3 человека'
        },
        {
            title: 'Платформа для проведения',
            content: 'Яндекс.Контест'
        }
    ];

    return (
        <div className="page">
            <div className="page-content">
                <div className="hero-section">
                    <h1 className="hero-title">Чемпионат по программированию для школьников "IT-ВыСотка"</h1>
                    <p className="hero-subtitle">Чемпионат завершился! Ознакомьтесь с результатами и поздравьте победителей!</p>
                    <div className="hero-actions">
                        <Link to="/results" className="btn btn-primary btn-lg">
                            Посмотреть результаты
                        </Link>
                    </div>
                </div>

                <div className="section">
                    <h2 className="section-title">Информация о чемпионате</h2>
                    <div className="info-accordion">
                        {infoData.map((item, index) => (
                            <div key={index} className="info-card">
                                <div 
                                    className="info-header" 
                                    onClick={() => toggleInfo(index)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => e.key === 'Enter' && toggleInfo(index)}
                                >
                                    <h3>{item.title}</h3>
                                    <span className={`info-icon ${openInfo === index ? 'open' : ''}`}>
                                        {openInfo === index ? '−' : '+'}
                                    </span>
                                </div>
                                {openInfo === index && (
                                    <div className="info-body">
                                        <p>{item.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section">
                    <h2 className="section-title">Преимущества участия</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <h3>Победители</h3>
                            <p>+10 баллов к сумме ЕГЭ</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Призёры</h3>
                            <p>+7 баллов к сумме ЕГЭ</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Сертификаты</h3>
                            <p>Все участники получат сертификаты</p>
                        </div>
                        <div className="benefit-card">
                            <h3>Призы</h3>
                            <p>Ценные призы от спонсоров</p>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <h2 className="section-title">Партнёры</h2>
                    <div className="sponsors-grid">
                        <img src="/uploads/redsoft.png" alt="Редсофт" />
                        <img src="/uploads/burintech.jpg" alt="Буринтех" />
                        <img src="/uploads/банер гк бит ПНг.png" alt="ГК Бит" />
                        <img src="/uploads/роснефть.jpg" alt="Роснефть" />
                        <img src="/uploads/транснефть.png" alt="Транснефть" />
                        <img src="/uploads/petrotest.png" alt="Башнефть" />
                        <img src="/uploads/kuraisoft.jpg" alt="Курайсофт" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;