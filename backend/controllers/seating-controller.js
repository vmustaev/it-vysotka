const seatingService = require('../service/seating-service');

class SeatingController {
    /**
     * Автоматическая рассадка
     */
    async autoAssign(req, res, next) {
        try {
            const result = await seatingService.autoAssignSeating();

            return res.json({
                success: true,
                data: result,
                message: `Рассадка выполнена: размещено ${result.assignedItems} из ${result.totalItems}`
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Получить текущую рассадку
     */
    async getSeating(req, res, next) {
        try {
            const seating = await seatingService.getSeating();

            return res.json({
                success: true,
                data: seating
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Очистить рассадку
     */
    async clearSeating(req, res, next) {
        try {
            const result = await seatingService.clearSeating();

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Ручное назначение команды/участника в аудиторию
     */
    async assignItem(req, res, next) {
        try {
            const { teamId, userId, roomId } = req.body;

            const result = await seatingService.assignItem(teamId, userId, roomId);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }

    /**
     * Удалить назначение
     */
    async removeAssignment(req, res, next) {
        try {
            const { teamId, userId } = req.body;

            const result = await seatingService.removeAssignment(teamId, userId);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SeatingController();
