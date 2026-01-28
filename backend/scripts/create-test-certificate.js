const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

async function createTestCertificate() {
    try {
        // Создаем новый PDF документ
        const pdfDoc = await PDFDocument.create();

        // Добавляем страницу А4 (горизонтальная ориентация)
        const page = pdfDoc.addPage([842, 595]); // A4 landscape

        // Загружаем шрифт
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const titleFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const { width, height } = page.getSize();

        // Рисуем рамку
        page.drawRectangle({
            x: 30,
            y: 30,
            width: width - 60,
            height: height - 60,
            borderColor: rgb(0.137, 0.212, 0.392), // #023664
            borderWidth: 3,
        });

        // Внутренняя декоративная рамка
        page.drawRectangle({
            x: 45,
            y: 45,
            width: width - 90,
            height: height - 90,
            borderColor: rgb(0.137, 0.212, 0.392),
            borderWidth: 1,
        });

        // Заголовок
        page.drawText('СЕРТИФИКАТ', {
            x: width / 2 - 150,
            y: height - 100,
            size: 48,
            font: font,
            color: rgb(0.137, 0.212, 0.392),
        });

        // Подзаголовок
        page.drawText('УЧАСТНИКА ОЛИМПИАДЫ', {
            x: width / 2 - 145,
            y: height - 145,
            size: 24,
            font: titleFont,
            color: rgb(0.4, 0.4, 0.4),
        });

        // Текст "Настоящий сертификат выдан"
        page.drawText('Настоящий сертификат выдан', {
            x: width / 2 - 130,
            y: height - 220,
            size: 18,
            font: titleFont,
            color: rgb(0, 0, 0),
        });

        // ЗДЕСЬ БУДЕТ ФИО (место для наложения текста)
        // Координаты примерно: x: 150, y: 280-300
        // В реальном использовании сюда будет подставлено ФИО участника

        // Нижний текст
        page.drawText('за участие в IT-олимпиаде "Высотка"', {
            x: width / 2 - 150,
            y: 180,
            size: 16,
            font: titleFont,
            color: rgb(0, 0, 0),
        });

        // Дата
        const currentDate = new Date().toLocaleDateString('ru-RU');
        page.drawText(`Дата выдачи: ${currentDate}`, {
            x: width / 2 - 80,
            y: 100,
            size: 14,
            font: titleFont,
            color: rgb(0.4, 0.4, 0.4),
        });

        // Сохраняем PDF
        const pdfBytes = await pdfDoc.save();

        // Создаем папку certificates если её нет
        const certificatesDir = path.join(__dirname, '..', 'files', 'certificates');
        try {
            await fs.access(certificatesDir);
        } catch {
            await fs.mkdir(certificatesDir, { recursive: true });
        }

        // Сохраняем файл
        const outputPath = path.join(certificatesDir, 'template_example.pdf');
        await fs.writeFile(outputPath, pdfBytes);

        console.log('✅ Тестовый шаблон сертификата создан:', outputPath);
        console.log('📍 Рекомендуемые координаты для ФИО:');
        console.log('   X: 150-200');
        console.log('   Y: 280-300');
        console.log('   Размер шрифта: 110');
        console.log('   Цвет: #023664');
        
    } catch (error) {
        console.error('❌ Ошибка создания шаблона:', error);
    }
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
    createTestCertificate();
}

module.exports = createTestCertificate;

