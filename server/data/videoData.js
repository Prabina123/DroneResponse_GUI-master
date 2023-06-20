module.exports = class VideoData {
  constructor() {
    this.sockets = {};
  }

  getSocket(id) {
    return this.sockets[id];
  }

  setSocket(id, socket) {
    if (!this.sockets[id]) {
      this.sockets[id] = [];
    }
    this.sockets[id].push(socket);
  }
};
