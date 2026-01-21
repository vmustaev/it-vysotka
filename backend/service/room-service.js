const RoomModel = require('../models/room-model');
const SeatingAssignmentModel = require('../models/seating-assignment-model');
const ApiError = require('../exceptions/api-error');

class RoomService {
    async createRoom(number, capacity) {
        // Проверяем, существует ли уже аудитория с таким номером
        const existingRoom = await RoomModel.findOne({
            where: { number }
        });

        if (existingRoom) {
            throw ApiError.BadRequest('Аудитория с таким номером уже существует');
        }

        const room = await RoomModel.create({
            number,
            capacity
        });

        return room;
    }

    async getAllRooms() {
        const rooms = await RoomModel.findAll({
            order: [['number', 'ASC']]
        });

        return rooms;
    }

    async getRoomById(id) {
        const room = await RoomModel.findByPk(id);

        if (!room) {
            throw ApiError.BadRequest('Аудитория не найдена');
        }

        return room;
    }

    async updateRoom(id, number, capacity) {
        const room = await RoomModel.findByPk(id);

        if (!room) {
            throw ApiError.BadRequest('Аудитория не найдена');
        }

        // Проверяем, не занят ли номер другой аудиторией
        if (number !== room.number) {
            const existingRoom = await RoomModel.findOne({
                where: { number }
            });

            if (existingRoom) {
                throw ApiError.BadRequest('Аудитория с таким номером уже существует');
            }
        }

        // Проверяем, что новое количество мест не меньше текущего количества занятых мест
        if (capacity < room.capacity) {
            const occupiedCount = await SeatingAssignmentModel.count({
                where: { roomId: id }
            });

            if (occupiedCount > capacity) {
                throw ApiError.BadRequest(
                    `Невозможно уменьшить количество мест до ${capacity}. В аудитории уже размещено ${occupiedCount} команд/участников.`
                );
            }
        }

        room.number = number;
        room.capacity = capacity;
        await room.save();

        return room;
    }

    async deleteRoom(id) {
        const room = await RoomModel.findByPk(id);

        if (!room) {
            throw ApiError.BadRequest('Аудитория не найдена');
        }

        await room.destroy();

        return { message: 'Аудитория успешно удалена' };
    }
}

module.exports = new RoomService();
