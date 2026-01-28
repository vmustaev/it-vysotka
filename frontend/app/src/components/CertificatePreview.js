import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Устанавливаем путь к worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CertificatePreview = ({ templateUrl, textY, templateHeight, onTextYChange }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [pageHeight, setPageHeight] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!templateUrl) return;

        const loadPdf = async () => {
            try {
                setIsLoading(true);
                const loadingTask = pdfjsLib.getDocument(templateUrl);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);

                const canvas = canvasRef.current;
                if (!canvas) return;
                
                const context = canvas.getContext('2d');

                // Вычисляем масштаб для отображения
                const containerWidth = containerRef.current?.offsetWidth || 800;
                const viewport = page.getViewport({ scale: 1 });
                const computedScale = containerWidth / viewport.width;
                
                const scaledViewport = page.getViewport({ scale: computedScale });
                
                canvas.height = scaledViewport.height;
                canvas.width = scaledViewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                await page.render(renderContext).promise;
                
                // Устанавливаем значения только после успешного рендера
                setScale(computedScale);
                setPageHeight(viewport.height);
                setIsLoading(false);
            } catch (error) {
                console.error('Ошибка загрузки PDF:', error);
                setIsLoading(false);
            }
        };

        loadPdf();
    }, [templateUrl]);

    // Конвертируем Y координату из PDF системы (снизу) в CSS систему (сверху)
    const linePositionFromTop = pageHeight > 0 ? (pageHeight - textY) * scale : 0;

    // Обработчики для перетаскивания
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
        
        // Конвертируем из CSS координат (сверху) в PDF координаты (снизу)
        const pdfY = pageHeight - (clickY / scale);
        
        // Ограничиваем значение в пределах страницы
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
                cursor: isDragging ? 'grabbing' : 'grab',
                minHeight: isLoading ? '400px' : 'auto'
            }}
        >
            {isLoading && (
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
            
            <canvas 
                ref={canvasRef}
                style={{ 
                    display: isLoading ? 'none' : 'block',
                    width: '100%',
                    height: 'auto'
                }}
            />
            
            {/* Горизонтальная линия для позиции текста */}
            {!isLoading && pageHeight > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: `${linePositionFromTop}px`,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: isDragging ? '#ff3333' : '#ff0000',
                        zIndex: 10,
                        boxShadow: isDragging ? '0 0 10px rgba(255, 0, 0, 0.8)' : '0 0 5px rgba(255, 0, 0, 0.5)',
                        pointerEvents: 'none',
                        transition: isDragging ? 'none' : 'top 0.1s ease-out'
                    }}
                >
                    {/* Метки по краям */}
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
                    
                    {/* Подпись с координатой */}
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

