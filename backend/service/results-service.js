const ChampionshipResultModel = require('../models/championship-result-model');
const ApiError = require('../exceptions/api-error');

class ResultsService {
    /**
     * Получить все результаты
     */
    async getAllResults() {
        return await ChampionshipResultModel.findAll({
            order: [['year', 'DESC'], ['place', 'ASC']]
        });
    }

    /**
     * Получить результаты по году
     */
    async getResultsByYear(year) {
        return await ChampionshipResultModel.findAll({
            where: { year },
            order: [['place', 'ASC']]
        });
    }

    /**
     * Получить список всех годов
     */
    async getYears() {
        const results = await ChampionshipResultModel.findAll({
            attributes: ['year'],
            group: ['year'],
            order: [['year', 'DESC']]
        });
        return results.map(r => r.year);
    }

    /**
     * Получить результат по ID
     */
    async getResultById(id) {
        const result = await ChampionshipResultModel.findByPk(id);
        if (!result) {
            throw ApiError.NotFound('Результат не найден');
        }
        return result;
    }

    /**
     * Создать результат
     */
    async createResult(resultData) {
        const { year, place, participants, schools, cities } = resultData;

        // Проверяем, не существует ли уже результат с таким годом и местом
        const existing = await ChampionshipResultModel.findOne({
            where: { year, place }
        });

        if (existing) {
            throw ApiError.BadRequest(`Результат для ${year} года с местом ${place} уже существует`);
        }

        return await ChampionshipResultModel.create({
            year,
            place,
            participants,
            schools,
            cities
        });
    }

    /**
     * Обновить результат
     */
    async updateResult(id, resultData) {
        const result = await this.getResultById(id);
        const { year, place, participants, schools, cities } = resultData;

        // Если изменяются год или место, проверяем уникальность
        if ((year && year !== result.year) || (place && place !== result.place)) {
            const finalYear = year || result.year;
            const finalPlace = place || result.place;
            
            const existing = await ChampionshipResultModel.findOne({
                where: { 
                    year: finalYear, 
                    place: finalPlace,
                    id: { [require('sequelize').Op.ne]: id }
                }
            });

            if (existing) {
                throw ApiError.BadRequest(`Результат для ${finalYear} года с местом ${finalPlace} уже существует`);
            }
        }

        await result.update({
            year: year || result.year,
            place: place || result.place,
            participants: participants || result.participants,
            schools: schools || result.schools,
            cities: cities || result.cities
        });

        return result;
    }

    /**
     * Удалить результат
     */
    async deleteResult(id) {
        const result = await this.getResultById(id);
        await result.destroy();
        return result;
    }

    /**
     * Автоматически создать результаты из участников с расставленными местами
     */
    async createResultsFromParticipants(year) {
        const UserModel = require('../models/user-model');
        const { Op } = require('sequelize');

        // Проверяем валидность года
        if (!year || year < 2000 || year > 2100) {
            const ApiError = require('../exceptions/api-error');
            throw ApiError.BadRequest('Некорректный год');
        }

        // Находим участников с расставленными местами
        const participants = await UserModel.findAll({
            where: {
                role: 'participant',
                place: { [Op.ne]: null }
            },
            order: [['place', 'ASC']]
        });

        if (!participants || participants.length === 0) {
            const ApiError = require('../exceptions/api-error');
            throw ApiError.BadRequest('Не найдено участников с расставленными местами');
        }

        // Группируем участников по местам
        const participantsByPlace = {};
        for (const participant of participants) {
            const place = participant.place;
            if (!participantsByPlace[place]) {
                participantsByPlace[place] = [];
            }
            participantsByPlace[place].push(participant);
        }

        // Создаем результаты для каждого места
        const createdResults = [];
        const errors = [];

        for (const [place, placeParticipants] of Object.entries(participantsByPlace)) {
            try {
                // Проверяем, не существует ли уже результат
                const existing = await ChampionshipResultModel.findOne({
                    where: { year: parseInt(year), place: parseInt(place) }
                });

                if (existing) {
                    errors.push(`Результат для ${year} года с местом ${place} уже существует`);
                    continue;
                }

                // Формируем списки участников, школ и городов
                const participantsNames = placeParticipants.map(p => 
                    `${p.last_name} ${p.first_name}${p.second_name ? ' ' + p.second_name : ''}`
                ).join(', ');

                // Уникальные школы
                const schools = [...new Set(placeParticipants.map(p => p.school))].join(', ');

                // Уникальные города
                const cities = [...new Set(placeParticipants.map(p => p.city))].join(', ');

                // Создаем результат
                const result = await ChampionshipResultModel.create({
                    year: parseInt(year),
                    place: parseInt(place),
                    participants: participantsNames,
                    schools: schools,
                    cities: cities
                });

                createdResults.push(result);
            } catch (error) {
                errors.push(`Ошибка создания результата для места ${place}: ${error.message}`);
            }
        }

        return {
            created: createdResults,
            errors: errors,
            count: createdResults.length
        };
    }

    /**
     * Отправить письма победителям (участникам с расставленными местами)
     */
    async sendWinnerNotifications() {
        const UserModel = require('../models/user-model');
        const mailService = require('./mail-service');
        const { Op } = require('sequelize');

        // Находим участников с расставленными местами (1, 2, 3)
        const winners = await UserModel.findAll({
            where: {
                role: 'participant',
                place: { [Op.in]: [1, 2, 3] },
                isActivated: true
            },
            order: [['place', 'ASC'], ['last_name', 'ASC']]
        });

        if (!winners || winners.length === 0) {
            const ApiError = require('../exceptions/api-error');
            throw ApiError.BadRequest('Не найдено победителей с расставленными местами');
        }

        let sentCount = 0;
        const errors = [];

        for (const winner of winners) {
            if (!winner.email) {
                errors.push(`Участник ${winner.last_name} ${winner.first_name} (ID: ${winner.id}) не имеет email`);
                continue;
            }

            try {
                const fullName = `${winner.last_name} ${winner.first_name}${winner.second_name ? ' ' + winner.second_name : ''}`;
                await mailService.sendWinnerNotificationMail(
                    winner.email,
                    winner.place,
                    fullName
                );
                sentCount++;
            } catch (error) {
                console.error(`Ошибка отправки письма победителю ${winner.email}:`, error);
                errors.push(`Не удалось отправить письмо на ${winner.email}: ${error.message}`);
            }
        }

        return {
            sent: sentCount,
            total: winners.length,
            errors: errors
        };
    }
}

module.exports = new ResultsService();

