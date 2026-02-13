import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';
import '../styles/tasks-section.css';

/**
 * @param {string} variant
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
            
            if (availableYears.length === 0) {
                const allTasksResponse = await FileService.getFilesByType('tasks', {});
                const years = [...new Set(allTasksResponse.files.map(f => f.year).filter(y => y))];
                const sortedYears = years.sort((a, b) => b - a);
                setAvailableYears(sortedYears);
                
                if (variant !== 'results' && sortedYears.length > 0 && selectedYear === null) {
                    setSelectedYear(sortedYears[0]);
                    return;
                }
                
                if (variant === 'results' && sortedYears.length > 0 && !selectedYear) {
                    setSelectedYear(sortedYears[0]);
                    return;
                }
            }
            
            const filters = selectedYear ? { year: selectedYear } : {};
            const response = await FileService.getFilesByType('tasks', filters);
            setTasks(response.files);
        } catch (error) {
            console.error('Ошибка при загрузке заданий:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="tasks-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка заданий...</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="tasks-empty">
                <div className="empty-state-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                </div>
                <h3 className="empty-state-title">Задания пока не доступны</h3>
            </div>
        );
    }

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

    return (
        <div className="tasks-section">
            <div className="tasks-container">
                {availableYears.length > 0 && (
                    <div className="year-tabs">
                        {availableYears.map(year => (
                            <button
                                key={year}
                                className={`year-tab ${selectedYear === year ? 'active' : ''}`}
                                onClick={() => setSelectedYear(year === selectedYear ? null : year)}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                )}

                <div className="tasks-content">
                    <div className="tasks-grid">
                        {tasks.map((task, index) => {
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
            </div>
        </div>
    );
};

export default TasksSection;
