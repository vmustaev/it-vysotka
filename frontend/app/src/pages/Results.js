import React, { useState } from 'react';
import '../styles/results.css';

const Results = () => {
    const [activeResultsTab, setActiveResultsTab] = useState('2025');
    const [activeTasksTab, setActiveTasksTab] = useState('2025');

    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Результаты чемпионата по программированию "IT-ВыСотка"</h1>
                    <p className="page-subtitle">
                        Ознакомьтесь с результатами чемпионата и поздравьте победителей
                    </p>
                </div>

                {/* Результаты */}
                <div className="section">
                    <div className="tabs">
                        <button 
                            className={`tab-button ${activeResultsTab === '2025' ? 'active' : ''}`}
                            onClick={() => setActiveResultsTab('2025')}
                        >
                            Результаты 2025 года
                        </button>
                        <button 
                            className={`tab-button ${activeResultsTab === '2024' ? 'active' : ''}`}
                            onClick={() => setActiveResultsTab('2024')}
                        >
                            Результаты 2024 года
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeResultsTab === '2025' && (
                            <div className="results-table-container">
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Место</th>
                                            <th>Участники</th>
                                            <th>Учебное заведение</th>
                                            <th>Город</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>
                                                Камалетдинов Карим Тимурович, Лещенко Даниил Анатольевич, 
                                                Шагалиев Дамир Зинурович, Габитов Шамиль, Фазлетдинов Галим, 
                                                Галимов Эдгар Ильдарович, Кидрасов Данияр Рашитович
                                            </td>
                                            <td>МБОУ Гимназия № 64, ГБОУ РИЛИ</td>
                                            <td>г. Уфа</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>
                                                Валиуллин Альберт Рустемович, Зиганшин Джалиль Ильгамович, 
                                                Юмаев Гайсар Ильгизович, Калимуллин Булат Равилевич, 
                                                Касимцев Елисей Игоревич, Рахматуллин Тимур Романович, 
                                                Акбалин Флюр Рустемович, Абдулганиев Азат Артурович, 
                                                Актуганов Руслан Дмитриевич, Фаузиев Булат Вадимович, 
                                                Аллаяров Аскар Ришатович, Камалов Айдар Маратович, 
                                                Рахимкулов Азамат Ратмирович, Васюткин Артём Вениаминович, 
                                                Габбасов Ранис Русланович, Лукманов Артём Русланович, 
                                                Назаров Алексей Николаевич, Спирин Ярослав Александрович
                                            </td>
                                            <td>ГБОУ РИЛИ, Лицей №83 им. Пинского М. С. УГНТУ, МАОУ Лицей №153, МБОУ Школа № 157</td>
                                            <td>г. Уфа</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>
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
                                            </td>
                                            <td>МАОУ Лицей №153, МАОУ школа №110, МАОУ Гимназия №82 УГНТУ, МБОУ Школа №109, МАОУ Школа № 130, МАОУ Лицей № 123, МАОУ Гимназия №16, МАОУ Гимназия №115, Лицей №83 им. Пинского М. С. УГНТУ</td>
                                            <td>г. Уфа</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeResultsTab === '2024' && (
                            <div className="results-table-container">
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Место</th>
                                            <th>Участники</th>
                                            <th>Учебное заведение</th>
                                            <th>Город</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>
                                                Равиль Хуснутдинов, Артур Нуртдинов, Максим Лапшин, Карам Сулейманов, 
                                                Азат Низамутдинов, Флюр Акбалин, Самат Нуртдинов, Вадим Ахундов
                                            </td>
                                            <td>Республиканский инженерный лицей-интернат</td>
                                            <td>г. Уфа</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>
                                                Марсель Истяков, Данияр Кидрасов, Гайсар Юмаев, 
                                                Джалиль Зиганшин, Альберт Валиуллин, Дмитрий Чековинский, 
                                                Дамир Бадретдинов, Линар Каримов, Азат Абдулганиев, 
                                                Руслан Актуганов, Тигран Асланян, Дамир Галиев, 
                                                Данияр Файрушин, Матвей Ветошкин, Роман Коптюх, 
                                                Тимур Кадыров, Артемий Иванов, Максим Гордиенко, 
                                                Станислав Никитенко
                                            </td>
                                            <td>РИЛИ, гимназия №115, лицей №83 им. Пинского М. С. УГНТУ, лицей №123</td>
                                            <td>г. Уфа</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>
                                                Ранис Габбасов, Марат Худайбердин, Михаил Копачёв, 
                                                Даниил Морозов, Иван Майоров, Лев Шураков, 
                                                Артём Лукманов, Ярослав Спирин, Артём Кадиков, 
                                                Илья Архипов, Артур Зайнетдинов, Никита Лахтионов, 
                                                Алексей Михин, Максим Никулин, Никита Емелёв, 
                                                Александр Торовин, Дмитрий Матвеев, Ильнара Гарифуллина, 
                                                Тимур Лутфурахманов, Никита Дронов, Ксения Демакова, 
                                                Артемий Сагутдинов, Станислав Бурский, Егор Апканиев, 
                                                Артур Ясавиев
                                            </td>
                                            <td>
                                                Гимназия №115, школа №131, школа №157, школа №110, РЖД лицей №1, 
                                                лицей №1 (г. Салават), лицей №107, лицей №155, лицей №6 имени Сафина Н. Д., лицей №68
                                            </td>
                                            <td>г. Уфа, г. Котлас Архангельской области, г. Салават</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Задания */}
                <div className="section">
                    <h2 className="section-title">Задания чемпионата</h2>
                    
                    <div className="tabs">
                        <button 
                            className={`tab-button ${activeTasksTab === '2025' ? 'active' : ''}`}
                            onClick={() => setActiveTasksTab('2025')}
                        >
                            Задания 2025 года
                        </button>
                        <button 
                            className={`tab-button ${activeTasksTab === '2024' ? 'active' : ''}`}
                            onClick={() => setActiveTasksTab('2024')}
                        >
                            Задания 2024 года
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTasksTab === '2025' && (
                            <div className="tasks-grid">
                                <div className="task-card">
                                    <h3>Задание 1: Контакт</h3>
                                    <p>Найти минимальную степень двойки, первые цифры которой совпадают с заданным числом</p>
                                    <a href="/uploads/task1_2025.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 2: Языки программирования</h3>
                                    <p>Определить, может ли слово из словаря быть подпоследовательностью введенной команды</p>
                                    <a href="/uploads/task2_2025.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 3: Грузоподъем</h3>
                                    <p>Найти минимальную стоимость подъема сейфа на заданный этаж с учетом лифтов и лестниц</p>
                                    <a href="/uploads/task3_2025.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 4: Заклинание</h3>
                                    <p>Вычислить магическую силу заклинания, равную количеству вхождений магического сочетания символов</p>
                                    <a href="/uploads/task4_2025.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 5: Садовод</h3>
                                    <p>Определить максимальное количество кустов, которые можно спасти</p>
                                    <a href="/uploads/task5_2025.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                            </div>
                        )}

                        {activeTasksTab === '2024' && (
                            <div className="tasks-grid">
                                <div className="task-card">
                                    <h3>Задание 1</h3>
                                    <p>Постройте маршрут доставки пиццы от пиццерии до отеля</p>
                                    <a href="/uploads/task1.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 2</h3>
                                    <p>Определите стартовую станцию для машинки на гоночной трассе</p>
                                    <a href="/uploads/task2.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 3</h3>
                                    <p>Переформатируйте лицензионный ключ</p>
                                    <a href="/uploads/task3.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
                                    </a>
                                </div>
                                <div className="task-card">
                                    <h3>Задание 4</h3>
                                    <p>Найдите вулкан, название которого начинается и заканчивается на согласную</p>
                                    <a href="/uploads/task4.pdf" className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                        Скачать задание
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