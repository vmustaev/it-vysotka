import React from 'react';

const Contacts = () => {
    return (
        <div className="content-page">
            <div className="page-content">
                <div className="content-page-header">
                    <h1 className="content-page-title">Контакты</h1>
                    <p className="content-page-subtitle">
                        Свяжитесь с нами, если у вас есть вопросы или предложения
                    </p>
                </div>
                
                <div className="content-section">
                    <div className="content-grid content-grid-3">
                        <div className="content-card">
                            <h3 className="content-card-title">Телефон</h3>
                            <div className="content-card-body">
                                <a href="tel:+73472431714">+7 347 243-17-14</a>
                            </div>
                        </div>

                        <div className="content-card">
                            <h3 className="content-card-title">E-mail</h3>
                            <div className="content-card-body">
                                <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a>
                            </div>
                        </div>

                        <div className="content-card">
                            <h3 className="content-card-title">Адрес</h3>
                            <div className="content-card-body">
                                <a 
                                    href="https://yandex.ru/maps/org/ugntu_kafedra_vychislitelnoy_tekhniki_i_inzhenernoy_kibernetiki/1691660559/?ll=56.056627%2C54.818559&z=17.28" 
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

                <div className="content-section">
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