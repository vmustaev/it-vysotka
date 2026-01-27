import React from 'react';
import '../styles/regulations.css';

const Regulations = () => {
    return (
        <div className="regulations-page">
            <div className="regulations-content">
                {/* Hero секция */}
                <div className="regulations-hero">
                    <h1 className="regulations-title">
                        Регламент чемпионата
                    </h1>
                    <p className="regulations-subtitle">
                        Всё, что нужно знать для участия в IT-ВыСотка
                    </p>
                </div>

                {/* Основная информация */}
                <div className="regulations-section">
                    <div className="regulations-grid">
                        {/* Карточка 1 */}
                        <div className="regulation-card">
                            <div className="card-number">01</div>
                            <h3 className="card-title">Согласие для несовершеннолетних</h3>
                            <p className="card-description">
                                Если участник младше 18 лет, необходимо предоставить <strong>согласие родителя или законного представителя</strong>
                            </p>
                            <a href="/files/roditeli.pdf" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="card-button">
                                <span>Скачать форму согласия</span>
                                <span className="button-arrow">→</span>
                            </a>
                        </div>

                        {/* Карточка 2 */}
                        <div className="regulation-card">
                            <div className="card-number">02</div>
                            <h3 className="card-title">Согласие для совершеннолетних</h3>
                            <p className="card-description">
                                Если участник старше 18 лет, необходимо предоставить <strong>согласие на обработку персональных данных</strong>
                            </p>
                            <a href="/files/uchastniki.pdf" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="card-button">
                                <span>Скачать форму согласия</span>
                                <span className="button-arrow">→</span>
                            </a>
                        </div>

                        {/* Карточка 3 */}
                        <div className="regulation-card">
                            <div className="card-number">03</div>
                            <h3 className="card-title">Порядок предоставления</h3>
                            <p className="card-description">
                                Согласие необходимо:
                            </p>
                            <ul className="card-list">
                                <li>Распечатать и заполнить</li>
                                <li>Подписать (родителем или участником)</li>
                                <li>Отправить скан на <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a></li>
                            </ul>
                        </div>

                        {/* Карточка 4 */}
                        <div className="regulation-card">
                            <div className="card-number">04</div>
                            <h3 className="card-title">Допуск на чемпионат</h3>
                            <p className="card-description">
                                Для участия обязательно наличие:
                            </p>
                            <ul className="card-list">
                                <li>Документа, удостоверяющего личность (паспорт)</li>
                                <li>Оригинала подписанного согласия</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Важная информация */}
                <div className="regulations-highlight">
                    <div className="highlight-badge">!</div>
                    <div className="highlight-content">
                        <h3 className="highlight-title">Важная информация</h3>
                        <p className="highlight-text">
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