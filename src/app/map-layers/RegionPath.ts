import { Drone } from '../model/Drone';
import { Lla } from '../model/Lla';

export class RegionPath {
  pathArrowArray: any;
  startingPoints: any;
  searchPolygonCoordinates: any;
  pathWaypoints: any;
  numberDrones: number;
  drones: Drone[];
  longitudeValues = [];
  xIncrement: number = 0.00025;
  path = [];
  pathsMultipleDrones: any;

  constructor(
    searchPolygonCoordinates: any,
    numberDrones: number,
    drones: any,
    altitude: number,
    speed: number
  ) {
    this.searchPolygonCoordinates = searchPolygonCoordinates;
    this.numberDrones = numberDrones;
    this.drones = drones;

    this.findSearchArea(this.searchPolygonCoordinates, altitude, speed);
  }

  findSearchArea(searchPolygonCoordinates: any, altitude: number, speed: number): void {
    let maxLong = searchPolygonCoordinates[0][0][0];
    let minLong = searchPolygonCoordinates[0][0][0];

    for (let i = 1; i < searchPolygonCoordinates[0].length; i++) {
      // Get min and max longitude values
      if (searchPolygonCoordinates[0][i][0] > maxLong) {
        maxLong = searchPolygonCoordinates[0][i][0];
      } else if (searchPolygonCoordinates[0][i][0] < minLong) {
        minLong = searchPolygonCoordinates[0][i][0];
      }
    }

    // start x increments at lowest longitude values
    let x = minLong;

    //add longitude values at every increment between the lowest and highest values
    while (x <= maxLong) {
      this.longitudeValues.push(x);
      x += this.xIncrement;
    }

    this.calculateEdgePoints();
    this.divideSearchAreaAmongMultipleDrones(altitude, speed);
    this.addFlightPathArrows();
  }

  // calculate the points on the edge of the polygon
  calculateEdgePoints(): void {
    let edgePoints = [];
    // loop through each polygon edge to get points at each longitude increment
    for (let i = 0; i < this.searchPolygonCoordinates[0].length - 1; i++) {
      //helper variables to keep geojson element straight
      let point1 = this.searchPolygonCoordinates[0][i];
      let point2 = this.searchPolygonCoordinates[0][i + 1];
      let lowerX = point1;
      let higherX = point2;
      if (point1[0] > point2[0]) {
        lowerX = point2;
        higherX = point1;
      }

      // lower/higherX[1] is the latitude/y value
      let slope = (higherX[1] - lowerX[1]) / (higherX[0] - lowerX[0]);

      // counter to multiply by slope based on where on line it is
      let counter = 0;
      let start = this.longitudeValues[0];

      // loop through the longitude value array
      for (let j = 0; j < this.longitudeValues.length; j++) {
        // skip ones lower than the lowest x value on the segment
        if (lowerX[0] > this.longitudeValues[j]) continue;
        // skip ones higher than the highest x value on the segment
        else if (higherX[0] < this.longitudeValues[j]) continue;
        // skip if slope will cause error
        else if (!Number.isFinite(slope)) continue;
        else {
          // set y value at first longitude value in the segment for slope calculations
          if (counter === 0)
            start = (this.longitudeValues[j] - lowerX[0]) * slope + lowerX[1];

          // Add points from the perimeter to the array
          edgePoints.push([
            this.longitudeValues[j],
            start + slope * this.xIncrement * counter,
          ]);
          counter++;
        }
      }
    }

    // Sort points by longitude values, least to greatest
    edgePoints.sort((leftSide, rightSide): number => {
      if (leftSide[0] < rightSide[0]) return -1;
      if (leftSide[0] > rightSide[0]) return 1;
      return 0;
    });

    // Divide edgePoints into two arrays with every other in each
    let evens = edgePoints.filter((point, index) => {
      return index % 2 === 0;
    });

    let odds = edgePoints.filter((_, index) => {
      return index % 2 === 1;
    });

    // New array to merge back together
    // Push two from each in order
    for (let i = 0; i < odds.length; i = i + 2) {
      this.path.push(evens[i]);
      this.path.push(odds[i]);
      if (i + 1 < odds.length) this.path.push(odds[i + 1]);
      if (i + 1 < evens.length) this.path.push(evens[i + 1]);
    }
  }

