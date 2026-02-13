import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';
import '../styles/public-gallery.css';

const PublicGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
    const [years, setYears] = useState([]);
    const [activeYear, setActiveYear] = useState(null);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await FileService.getFilesByType('gallery');
            
            const imageFiles = (response.files || []).filter(file => 
                file.mimetype.startsWith('image/')
            );
            
            setImages(imageFiles);

            const yearSet = new Set();
            let hasNoYear = false;

            imageFiles.forEach(file => {
                if (file.year) {
                    yearSet.add(file.year);
                } else {
                    hasNoYear = true;
                }
            });

            const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
            const yearsForTabs = [...sortedYears];

            if (hasNoYear) {
                yearsForTabs.push('no-year');
            }

            setYears(yearsForTabs);
            if (yearsForTabs.length > 0) {
                setActiveYear(yearsForTabs[0]);
            }
        } catch (error) {
            console.error('Ошибка при загрузке галереи:', error);
            setError('Не удалось загрузить галерею');
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (image) => {
        setSelectedImage(image);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % images.length;
        } else {
            newIndex = currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1;
        }

        setSelectedImage(images[newIndex]);
    };

    const getFilteredImages = () => {
        if (!activeYear) return images;

        if (activeYear === 'no-year') {
            return images.filter(img => !img.year);
        }

        return images.filter(img => img.year === activeYear);
    };

    const filteredImages = getFilteredImages();

    if (loading) {
        return (
            <div className="gallery-container">
                <div className="gallery-loading">
                    <div className="spinner"></div>
                    <p>Загрузка галереи...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gallery-container">
                <div className="gallery-error">
                    <p>{error}</p>
                    <button onClick={loadGallery}>Попробовать снова</button>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="gallery-container">
                <div className="gallery-empty">
                    <p>Галерея пуста</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            <h2 className="gallery-title">Галерея</h2>

            {years.length > 0 && (
                <div className="year-tabs" style={{ marginBottom: '24px' }}>
                    {years.map(year => (
                        <button
                            key={year}
                            className={`year-tab ${activeYear === year ? 'active' : ''}`}
                            onClick={() => setActiveYear(year)}
                        >
                            {year === 'no-year' ? 'Год не указан' : year}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="gallery-grid">
                {filteredImages.map((image) => (
                    <div 
                        key={image.id} 
                        className="gallery-item"
                        onClick={() => openLightbox(image)}
                    >
                        <img 
                            src={image.url} 
                            alt={image.description || image.filename}
                            loading="lazy"
                        />
                        {image.description && (
                            <div className="gallery-item-overlay">
                                <p>{image.description}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button 
                        className="lightbox-close"
                        onClick={closeLightbox}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>

                    <button 
                        className="lightbox-nav lightbox-prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage('prev');
                        }}
                        aria-label="Предыдущее"
                    >
                        ‹
                    </button>

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={selectedImage.url} 
                            alt={selectedImage.description || selectedImage.filename}
                        />
                        {selectedImage.description && (
                            <div className="lightbox-description">
                                {selectedImage.description}
                            </div>
                        )}
                    </div>

                    <button 
                        className="lightbox-nav lightbox-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage('next');
                        }}
                        aria-label="Следующее"
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicGallery;
