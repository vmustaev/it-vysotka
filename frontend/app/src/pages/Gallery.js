import React, { useState, useEffect, useRef, useCallback } from 'react';
import FileService from '../services/FileService';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [activeYear, setActiveYear] = useState(null);
    const [visibleImages, setVisibleImages] = useState(9); // Показываем первые 9 изображений
    const observerRef = useRef(null);
    const loadMoreRef = useRef(null);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            setLoading(true);
            const response = await FileService.getFilesByType('gallery');
            const files = response.files || [];

            setImages(files);

            const yearSet = new Set();
            let hasNoYear = false;

            files.forEach(file => {
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
        } finally {
            setLoading(false);
        }
    };

    const openImage = (image) => {
        setSelectedImage(image);
        document.body.style.overflow = 'hidden';
    };

    const closeImage = () => {
        setSelectedImage(null);
        document.body.style.overflow = '';
    };

    const navigateImage = (direction) => {
        if (!selectedImage || images.length === 0) return;
        
        const currentIndex = images.findIndex(img => img.id === selectedImage.id);
        let newIndex;
        
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        } else {
            newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        }
        
        setSelectedImage(images[newIndex]);
    };

    useEffect(() => {
        if (!selectedImage) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeImage();
            } else if (e.key === 'ArrowLeft') {
                navigateImage('prev');
            } else if (e.key === 'ArrowRight') {
                navigateImage('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedImage, images]);

    const getFilteredImages = () => {
        if (!activeYear) return images;

        if (activeYear === 'no-year') {
            return images.filter(img => !img.year);
        }

        return images.filter(img => img.year === activeYear);
    };

    const filteredImages = getFilteredImages();
    
    // Сброс видимых изображений при смене года
    useEffect(() => {
        setVisibleImages(9);
        loadingMoreRef.current = false;
    }, [activeYear]);

    // Intersection Observer для подгрузки изображений
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        const handleObserver = (entries) => {
            const target = entries[0];
            if (target.isIntersecting && visibleImages < filteredImages.length && !loadingMoreRef.current) {
                loadingMoreRef.current = true;
                // Добавляем небольшую задержку для предотвращения множественных загрузок
                setTimeout(() => {
                    setVisibleImages(prev => Math.min(prev + 9, filteredImages.length));
                    loadingMoreRef.current = false;
                }, 100);
            }
        };

        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '300px',
            threshold: 0.1
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [visibleImages, filteredImages.length]);

    const displayedImages = filteredImages.slice(0, visibleImages);

    if (loading) {
        return (
            <div className="content-page">
                <div className="page-content">
                    <div className="content-page-header">
                        <h1 className="content-page-title">Фотографии с чемпионата "IT-высотка"</h1>
                    </div>
                    <div className="content-section">
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Загрузка фотографий...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-page">
            <div className="page-content">
                <div className="content-page-header">
                    <h1 className="content-page-title">Фотографии с чемпионата "IT-высотка"</h1>
                    <p className="content-page-subtitle">
                        Яркие моменты и атмосфера соревнований
                    </p>
                </div>
                
                {years.length > 0 && (
                    <div className="results-section" style={{ paddingTop: 0 }}>
                        <div className="year-tabs">
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
                    </div>
                )}

                <div className="content-section">
                    {filteredImages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </div>
                            <h3 className="empty-state-title">Фотографий для выбранного года пока нет</h3>
                        </div>
                    ) : (
                        <>
                            <div className="gallery-grid">
                                {displayedImages.map((image) => (
                                    <div 
                                        key={image.id} 
                                        className="gallery-item"
                                        onClick={() => openImage(image)}
                                    >
                                        <img 
                                            src={image.url} 
                                            alt={image.description || image.filename}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        <div className="gallery-overlay"></div>
                                    </div>
                                ))}
                            </div>
                            {visibleImages < filteredImages.length && (
                                <div ref={loadMoreRef} className="loading-more">
                                    <div className="loading-spinner"></div>
                                    <p>Загрузка еще {Math.min(9, filteredImages.length - visibleImages)} фото...</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {selectedImage && (
                    <div className="gallery-modal" onClick={closeImage}>
                        <button 
                            className="gallery-modal-close"
                            onClick={closeImage}
                            aria-label="Закрыть"
                        >
                            ✕
                        </button>

                        <button 
                            className="gallery-modal-nav gallery-modal-prev"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('prev');
                            }}
                            aria-label="Предыдущее фото"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>

                        <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description || selectedImage.filename}
                            />
                            {selectedImage.description && (
                                <div className="gallery-modal-description">
                                    {selectedImage.description}
                                </div>
                            )}
                        </div>

                        <button 
                            className="gallery-modal-nav gallery-modal-next"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('next');
                            }}
                            aria-label="Следующее фото"
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;