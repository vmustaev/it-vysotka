import React from 'react';

const Gallery = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Галерея</h1>
                    <p className="page-subtitle">
                        Фотографии и материалы с олимпиады
                    </p>
                </div>
                
                <div className="section">
                    <div className="card">
                        <div className="card-body">
                            <p className="text-secondary">Галерея будет пополняться по мере проведения мероприятий</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;