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
}

module.exports = new ResultsService();

