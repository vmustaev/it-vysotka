import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SettingsService from '../services/SettingsService';
import '../styles/home.css';

const Home = () => {
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkRegistrationStatus();
    }, []);

    const checkRegistrationStatus = async () => {
        try {
            const response = await SettingsService.getRegistrationStatus();
            const data = response.data.data;
            setRegistrationOpen(data.isOpen);
            setRegistrationData(data);
        } catch (e) {
            console.error('Error checking registration status:', e);
        } finally {
            setLoading(false);
        }
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
            content: 'Очный'
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

    if (loading) {
        return null;
    }

    return (
        <div className="home-page">
            <div className="hero-wrapper">
                <div className="hero-content">
                    <div className="hero-badge">Чемпионат по программированию</div>
                    <h1 className="hero-title">IT-ВыСотка</h1>
                    
                    {registrationOpen && registrationData?.championship_datetime && (
                        <div className="hero-event-info">
                            <div className="event-info-item">
                                <span className="event-info-label">Дата и время</span>
                                <span className="event-info-value">
                                    {new Date(registrationData.championship_datetime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} 
                                    {' в '} 
                                    {new Date(registrationData.championship_datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="event-info-item">
                                <span className="event-info-label">Место проведения</span>
                                <span className="event-info-value">г. Уфа, ул. Космонавтов, 1 (УГНТУ)</span>
                            </div>
                        </div>
                    )}

                    <p className="hero-description">
                        Командный чемпионат по программированию для школьников 9-11 классов. 
                        Проверьте свои навыки в решении алгоритмических задач и получите дополнительные баллы при поступлении в УГНТУ.
                    </p>

                    {registrationOpen ? (
                        <Link to="/register" className="hero-cta">
                            Зарегистрироваться на чемпионат
                            <span className="cta-arrow">→</span>
                        </Link>
                    ) : (
                        <>
                            <p className="hero-closed">Чемпионат завершён. Ознакомьтесь с результатами!</p>
                            <Link to="/results" className="hero-cta">
                                Посмотреть результаты
                                <span className="cta-arrow">→</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="content-wrapper">
                <section className="info-section">
                    <div className="info-grid">
                        {infoData.map((item, index) => (
                            <div key={index} className="info-item">
                                <div className="info-label">{item.title}</div>
                                <div className="info-value">{item.content}</div>
                            </div>
                        ))}
                        {registrationData?.championship_datetime && (
                            <>
                                <div className="info-item">
                                    <div className="info-label">Время начала</div>
                                    <div className="info-value">
                                        {new Date(registrationData.championship_datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Место проведения</div>
                                    <div className="info-value">г. Уфа, ул. Космонавтов, 1</div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="benefits-section">
                    <h2 className="section-heading">Что вы получите</h2>
                    <div className="benefits-container">
                        <div className="benefit-item">
                            <div className="benefit-icon benefit-icon-gold">+10</div>
                            <h3 className="benefit-title">Победители</h3>
                            <p className="benefit-text">Дополнительные 10 баллов к сумме ЕГЭ при поступлении в УГНТУ</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon benefit-icon-silver">+7</div>
                            <h3 className="benefit-title">Призёры</h3>
                            <p className="benefit-text">Дополнительные 7 баллов к сумме ЕГЭ при поступлении в УГНТУ</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon benefit-icon-cert">✓</div>
                            <h3 className="benefit-title">Сертификаты</h3>
                            <p className="benefit-text">Все участники получают именные сертификаты об участии</p>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon benefit-icon-prize">★</div>
                            <h3 className="benefit-title">Призы</h3>
                            <p className="benefit-text">Ценные призы и подарки от партнёров чемпионата</p>
                        </div>
                    </div>
                </section>

                <section className="sponsors-section">
                    <h2 className="section-heading">Партнёры чемпионата</h2>
                    <div className="sponsors-container">
                        <div className="sponsor-item"><img src="/files/redsoft.png" alt="Редсофт" /></div>
                        <div className="sponsor-item"><img src="/files/burintech.jpg" alt="Буринтех" /></div>
                        <div className="sponsor-item"><img src="/files/банер гк бит ПНг.png" alt="ГК Бит" /></div>
                        <div className="sponsor-item"><img src="/files/роснефть.jpg" alt="Роснефть" /></div>
                        <div className="sponsor-item"><img src="/files/транснефть.png" alt="Транснефть" /></div>
                        <div className="sponsor-item"><img src="/files/petrotest.png" alt="Башнефть" /></div>
                        <div className="sponsor-item"><img src="/files/kuraisoft.jpg" alt="Курайсофт" /></div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;