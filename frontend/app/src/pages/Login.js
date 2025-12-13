import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const LoginPage = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();

    const isRegisterPage = location.pathname === '/register';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isRegisterPage) {
            await store.login(email, password);
        } else {
            await store.registration(email, password);
        }
        
        if (store.isAuth) {
            navigate('/');
        }
    };

    const switchMode = () => {
        navigate(isRegisterPage ? '/login' : '/register');
    };

    return (
        <div className="login-page">
            <div className="login-form">
                <h2>{isRegisterPage ? 'Регистрация' : 'Вход'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="submit-btn">
                        {isRegisterPage ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </form>
                
                <button onClick={switchMode} className="switch-btn">
                    {isRegisterPage 
                        ? 'Уже есть аккаунт? Войти' 
                        : 'Нет аккаунта? Зарегистрироваться'}
                </button>
            </div>
        </div>
    );
});

export default LoginPage;