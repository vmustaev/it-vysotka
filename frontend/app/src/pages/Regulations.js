import React from 'react';

const Regulations = () => {
    return (
        <div className="content-page">
            <div className="page-content">
                <div className="content-page-header">
                    <h1 className="content-page-title">Регламент чемпионата по программированию "IT-ВыСотка"</h1>
                </div>

                <div className="content-section">
                    <div className="content-container-light">
                        <h2 className="content-section-title">Регистрация и согласие на обработку персональных данных</h2>
                        <p>
                            Для участия в Чемпионате необходимо зарегистрироваться и предоставить согласие на обработку персональных данных для каждого члена команды. Обратите внимание на следующие требования:
                        </p>

                        <div className="content-grid content-grid-2">
                            <div className="content-card">
                                <h3 className="content-card-title">Согласие для несовершеннолетних</h3>
                                <div className="content-card-body">
                                    <p>Если участник младше 18 лет, необходимо предоставить <strong>согласие родителя или законного представителя</strong>.</p>
                                    <a href="/files/roditeli.pdf" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn btn-primary">
                                        Скачать форму согласия
                                    </a>
                                </div>
                            </div>

                            <div className="content-card">
                                <h3 className="content-card-title">Согласие для совершеннолетних</h3>
                                <div className="content-card-body">
                                    <p>Если участник старше 18 лет, необходимо предоставить <strong>согласие на обработку персональных данных</strong>.</p>
                                    <a href="/files/uchastniki.pdf" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn btn-primary">
                                        Скачать форму согласия
                                    </a>
                                </div>
                            </div>

                            <div className="content-card">
                                <h3 className="content-card-title">Порядок предоставления</h3>
                                <div className="content-card-body">
                                    <p>Согласие необходимо:</p>
                                    <ul>
                                        <li>Распечатать и заполнить</li>
                                        <li>Подписать (родителем или участником)</li>
                                        <li>Отправить скан или фотографию на электронную почту: <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="content-card">
                                <h3 className="content-card-title">Допуск на чемпионат</h3>
                                <div className="content-card-body">
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

                <div className="content-highlight">
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
    );
};

export default Regulations;