import React from 'react';

const Home = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Добро пожаловать!</h1>
                    <p className="page-subtitle">
                        Присоединяйтесь к нашему сообществу и развивайте свои навыки программирования
                    </p>
                </div>
                
                <div className="section">
                    <div className="grid grid-3">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Регистрация</h3>
                            </div>
                            <div className="card-body">
                                <p>Зарегистрируйтесь для участия в олимпиаде и получите доступ ко всем возможностям платформы</p>
                            </div>
                        </div>
                        
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Регламент</h3>
                            </div>
                            <div className="card-body">
                                <p>Ознакомьтесь с правилами проведения олимпиады и требованиями к участникам</p>
                            </div>
                        </div>
                        
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Результаты</h3>
                            </div>
                            <div className="card-body">
                                <p>Следите за результатами олимпиады и своими достижениями</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;