import React from 'react';

const Contacts = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Контакты</h1>
                    <p className="page-subtitle">
                        Свяжитесь с нами, если у вас есть вопросы
                    </p>
                </div>
                
                <div className="section">
                    <div className="grid grid-2">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Email</h3>
                            </div>
                            <div className="card-body">
                                <p>info@example.com</p>
                            </div>
                        </div>
                        
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Телефон</h3>
                            </div>
                            <div className="card-body">
                                <p>+7 (XXX) XXX-XX-XX</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;