import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const Navbar = observer(() => {
    const { store } = useContext(Context);
    const navigate = useNavigate();

    const handleLogout = () => {
        store.logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <div className="navbar-links">
                    <Link to="/" className="navbar-link">Главная</Link>
                    <Link to="/regulations" className="navbar-link">Регламент</Link>
                    <Link to="/gallery" className="navbar-link">Галерея</Link>
                    <Link to="/results" className="navbar-link">Результаты</Link>
                    <Link to="/contacts" className="navbar-link">Контакты</Link>
                </div>
                
                <div className="navbar-actions">
                    {store.isAuth ? (
                        <>
                            <span className="navbar-user">{store.user.email}</span>
                            <button 
                                onClick={handleLogout}
                                className="btn btn-danger btn-sm"
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary navbar-btn">
                                Войти
                            </Link>
                            <Link to="/register" className="btn btn-primary navbar-btn">
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navbar;