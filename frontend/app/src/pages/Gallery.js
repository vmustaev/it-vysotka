import React, { useState, useEffect } from 'react';
import FileService from '../services/FileService';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            setLoading(true);
            const response = await FileService.getFilesByType('gallery');
            setImages(response.files);
        } catch (error) {
            console.error('Ошибка при загрузке галереи:', error);
        } finally {
            setLoading(false);
        }
    };

    const openImage = (image) => {
        setSelectedImage(image);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    if (loading) {
        return (
            <div className="content-page">
                <div className="page-content">
                    <div className="content-page-header">
                        <h1 className="content-page-title">Фотографии с чемпионата "IT-высотка"</h1>
                    </div>
                    <div className="content-section" style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '1.2rem', color: '#666' }}>Загрузка фотографий...</div>
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
                
                <div className="content-section">
                    {images.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                            Фотографий пока нет
                        </div>
                    ) : (
                        <div className="gallery-grid">
                            {images.map((image) => (
                                <div 
                                    key={image.id} 
                                    className="gallery-item"
                                    onClick={() => openImage(image)}
                                >
                                    <img 
                                        src={image.url} 
                                        alt={image.description || image.filename}
                                        loading="lazy"
                                    />
                                    <div className="gallery-overlay"></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedImage && (
                    <div className="gallery-modal" onClick={closeImage}>
                        <div className="modal-content">
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.description || selectedImage.filename}
                                onClick={closeImage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gallery;