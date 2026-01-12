import React from 'react';
import '../styles/contacts.css';

const Contacts = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Контакты</h1>
                    <p className="page-subtitle">
                        Свяжитесь с нами, если у вас есть вопросы или предложения
                    </p>
                </div>
                
                <div className="section">
                    <div className="contacts-grid">
                        <div className="contact-card">
                            <div className="contact-header">
                                <h3>Телефон</h3>
                            </div>
                            <div className="contact-body">
                                <a href="tel:+73472431714">+7 347 243-17-14</a>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="contact-header">
                                <h3>E-mail</h3>
                            </div>
                            <div className="contact-body">
                                <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a>
                            </div>
                        </div>

                        <div className="contact-card">
                            <div className="contact-header">
                                <h3>Адрес</h3>
                            </div>
                            <div className="contact-body">
                                <a 
                                    href="https://go.2gis.com/7yqth" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    450064, Республика Башкортостан, г. Уфа, ул. Космонавтов, дом 1<br />
                                    (главный корпус УГНТУ), кафедра «Вычислительная техника и инженерная кибернетика», каб. 434
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="map-container">
                        <iframe 
                            src="https://yandex.ru/map-widget/v1/?um=constructor%3Ac539861e7580230ac0b39a7fab9a04944404e83940da9d7886985362804f8c69&amp;source=constructor" 
                            width="100%" 
                            height="400" 
                            frameBorder="0"
                            title="Карта расположения"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;