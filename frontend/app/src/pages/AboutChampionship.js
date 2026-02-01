import React from 'react';
import TasksSection from '../components/TasksSection';
import '../styles/about-championship.css';

const AboutChampionship = () => {
    return (
        <div className="about-championship-page">
            <div className="about-championship-content">
                {/* Hero секция */}
                <div className="about-hero">
                    <h1 className="about-title">
                        О чемпионате
                    </h1>
                    <p className="about-subtitle">
                        Всё, что нужно знать об IT-ВыСотка
                    </p>
                </div>

                {/* Информация о чемпионате */}
                <div className="about-section">
                    <div className="championship-info">
                        <div className="championship-info-block">
                            <h3 className="info-block-title">Формат проведения</h3>
                            <p className="info-block-text">
                                Чемпионат проводится в <strong>очном формате</strong>. 
                                Соревнование командное: в состав команды входит от 1 до 3 человек.
                            </p>
                        </div>

                        <div className="championship-info-block">
                            <h3 className="info-block-title">Задания чемпионата</h3>
                            <p className="info-block-text">
                                Участникам будет предложено <strong>3 задачи</strong> на проверку углубленных знаний содержательной 
                                линии «Программирование» по предмету «Информатика». Продолжительность тура составляет 4 астрономических часа.
                            </p>
                        </div>

                        <div className="championship-info-block">
                            <h3 className="info-block-title">Эссе</h3>
                            <p className="info-block-text">
                                <strong>Обязательное требование:</strong> после активации аккаунта необходимо прикрепить эссе.
                            </p>
                            <ul className="info-block-list">
                                <li><strong>Индивидуальные участники:</strong> прикрепить эссе в личном кабинете</li>
                                <li><strong>Участники команд:</strong> эссе прикрепляет только <strong>лидер команды</strong> в личном кабинете</li>
                            </ul>
                            <p className="info-block-text" style={{ marginTop: '12px', fontSize: '0.95rem', color: '#64748b' }}>
                                Ссылку на эссе необходимо указать в разделе "Эссе" вашего личного кабинета после активации аккаунта.
                            </p>
                        </div>

                        <div className="championship-info-block">
                            <h3 className="info-block-title">Языки программирования</h3>
                            <p className="info-block-text">
                                Разрешены языки программирования: <strong>C++</strong>, <strong>Python</strong>, <strong>Java</strong>.
                            </p>
                        </div>

                        <div className="championship-info-block">
                            <h3 className="info-block-title">Система проверки</h3>
                            <p className="info-block-text">
                                Решения проверяются автоматически на платформе <strong>Яндекс.Контест</strong>. 
                                Команды отправляют решения через Web-интерфейс, система автоматически проверяет их на наборе тестов.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Примеры заданий прошлых лет */}
                <div className="about-section">
                    <h2 className="section-title-main">Примеры заданий прошлых лет</h2>
                    <TasksSection variant="default" />
                </div>
            </div>
        </div>
    );
};

export default AboutChampionship;

