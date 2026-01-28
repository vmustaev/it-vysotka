import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';
import '../styles/tasks-section.css';

/**
 * Компонент для отображения заданий
 * @param {string} variant - вариант отображения: 'default' или 'results'
 */
const TasksSection = ({ variant = 'default' }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        loadTasks();
    }, [selectedYear]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            
            // Для варианта results сначала загружаем все задания чтобы получить годы
            if (variant === 'results' && !selectedYear && availableYears.length === 0) {
                const response = await FileService.getFilesByType('tasks', {});
                const years = [...new Set(response.files.map(f => f.year).filter(y => y))];
                const sortedYears = years.sort((a, b) => b - a);
                setAvailableYears(sortedYears);
                
                // Устанавливаем последний год по умолчанию
                if (sortedYears.length > 0) {
                    setSelectedYear(sortedYears[0]);
                    return;
                }
            }
            
            const filters = selectedYear ? { year: selectedYear } : {};
            const response = await FileService.getFilesByType('tasks', filters);
            
            setTasks(response.files);

            // Получаем уникальные годы для default варианта
            if (variant !== 'results') {
                const years = [...new Set(response.files.map(f => f.year).filter(y => y))];
                setAvailableYears(years.sort((a, b) => b - a));
            }
        } catch (error) {
            console.error('Ошибка при загрузке заданий:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="tasks-loading">Загрузка заданий...</div>;
    }

    if (tasks.length === 0) {
        return <div className="tasks-empty">Задания пока не доступны</div>;
    }

    // Вариант для страницы Results
    if (variant === 'results') {
        return (
            <>
                <div className="year-tabs">
                    {availableYears.map(year => (
                        <button
                            key={year}
                            className={`year-tab ${selectedYear === year ? 'active' : ''}`}
                            onClick={() => setSelectedYear(year)}
                        >
                            {year}
                        </button>
                    ))}
                </div>

                <div className="tasks-content">
                    <div className="tasks-grid">
                        {tasks.map((task, index) => {
                            // Парсим description: первая строка = название, остальное = описание
                            const lines = (task.description || '').split('\n').filter(l => l.trim());
                            const title = lines[0] || task.filename;
                            const description = lines.slice(1).join(' ') || '';
                            
                            return (
                                <div key={task.id} className="task-card">
                                    <div className="task-number">{String(index + 1).padStart(2, '0')}</div>
                                    <h3 className="task-title">{title}</h3>
                                    {description && (
                                        <p className="task-description">{description}</p>
                                    )}
                                    <a 
                                        href={task.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="task-button"
                                    >
                                        <span>Скачать задание</span>
                                        <span className="button-arrow">→</span>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }

    // Вариант по умолчанию
    return (
        <div className="tasks-section">
            <div className="tasks-container">
                <h2 className="tasks-title">Задания чемпионата</h2>
                <p className="tasks-subtitle">
                    Ознакомьтесь с заданиями прошлых чемпионатов для подготовки
                </p>

                {availableYears.length > 0 && (
                    <div className="year-filter">
                        <button 
                            className={`year-btn ${!selectedYear ? 'active' : ''}`}
                            onClick={() => setSelectedYear(null)}
                        >
                            Все годы
                        </button>
                        {availableYears.map(year => (
                            <button
                                key={year}
                                className={`year-btn ${selectedYear === year ? 'active' : ''}`}
                                onClick={() => setSelectedYear(year)}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="tasks-grid">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="task-card">
                            <div className="task-icon">📄</div>
                            {task.year && (
                                <div className="task-year-badge">{task.year}</div>
                            )}
                            <h3 className="task-name">
                                {task.description || task.filename}
                            </h3>
                            <p className="task-filename">{task.filename}</p>
                            <div className="task-info">
                                <span className="task-size">
                                    {(task.size / 1024).toFixed(0)} КБ
                                </span>
                                <span className="task-type">PDF</span>
                            </div>
                            <a 
                                href={task.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="task-download-btn"
                            >
                                <span>Скачать задание</span>
                                <span className="download-icon">⬇</span>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TasksSection;
