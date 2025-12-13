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
        <div style={{
            background: '#333',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
        }}>
            <div style={{ display: 'flex', gap: '15px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Главная</Link>
                <Link to="/regulations" style={{ color: 'white', textDecoration: 'none' }}>Регламент</Link>
                <Link to="/gallery" style={{ color: 'white', textDecoration: 'none' }}>Галерея</Link>
                <Link to="/results" style={{ color: 'white', textDecoration: 'none' }}>Результаты</Link>
                <Link to="/contacts" style={{ color: 'white', textDecoration: 'none' }}>Контакты</Link>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {store.isAuth ? (
                    <>
                        <span style={{ marginRight: '10px' }}>{store.user.email}</span>
                        <button 
                            onClick={handleLogout}
                            style={{
                                background: '#ff4444',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                            <button style={{
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px'
                            }}>
                                Войти
                            </button>
                        </Link>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                            <button style={{
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}>
                                Регистрация
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
});

export default Navbar;