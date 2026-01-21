import React from 'react';
import '../styles/confirm-dialog.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Подтвердить', cancelText = 'Отмена', danger = false }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="confirm-dialog-overlay" onClick={handleBackdropClick}>
            <div className="confirm-dialog">
                <div className="confirm-dialog-header">
                    <h3 className="confirm-dialog-title">{title}</h3>
                </div>
                <div className="confirm-dialog-body">
                    {typeof message === 'string' ? (
                        <p className="confirm-dialog-message">{message}</p>
                    ) : (
                        <div className="confirm-dialog-message">{message}</div>
                    )}
                </div>
                <div className="confirm-dialog-actions">
                    <button 
                        type="button"
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
