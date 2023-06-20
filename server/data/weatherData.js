const conditions = Object.freeze({
  CLOUDY: 'cloudy',
  SUNNY : 'sunny',
  RAINY : 'rainy',
  SNOWY : 'snowy',
  FOGGY : 'foggy',
  DARK  : 'dark'
});

class WeatherData {
  constructor(droneTotal) {
    this.total = droneTotal;
    this.conditions = [
      {
        'count': 0,
        'name' : conditions.CLOUDY
      },
      {
        'count': 0,
        'name' : conditions.SUNNY
      },
      {
        'count': 0,
        'name' : conditions.RAINY
      },
      {
        'count': 0,
        'name' : conditions.SNOWY
      },
      {
        'count': 0,
        'name' : conditions.FOGGY
      },
      {
        'count': 0,
        'name' : conditions.DARK
      }
    ];
  }

  get consensus() {
    return this.largest >= (this.total/2) || this.largest >= Math.ceil(this.total/2);
  }
  // not allowed:
  //  sunny and foggy
  //  rainy and snowy
  get candidates() {
    let largestWeathers = this.conditions.filter(condition => condition.count === this.largest);

    let sunnyOrFoggy = largestWeathers.filter(condition => condition.name === conditions.SUNNY || condition.name === conditions.FOGGY);
    let rainyOrSnowy = largestWeathers.filter(condition => condition.name === conditions.RAINY || condition.name === conditions.SNOWY);
    if (sunnyOrFoggy.length > 1) {
      largestWeathers.splice(largestWeathers.findIndex(condition => condition.name === conditions.FOGGY));
    }
    if (rainyOrSnowy.length > 1) {
      largestWeathers.splice(largestWeathers.findIndex(condition => condition.name === conditions.SNOWY));
    }
    
    let largestWeathersNames = largestWeathers.map(condition => condition.name);
    return largestWeathersNames;
  }

  get largest() {
    let counts = this.conditions.map(condition => condition.count);
    return Math.max(...counts);
  }

  get darkDominance() {
    const darkCount = this.conditions.find(condition => condition.name === conditions.DARK).count;
    return darkCount === this.largest;
  }

  updateCounts (drones) {
    for (let drone of drones) {
      this.conditions.forEach(condition => {
        if (condition.name === conditions.DARK) {
          condition.count += !drone['data'][condition.name]
        }
        else {
          condition.count += drone['data'][condition.name]
        }
      });
    }
  }
}

exports.conditions = conditions;
exports.WeatherData = WeatherData;
