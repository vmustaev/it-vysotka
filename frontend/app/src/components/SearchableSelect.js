import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    isLoading = false,
    disabled = false,
    error = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);
    const searchInputRef = useRef(null);

    // Локальная фильтрация опций
    useEffect(() => {
        if (searchQuery) {
            const filtered = options.filter(opt => 
                opt.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [searchQuery, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Фокус на поле поиска при открытии
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchFocus = (e) => {
        e.stopPropagation();
    };

    return (
        <div ref={wrapperRef} className="searchable-select">
            <div
                onClick={handleInputClick}
                className="searchable-select-input-wrapper"
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
                <input
                    type="text"
                    value={value}
                    readOnly
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`searchable-select-input ${error ? 'error' : ''}`}
                />
                <div className="searchable-select-arrow">
                    ▼
                </div>
            </div>
            {isOpen && !disabled && (
                <div className="searchable-select-dropdown">
                    {/* Поле поиска внутри select */}
                    <div className="searchable-select-search">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            placeholder="Поиск..."
                            className="searchable-select-search-input"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {/* Список опций */}
                    <div className="searchable-select-options">
                        {isLoading ? (
                            <div className="searchable-select-loading">
                                Загрузка...
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="searchable-select-empty">
                                Ничего не найдено
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(option)}
                                    className={`searchable-select-option ${value === option ? 'selected' : ''}`}
                                >
                                    {option}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;

