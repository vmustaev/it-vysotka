import React, { useState, useEffect } from 'react';
import ResultsService from '../services/ResultsService';
import '../styles/results.css';

const Results = () => {
    const [years, setYears] = useState([]);
    const [activeResultsTab, setActiveResultsTab] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadYears();
    }, []);

    useEffect(() => {
        if (activeResultsTab) {
            loadResults(activeResultsTab);
        }
    }, [activeResultsTab]);

    const loadYears = async () => {
        try {
            const response = await ResultsService.getYears();
            const yearsData = response.data.data;
            setYears(yearsData);
            if (yearsData.length > 0) {
                setActiveResultsTab(yearsData[0].toString());
            }
        } catch (e) {
            console.error('Ошибка загрузки годов:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadResults = async (year) => {
        try {
            setLoading(true);
            const response = await ResultsService.getResultsByYear(year);
            setResults(response.data.data);
        } catch (e) {
            console.error('Ошибка загрузки результатов:', e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const getPlaceName = (place) => {
        const placeNames = {
            1: 'Первое место',
            2: 'Второе место',
            3: 'Третье место'
        };
        return placeNames[place] || `${place}-е место`;
    };

    const getPlaceClass = (place) => {
        if (place === 1) return 'winner-gold';
        if (place === 2) return 'winner-silver';
        if (place === 3) return 'winner-bronze';
        return '';
    };

    return (
        <div className="results-page">
            <div className="results-content">
                {/* Hero секция */}
                <div className="results-hero">
                    <h1 className="results-title">
                        Результаты IT-ВыСотка
                    </h1>
                </div>

                {/* Секция результатов */}
                <div className="results-section">
                    {years.length > 0 && (
                        <div className="year-tabs">
                            {years.map(year => (
                                <button 
                                    key={year}
                                    className={`year-tab ${activeResultsTab === year.toString() ? 'active' : ''}`}
                                    onClick={() => setActiveResultsTab(year.toString())}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="winners-content">
                        {loading ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: 'var(--spacing-xxl)',
                                color: 'var(--text-secondary)'
                            }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                                <p style={{ marginTop: 'var(--spacing-md)' }}>Загрузка результатов...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: 'var(--spacing-xxl)',
                                color: 'var(--text-secondary)'
                            }}>
                                <p>Результаты для выбранного года пока не добавлены</p>
                            </div>
                        ) : (
                            <div className="winners-grid">
                                {results
                                    .sort((a, b) => a.place - b.place)
                                    .map(result => (
                                        <div 
                                            key={result.id} 
                                            className={`winner-card ${getPlaceClass(result.place)}`}
                                        >
                                            <div className={`medal-badge ${
                                                result.place === 1 ? 'medal-gold' :
                                                result.place === 2 ? 'medal-silver' :
                                                'medal-bronze'
                                            }`}>
                                                <span className="medal-icon">{result.place}</span>
                                            </div>
                                            <h3 className="winner-place">{getPlaceName(result.place)}</h3>
                                            <div className="winner-info">
                                                <div className="info-row">
                                                    <span className="info-label">Участники:</span>
                                                    <p className="info-text">{result.participants}</p>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Учебное заведение:</span>
                                                    <p className="info-text">{result.schools}</p>
                                                </div>
                                                <div className="info-row">
                                                    <span className="info-label">Город:</span>
                                                    <p className="info-text">{result.cities}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;