  divideSearchAreaAmongMultipleDrones(altitude: number, speed: number): void {
    // divide into multiple paths
    let searchArea = this.path;
    let totalFlightPathDistance =
      this.calcDistanceToCoverInSearchArea(searchArea);

    // divide flight path distance by number of drones
    let droneFlightPathDistance = this.getDistanceToCoverForEachDrone(
      this.numberDrones,
      totalFlightPathDistance
    );

    // Initialize variables for loop to add array for each drone's flight path
    let pathsMultipleDrones = [];
    let individualDronePath = [];
    let startingPoints = [];
    let individualDronePathJson = [];
    let individualFlightPathDistance = 0;
    let newDrone = true;
    let tempWaypointArray = [];
    let tempDroneId = 0;

    // Loop back through all the points to add them to an individual drone's flight path
    for (let i = 0; i < searchArea.length - 1; i++) {
      // Reset variables if making new drone flight path array
      if (newDrone === true) {
        individualDronePath = [searchArea[i]];
        let startingLla = new Lla();
        // Add a 2m rise in altitude for each additional drone in the region
        startingLla.altitude = altitude + (2 * tempDroneId);
        startingLla.longitude = searchArea[i][0];
        startingLla.latitude = searchArea[i][1];
        startingLla.speed = speed;
        individualDronePathJson = [startingLla];

        startingPoints.push(searchArea[i]);
        individualFlightPathDistance = 0;
        newDrone = false;
      }

      individualFlightPathDistance += this.calcDistance(
        searchArea[i+1][0],
        searchArea[i][0],
        searchArea[i+1][1],
        searchArea[i][1]
      );
      // Add points to array
      individualDronePath.push(searchArea[i+1]);

      let lla = new Lla();
      lla.longitude = searchArea[i+1][0];
      lla.latitude = searchArea[i+1][1];
      // Add a 2m rise in altitude for each additional drone in the region
      lla.altitude = altitude + (2 * tempDroneId);
      lla.speed = speed;
      individualDronePathJson.push(lla);

      // Once the flight path distance exceeds the individual drone flight path distance calculated,
      // push it to an array and restart on a new drone's path
      if (individualFlightPathDistance >= droneFlightPathDistance || i === searchArea.length - 2) {
        pathsMultipleDrones.push(individualDronePath);
        tempWaypointArray.push({
          coordinates: individualDronePathJson,
          uavid: '',
          routeid: `REGION-ROUTE${tempDroneId}`,
        });
        tempDroneId++;
        newDrone = true;
      }
    }

    this.pathsMultipleDrones = pathsMultipleDrones;
    this.pathWaypoints = tempWaypointArray;
    this.startingPoints = startingPoints;

    if (this.drones.length) {
      const startingPermutation = this.getDroneStartingPoints();
      for (let i = 0; i < startingPermutation.length; ++i) {
        this.pathWaypoints[startingPermutation[i]].uavid = this.drones[i].uavid;
      }
    }

    // TODO: Intersection check
  }

  calcDistanceToCoverInSearchArea(searchArea: any): number {
    let flightPathDistance: number = 0;

    // Find total flight path distance
    for (let i = 0; i < searchArea.length - 1; i++) {
      flightPathDistance += this.calcDistance(
        searchArea[i + 1][0],
        searchArea[i][0],
        searchArea[i + 1][1],
        searchArea[i][1]
      );
    }
    return flightPathDistance;
  }

  // we can replace it with more complex distance formula later
  calcDistance(x2: number, x1: number, y2: number, y1: number): number {
    let distance = 0;
    distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance;
  }

  getDistanceToCoverForEachDrone(numDrones: number, totalFlightPathDistace: number): number {
    if (numDrones == 0) {
      numDrones = 1;
    }
    return totalFlightPathDistace / numDrones;
  }

  getDroneStartingPoints(): number[] {
    // Generate permutations for possible starting points
    const startingPermutations = this.permutations(this.startingPoints.length);

    // Store the total distance of each permutation of starting points
    let distances = new Array<number>(startingPermutations.length);

    // Iterate through the possible permuations and calculate the distances
    startingPermutations.forEach((perm: number[], index: number) => {
      distances[index] = 0;
      for (let i = 0; i < perm.length; ++i) {
        const point = this.startingPoints[perm[i]];
        const droneLoc = this.drones[i].status.location;
        distances[index] += this.calcDistance(point[0], droneLoc.longitude, point[1], droneLoc.longitude);
      }
    });

    let sortedDistances = distances.map((dist, index) => [dist, index]);
    sortedDistances.sort((a, b) => a[0] - b[0]);
    return startingPermutations[sortedDistances[0][1]];
  }

