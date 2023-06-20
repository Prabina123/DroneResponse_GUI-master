interface Drones {
  drones?: Drone[] | null;
}

interface DronesEntity {
  drone: Drone;
}

interface Drone {
  altitude: string;
  uavid: string;
  status: {
    status: boolean;
    battery: { level: number };
    location: { altitude: number; airspeed: number };
  };
  name: string;
}

const drones: Drones = {
  drones: [
    {
      altitude: "0.1",
      uavid: "red",
      status: {
        status: true,
        battery: { level: 90 },
        location: { altitude: 0.1, airspeed: 100 },
      },
      name: "Red",
    },
    {
      altitude: "0.1",
      uavid: "blue",
      status: {
        status: true,
        battery: { level: 90 },
        location: { altitude: 0.1, airspeed: 100 },
      },
      name: "Blue",
    },
    {
      altitude: "0.1",
      uavid: "orange",
      status: {
        status: true,
        battery: { level: 90 },
        location: { altitude: 0.1, airspeed: 100 },
      },
      name: "Orange",
    },
    {
      altitude: "0.1",
      uavid: "Green",
      status: {
        status: true,
        battery: { level: 90 },
        location: { altitude: 0.1, airspeed: 100 },
      },
      name: "Green",
    },
  ],
};

export default drones;
