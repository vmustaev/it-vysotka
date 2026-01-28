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

        if (!selectedParticipant) {
            setNotification({ type: 'error', message: 'Выберите участника' });
            return;
        }

        try {
            setLoading(true);
            
            // Сначала сохраняем настройки
            await CertificateService.updateSettings(settings);
            
            // Затем получаем финальный предпросмотр с текстом
            const response = await CertificateService.preview(selectedParticipant);
            
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

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                <h1 className="admin-page-title">Сертификаты</h1>
                    <p className="admin-page-subtitle">Генерация сертификатов для участников</p>
                </div>
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
                    <div className="admin-section" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Выдача сертификатов участникам</h2>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Выберите участников, которым нужно выдать сертификаты. Сертификаты будут сгенерированы и сохранены, после чего участники смогут скачать их в своих профилях.
                            </p>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <button 
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        const allChecked = participants.length === participants.filter(p => selectedParticipants.includes(p.id)).length;
                                        if (allChecked) {
                                            setSelectedParticipants([]);
                                        } else {
                                            setSelectedParticipants(participants.map(p => p.id));
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {participants.length === selectedParticipants.length ? 'Снять все' : 'Выбрать всех'}
                                </button>
                                
                                <button 
                                    className="btn btn-primary btn-with-icon"
                                    onClick={handleIssueCertificates}
                                    disabled={loading || selectedParticipants.length === 0}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="7"/>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                    </svg>
                                    Выдать сертификаты ({selectedParticipants.length})
                                </button>
                            </div>

                            <div style={{ 
                                maxHeight: '400px', 
                                overflowY: 'auto', 
                                border: '1px solid var(--border)', 
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--bg-primary)'
                            }}>
                                {participants.length > 0 ? (
                                    <div>
                                        {participants.map((participant) => (
                                            <label 
                                                key={participant.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    borderBottom: '1px solid var(--border)',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    backgroundColor: selectedParticipants.includes(participant.id) ? 'var(--bg-secondary)' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                                                onMouseLeave={(e) => {
                                                    if (!selectedParticipants.includes(participant.id)) {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
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
                                                    disabled={loading}
                                                    style={{ marginRight: '1rem', cursor: 'pointer', width: '18px', height: '18px' }}
                                                />
                                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>
                                                        {participant.last_name} {participant.first_name} {participant.second_name || ''}
                                                    </span>
                                                    {participant.certificateUrl && (
                                                        <span style={{ 
                                                            color: 'var(--success)', 
                                                            fontSize: '0.875rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="20 6 9 17 4 12"/>
                                                            </svg>
                                                            Выдан
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Нет участников
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

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

                    <div className="admin-section" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Предпросмотр</h2>
                        
                        {templatePreviewUrl && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                {!showInteractive && (
                                    <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                                        <button 
                                            className="btn btn-sm btn-outline"
                                            onClick={() => setShowInteractive(true)}
                                        >
                                            Вернуться к настройке
                                        </button>
                                    </div>
                                )}

                                {showInteractive ? (
                                    <CertificatePreview 
                                        templateUrl={templatePreviewUrl}
                                        textY={settings.textY}
                                        templateHeight={templateSize.height}
                                        onTextYChange={(newY) => handleSettingsChange('textY', newY)}
                                    />
                                ) : finalPreviewUrl ? (
                                    <div style={{ 
                                        border: '1px solid var(--border)', 
                                        borderRadius: 'var(--radius)',
                                        overflow: 'hidden',
                                        backgroundColor: 'var(--bg-secondary)'
                                    }}>
                                        <iframe
                                            src={finalPreviewUrl}
                                            style={{
                                                width: '100%',
                                                height: '600px',
                                                border: 'none'
                                            }}
                                            title="Финальный предпросмотр сертификата"
                                        />
                                    </div>
                                ) : null}
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Выберите участника для финального предпросмотра</label>
                            <select
                                className="form-select"
                                value={selectedParticipant || ''}
                                onChange={(e) => setSelectedParticipant(parseInt(e.target.value))}
                                style={{ maxWidth: '400px' }}
                            >
                                {participants.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.last_name} {p.first_name} {p.second_name || ''}
                                    </option>
                                ))}
                            </select>
            </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="btn btn-primary"
                                onClick={handlePreview}
                                disabled={loading || !selectedParticipant}
                            >
                                {loading ? 'Генерация...' : 'Финальный предпросмотр'}
                            </button>

                            <button 
                                className="btn btn-outline"
                                onClick={handleGenerateOne}
                                disabled={loading || !selectedParticipant}
                            >
                                Скачать сертификат
                            </button>
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
