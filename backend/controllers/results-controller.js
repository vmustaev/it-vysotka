const resultsService = require('../service/results-service');
const ApiError = require('../exceptions/api-error');

class ResultsController {
    /**
     * Получить все результаты
     */
    async getAllResults(req, res, next) {
        try {
            const results = await resultsService.getAllResults();
            return res.json({
                success: true,
                data: results
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить результаты по году (публичный endpoint)
     */
    async getResultsByYear(req, res, next) {
        try {
            const { year } = req.params;
            const yearNum = parseInt(year);
            
            if (isNaN(yearNum)) {
                throw ApiError.BadRequest('Некорректный год');
            }

            const results = await resultsService.getResultsByYear(yearNum);
            return res.json({
                success: true,
                data: results
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить список годов (публичный endpoint)
     */
    async getYears(req, res, next) {
        try {
            const years = await resultsService.getYears();
            return res.json({
                success: true,
                data: years
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Создать результат (админ)
     */
    async createResult(req, res, next) {
        try {
            const { year, place, participants, schools, cities } = req.body;

            if (!year || !place || !participants || !schools || !cities) {
                throw ApiError.BadRequest('Все поля обязательны для заполнения');
            }

            const result = await resultsService.createResult({
                year: parseInt(year),
                place: parseInt(place),
                participants,
                schools,
                cities
            });

            return res.json({
                success: true,
                data: result,
                message: 'Результат успешно создан'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Обновить результат (админ)
     */
    async updateResult(req, res, next) {
        try {
            const { id } = req.params;
            const { year, place, participants, schools, cities } = req.body;

            const result = await resultsService.updateResult(id, {
                year: year ? parseInt(year) : undefined,
                place: place ? parseInt(place) : undefined,
                participants,
                schools,
                cities
            });

            return res.json({
                success: true,
                data: result,
                message: 'Результат успешно обновлен'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Удалить результат (админ)
     */
    async deleteResult(req, res, next) {
        try {
            const { id } = req.params;
            await resultsService.deleteResult(id);
            return res.json({
                success: true,
                message: 'Результат успешно удален'
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Автоматически создать результаты из участников с расставленными местами (админ)
     */
    async createResultsFromParticipants(req, res, next) {
        try {
            const { year } = req.body;

            if (!year) {
                throw ApiError.BadRequest('Год обязателен для заполнения');
            }

            const result = await resultsService.createResultsFromParticipants(parseInt(year));

            return res.json({
                success: true,
                data: result,
                message: `Успешно создано результатов: ${result.count}. ${result.errors.length > 0 ? `Ошибок: ${result.errors.length}` : ''}`
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Отправить письма победителям (админ)
     */
    async sendWinnerNotifications(req, res, next) {
        try {
            const result = await resultsService.sendWinnerNotifications();

            return res.json({
                success: true,
                data: result,
                message: `Отправлено писем: ${result.sent} из ${result.total}. ${result.errors.length > 0 ? `Ошибок: ${result.errors.length}` : ''}`
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ResultsController();

