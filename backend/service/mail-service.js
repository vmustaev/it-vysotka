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

    /**
     * Письмо-напоминание об эссе
     * @param {string} to email получателя
     * @param {string|null} essayDeadline человеко-понятная дата дедлайна (может быть null)
     * @param {string} profileLink ссылка на личный кабинет / профиль
     */
    async sendEssayReminderMail(to, essayDeadline, profileLink) {
        const currentYear = new Date().getFullYear();

        const deadlineText = essayDeadline
            ? `до ${essayDeadline}`
            : 'до установленного дедлайна по эссе';

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Напоминание: прикрепите эссе для участия в чемпионате IT-ВыСотка',
            text: `Пожалуйста, прикрепите эссе ${deadlineText}. Если эссе не будет прикреплено вовремя, вы можете потерять до 40 баллов в итоговой оценке.\n\nПерейдите в личный кабинет по ссылке: ${profileLink}`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Напоминание об эссе</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка</h1>
                                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 32px 40px;">
                                            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 22px; font-weight: 700; line-height: 1.25;">Напоминание об эссе</h2>
                                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                                В вашем личном кабинете пока не прикреплено эссе.
                                            </p>
                                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                                Пожалуйста, прикрепите эссе ${deadlineText}.
                                            </p>
                                            <p style="margin: 0 0 20px 0; color: #b91c1c; font-size: 14px; line-height: 1.6; font-weight: 600;">
                                                Если эссе не будет прикреплено вовремя, вы можете потерять до 40 баллов в итоговой оценке.
                                            </p>
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 24px;">
                                                        <a href="${profileLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                                                            Перейти в личный кабинет
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8;">
                                                <p style="margin: 0 0 8px 0; font-weight: 500;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
                                                <a href="${profileLink}" style="color: #2563eb; word-break: break-all; text-decoration: none; font-family: 'Courier New', Courier, monospace;">${profileLink}</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                                Вы получили это письмо, потому что зарегистрированы как участник чемпионата IT-ВыСотка.
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

    /**
     * Письмо участнику с командным форматом без команды
     * @param {string} to email получателя
     * @param {string} profileLink ссылка на личный кабинет / профиль
     */
    async sendTeamWithoutTeamReminderMail(to, profileLink) {
        const currentYear = new Date().getFullYear();

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Важно: у вас выбран командный формат участия, но вы без команды',
            text: `У вас в личном кабинете выбран командный формат участия, но вы пока не состоите в команде.\n\nДля участия в чемпионате вам необходимо:\n— создать свою команду;\n— либо присоединиться к существующей команде по пригласительной ссылке;\n— либо, если вы хотите участвовать один, изменить формат участия на индивидуальный в личном кабинете.\n\nПерейдите в личный кабинет по ссылке: ${profileLink}`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Формат участия и команда</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 100%;">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 30px; text-align: center;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка</h1>
                                            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 14px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 32px 40px;">
                                            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 22px; font-weight: 700; line-height: 1.25;">У вас выбран командный формат без команды</h2>
                                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                                В вашем личном кабинете сейчас указан <strong>командный формат участия</strong>, но вы пока не состоите ни в одной команде.
                                            </p>
                                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                                Для участия в чемпионате вам необходимо выбрать один из вариантов:
                                            </p>
                                            <ul style="margin: 0 0 16px 24px; padding: 0; color: #64748b; font-size: 15px; line-height: 1.6;">
                                                <li>создать свою команду в личном кабинете;</li>
                                                <li>присоединиться к уже существующей команде по пригласительной ссылке от лидера команды;</li>
                                                <li>если вы хотите участвовать один, изменить формат участия на <strong>индивидуальный</strong> в личном кабинете.</li>
                                            </ul>
                                            <p style="margin: 0 0 20px 0; color: #b91c1c; font-size: 14px; line-height: 1.6; font-weight: 600;">
                                                Пожалуйста, выполните один из вариантов заранее, чтобы ваше участие в чемпионате было подтверждено.
                                            </p>
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 24px;">
                                                        <a href="${profileLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                                                            Перейти в личный кабинет
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; font-size: 13px; color: #94a3b8;">
                                                <p style="margin: 0 0 8px 0; font-weight: 500;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:</p>
                                                <a href="${profileLink}" style="color: #2563eb; word-break: break-all; text-decoration: none; font-family: 'Courier New', Courier, monospace;">${profileLink}</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                                Вы получили это письмо, потому что зарегистрированы как участник чемпионата IT-ВыСотка.
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

    /**
     * Письмо победителю с поздравлением и информацией о месте
     * @param {string} to email получателя
     * @param {number} place занятое место (1, 2 или 3)
     * @param {string} participantName ФИО участника
     */
    async sendWinnerNotificationMail(to, place, participantName) {
        const currentYear = new Date().getFullYear();

        const placeNames = {
            1: 'ПЕРВОЕ',
            2: 'ВТОРОЕ',
            3: 'ТРЕТЬЕ'
        };

        const placeEmojis = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };

        const placeColors = {
            1: { primary: '#fbbf24', secondary: '#f59e0b', gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
            2: { primary: '#e5e7eb', secondary: '#9ca3af', gradient: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)' },
            3: { primary: '#fb923c', secondary: '#f97316', gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' }
        };

        const placeName = placeNames[place] || `${place}-Е`;
        const placeEmoji = placeEmojis[place] || '🏆';
        const colors = placeColors[place] || placeColors[3];

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Поздравляем с победой в чемпионате IT-ВыСотка ${currentYear}!`,
            text: `Поздравляем, ${participantName}!\n\nВы заняли ${placeName} место в чемпионате по программированию IT-ВыСотка ${currentYear}!\n\nДипломы в скором времени появятся на сайте приемной комиссии УГНТУ: https://pk.rusoil.net/page/olimpiada-ugntu\n\nЕще раз поздравляем вас с заслуженной победой!`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Поздравление с победой</title>
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
                                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка ${currentYear}</h1>
                                            <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Медаль и поздравление -->
                                    <tr>
                                        <td style="padding: 48px 40px; text-align: center;">
                                            <div style="font-size: 80px; line-height: 1; margin-bottom: 24px;">${placeEmoji}</div>
                                            
                                            <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 32px; font-weight: 700; line-height: 1.25;">
                                                Поздравляем с победой!
                                            </h2>
                                            
                                            <p style="margin: 0 0 32px 0; color: #64748b; font-size: 18px; line-height: 1.6;">
                                                <strong>${participantName}</strong>
                                            </p>
                                            
                                            <!-- Блок с местом -->
                                            <div style="background: ${colors.gradient}; border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                                                <p style="margin: 0 0 12px 0; color: rgba(0, 0, 0, 0.7); font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                                    Вы заняли
                                                </p>
                                                <h3 style="margin: 0; color: #1e293b; font-size: 40px; font-weight: 900; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                                    ${placeName} МЕСТО
                                                </h3>
                                            </div>
                                            
                                            <p style="margin: 0 0 24px 0; color: #64748b; font-size: 16px; line-height: 1.7;">
                                                Это выдающийся результат! Вы показали отличные знания в программировании и продемонстрировали высокий уровень подготовки.
                                            </p>
                                            
                                            <!-- Информация о дипломах -->
                                            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; border-radius: 8px; margin-top: 32px; text-align: left;">
                                                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600; line-height: 1.5;">
                                                    Важная информация о дипломах
                                                </p>
                                                <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 15px; line-height: 1.6;">
                                                    Дипломы в скором времени появятся на сайте приемной комиссии УГНТУ:
                                                </p>
                                                <a href="https://pk.rusoil.net/page/olimpiada-ugntu" style="display: inline-block; color: #2563eb; font-size: 15px; font-weight: 600; text-decoration: none; word-break: break-all;">
                                                    https://pk.rusoil.net/page/olimpiada-ugntu
                                                </a>
                                            </div>
                                            
                                            <!-- Финальное поздравление -->
                                            <p style="margin: 32px 0 0 0; color: #1e293b; font-size: 18px; font-weight: 600; line-height: 1.6;">
                                                Еще раз поздравляем вас с заслуженной победой! 
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Команда чемпионата IT-ВыСотка благодарит вас за участие!
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

    /**
     * Письмо участнику о выдаче сертификата
     * @param {string} to email получателя
     * @param {string} participantName ФИО участника
     * @param {string} profileLink ссылка на личный кабинет
     */
    async sendCertificateIssuedMail(to, participantName, profileLink) {
        const currentYear = new Date().getFullYear();

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Ваш сертификат участника чемпионата IT-ВыСотка ${currentYear} готов!`,
            text: `Уважаемый участник ${participantName},\n\nБлагодарим вас за участие в чемпионате по программированию IT-ВыСотка ${currentYear}!\n\nВаш сертификат участника готов и доступен для скачивания в личном кабинете.\n\nПерейдите в личный кабинет по ссылке: ${profileLink}\n\nМы ценим ваше стремление к развитию и надеемся увидеть вас на следующих мероприятиях!`,
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Сертификат готов</title>
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
                                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">IT-ВыСотка ${currentYear}</h1>
                                            <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 500;">Чемпионат по программированию</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Основное содержимое -->
                                    <tr>
                                        <td style="padding: 48px 40px; text-align: center;">
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                                Уважаемый участник,<br><strong>${participantName}</strong>
                                            </p>
                                            
                                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.7;">
                                                Благодарим вас за участие в чемпионате по программированию <strong>IT-ВыСотка ${currentYear}</strong>!
                                            </p>
                                            
                                            <p style="margin: 0 0 32px 0; color: #64748b; font-size: 16px; line-height: 1.7;">
                                                Ваш сертификат участника готов и доступен для скачивания в личном кабинете.
                                            </p>
                                            
                                            <!-- Кнопка -->
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                <tr>
                                                    <td align="center" style="padding-bottom: 32px;">
                                                        <a href="${profileLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; letter-spacing: -0.01em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); border: 2px solid transparent; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
                                                            Перейти в личный кабинет
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <!-- Альтернативная ссылка -->
                                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;">
                                                <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; font-weight: 500;">
                                                    Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:
                                                </p>
                                                <a href="${profileLink}" style="color: #2563eb; word-break: break-all; font-size: 13px; text-decoration: none; font-family: 'Courier New', Courier, monospace;">${profileLink}</a>
                                            </div>
                                            
                                            <!-- Благодарность -->
                                            <p style="margin: 32px 0 0 0; color: #1e293b; font-size: 17px; font-weight: 600; line-height: 1.6;">
                                                Мы ценим ваше стремление к развитию и надеемся увидеть вас на следующих мероприятиях!
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Футер -->
                                    <tr>
                                        <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                                Команда чемпионата IT-ВыСотка благодарит вас за участие!
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