/*jslint sloppy: true, plusplus: true, continue: true */
/*globals Vectr, Player, PlayerBullet, Enemy, EnemyBullet */

var Client = function () {
  Vectr.Scene.apply(this, arguments);
  this.clearColor = 'rgba(0, 0, 0, 0.15)';

  var socket,
      onConnect,
      onDisconnect,
      onNewPlayer,
      onMovePlayer,
      onRemovePlayer,
      i,
      sprite;

  this.socket = io.connect('http://localhost');

  this.onConnect = this.onConnect.bind(this);
  this.onDisconnect = this.onDisconnect.bind(this);
  this.onNewPlayer = this.onNewPlayer.bind(this);
  this.onMovePlayer = this.onMovePlayer.bind(this);
  this.onRemovePlayer = this.onRemovePlayer.bind(this);
  this.onReceiveData = this.onReceiveData.bind(this);

  // Not sure which of these I'll actually be listening to
  this.socket.on('connect', this.onConnect);
  this.socket.on('disconnect', this.onDisconnect);
  this.socket.on('new player', this.onNewPlayer);
  this.socket.on('move player', this.onMovePlayer);
  this.socket.on('remove player', this.onRemovePlayer);
  this.socket.on('data', this.onReceiveData);

  // x, y, text, font, color, alignment
  //this.add(new Vectr.Label(Vectr.WIDTH / 2, Vectr.HEIGHT / 2, "NODE", "40px monospace", "rgba(255, 255, 255, 0.8)"));

  this.playerData = {};
  this.bulletData = [];
  this.playerShapes = [];
  this.bulletShapes = [];
 
  for (i = 0; i < 8; i +=1) {
    shape = new Vectr.Shape(0, 0, 'triangle');
    shape.active = false;
    shape.size = 20;
    this.playerShapes.push(shape);
    this.add(shape);
  }

  for (i = 0; i < 100; i +=1) {
    shape = new Vectr.Shape(0, 0, 'circle');
    shape.active = false;
    shape.size = 2;
    this.bulletShapes.push(shape);
    this.add(shape);
  }
};

Client.prototype = new Vectr.Scene();

Client.prototype.update = function (delta) {
  Vectr.Scene.prototype.update.call(this, delta);

  var id,
      shape,
      data,
      count = 0;

  // Draw each player
  // TODO: This won't set deactivated players to active=false
  for (id in this.playerData) {
    shape = this.playerShapes[count];
    data = this.playerData[id];
    shape.position = data.position;
    shape.rotation = data.rotation;
    shape.active = true;
    count += 1;
  }

  // Draw each bullet
  // TODO: This won't set deactivated bullets to active=false
  for (id = 0, count = this.bulletData.length; id < count; id += 1) {
    shape = this.bulletShapes[id];
    data = this.bulletData[id];
    shape.position = data.position;
    shape.rotation = data.rotation;
    shape.active = true;
  }
};

Client.prototype.onReceiveData = function (data) {
  console.log("Got data from server", data);
  this.playerData = data.players;
  this.bulletData = data.bullets;
};

Client.prototype.onConnect = function (data) {
  console.log("Client has connected");
  console.log("Sending 'new player' message");
  this.socket.emit('new player');
};

Client.prototype.onDisconnect = function (data) {
  console.log("Disconnect:", data);
};

Client.prototype.onNewPlayer = function (data) {
  console.log("New player", data);
};

Client.prototype.onMovePlayer = function (data) {
  console.log("Move player", data);
};

Client.prototype.onRemovePlayer = function (data) {
  console.log("Remove player", data);
};

// Player will be moved on the server in the direction the client specifies
// until the client sends the "stop" message
Client.prototype.onKeyDown = function (key) {
  if (key === 'z' || key === 'space') {
    this.socket.emit('move player', 'shoot');
  }

  if (key === 'left') {
    this.socket.emit('move player', 'left');
  }

  if (key === 'right') {
    this.socket.emit('move player', 'right');
  }

  if (key === 'up') {
    this.socket.emit('move player', 'up');
  }

  if (key === 'down') {
    this.socket.emit('move player', 'down');
  }
};

// Shooting requires a new button press each time, which is why it doesn't 
// appear in the onKeyUp handler
Client.prototype.onKeyUp = function (key) {
  if (key === 'left') {
    this.socket.emit('move player', 'left-stop');
  }

  if (key === 'right') {
    this.socket.emit('move player', 'right-stop');
  }

  if (key === 'up') {
    this.socket.emit('move player', 'up-stop');
  }

  if (key === 'down') {
    this.socket.emit('move player', 'down-stop');
  }
};
