import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';
import '../styles/sponsors-section.css';

/**
 * Компонент для отображения логотипов спонсоров
 * Получает файлы с типом 'sponsors' из файловой системы
 */
const SponsorsSection = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSponsors();
    }, []);

    const loadSponsors = async () => {
        try {
            setLoading(true);
            const response = await FileService.getFilesByType('sponsors');
            
            // Фильтруем только изображения
            const sponsorImages = response.files.filter(file => 
                file.mimetype.startsWith('image/')
            );
            
            setSponsors(sponsorImages);
        } catch (error) {
            console.error('Ошибка при загрузке спонсоров:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="sponsors-section">
                <div className="sponsors-loading">Загрузка...</div>
            </section>
        );
    }

    if (sponsors.length === 0) {
        return null; // Не показываем секцию, если нет спонсоров
    }

    return (
        <section className="sponsors-section">
            <div className="sponsors-container">
                <h2 className="sponsors-title">Наши партнеры и спонсоры</h2>
                
                <div className="sponsors-grid">
                    {sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="sponsor-item">
                            <img 
                                src={sponsor.url} 
                                alt={sponsor.description || sponsor.filename}
                                title={sponsor.description || sponsor.filename}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SponsorsSection;
