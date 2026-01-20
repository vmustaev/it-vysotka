const roomService = require('../service/room-service');

class RoomController {
    async create(req, res, next) {
        try {
            const { number, capacity } = req.body;

            const room = await roomService.createRoom(number, capacity);

            return res.json({
                success: true,
                data: room,
                message: 'Аудитория успешно создана'
            });
        } catch (e) {
            next(e);
        }
    }

    async getAll(req, res, next) {
        try {
            const rooms = await roomService.getAllRooms();

            return res.json({
                success: true,
                data: rooms
            });
        } catch (e) {
            next(e);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const room = await roomService.getRoomById(id);

            return res.json({
                success: true,
                data: room
            });
        } catch (e) {
            next(e);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { number, capacity } = req.body;

            const room = await roomService.updateRoom(id, number, capacity);

            return res.json({
                success: true,
                data: room,
                message: 'Аудитория успешно обновлена'
            });
        } catch (e) {
            next(e);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            await roomService.deleteRoom(id);

            return res.json({
                success: true,
                message: 'Аудитория успешно удалена'
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new RoomController();
