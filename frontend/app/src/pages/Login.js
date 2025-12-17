import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const LoginPage = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    useEffect(() => {
        const registered = searchParams.get('registered');
        if (registered === 'true') {
            setSuccessMessage('Регистрация успешна! Пожалуйста, проверьте вашу почту для активации аккаунта.');
            
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await store.login(email, password);
            
            if (store.isAuth) {
                navigate('/');
            }
        } catch (e) {
            setSuccessMessage('');

            if (e.response?.data?.fieldErrors) {
                const backendErrors = {};
                Object.entries(e.response.data.fieldErrors).forEach(([field, errorList]) => {
                    backendErrors[field] = errorList;
                });
                setErrors(backendErrors);
            } else if (e.response?.data?.message) {
                setErrors({ general: [e.response.data.message] });
            }
        }
    };

    const getFieldError = (fieldName) => {
        return errors[fieldName] ? errors[fieldName][0] : '';
    };

    const isFieldInvalid = (fieldName) => {
        return errors[fieldName] && errors[fieldName].length > 0;
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Вход</h2>
            
            {successMessage && (
                <div style={{
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #c8e6c9'
                }}>
                    {successMessage}
                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                        После активации войдите в аккаунт
                    </div>
                </div>
            )}
            
            {errors.general && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    {errors.general[0]}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: [] }));
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('email') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                        required
                    />
                    {isFieldInvalid('email') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('email')}
                        </div>
                    )}
                </div>
                
                <div>
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: [] }));
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('password') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                        required
                    />
                    {isFieldInvalid('password') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('password')}
                        </div>
                    )}
                </div>
                
                <button 
                    type="submit"
                    style={{
                        padding: '12px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Войти
                </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a 
                    href="/register" 
                    style={{ color: '#2196F3', textDecoration: 'none' }}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/register');
                    }}
                >
                    Нет аккаунта? Зарегистрироваться
                </a>
            </div>
        </div>
    );
});

export default LoginPage;