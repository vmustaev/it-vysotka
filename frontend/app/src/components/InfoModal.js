import React from 'react';
import '../styles/info-modal.css';

const InfoModal = ({ isOpen, title, content, message, onClose }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="info-modal-overlay" onClick={handleBackdropClick}>
            <div className="info-modal">
                {title && (
                    <div className="info-modal-header">
                        <h3>{title}</h3>
                        <button className="info-modal-close" onClick={onClose}>✕</button>
                    </div>
                )}
                <div className="info-modal-body">
                    {content ? content : <p className="info-modal-message">{message}</p>}
                </div>
                <div className="info-modal-actions">
                    <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={onClose}
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;

