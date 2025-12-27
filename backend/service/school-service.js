const School = require('../models/school-model');

class SchoolService {
    async getRegions() {
        const regions = await School.findAll({
            attributes: ['region'],
            group: ['region'],
            order: [['region', 'ASC']],
            raw: true
        });
        return regions.map(r => r.region);
    }

    async getCitiesByRegion(region) {
        if (!region) {
            return [];
        }
        const cities = await School.findAll({
            attributes: ['city'],
            where: {
                region: region
            },
            group: ['city'],
            order: [['city', 'ASC']],
            raw: true
        });
        return cities.map(c => c.city);
    }

    async getSchoolsByCity(region, city) {
        if (!region || !city) {
            return [];
        }
        const schools = await School.findAll({
            attributes: ['name'],
            where: {
                region: region,
                city: city
            },
            group: ['name'],
            order: [['name', 'ASC']],
            raw: true
        });
        return schools.map(s => s.name);
    }
}

module.exports = new SchoolService();

