import React, { useState } from 'react';
import '../styles/results.css';

const Results = () => {
    const [activeResultsTab, setActiveResultsTab] = useState('2025');
    const [activeTasksTab, setActiveTasksTab] = useState('2025');

    return (
        <div className="results-page">
            <div className="results-content">
                {/* Hero секция */}
                <div className="results-hero">
                    <h1 className="results-title">
                        Результаты IT-ВыСотка
                    </h1>
                    <p className="results-subtitle">
                        Поздравляем победителей и участников чемпионата
                    </p>
                </div>

                {/* Секция результатов */}
                <div className="results-section">
                    <h2 className="section-title-main">Победители чемпионата</h2>
                    
                    <div className="year-tabs">
                        <button 
                            className={`year-tab ${activeResultsTab === '2025' ? 'active' : ''}`}
                            onClick={() => setActiveResultsTab('2025')}
                        >
                            2025
                        </button>
                        <button 
                            className={`year-tab ${activeResultsTab === '2024' ? 'active' : ''}`}
                            onClick={() => setActiveResultsTab('2024')}
                        >
                            2024
                        </button>
                    </div>

                    <div className="winners-content">
                        {activeResultsTab === '2025' && (
                            <div className="winners-grid">
                                <div className="winner-card winner-gold">
                                    <div className="medal-badge medal-gold">
                                        <span className="medal-icon">1</span>
                                    </div>
                                    <h3 className="winner-place">Первое место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Камалетдинов Карим Тимурович, Лещенко Даниил Анатольевич, 
                                                Шагалиев Дамир Зинурович, Габитов Шамиль, Фазлетдинов Галим, 
                                                Галимов Эдгар Ильдарович, Кидрасов Данияр Рашитович
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">МБОУ Гимназия № 64, ГБОУ РИЛИ</p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="winner-card winner-silver">
                                    <div className="medal-badge medal-silver">
                                        <span className="medal-icon">2</span>
                                    </div>
                                    <h3 className="winner-place">Второе место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Валиуллин Альберт Рустемович, Зиганшин Джалиль Ильгамович, 
                                                Юмаев Гайсар Ильгизович, Калимуллин Булат Равилевич, 
                                                Касимцев Елисей Игоревич, Рахматуллин Тимур Романович, 
                                                Акбалин Флюр Рустемович, Абдулганиев Азат Артурович, 
                                                Актуганов Руслан Дмитриевич, Фаузиев Булат Вадимович, 
                                                Аллаяров Аскар Ришатович, Камалов Айдар Маратович, 
                                                Рахимкулов Азамат Ратмирович, Васюткин Артём Вениаминович, 
                                                Габбасов Ранис Русланович, Лукманов Артём Русланович, 
                                                Назаров Алексей Николаевич, Спирин Ярослав Александрович
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">ГБОУ РИЛИ, Лицей №83 им. Пинского М. С. УГНТУ, МАОУ Лицей №153, МБОУ Школа № 157</p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="winner-card winner-bronze">
                                    <div className="medal-badge medal-bronze">
                                        <span className="medal-icon">3</span>
                                    </div>
                                    <h3 className="winner-place">Третье место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Гарифуллина Ильнара Маратовна, Лутфурахманов Тимур Артурович, 
                                                Сагутдинов Артемий Владимирович, Архипов Илья Юрьевич, 
                                                Зайнетдинов Артур Айратович, Трофимов Кирилл Максимович, 
                                                Хисаев Виталий Эдуардович, Насибуллин Урал Марселевич, 
                                                Валиев Данир Айнурович, Кудрявцев Илья Денисович, 
                                                Новолодский Дмитрий Александрович, Курбангалиев Амир Ринатович, 
                                                Матвеев Дмитрий Михайлович, Худайбердин Марат Русланович, 
                                                Никитенко Станислав Владимирович, Васимирская София Александровна, 
                                                Зинатуллин Арсен Ирекович, Якупов Арсен Эдуардович, 
                                                Назарова Полина Олеговна, Сулейманов Дамир Азатович, 
                                                Файрушин Данияр Айратович
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">МАОУ Лицей №153, МАОУ школа №110, МАОУ Гимназия №82 УГНТУ, МБОУ Школа №109, МАОУ Школа № 130, МАОУ Лицей № 123, МАОУ Гимназия №16, МАОУ Гимназия №115, Лицей №83 им. Пинского М. С. УГНТУ</p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeResultsTab === '2024' && (
                            <div className="winners-grid">
                                <div className="winner-card winner-gold">
                                    <div className="medal-badge medal-gold">
                                        <span className="medal-icon">1</span>
                                    </div>
                                    <h3 className="winner-place">Первое место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Равиль Хуснутдинов, Артур Нуртдинов, Максим Лапшин, Карам Сулейманов, 
                                                Азат Низамутдинов, Флюр Акбалин, Самат Нуртдинов, Вадим Ахундов
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">Республиканский инженерный лицей-интернат</p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="winner-card winner-silver">
                                    <div className="medal-badge medal-silver">
                                        <span className="medal-icon">2</span>
                                    </div>
                                    <h3 className="winner-place">Второе место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Марсель Истяков, Данияр Кидрасов, Гайсар Юмаев, 
                                                Джалиль Зиганшин, Альберт Валиуллин, Дмитрий Чековинский, 
                                                Дамир Бадретдинов, Линар Каримов, Азат Абдулганиев, 
                                                Руслан Актуганов, Тигран Асланян, Дамир Галиев, 
                                                Данияр Файрушин, Матвей Ветошкин, Роман Коптюх, 
                                                Тимур Кадыров, Артемий Иванов, Максим Гордиенко, 
                                                Станислав Никитенко
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">РИЛИ, гимназия №115, лицей №83 им. Пинского М. С. УГНТУ, лицей №123</p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="winner-card winner-bronze">
                                    <div className="medal-badge medal-bronze">
                                        <span className="medal-icon">3</span>
                                    </div>
                                    <h3 className="winner-place">Третье место</h3>
                                    <div className="winner-info">
                                        <div className="info-row">
                                            <span className="info-label">Участники:</span>
                                            <p className="info-text">
                                                Ранис Габбасов, Марат Худайбердин, Михаил Копачёв, 
                                                Даниил Морозов, Иван Майоров, Лев Шураков, 
                                                Артём Лукманов, Ярослав Спирин, Артём Кадиков, 
                                                Илья Архипов, Артур Зайнетдинов, Никита Лахтионов, 
                                                Алексей Михин, Максим Никулин, Никита Емелёв, 
                                                Александр Торовин, Дмитрий Матвеев, Ильнара Гарифуллина, 
                                                Тимур Лутфурахманов, Никита Дронов, Ксения Демакова, 
                                                Артемий Сагутдинов, Станислав Бурский, Егор Апканиев, 
                                                Артур Ясавиев
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Учебное заведение:</span>
                                            <p className="info-text">
                                                Гимназия №115, школа №131, школа №157, школа №110, РЖД лицей №1, 
                                                лицей №1 (г. Салават), лицей №107, лицей №155, лицей №6 имени Сафина Н. Д., лицей №68
                                            </p>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Город:</span>
                                            <p className="info-text">г. Уфа, г. Котлас Архангельской области, г. Салават</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Секция заданий */}
                <div className="tasks-section">
                    <h2 className="section-title-main">Задания чемпионата</h2>
                    
                    <div className="year-tabs">
                        <button 
                            className={`year-tab ${activeTasksTab === '2025' ? 'active' : ''}`}
                            onClick={() => setActiveTasksTab('2025')}
                        >
                            2025
                        </button>
                        <button 
                            className={`year-tab ${activeTasksTab === '2024' ? 'active' : ''}`}
                            onClick={() => setActiveTasksTab('2024')}
                        >
                            2024
                        </button>
                    </div>

                    <div className="tasks-content">
                        {activeTasksTab === '2025' && (
                            <div className="tasks-grid">
                                <div className="task-card">
                                    <div className="task-number">01</div>
                                    <h3 className="task-title">Контакт</h3>
                                    <p className="task-description">Найти минимальную степень двойки, первые цифры которой совпадают с заданным числом</p>
                                    <a href="/files/task1_2025.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">02</div>
                                    <h3 className="task-title">Языки программирования</h3>
                                    <p className="task-description">Определить, может ли слово из словаря быть подпоследовательностью введенной команды</p>
                                    <a href="/files/task2_2025.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">03</div>
                                    <h3 className="task-title">Грузоподъем</h3>
                                    <p className="task-description">Найти минимальную стоимость подъема сейфа на заданный этаж с учетом лифтов и лестниц</p>
                                    <a href="/files/task3_2025.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">04</div>
                                    <h3 className="task-title">Заклинание</h3>
                                    <p className="task-description">Вычислить магическую силу заклинания, равную количеству вхождений магического сочетания символов</p>
                                    <a href="/files/task4_2025.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">05</div>
                                    <h3 className="task-title">Садовод</h3>
                                    <p className="task-description">Определить максимальное количество кустов, которые можно спасти</p>
                                    <a href="/files/task5_2025.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {activeTasksTab === '2024' && (
                            <div className="tasks-grid">
                                <div className="task-card">
                                    <div className="task-number">01</div>
                                    <h3 className="task-title">Маршрут доставки</h3>
                                    <p className="task-description">Постройте маршрут доставки пиццы от пиццерии до отеля</p>
                                    <a href="/files/task1.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">02</div>
                                    <h3 className="task-title">Гоночная трасса</h3>
                                    <p className="task-description">Определите стартовую станцию для машинки на гоночной трассе</p>
                                    <a href="/files/task2.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">03</div>
                                    <h3 className="task-title">Лицензионный ключ</h3>
                                    <p className="task-description">Переформатируйте лицензионный ключ</p>
                                    <a href="/files/task3.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                                <div className="task-card">
                                    <div className="task-number">04</div>
                                    <h3 className="task-title">Вулкан</h3>
                                    <p className="task-description">Найдите вулкан, название которого начинается и заканчивается на согласную</p>
                                    <a href="/files/task4.pdf" className="task-button" target="_blank" rel="noopener noreferrer">
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Results;