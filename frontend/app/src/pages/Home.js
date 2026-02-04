import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SettingsService from '../services/SettingsService';
import FileService from '../services/FileService';
import '../styles/home.css';

const Home = () => {
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [registrationData, setRegistrationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sponsors, setSponsors] = useState([]);

    useEffect(() => {
        checkRegistrationStatus();
        loadSponsors();
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

    const loadSponsors = async () => {
        try {
            const response = await FileService.getFilesByType('sponsors');
            setSponsors(response.files);
        } catch (error) {
            console.error('Ошибка при загрузке спонсоров:', error);
        }
    };

    // Вся информация в одном массиве для отображения по столбцам
    const allInfoData = [
        ...(registrationData?.championship_datetime ? [
            {
                title: 'Дата и время',
                content: `${new Date(registrationData.championship_datetime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${new Date(registrationData.championship_datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
            },
            {
                title: 'Место проведения',
                content: 'г. Уфа, ул. Космонавтов, 1 (УГНТУ)'
            }
        ] : []),
        {
            title: 'Формат проведения',
            content: 'Очный'
        },
        {
            title: 'Состав команд',
            content: '1-3 человека'
        },
        {
            title: 'Продолжительность',
            content: '4 часа'
        },
        {
            title: 'Языки программирования',
            content: 'C++, Python, Java'
        }
    ];

    if (loading) {
        return null;
    }

    return (
        <div className="home-page">
            <div className="hero-wrapper">
                <div className="hero-content">
                    <h1 className="hero-title">IT-ВыСотка</h1>
                    
                    {registrationData?.championship_datetime && (
                        <div className="hero-event-info">
                            <div className="event-info-item">
                                <span className="event-info-label">
                                    {registrationOpen ? 'Дата и время' : 'Дата проведения'}
                                </span>
                                <span className="event-info-value">
                                    {new Date(registrationData.championship_datetime).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} 
                                    {registrationOpen && (
                                        <>
                                            {' в '} 
                                            {new Date(registrationData.championship_datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="event-info-item">
                                <span className="event-info-label">Место проведения</span>
                                <span className="event-info-value">г. Уфа, ул. Космонавтов, 1 (УГНТУ)</span>
                            </div>
                        </div>
                    )}

                    <p className="hero-description">
                        Чемпионат по программированию для школьников 9-11 классов. 
                        Проверьте свои навыки в решении алгоритмических задач и получите дополнительные баллы при поступлении в УГНТУ.
                    </p>

                    {registrationOpen ? (
                        <Link to="/register" className="hero-cta">
                            Зарегистрироваться на чемпионат
                            <span className="cta-arrow">→</span>
                        </Link>
                    ) : (
                        <div className="hero-completed-section">
                            <div className="hero-completed-badge">
                                Чемпионат успешно завершён
                            </div>
                            <Link to="/results" className="hero-cta hero-cta-results">
                                Посмотреть результаты
                                <span className="cta-arrow">→</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="content-wrapper">
                <section className="info-section">
                    <div className="info-grid">
                        {allInfoData.map((item, index) => (
                            <div key={index} className="info-item">
                                <div className="info-label">{item.title}</div>
                                <div className="info-value">{item.content}</div>
                            </div>
                        ))}
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
                    {sponsors.length > 0 ? (
                        <div className="sponsors-container">
                            {sponsors.map((sponsor) => (
                                <div key={sponsor.id} className="sponsor-item">
                                    <img 
                                        src={sponsor.url} 
                                        alt={sponsor.description || sponsor.filename} 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="sponsors-empty">
                            <div className="sponsors-empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <h3 className="sponsors-empty-title">Информация о партнёрах появится позже</h3>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Home;