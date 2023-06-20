const VideoData = require('../data/videoData');
const videoData = new VideoData();

module.exports = class VideoService {
  getSocketByID(id) {
    return videoData.getSocket(id);
  }

  setSocketByID(id, socket) {
    videoData.setSocket(id, socket);
  }
};
