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
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f8fafc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Контейнер письма -->
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 100%;">
                                    
                                    <!-- Шапка с градиентом -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 40px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">IT-ВыСотка</h1>
                                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Основное содержимое -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Добро пожаловать!</h2>
                                            
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Спасибо за регистрацию на платформе IT-ВыСотка. Для завершения регистрации и активации вашего аккаунта, пожалуйста, подтвердите ваш email адрес.
                                            </p>
                                            
                                            <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Нажмите на кнопку ниже, чтобы активировать ваш аккаунт:
                                            </p>
                                            
                                            <!-- Кнопка -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                                                            ✓ Активировать аккаунт
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Альтернативная ссылка -->
                                            <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br/>
                                                <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                                Если вы не регистрировались на IT-ВыСотка, просто проигнорируйте это письмо.
                                            </p>
                                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                                © 2024 IT-ВыСотка. Все права защищены.
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
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f8fafc;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <!-- Контейнер письма -->
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; max-width: 100%;">
                                    
                                    <!-- Шапка с градиентом -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 40px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">IT-ВыСотка</h1>
                                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Основное содержимое -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">Сброс пароля</h2>
                                            
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Вы запросили сброс пароля для вашего аккаунта на платформе IT-ВыСотка. 
                                            </p>
                                            
                                            <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Нажмите на кнопку ниже, чтобы создать новый пароль:
                                            </p>
                                            
                                            <!-- Кнопка -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                                                            🔑 Сбросить пароль
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Важное замечание -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 30px;">
                                                <tr>
                                                    <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px;">
                                                        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                                                            ⚠️ Важно: Ссылка действительна только 15 минут
                                                        </p>
                                                        <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
                                                            После истечения времени потребуется повторный запрос на сброс пароля.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Альтернативная ссылка -->
                                            <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br/>
                                                <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                                Если вы не запрашивали сброс пароля, проигнорируйте это письмо. Ваш пароль останется без изменений.
                                            </p>
                                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                                © 2024 IT-ВыСотка. Все права защищены.
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