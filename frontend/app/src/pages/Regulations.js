import React from 'react';
import '../styles/regulations.css';

const Regulations = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Регламент чемпионата по программированию "IT-ВыСотка"</h1>
                    <p className="page-subtitle">
                        Ознакомьтесь с правилами и условиями участия в чемпионате
                    </p>
                </div>

                <div className="section">
                    <h2 className="section-title">Регистрация и согласие на обработку персональных данных</h2>
                    
                    <div className="registration-info">
                        <p className="intro-text">
                            Для участия в Чемпионате необходимо зарегистрироваться и предоставить согласие на обработку персональных данных для каждого члена команды. Обратите внимание на следующие требования:
                        </p>

                        <div className="grid grid-2">
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Согласие для несовершеннолетних</h3>
                                </div>
                                <div className="card-body">
                                    <p>Если участник младше 18 лет, необходимо предоставить <strong>согласие родителя или законного представителя</strong>.</p>
                                    <a href="/files/roditeli.pdf" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn btn-primary">
                                        Скачать форму согласия
                                    </a>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Согласие для совершеннолетних</h3>
                                </div>
                                <div className="card-body">
                                    <p>Если участник старше 18 лет, необходимо предоставить <strong>согласие на обработку персональных данных</strong>.</p>
                                    <a href="/files/uchastniki.pdf" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn btn-primary">
                                        Скачать форму согласия
                                    </a>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Порядок предоставления</h3>
                                </div>
                                <div className="card-body">
                                    <p>Согласие необходимо:</p>
                                    <ul>
                                        <li>Распечатать и заполнить</li>
                                        <li>Подписать (родителем или участником)</li>
                                        <li>Отправить скан или фотографию на электронную почту: <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Допуск на чемпионат</h3>
                                </div>
                                <div className="card-body">
                                    <p>Для участия обязательно наличие:</p>
                                    <ul>
                                        <li>Документа, удостоверяющего личность (паспорт)</li>
                                        <li>Оригинала подписанного согласия</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="important-note">
                    <div className="important-note-content">
                        <h3>Важно</h3>
                        <p>
                            Настоятельно рекомендуем ознакомиться с{' '}
                            <a href="/files/polozhenie.pdf" target="_blank" rel="noopener noreferrer">
                                Положением о Чемпионате
                            </a>
                            {' '}и с{' '}
                            <a href="/files/booklet.docx" target="_blank" rel="noopener noreferrer">
                                Памяткой участникам соревнований
                            </a>
                            {' '}для полного понимания правил и требований проведения чемпионата.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Regulations;