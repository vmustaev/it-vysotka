import React, { useEffect, useRef, useState } from 'react';

const CertificatePreview = ({ templateUrl, textY, templateHeight, templateWidth, onTextYChange }) => {
    const containerRef = useRef(null);
    const iframeRef = useRef(null);
    const overlayRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [pageHeight, setPageHeight] = useState(0);
    const [pageWidth, setPageWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!templateUrl) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Получаем ширину контейнера
        const containerWidth = containerRef.current?.offsetWidth || 800;
        
        // Стандартный размер A4 в пунктах PDF: 595 x 842
        const standardA4Width = 595;
        const standardA4Height = 842;
        
        // Используем переданные размеры шаблона или стандартный A4
        let pdfWidth, pdfHeight;
        
        // Проверяем, что размеры в разумных пределах (A4 обычно 595x842, но могут быть другие форматы)
        // Максимальный разумный размер: 3000x4000 пунктов
        const MAX_REASONABLE_SIZE = 4000;
        
        if (templateWidth && templateWidth > 0 && templateWidth < MAX_REASONABLE_SIZE &&
            templateHeight && templateHeight > 0 && templateHeight < MAX_REASONABLE_SIZE) {
            // Используем реальные размеры шаблона
            pdfWidth = templateWidth;
            pdfHeight = templateHeight;
        } else if (templateHeight && templateHeight > 0 && templateHeight < MAX_REASONABLE_SIZE) {
            // Если есть только высота, вычисляем ширину сохраняя пропорции A4
            pdfWidth = (templateHeight * standardA4Width / standardA4Height);
            pdfHeight = templateHeight;
        } else {
            // Используем стандартный A4, если размеры не переданы или выглядят неправильно
            pdfWidth = standardA4Width;
            pdfHeight = standardA4Height;
        }
        
        // Вычисляем масштаб так, чтобы PDF поместился по ширине контейнера
        const computedScale = containerWidth / pdfWidth;
        
        setScale(computedScale);
        setPageHeight(pdfHeight);
        setPageWidth(pdfWidth);
        
        // Даем время iframe загрузиться
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [templateUrl, templateHeight, templateWidth]);

    // Вычисляем позицию красной полоски
    // textY - это координата Y в системе координат PDF (0 внизу, pageHeight вверху)
    // Нам нужно преобразовать это в позицию от верха экрана
    const linePositionFromTop = pageHeight > 0 ? (pageHeight - textY) * scale : 0;

    const handleMouseDown = (e) => {
        setIsDragging(true);
        updatePosition(e);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            updatePosition(e);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const updatePosition = (e) => {
        if (!containerRef.current || !onTextYChange || pageHeight === 0) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        
        // Преобразуем координату клика в координату PDF
        // clickY - это позиция от верха контейнера
        // В PDF координатах: 0 внизу, pageHeight вверху
        const pdfY = pageHeight - (clickY / scale);
        
        const clampedY = Math.max(0, Math.min(pageHeight, pdfY));
        
        onTextYChange(clampedY);
    };

    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e) => handleMouseMove(e);
            const upHandler = () => handleMouseUp();
            
            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
            
            return () => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
            };
        }
    }, [isDragging, pageHeight, scale, onTextYChange]);

    return (
        <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            style={{ 
                position: 'relative',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
                maxWidth: '100%',
                width: '100%',
                height: isLoading ? '400px' : (pageHeight > 0 ? `${pageHeight * scale}px` : 'auto'),
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            {isLoading && !error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    zIndex: 20
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--border)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px'
                    }} />
                    <div>Загрузка шаблона...</div>
                </div>
            )}
            
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#ff4444',
                    zIndex: 20,
                    padding: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid #ff4444',
                    maxWidth: '80%'
                }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Ошибка загрузки</div>
                    <div style={{ fontSize: '14px', marginBottom: '15px' }}>{error}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Проверьте, что файл шаблона загружен и доступен.
                    </div>
                </div>
            )}
            
            {/* embed для отображения PDF без панели инструментов */}
            {!isLoading && (
                <embed
                    ref={iframeRef}
                    src={`${templateUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    type="application/pdf"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: pageHeight > 0 ? `${pageHeight * scale}px` : 'auto',
                        border: 'none',
                        pointerEvents: 'none' // Отключаем взаимодействие, чтобы клики попадали на overlay
                    }}
                    title="PDF Preview"
                />
            )}
            
            {/* Overlay для интерактивности (вместо canvas) */}
            {!isLoading && pageHeight > 0 && (
                <div
                    ref={overlayRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${pageHeight * scale}px`,
                        pointerEvents: 'auto',
                        zIndex: 5
                    }}
                />
            )}
            
            {/* Красная полоска для индикации позиции текста */}
            {!isLoading && pageHeight > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${linePositionFromTop}px`,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: isDragging ? '#ff3333' : '#ff0000',
                        zIndex: 15,
                        boxShadow: isDragging ? '0 0 10px rgba(255, 0, 0, 0.8)' : '0 0 5px rgba(255, 0, 0, 0.5)',
                        pointerEvents: 'none',
                        transition: isDragging ? 'none' : 'top 0.1s ease-out'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '-8px',
                        width: '20px',
                        height: '18px',
                        backgroundColor: '#ff0000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="12,2 22,12 12,22 2,12" />
                        </svg>
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '-8px',
                        width: '20px',
                        height: '18px',
                        backgroundColor: '#ff0000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <polygon points="12,2 22,12 12,22 2,12" />
                        </svg>
                    </div>
                    
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '-30px',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#ff0000',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                        Текст здесь (Y: {Math.round(textY)})
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatePreview;