import React, { useState, useEffect } from 'react';
import RoomService from '../../services/RoomService';
import ConfirmDialog from '../../components/ConfirmDialog';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [formData, setFormData] = useState({
        number: '',
        capacity: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await RoomService.getAll();
            setRooms(response.data.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка загрузки аудиторий');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? (value === '' ? '' : parseInt(value) || '') : value
        }));
        // Очищаем ошибку для этого поля
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.number.trim()) {
            errors.number = 'Номер аудитории обязателен';
        } else if (formData.number.trim().length > 50) {
            errors.number = 'Номер аудитории не должен превышать 50 символов';
        }

        if (!formData.capacity || formData.capacity === '') {
            errors.capacity = 'Количество мест обязательно';
        } else if (formData.capacity < 1) {
            errors.capacity = 'Количество мест должно быть не менее 1';
        } else if (!Number.isInteger(formData.capacity)) {
            errors.capacity = 'Количество мест должно быть целым числом';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            if (editingRoom) {
                await RoomService.update(editingRoom.id, formData.number.trim(), formData.capacity);
                setSuccess('Аудитория успешно обновлена');
            } else {
                await RoomService.create(formData.number.trim(), formData.capacity);
                setSuccess('Аудитория успешно создана');
            }

            // Очищаем форму и закрываем
            setFormData({ number: '', capacity: '' });
            setEditingRoom(null);
            setShowForm(false);
            setFormErrors({});

            // Перезагружаем список
            await loadRooms();

            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            const errorMessage = e.response?.data?.message || 'Ошибка при сохранении аудитории';
            setError(errorMessage);
            
            // Если ошибка связана с конкретным полем, показываем её
            if (e.response?.data?.errors) {
                setFormErrors(e.response.data.errors);
            }
        }
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            number: room.number,
            capacity: room.capacity
        });
        setFormErrors({});
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setError('');
            setSuccess('');
            await RoomService.delete(roomToDelete.id);
            setSuccess('Аудитория успешно удалена');
            setShowDeleteDialog(false);
            setRoomToDelete(null);
            await loadRooms();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при удалении аудитории');
            setShowDeleteDialog(false);
            setRoomToDelete(null);
        }
    };

    const handleCancel = () => {
        setFormData({ number: '', capacity: '' });
        setEditingRoom(null);
        setShowForm(false);
        setFormErrors({});
        setError('');
        setSuccess('');
    };

    const handleAddNew = () => {
        setEditingRoom(null);
        setFormData({ number: '', capacity: '' });
        setFormErrors({});
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Аудитории</h1>
                    <p className="admin-page-subtitle">Управление аудиториями для олимпиады</p>
                </div>
                {!showForm && (
                    <button 
                        className="btn btn-primary btn-with-icon"
                        onClick={handleAddNew}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Добавить аудиторию
                    </button>
                )}
            </div>

            {/* Уведомления */}
            {error && (
                <div className="alert alert-error">{error}</div>
            )}
            {success && (
                <div className="alert alert-success">{success}</div>
            )}

            {/* Форма добавления/редактирования */}
            {showForm && (
                <div className="admin-card" style={{ marginBottom: '2rem' }}>
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">
                            {editingRoom ? 'Редактировать аудиторию' : 'Добавить аудиторию'}
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Номер аудитории <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                name="number"
                                className={`admin-form-input ${formErrors.number ? 'input-error' : ''}`}
                                value={formData.number}
                                onChange={handleInputChange}
                                placeholder="Например: 101, 201А, 3-12"
                                maxLength={50}
                            />
                            {formErrors.number && (
                                <span className="admin-form-error">{formErrors.number}</span>
                            )}
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">
                                Количество мест <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                className={`admin-form-input ${formErrors.capacity ? 'input-error' : ''}`}
                                value={formData.capacity}
                                onChange={handleInputChange}
                                placeholder="Введите количество мест"
                                min="1"
                                step="1"
                            />
                            {formErrors.capacity && (
                                <span className="admin-form-error">{formErrors.capacity}</span>
                            )}
                        </div>

                        <div className="admin-form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingRoom ? 'Сохранить изменения' : 'Добавить аудиторию'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Список аудиторий */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner"></div>
                    <p>Загрузка аудиторий...</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                    </div>
                    <h2>Нет аудиторий</h2>
                    <p>Добавьте первую аудиторию, чтобы начать работу</p>
                </div>
            ) : (
                <div className="admin-card">
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Номер аудитории</th>
                                    <th>Количество мест</th>
                                    <th style={{ width: '150px' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id}>
                                        <td>
                                            <strong>{room.number}</strong>
                                        </td>
                                        <td>{room.capacity}</td>
                                        <td>
                                            <div className="admin-table-actions">
                                                <button
                                                    className="btn-icon btn-icon-edit"
                                                    onClick={() => handleEdit(room)}
                                                    title="Редактировать"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="btn-icon btn-icon-delete"
                                                    onClick={() => handleDeleteClick(room)}
                                                    title="Удалить"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Диалог подтверждения удаления */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Удалить аудиторию?"
                message={`Вы уверены, что хотите удалить аудиторию "${roomToDelete?.number}"? Это действие нельзя отменить.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setShowDeleteDialog(false);
                    setRoomToDelete(null);
                }}
                confirmText="Удалить"
                cancelText="Отмена"
                danger={true}
            />
        </div>
    );
};

export default Rooms;
