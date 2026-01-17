const schoolService = require('../service/school-service');

class SchoolController {
    async getRegions(req, res, next) {
        try {
            const regions = await schoolService.getRegions();
            return res.json({ data: regions });
        } catch (e) {
            next(e);
        }
    }

    async getCities(req, res, next) {
        try {
            const { region } = req.query;
            if (!region) {
                return res.json({ data: [] });
            }
            const cities = await schoolService.getCitiesByRegion(region);
            return res.json({ data: cities });
        } catch (e) {
            next(e);
        }
    }

    async getSchools(req, res, next) {
        try {
            const { region, city } = req.query;
            if (!region || !city) {
                return res.json({ data: [] });
            }
            const schools = await schoolService.getSchoolsByCity(region, city);
            return res.json({ data: schools });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SchoolController();