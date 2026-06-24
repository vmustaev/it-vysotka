import React from 'react';

const URL_REGEX = /(https?:\/\/\S+)/g;

const DiplomasMessage = ({ text, linkClassName }) => {
    if (!text) return null;

    const parts = text.split(URL_REGEX);

    return (
        <>
            {parts.map((part, index) =>
                /^https?:\/\//.test(part) ? (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClassName}
                    >
                        {part}
                    </a>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </>
    );
};

export default DiplomasMessage;
