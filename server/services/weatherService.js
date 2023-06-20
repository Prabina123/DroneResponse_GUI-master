const logger = require('../logger/logger');
const { conditions, WeatherData } = require('../data/weatherData');

let previousCondition = [];
let currentCondition = [];
let drones = [];

module.exports = class WeatherService {
  getWeatherCondition(weather) {
    let weatherJSON = JSON.parse(weather);
    let includesWeatherId = drones.filter((drone) => drone['id'] === weatherJSON['id'], drones);
    // Discovering new drone
    if (!Array.isArray(includesWeatherId) || !includesWeatherId.length) {
      drones.push(weatherJSON);
    }
    // Drone reports new data
    else if (!drones.includes(weatherJSON)) {
      let replaceIndex = drones.findIndex((drone) => drone['id'] === weatherJSON['id']);
      drones[replaceIndex] = weatherJSON;
    }

    const total = drones.length;
    const weatherData = new WeatherData(total);
    weatherData.updateCounts(drones);

    currentCondition = weatherData.darkDominance ? conditions.DARK : weatherData.candidates;
    let conditionSame = currentCondition.length === previousCondition.length && Array.from(currentCondition).every((c, i) => {
      return c === previousCondition[i];
    });

    if (weatherData.consensus && !conditionSame) {
      previousCondition = currentCondition;
      logger.info(`Current condition: ${currentCondition}`);
      return currentCondition;
    }
    else {
      logger.info(`Retaining condition: ${currentCondition}`);
      return 'same';
    }
  }
};
