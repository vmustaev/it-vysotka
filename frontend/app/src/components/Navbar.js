import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const Navbar = observer(() => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

                <button 
                    className={`navbar-burger ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Меню"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {mobileMenuOpen && (
                    <div className="navbar-overlay" onClick={closeMobileMenu}></div>
                )}

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to="/" className="navbar-link" onClick={closeMobileMenu}>Главная</Link>
                        <Link to="/about" className="navbar-link" onClick={closeMobileMenu}>О чемпионате</Link>
                        <Link to="/regulations" className="navbar-link" onClick={closeMobileMenu}>Регламент</Link>
                        <Link to="/gallery" className="navbar-link" onClick={closeMobileMenu}>Галерея</Link>
                        <Link to="/results" className="navbar-link" onClick={closeMobileMenu}>Результаты</Link>
                        <Link to="/contacts" className="navbar-link" onClick={closeMobileMenu}>Контакты</Link>
                    </div>
                    
                    <div className="navbar-actions">
                        {store.isAuth ? (
                            <>
                                <Link 
                                    to={
                                        store.user.role === 'admin' ? '/admin' : 
                                        store.user.role === 'volunteer' ? '/volunteer' : 
                                        '/profile'
                                    } 
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
                                    ) : store.user.role === 'volunteer' ? (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="10" cy="7" r="4"/>
                                                <path d="M22 11l-2 2-2-2"/>
                                                <path d="M20 13v-2a4 4 0 0 0-4-4"/>
                                            </svg>
                                            Панель волонтера
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
                                <Link to="/register" className="navbar-link navbar-link-auth" onClick={closeMobileMenu}>
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
});

export default Navbar;