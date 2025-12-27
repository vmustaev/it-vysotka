import React from 'react';

const Results = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Результаты</h1>
                    <p className="page-subtitle">
                        Просмотрите результаты олимпиады и свои достижения
                    </p>
                </div>
                
                <div className="section">
                    <div className="card">
                        <div className="card-body">
                            <p className="text-secondary">Результаты будут доступны после завершения олимпиады</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;