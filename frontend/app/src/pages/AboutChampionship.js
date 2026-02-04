import React, { useState, useEffect } from 'react';
import TasksSection from '../components/TasksSection';
import FileService from '../services/FileService';
import '../styles/about-championship.css';

const AboutChampionship = () => {
    const [essayRequirementsDoc, setEssayRequirementsDoc] = useState(null);
    const [loadingEssayDoc, setLoadingEssayDoc] = useState(true);

    useEffect(() => {
        const loadEssayDoc = async () => {
            try {
                const response = await FileService.getFilesByType('regulations');
                const doc = response.files?.find(f => f.subType === 'essay_requirements') || null;
                setEssayRequirementsDoc(doc);
            } catch (e) {
                console.error('Ошибка загрузки документа требований к эссе:', e);
            } finally {
                setLoadingEssayDoc(false);
            }
        };
        loadEssayDoc();
    }, []);
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
                                Чемпионат проводится в <strong>очном формате</strong>. Участвовать можно как индивидуально, так и в составе команды.
                            </p>
                        </div>

                        <div className="championship-info-block">
                            <h3 className="info-block-title">Задания и эссе</h3>
                            <p className="info-block-text">
                                Чемпионат состоит из <strong>3 заданий</strong> и <strong>эссе</strong>. За задачи можно получить <strong>60 баллов</strong>, за эссе – <strong>40 баллов</strong>. Всего можно получить 100 баллов.
                            </p>
                            <p className="info-block-text" style={{ marginTop: '12px' }}>
                                Участникам предлагаются три задачи, направленные на проверку углублённых знаний содержательной линии «Программирование» по предмету «Информатика». На решение задач отводится 2 часа, ещё 2 часа – на обсуждение и выступление с эссе.
                            </p>
                            <p className="info-block-text" style={{ marginTop: '12px' }}>
                                Ссылку на эссе необходимо прикрепить в личном кабинете: участникам индивидуального формата – самостоятельно, участникам команд – у лидера команды.
                            </p>
                            {essayRequirementsDoc ? (
                                <a href={essayRequirementsDoc.url} target="_blank" rel="noopener noreferrer" className="about-essay-doc-link">
                                    Требования к эссе
                                </a>
                            ) : !loadingEssayDoc ? null : (
                                <p className="info-block-text" style={{ marginTop: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>Загрузка...</p>
                            )}
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

