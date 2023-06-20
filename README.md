# DroneResponse

### Docker Installation for Production

Find Instruction [here](https://github.com/SAREC-Lab/DroneResponse/wiki/Sarec2-server-Configuration---NodeJs)

Currently, access the application at http://sarec2.crc.nd.edu:8090 (Verify that you are on ND network)

### Project Set-Up for Development - MEAN Stack

#### Local Installation

1) Install Node.js (version 18.13.0) and npm
    - Ubuntu
      - `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
    - MacOS
      - Download installer from [Node.js website](https://nodejs.org/en/).
2) Install Angular CLI (version 15.1.0)
    - `npm install -g @angular/cli`
3) Install and run MongoDB
    - [Ubuntu instructions](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
    - [MacOS instructions](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
4) Install and run Mosquitto
    - Ubuntu
      - `sudo apt update`
      - `sudo apt install mosquitto`
      - `sudo systemctl start mosquitto`
    - MacOS
      - `brew install mosquitto`
      - `brew services start mosquitto`
5) Clone repository
    - `git clone git@github.com:SAREC-Lab/DroneResponse.git`
    - `cd DroneResponse`
6) Run Angular frontend
    - Install project dependencies - `npm install`
    - (Optional) Build project - `ng build`
    - Run project locally - `ng serve`
7) Run Node.js backend
    - `cd server`
    - Install server dependencies - `npm install`
    - Run server locally - `node index.js`
8) Visit site running at http://localhost:4200

##### Docker 

1) Install and run Docker (Docker Desktop recommended for local installation)
    - [Ubuntu instructions for Docker Desktop](https://docs.docker.com/desktop/install/ubuntu/)
    - [Ubuntu instructions for Docker CLI](https://docs.docker.com/engine/install/ubuntu/)
    - [MacOS instructions for Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)
2) Install Docker Compose
    - Docker Compose comes with Docker Desktop
    - If the Docker Desktop is not installed, follow the instructions [here](https://docs.docker.com/compose/install/linux/#install-using-the-repository).
3) Pull Node.js and MongoDB Docker image
    - `docker pull node:18.3.0`
    - `docker pull mongo:latest`
4) Clone repository
    - `git clone git@github.com:SAREC-Lab/DroneResponse.git`
    - `cd DroneResponse`
5) Run Docker Compose with the DroneResponse configuration file
    - `docker-compose build`
    - `docker-compose up`
6) Visit site running at http://localhost:4200

### Open Topo Data Altitude API Installation
 **[Official Instructions](https://www.opentopodata.org/server/)**

 Running a locally-hosted version of the Open Topo Data API allows for altitudes on the front-end to be specified relative to ground instead of from sea level.

 Some changes may need to be made to the typical instructions in order for this to be workly properly and give accurate data.

```bash
git clone https://github.com/ajnisbet/opentopodata.git
cd opentopodata
```

In the `Makefile` in this folder, under the `run` rule on lines 10-11, change the rule to:
```
run:
  docker run --rm -it --volume "$(shell pwd)/data:/app/data:ro" -p 5001:5000 opentopodata:$(VERSION) 
```

On MacOS machines, port 5000 is used for the AirPlay receiver, so changing this rule to make Docker forward port 5000 to the local machine's port 5001 gets around this issue.

To get more accurate data, we must download the National Elevation Dataset ([Official Instructions](https://www.opentopodata.org/datasets/ned/)).

In the `opentopodata` folder, run:
```bash
mkdir ./data/ned10m
```

Only parts of the US map topography need to be downloaded (at least for supporting areas where we currently fly). This [Python script](https://gist.github.com/michaelpri10/80dc8b81bd0cee2ddb1fda4b62feb55d#file-download_ned10m-py) can be run in the `opentopodata` folder in order to download the files. Then, you must run this [Python script](https://gist.github.com/michaelpri10/80dc8b81bd0cee2ddb1fda4b62feb55d#file-filename_conversion-py) to properly rename the files. 

Additionally, you should create `config.yaml` file with the following contents:
```
access_control_allow_origin: '*'
datasets:
- name: ned10m
  path: data/ned10m/
  filename_epsg: 4269
```

Once the NED dataset is installed, you can build and run the server by running:

```bash
make build 
# make build-m1 for Apple Silicon Macs
make run
```

*Note: Docker must be running for these commands to work*