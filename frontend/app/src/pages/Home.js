import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SettingsService from '../services/SettingsService';
import '../styles/home.css';

const Home = () => {
    const [openInfo, setOpenInfo] = useState(null);
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
        <div className="page">
            <div className="page-content">
                <div className="hero-section">
                    <h1 className="hero-title">Чемпионат по программированию для школьников "IT-ВыСотка"</h1>
                    
                    {registrationOpen ? (
                        <>
                            <p className="hero-subtitle">
                                Приглашаем школьников 9-11 классов принять участие в командном чемпионате по программированию.
                                <br />
                                Покажите свои навыки и получите шанс выиграть ценные призы + дополнительные баллы для поступления в УГНТУ!
                            </p>
                            
                            <div style={{ 
                                marginTop: 'var(--spacing-xl)', 
                                marginBottom: 'var(--spacing-xl)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--spacing-sm)',
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--text-secondary)'
                            }}>
                                {registrationData?.championship_datetime && (
                                    <>
                                        <div><strong>Дата:</strong> {new Date(registrationData.championship_datetime).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        <div><strong>Время начала соревнований:</strong> {new Date(registrationData.championship_datetime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </>
                                )}
                                <div><strong>Место:</strong> г. Уфа, ул. Космонавтов, 1</div>
                                {registrationData?.registration_start && registrationData?.registration_end && (
                                    <div>
                                        <strong>Период регистрации:</strong> с{' '}
                                        {new Date(registrationData.registration_start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
                                        по{' '}
                                        {new Date(registrationData.registration_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                )}
                            </div>

                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Зарегистрироваться
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="hero-subtitle">Чемпионат завершился! Ознакомьтесь с результатами и поздравьте победителей!</p>
                            <div className="hero-actions">
                                <Link to="/results" className="btn btn-primary btn-lg">
                                    Посмотреть результаты
                                </Link>
                            </div>
                        </>
                    )}
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
                        <img src="/files/redsoft.png" alt="Редсофт" />
                        <img src="/files/burintech.jpg" alt="Буринтех" />
                        <img src="/files/банер гк бит ПНг.png" alt="ГК Бит" />
                        <img src="/files/роснефть.jpg" alt="Роснефть" />
                        <img src="/files/транснефть.png" alt="Транснефть" />
                        <img src="/files/petrotest.png" alt="Башнефть" />
                        <img src="/files/kuraisoft.jpg" alt="Курайсофт" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;