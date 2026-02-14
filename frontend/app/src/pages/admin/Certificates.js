import React, { useState, useEffect, useRef } from 'react';
import CertificateService from '../../services/CertificateService';
import ParticipantsService from '../../services/ParticipantsService';
import Toast from '../../components/Toast';
import CertificatePreview from '../../components/CertificatePreview';

const Certificates = () => {
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        textX: 0,
        textY: 0,
        fontSize: 110,
        fontColor: '#023664'
    });
    const [templateSize, setTemplateSize] = useState({ width: 0, height: 0 });
    const [hasTemplate, setHasTemplate] = useState(false);
    const [templatePreviewUrl, setTemplatePreviewUrl] = useState(null);
    const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [showInteractive, setShowInteractive] = useState(true);
    const [fontUploaded, setFontUploaded] = useState(false);
    const [sendingNotifications, setSendingNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterFormat, setFilterFormat] = useState('');
    const [filterAttendance, setFilterAttendance] = useState('');
    const [showOnlyWithoutCertificate, setShowOnlyWithoutCertificate] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    
    // Refs для отслеживания blob URLs для правильной очистки
    const templateUrlRef = useRef(null);
    const finalUrlRef = useRef(null);

    useEffect(() => {
        loadSettings();
        loadParticipants();
        
        // Очистка blob URLs при размонтировании
        return () => {
            if (templateUrlRef.current) {
                URL.revokeObjectURL(templateUrlRef.current);
            }
            if (finalUrlRef.current) {
                URL.revokeObjectURL(finalUrlRef.current);
            }
        };
    }, []);

    const loadSettings = async () => {
        try {
            const response = await CertificateService.getSettings();
            if (response.data.data) {
                const data = response.data.data;
                setSettings({
                    textX: data.textX || 0,
                    textY: data.textY || 0,
                    fontSize: data.fontSize || 110,
                    fontColor: data.fontColor || '#023664'
                });
                setTemplateSize({
                    width: Math.round(data.templateWidth || 0),
                    height: Math.round(data.templateHeight || 0)
                });
                setHasTemplate(true);
                
                // Проверяем, загружен ли шрифт
                if (data.fontPath) {
                    setFontUploaded(true);
                }
                
                await loadTemplatePreview();
            }
        } catch (e) {
            // Шаблон еще не загружен
            setHasTemplate(false);
        }
    };

    const loadTemplatePreview = async () => {
        try {
            const response = await CertificateService.getTemplateFile();
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const newUrl = URL.createObjectURL(blob);
            
            // Освобождаем старый URL
            if (templateUrlRef.current) {
                URL.revokeObjectURL(templateUrlRef.current);
            }
            
            // Сохраняем новый URL в state и ref
            templateUrlRef.current = newUrl;
            setTemplatePreviewUrl(newUrl);
        } catch (e) {
            console.error('Ошибка загрузки шаблона для предпросмотра:', e);
        }
    };

    const loadParticipants = async () => {
        try {
            const response = await ParticipantsService.getAll({ 
                limit: 1000,
                sortBy: 'last_name',
                sortOrder: 'ASC'
            });
            setParticipants(response.data.data.participants);
            if (response.data.data.participants.length > 0) {
                setSelectedParticipant(response.data.data.participants[0].id);
            }
        } catch (e) {
            console.error('Ошибка загрузки участников:', e);
        }
    };

    const handleTemplateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setNotification({ type: 'error', message: 'Выберите PDF файл' });
            return;
        }

        try {
            setLoading(true);
            const response = await CertificateService.uploadTemplate(file, settings);
            
            // Получаем размеры шаблона из ответа
            if (response.data.data) {
                const data = response.data.data;
                setTemplateSize({
                    width: Math.round(data.templateWidth || 0),
                    height: Math.round(data.templateHeight || 0)
                });
                // Устанавливаем начальные координаты в центр
                setSettings(prev => ({
                    ...prev,
                    textX: Math.round(data.templateWidth / 2) || prev.textX,
                    textY: Math.round(data.templateHeight / 2) || prev.textY
                }));
            }
            
            setNotification({ type: 'success', message: 'Шаблон успешно загружен!' });
            setHasTemplate(true);
            
            // Загружаем настройки (включая предпросмотр шаблона)
            await loadSettings();
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка загрузки шаблона' });
        } finally {
            setLoading(false);
            e.target.value = ''; // Сбрасываем input
        }
    };

    const handleFontUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.ttf') && !file.name.endsWith('.otf')) {
            setNotification({ type: 'error', message: 'Выберите файл шрифта (.ttf или .otf)' });
            return;
        }

        try {
            setLoading(true);
            await CertificateService.uploadFont(file);
            setFontUploaded(true);
            setNotification({ type: 'success', message: 'Шрифт успешно загружен!' });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка загрузки шрифта' });
        } finally {
            setLoading(false);
            e.target.value = ''; // Сбрасываем input
        }
    };

    const handleSettingsChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);
            await CertificateService.updateSettings(settings);
            setNotification({ type: 'success', message: 'Настройки сохранены!' });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка сохранения настроек' });
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        if (!hasTemplate) {
            setNotification({ type: 'error', message: 'Сначала загрузите шаблон' });
            return;
        }

        try {
            setLoading(true);
            
            // Сначала сохраняем настройки
            await CertificateService.updateSettings(settings);
            
            // Затем получаем финальный предпросмотр с текстом (без participantId = используется тестовый "Иванов Иван")
            const response = await CertificateService.preview();
            
            // Создаем URL для blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const newUrl = URL.createObjectURL(blob);
            
            // Освобождаем предыдущий URL
            if (finalUrlRef.current) {
                URL.revokeObjectURL(finalUrlRef.current);
            }
            
            // Сохраняем новый URL в state и ref
            finalUrlRef.current = newUrl;
            setFinalPreviewUrl(newUrl);
            setShowInteractive(false);
            setNotification({ type: 'success', message: 'Финальный предпросмотр готов!' });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка генерации предпросмотра' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOne = async () => {
        if (!hasTemplate) {
            setNotification({ type: 'error', message: 'Сначала загрузите шаблон' });
            return;
        }

        if (!selectedParticipant) {
            setNotification({ type: 'error', message: 'Выберите участника' });
            return;
        }

        try {
            setLoading(true);
            const response = await CertificateService.generateOne(selectedParticipant);
            
            // Скачиваем сертификат
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const participant = participants.find(p => p.id === selectedParticipant);
            const filename = `certificate_${participant?.last_name || 'participant'}.pdf`;
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setNotification({ type: 'success', message: 'Сертификат скачан!' });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка генерации сертификата' });
        } finally {
            setLoading(false);
        }
    };

    const handleIssueCertificates = async () => {
        if (!hasTemplate) {
            setNotification({ type: 'error', message: 'Сначала загрузите шаблон' });
            return;
        }

        if (selectedParticipants.length === 0) {
            setNotification({ type: 'error', message: 'Выберите участников' });
            return;
        }

        try {
            setLoading(true);
            const response = await CertificateService.issueCertificates(selectedParticipants);
            
            setNotification({ 
                type: 'success', 
                message: `Выдано сертификатов: ${response.data.data.success} из ${response.data.data.total}` 
            });

            // Обновляем список участников, чтобы показать кто получил сертификаты
            await loadParticipants();
            
            // Очищаем выбор
            setSelectedParticipants([]);
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка выдачи сертификатов' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendCertificateNotifications = async () => {
        try {
            setSendingNotifications(true);
            const response = await CertificateService.sendCertificateNotifications();
            
            setNotification({ 
                type: 'success', 
                message: response.data.message || 'Письма о сертификатах отправлены' 
            });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка отправки уведомлений' });
        } finally {
            setSendingNotifications(false);
        }
    };

    const handleIssueAllCertificates = async () => {
        if (!hasTemplate) {
            setNotification({ type: 'error', message: 'Сначала загрузите шаблон' });
            return;
        }

        const participantsWithoutCertificates = filteredParticipants.filter(p => !p.certificateId);
        
        if (participantsWithoutCertificates.length === 0) {
            setNotification({ type: 'error', message: 'Нет участников без сертификатов' });
            return;
        }

        if (!window.confirm(`Выдать сертификаты всем участникам (${participantsWithoutCertificates.length} чел.)?`)) {
            return;
        }

        try {
            setLoading(true);
            const allIds = participantsWithoutCertificates.map(p => p.id);
            const response = await CertificateService.issueCertificates(allIds);
            
            setNotification({ 
                type: 'success', 
                message: `Выдано сертификатов: ${response.data.data.success} из ${response.data.data.total}` 
            });

            await loadParticipants();
            setSelectedParticipants([]);
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка выдачи сертификатов' });
        } finally {
            setLoading(false);
        }
    };

    // Фильтрация участников
    const filteredParticipants = participants.filter(participant => {
        // Поиск по ФИО
        if (searchQuery) {
            const fullName = `${participant.last_name} ${participant.first_name} ${participant.second_name || ''}`.toLowerCase();
            if (!fullName.includes(searchQuery.toLowerCase())) {
                return false;
            }
        }

        // Фильтр по классу
        if (filterGrade && participant.grade !== parseInt(filterGrade)) {
            return false;
        }

        // Фильтр по формату участия
        if (filterFormat && participant.participation_format !== filterFormat) {
            return false;
        }

        // Фильтр по присутствию
        if (filterAttendance === 'true' && !participant.attendance) {
            return false;
        }
        if (filterAttendance === 'false' && participant.attendance) {
            return false;
        }

        // Показывать только без сертификата
        if (showOnlyWithoutCertificate && participant.certificateId) {
            return false;
        }

        return true;
    });

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                <h1 className="admin-page-title">Сертификаты</h1>
                    <p className="admin-page-subtitle">Генерация сертификатов для участников</p>
                </div>
                <button
                    onClick={() => setShowInfoModal(true)}
                    style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = '#475569';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#64748b';
                    }}
                    title="Информация"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                </button>
            </div>

            <div className="admin-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Загрузка шаблона</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label className="btn btn-primary btn-with-icon" style={{ margin: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Выбрать PDF шаблон
                        <input 
                            type="file" 
                            accept=".pdf"
                            onChange={handleTemplateUpload}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />
                    </label>

                    {hasTemplate && (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Шаблон загружен
                        </span>
                    )}
                </div>
            </div>

            <div className="admin-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Загрузка шрифта</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label className="btn btn-outline btn-with-icon" style={{ margin: 0 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="4 7 4 4 20 4 20 7"/>
                            <line x1="9" y1="20" x2="15" y2="20"/>
                            <line x1="12" y1="4" x2="12" y2="20"/>
                        </svg>
                        Загрузить шрифт
                        <input 
                            type="file" 
                            accept=".ttf,.otf"
                            onChange={handleFontUpload}
                            style={{ display: 'none' }}
                            disabled={loading}
                        />
                    </label>

                    {fontUploaded && (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Шрифт загружен
                        </span>
                    )}
                </div>
            </div>

            {hasTemplate && (
                <>
                    {/* Настройка параметров текста */}
                    <div className="admin-section" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Настройка параметров текста</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="form-label">Размер шрифта</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={settings.fontSize}
                                    onChange={(e) => handleSettingsChange('fontSize', parseInt(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="form-label">Цвет текста</label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={settings.fontColor}
                                        onChange={(e) => handleSettingsChange('fontColor', e.target.value)}
                                        style={{ width: '50px', height: '38px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={settings.fontColor}
                                        onChange={(e) => handleSettingsChange('fontColor', e.target.value)}
                                        placeholder="#023664"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            className="btn btn-primary"
                            onClick={handleSaveSettings}
                            disabled={loading}
                        >
                            Сохранить настройки
                        </button>
                    </div>

                    {/* Предпросмотр сертификата */}
                    <div className="admin-section" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Предпросмотр сертификата</h2>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            {showInteractive && templatePreviewUrl && (
                                <CertificatePreview
                                    templateUrl={templatePreviewUrl}
                                    textY={settings.textY}
                                    templateHeight={templateSize.height}
                                    onTextYChange={(newY) => handleSettingsChange('textY', newY)}
                                />
                            )}

                            {!showInteractive && finalPreviewUrl && (
                                <div>
                                    <button 
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setShowInteractive(true)}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        ← Вернуться к настройке
                                    </button>
                                    <iframe
                                        src={finalPreviewUrl}
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius)'
                                        }}
                                        title="Финальный предпросмотр"
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                {showInteractive && (
                                    <button 
                                        className="btn btn-primary btn-with-icon"
                                        onClick={handlePreview}
                                        disabled={loading}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                        {loading ? 'Генерация...' : 'Финальный предпросмотр'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Выдача сертификатов */}
                    <div className="admin-section" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Выдача сертификатов участникам</h2>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Выберите участников, которым нужно выдать сертификаты. Сертификаты будут сгенерированы и сохранены, после чего участники смогут скачать их в своих профилях.
                            </p>
                            
                            {/* Фильтры */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '1rem', 
                                marginBottom: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Поиск по ФИО..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-input"
                                    style={{ margin: 0 }}
                                />
                                
                                <select
                                    value={filterGrade}
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                    className="form-select"
                                    style={{ margin: 0 }}
                                >
                                    <option value="">Все классы</option>
                                    <option value="9">9 класс</option>
                                    <option value="10">10 класс</option>
                                    <option value="11">11 класс</option>
                                </select>
                                
                                <select
                                    value={filterFormat}
                                    onChange={(e) => setFilterFormat(e.target.value)}
                                    className="form-select"
                                    style={{ margin: 0 }}
                                >
                                    <option value="">Все форматы</option>
                                    <option value="individual">Индивидуальное</option>
                                    <option value="team">Командное</option>
                                </select>
                                
                                <select
                                    value={filterAttendance}
                                    onChange={(e) => setFilterAttendance(e.target.value)}
                                    className="form-select"
                                    style={{ margin: 0 }}
                                >
                                    <option value="">Все участники</option>
                                    <option value="true">Пришедшие</option>
                                    <option value="false">Не пришедшие</option>
                                </select>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={showOnlyWithoutCertificate}
                                        onChange={(e) => setShowOnlyWithoutCertificate(e.target.checked)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>Только без сертификата</span>
                                </label>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button 
                                    className="btn btn-primary btn-with-icon"
                                    onClick={handleIssueCertificates}
                                    disabled={loading || selectedParticipants.length === 0}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="7"/>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                    </svg>
                                    Выдать выбранным ({selectedParticipants.length})
                                </button>

                                <button 
                                    className="btn btn-secondary btn-with-icon"
                                    onClick={handleSendCertificateNotifications}
                                    disabled={sendingNotifications}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16v13H5.17L4 18.17z"/>
                                        <polyline points="22 6 12 13 2 6"/>
                                    </svg>
                                    {sendingNotifications ? 'Отправка писем...' : 'Отправить письма'}
                                </button>
                                
                                <div style={{ 
                                    marginLeft: 'auto', 
                                    color: 'var(--text-secondary)', 
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <span>Показано: {filteredParticipants.length} из {participants.length}</span>
                                    <span>С сертификатом: {filteredParticipants.filter(p => p.certificateId).length}</span>
                                </div>
                            </div>

                            {/* Таблица участников */}
                            <div className="participants-table-container">
                                {filteredParticipants.length > 0 ? (
                                    <table className="participants-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px', textAlign: 'center' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={filteredParticipants.length > 0 && filteredParticipants.every(p => selectedParticipants.includes(p.id))}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedParticipants(filteredParticipants.map(p => p.id));
                                                            } else {
                                                                setSelectedParticipants([]);
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </th>
                                                <th>ФИО</th>
                                                <th>Класс</th>
                                                <th>Школа</th>
                                                <th>Формат</th>
                                                <th style={{ width: '80px', textAlign: 'center' }}>Пришел</th>
                                                <th style={{ textAlign: 'center' }}>Сертификат</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredParticipants.map((participant) => (
                                                <tr key={participant.id}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedParticipants.includes(participant.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedParticipants([...selectedParticipants, participant.id]);
                                                                } else {
                                                                    setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="participant-name">
                                                            {participant.last_name} {participant.first_name}
                                                        </div>
                                                    </td>
                                                    <td>{participant.grade}</td>
                                                    <td style={{ fontSize: 'var(--font-size-sm)' }}>
                                                        {participant.school || '-'}
                                                    </td>
                                                    <td>
                                                        {participant.participation_format === 'individual' ? (
                                                            <span className="badge badge-info">Индивидуальный</span>
                                                        ) : (
                                                            <span className="badge badge-team">Командный</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: participant.attendance ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                                        {participant.attendance ? 'Да' : 'Нет'}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        {participant.certificateId ? (
                                                            <span className="badge" style={{ 
                                                                background: '#10b981', 
                                                                color: 'white',
                                                                padding: '4px 12px'
                                                            }}>
                                                                ✓ Выдан
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="admin-placeholder">
                                        <div className="admin-placeholder-icon">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                        </div>
                                        <h2>Участники не найдены</h2>
                                        <p>Попробуйте изменить фильтры поиска</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!hasTemplate && (
            <div className="admin-placeholder">
                <div className="admin-placeholder-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                    </svg>
                </div>
                    <h2>Загрузите шаблон сертификата</h2>
                    <p>Начните с загрузки PDF шаблона сертификата</p>
            </div>
            )}

            {/* Модальное окно с инструкцией */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Полезные советы</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowInfoModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ lineHeight: '1.8' }}>
                            <ul style={{ marginLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                <li>Загрузите PDF шаблон сертификата перед началом работы</li>
                                <li>Используйте интерактивный предпросмотр для точной настройки позиции текста</li>
                                <li>Фильтр "Пришедшие" поможет выдать сертификаты только присутствующим участникам</li>
                                <li>Вы можете выбрать конкретных участников или выдать сертификаты всем сразу</li>
                                <li>После выдачи сертификатов участники смогут скачать их в своих профилях</li>
                                <li>Используйте функцию отправки писем для уведомления участников о готовности сертификатов</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast уведомление */}
            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                    duration={5000}
                />
            )}
        </div>
    );
};

export default Certificates;
