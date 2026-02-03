const nodemailer = require("nodemailer");

class MailService {

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }

    async sendActivationMail(to, link){
        const currentYear = new Date().getFullYear();
        
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: "Активация аккаунта IT-ВыСотка",
            text: `Для активации аккаунта перейдите по ссылке: ${link}`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Активация аккаунта</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Контейнер письма -->
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                                    
                                    <!-- Шапка с градиентом -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 48px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка</h1>
                                            <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Основное содержимое -->
                                    <tr>
                                        <td style="padding: 48px 40px;">
                                            <h2 style="margin: 0 0 24px 0; color: #1e293b; font-size: 28px; font-weight: 700; line-height: 1.25;">Добро пожаловать!</h2>
                                            
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Спасибо за регистрацию на платформе IT-ВыСотка. Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email адрес.
                                            </p>
                                            
                                            <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Нажмите на кнопку ниже, чтобы активировать ваш аккаунт:
                                            </p>
                                            
                                            <!-- Кнопка -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 32px;">
                                                        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                                                            Активировать аккаунт
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Альтернативная ссылка -->
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                                                <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">
                                                    Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:
                                                </p>
                                                <a href="${link}" style="color: #2563eb; word-break: break-all; font-size: 13px; text-decoration: none; font-family: 'Courier New', Courier, monospace;">${link}</a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Если вы не регистрировались на IT-ВыСотка, просто проигнорируйте это письмо.
                                            </p>
                                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                                © ${currentYear} IT-ВыСотка. Все права защищены.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        })
    }

    async sendResetMail(to, link){
        const currentYear = new Date().getFullYear();
        
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Сброс пароля IT-ВыСотка',
            text: `Для сброса пароля перейдите по ссылке: ${link}. Ссылка действительна 15 минут.`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Сброс пароля</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Контейнер письма -->
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                                    
                                    <!-- Шапка с градиентом -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 48px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка</h1>
                                            <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Основное содержимое -->
                                    <tr>
                                        <td style="padding: 48px 40px;">
                                            <h2 style="margin: 0 0 24px 0; color: #1e293b; font-size: 28px; font-weight: 700; line-height: 1.25;">Сброс пароля</h2>
                                            
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Вы запросили сброс пароля для вашего аккаунта на платформе IT-ВыСотка. 
                                            </p>
                                            
                                            <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Нажмите на кнопку ниже, чтобы создать новый пароль:
                                            </p>
                                            
                                            <!-- Кнопка -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 32px;">
                                                        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                                                            Сбросить пароль
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Важное замечание -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                                                <tr>
                                                    <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px;">
                                                        <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 15px; font-weight: 600; line-height: 1.5;">
                                                            ⚠️ Важно: Ссылка действительна только 15 минут
                                                        </p>
                                                        <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                                                            После истечения времени потребуется повторный запрос на сброс пароля.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Альтернативная ссылка -->
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                                                <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">
                                                    Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:
                                                </p>
                                                <a href="${link}" style="color: #2563eb; word-break: break-all; font-size: 13px; text-decoration: none; font-family: 'Courier New', Courier, monospace;">${link}</a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.
                                            </p>
                                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                                © ${currentYear} IT-ВыСотка. Все права защищены.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        });
    }
}

module.exports = new MailService();