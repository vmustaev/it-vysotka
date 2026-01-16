import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const Navbar = observer(() => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Применение темы при монтировании и изменении
    useEffect(() => {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Блокировка прокрутки при открытом мобильном меню
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleLogout = () => {
        store.logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-logo">
                    <img src="/assets/img/logo.png" alt="IT-ВыСотка" />
                </Link>

                {/* Бургер-меню для мобильных устройств */}
                <button 
                    className={`navbar-burger ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Меню"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Оверлей для затемнения фона */}
                {mobileMenuOpen && (
                    <div className="navbar-overlay" onClick={closeMobileMenu}></div>
                )}

                {/* Навигационное меню */}
                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Главная</Link>
                        <Link to="/regulations" className="navbar-link" onClick={closeMobileMenu}>Регламент</Link>
                        <Link to="/gallery" className="navbar-link" onClick={closeMobileMenu}>Галерея</Link>
                        <Link to="/results" className="navbar-link" onClick={closeMobileMenu}>Результаты</Link>
                        <Link to="/contacts" className="navbar-link" onClick={closeMobileMenu}>Контакты</Link>
                    </div>
                    
                    <div className="navbar-actions">
                        {store.isAuth ? (
                            <>
                                <Link 
                                    to={store.user.role === 'admin' ? '/admin' : '/profile'} 
                                    className="navbar-link navbar-link-user" 
                                    onClick={closeMobileMenu}
                                >
                                    {store.user.role === 'admin' ? (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="7" height="7"/>
                                                <rect x="14" y="3" width="7" height="7"/>
                                                <rect x="14" y="14" width="7" height="7"/>
                                                <rect x="3" y="14" width="7" height="7"/>
                                            </svg>
                                            Админ-панель
                                        </>
                                    ) : (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            Профиль
                                        </>
                                    )}
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="navbar-link navbar-link-logout"
                                    title="Выйти"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                        <polyline points="16 17 21 12 16 7"/>
                                        <line x1="21" y1="12" x2="9" y2="12"/>
                                    </svg>
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="navbar-link navbar-link-auth" onClick={closeMobileMenu}>
                                    Войти
                                </Link>
                                <Link to="/register" className="navbar-link navbar-link-register" onClick={closeMobileMenu}>
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Кнопка переключения темы - прижата к правому краю */}
                <button 
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Переключить тему"
                >
                    {darkMode ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
});

export default Navbar;