import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';
import '../styles/regulations.css';

const Regulations = () => {
    const [documents, setDocuments] = useState({
        roditeli: null,
        uchastniki: null,
        polozhenie: null,
        booklet: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await FileService.getFilesByType('regulations');
            const docs = response.files;

            // Маппинг файлов по их именам
            const docsMap = {
                roditeli: docs.find(d => d.filename.toLowerCase().includes('roditeli') || d.filename.toLowerCase().includes('родител')),
                uchastniki: docs.find(d => d.filename.toLowerCase().includes('uchastniki') || d.filename.toLowerCase().includes('участник')),
                polozhenie: docs.find(d => d.filename.toLowerCase().includes('polozhenie') || d.filename.toLowerCase().includes('положение')),
                booklet: docs.find(d => d.filename.toLowerCase().includes('booklet') || d.filename.toLowerCase().includes('памятка'))
            };

            setDocuments(docsMap);
        } catch (error) {
            console.error('Ошибка при загрузке документов:', error);
        } finally {
            setLoading(false);
        }
    };

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
                            {documents.roditeli ? (
                                <a href={documents.roditeli.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="card-button">
                                    <span>Скачать форму согласия</span>
                                    <span className="button-arrow">→</span>
                                </a>
                            ) : (
                                <div className="document-unavailable">
                                    {loading ? (
                                        <div className="document-loading">
                                            <div className="document-spinner"></div>
                                            <span>Загрузка...</span>
                                        </div>
                                    ) : (
                                        <div className="document-empty">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/>
                                                <line x1="16" y1="17" x2="8" y2="17"/>
                                            </svg>
                                            <span>Документ пока не доступен</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Карточка 2 */}
                        <div className="regulation-card">
                            <div className="card-number">02</div>
                            <h3 className="card-title">Согласие для совершеннолетних</h3>
                            <p className="card-description">
                                Если участник старше 18 лет, необходимо предоставить <strong>согласие на обработку персональных данных</strong>
                            </p>
                            {documents.uchastniki ? (
                                <a href={documents.uchastniki.url} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="card-button">
                                    <span>Скачать форму согласия</span>
                                    <span className="button-arrow">→</span>
                                </a>
                            ) : (
                                <div className="document-unavailable">
                                    {loading ? (
                                        <div className="document-loading">
                                            <div className="document-spinner"></div>
                                            <span>Загрузка...</span>
                                        </div>
                                    ) : (
                                        <div className="document-empty">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/>
                                                <line x1="16" y1="17" x2="8" y2="17"/>
                                            </svg>
                                            <span>Документ пока не доступен</span>
                                        </div>
                                    )}
                                </div>
                            )}
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
                            {documents.polozhenie ? (
                                <a href={documents.polozhenie.url} target="_blank" rel="noopener noreferrer">
                                    Положением о Чемпионате
                                </a>
                            ) : (
                                <span style={{ color: '#999' }}>Положением о Чемпионате</span>
                            )}
                            {' '}и с{' '}
                            {documents.booklet ? (
                                <a href={documents.booklet.url} target="_blank" rel="noopener noreferrer">
                                    Памяткой участникам соревнований
                                </a>
                            ) : (
                                <span style={{ color: '#999' }}>Памяткой участникам соревнований</span>
                            )}
                            {' '}для полного понимания правил и требований проведения чемпионата.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Regulations;