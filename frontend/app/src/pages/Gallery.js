import React, { useState } from 'react';
import '../styles/gallery.css';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        'DSC_0194-min.JPG',
        'DSC_5314-min.JPG',
        'DSC_5316-min.JPG',
        'DSC_5320-min.JPG',
        'DSC_5389-min.JPG',
        'DSC_5402-min.JPG',
        'DSC_5419-min.JPG',
        'DSC_5432-min.JPG',
        'DSC_5441-min.jpg',
        'DSC_5452-min.jpg',
        'DSC_5552-min.jpg',
        'DSC_5560-min.jpg',
        'DSC_5630-min.jpg',
        'IMG_1620-min.jpg',
        'IMG_1624-min.jpg',
        'IMG_1674-min.jpg',
        'IMG_1676-min.jpg',
        'IMG_1683-min.jpg',
        'IMG_1762-min.jpg',
        'IMG_1796-min.jpg',
        'ITchamp-0044-min.jpg'
    ];

    const openImage = (image) => {
        setSelectedImage(image);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Фотографии с чемпионата "IT-высотка"</h1>
                    <p className="page-subtitle">
                        Яркие моменты и атмосфера соревнований
                    </p>
                </div>
                
                <div className="section">
                    <div className="gallery-grid">
                        {images.map((image, index) => (
                            <div 
                                key={index} 
                                className="gallery-item"
                                onClick={() => openImage(image)}
                            >
                                <img 
                                    src={`/uploads/${image}`} 
                                    alt={`Фото ${index + 1}`}
                                    loading="lazy"
                                />
                                <div className="gallery-overlay"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedImage && (
                    <div className="gallery-modal" onClick={closeImage}>
                        <div className="modal-content">
                            <img 
                                src={`/uploads/${selectedImage}`} 
                                alt="Увеличенное фото"
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