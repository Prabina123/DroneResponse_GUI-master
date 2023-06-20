const Region = require('../data/model/regions')
const mongoose = require('mongoose');

module.exports = class RegionData {
    async createRegion(regionData) {
        const region = await Region.create(regionData);
        return region;
    }

    async getRegions() {
        return await Region.find({});
    }

    async deleteRegion(id) {
        const region = await Region.findOne({ _id: mongoose.Types.ObjectId(id) });
        if (!region) return false;
        return region.remove();
    }

    async updateRegion(id, data) {
        const region = await Region.findOne({ _id: mongoose.Types.ObjectId(id) });
        if (!region) return false;
        Object.assign(region, data);
        return region.save();
    }
}
