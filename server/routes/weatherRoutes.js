// Import events names
const events = require('../events');
const logger = require('../logger/logger')

// Import service for weather
const WeatherService = require('../services/weatherService');
const weatherService = new WeatherService();

const SAME_WEATHER = 'same';

module.exports = (io) => {
  const jetsonConnection = (weather) => {
    let condition = weatherService.getWeatherCondition(weather);
    if (condition !== SAME_WEATHER) {
      logger.info(`Condition: ${condition}`);
      io.emit(events.WEATHER_CONDITION, condition);
    }
  };

  io.on(events.CONNECTION, (socket) => {
    socket.on(events.ON_WEATHER_CONNECTION, (weather) => {
      jetsonConnection(weather);
    });
  });
};
