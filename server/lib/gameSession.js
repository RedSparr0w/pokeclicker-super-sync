const LOBBY_CODE_CHARACTER_SET = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
class GameSession {
  constructor() {
    this.id = [...new Array(6)].map(() => LOBBY_CODE_CHARACTER_SET[Math.floor(Math.random() * LOBBY_CODE_CHARACTER_SET.length)]).join('');
    this.clients = [];
    this.pokemon = [];
    this.lastUpdate = new Date();
  }

  addClient(socket, username) {
    this.clients.push({ socket, username });
  }
  
  removeClient(ws) {
    this.clients = this.clients.filter(({ socket }) => socket !== ws);
  }

  broadcast(event, payload = {}, exclude = null) {
    this.clients.forEach(({ socket }) => {
      console.log(event, socket === exclude);
      if (socket === exclude) return;
      console.log('sending', event, payload);
      socket.send(JSON.stringify({ event, payload }));
    });
  }

  broadcastAlert(message, title, options = {}, exclude = null) {
    this.broadcast('alert', { message, title, ...options }, exclude);
  }

  getUsername(ws) {
    return this.clients.find(({ socket }) => socket === ws)?.username ?? null;
  }

  addCatch(ws, id, shiny) {
    console.log('adding catch???', this.id, this.clients.length);
    const existingRecord = this.pokemon.find(record => record.id === id);

    if (existingRecord && shiny) {
      existingRecord.shiny = true;
    } else if (!existingRecord) {
      this.pokemon.push({ id, shiny });
    }
    
    this.broadcast('catch', { 
      username: this.getUsername(ws),
      id,
      shiny,
    }, ws);
  }
}

module.exports = {
  GameSession
};