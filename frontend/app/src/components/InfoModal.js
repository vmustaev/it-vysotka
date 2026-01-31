import React from 'react';
import '../styles/info-modal.css';

const InfoModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="info-modal-overlay" onClick={handleBackdropClick}>
            <div className="info-modal">
                <div className="info-modal-body">
                    <p className="info-modal-message">{message}</p>
                </div>
                <div className="info-modal-actions">
                    <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={onClose}
                    >
                        ОК
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;

