import React from 'react';
import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-copyright">
                    <span>© 2025 IT-Высотка</span>
                </div>
                <div className="footer-contact">
                    <span>По всем вопросам обращайтесь на электронную почту{' '}
                        <a href="mailto:it.vysotka.usptu@mail.ru">it.vysotka.usptu@mail.ru</a>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