  // Generate possible permutations for starting points in a region
  // so that the optimal starting points can be chosen
  permutations(n: number): Array<number[]> {
    if (n === 0) {
      return [[]];
    }
    const result = [[0]];
    for (let i = 1; i < n; i++) {
      const newResult = [];
      for (let j = 0; j < result.length; j++) {
        const subPerm = result[j];
        for (let k = 0; k <= subPerm.length; k++) {
          const perm = [...subPerm.slice(0, k), i, ...subPerm.slice(k)];
          newResult.push(perm);
        }
      }
      result.splice(0, result.length, ...newResult);
    }
    return result;
  }

  checkIntersection(s1: number[], e1: number[], s2: number[], e2: number[]): boolean {
    // Calculate slopes and intercepts of the two lines
    const slope1 = (e1[1] - s1[1]) / (e1[0] - s1[0]);
    const intercept1 = s1[1] - slope1 * s1[0]
    const slope2 = (e2[1] - s2[1]) / (e2[0] - s2[0]);
    const intercept2 = s2[1] - slope2 * s2[0]

    // Parallel lines will not intersect
    if (slope1 == slope2) {
      return false;
    }

    // Calculate intersection point
    const xIntersect = (intercept2 - intercept1) / (slope1 - slope2);
    const yIntersect = (slope1 * xIntersect + intercept1);

    // Check if the intersection point is on both lines
    if (
      xIntersect >= Math.min(s1[1], e1[1]) && xIntersect <= Math.max(s1[1], e1[1]) &&
      xIntersect >= Math.min(s2[1], e2[1]) && xIntersect <= Math.max(s2[1], s2[1]) &&
      yIntersect >= Math.min(s1[0], e1[0]) && yIntersect <= Math.max(s1[0], e1[0]) &&
      yIntersect >= Math.min(s2[0], e2[0]) && yIntersect <= Math.max(s2[0], e2[0])
    ) {
      return true;
    }
  }

  addFlightPathArrows(): void {
    // Array to make multi-line GeoJSON entry
    let pathArrowArray = this.pathsMultipleDrones;

    // Adding arrows to midpoint of each flight path
    // Loop through path array to get midpoints of each segment
    let path = this.path;
    for (let i = 0; i < path.length - 1; i++) {
      // Slope and midpoint of each segment
      let midpoint = [
        path[i][0] + (path[i + 1][0] - path[i][0]) / 2,
        path[i][1] + (path[i + 1][1] - path[i][1]) / 2,
      ];
      let slope = (path[i + 1][1] - path[i][1]) / (path[i + 1][0] - path[i][0]);

      // Initial calculations to get slopes of arrow segments
      let arrowLength = this.xIncrement / 4.5;
      let arrowSlopeHigh = Math.tan(Math.atan(-slope) + 2.356);
      let arrowSlopeLow = Math.tan(Math.atan(-slope) - 2.356);

      // Set endpoints of arrows
      let x1 = midpoint[0] - arrowLength / Math.sqrt(1 + Math.pow(arrowSlopeLow, 2));
      let x2 = midpoint[0] - arrowLength / Math.sqrt(1 + Math.pow(arrowSlopeHigh, 2));
      let y1 = midpoint[1] + (arrowLength * arrowSlopeLow) / Math.sqrt(1 + Math.pow(arrowSlopeLow, 2));
      let y2 = midpoint[1] + (arrowLength * arrowSlopeHigh) / Math.sqrt(1 + Math.pow(arrowSlopeHigh, 2));

      // Adjust the signs based on the slope
      if (slope > 1) {
        x2 = midpoint[0] + arrowLength / Math.sqrt(1 + Math.pow(arrowSlopeHigh, 2));
        y2 = midpoint[1] - (arrowLength * arrowSlopeHigh) / Math.sqrt(1 + Math.pow(arrowSlopeHigh, 2));
      } else if (slope < -1) {
        x1 = midpoint[0] + arrowLength / Math.sqrt(1 + Math.pow(arrowSlopeLow, 2));
        y1 = midpoint[1] - (arrowLength * arrowSlopeLow) / Math.sqrt(1 + Math.pow(arrowSlopeLow, 2));
      }

      // Ensure long line not drawn across screen
      if (Number.isNaN(x1) || Number.isNaN(y1)) {
        continue;
    }

      // Add segments to multi-line array
      pathArrowArray.push([[x1, y1], midpoint, [x2, y2]]);
    }
    this.pathArrowArray = pathArrowArray;
  }
}
