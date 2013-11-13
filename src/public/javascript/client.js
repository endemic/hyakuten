/*jslint sloppy: true, plusplus: true, continue: true, devel: true */
/*globals io: false, Vectr: false, Player: false */

var Client = function() {
    Vectr.Scene.apply(this, arguments);
    this.clearColor = 'rgba(0, 0, 0, 0.75)';

    var i,
        shape,
        arenaSize;

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

    this.playerData = {};
    this.bulletData = [];
    this.playerShapes = [];
    this.bulletShapes = [];

    for (i = 0; i < 8; i += 1) {
        shape = new Player(0, 0);
        shape.active = false;
        this.playerShapes.push(shape);
        this.add(shape);
    }

    for (i = 0; i < 100; i += 1) {
        shape = new Vectr.Shape(0, 0, 'circle');
        shape.active = false;
        shape.size = 2;
        this.bulletShapes.push(shape);
        this.add(shape);
    }

    arenaSize = 1000;

    // Draw bounds of arena
    shape = new Vectr.Shape(arenaSize / 2, arenaSize / 2, 'square', arenaSize);
    shape.lineWidth = 5;
    shape.color = 'rgba(255, 0, 0, 1)';
    this.add(shape);

    this.camera.bounds = {
        top: 0,
        bottom: arenaSize,
        left: 0,
        right: arenaSize
    };

    // Draw some shapes for reference
    this.add(new Vectr.Shape(500, 500, 'square', 10));
    this.add(new Vectr.Shape(300, 700, 'square', 10));
    this.add(new Vectr.Shape(800, 900, 'square', 10));
};

Client.prototype = new Vectr.Scene();

Client.prototype.update = function (delta) {
    Vectr.Scene.prototype.update.call(this, delta);

    var id,
        shape,
        data,
        count = 0;

    // Reset player shapes
    //for (id = 0, count = this.playerShapes.length; id < count; id += 1) {
    //  shape = this.playerShapes[id];
    //  shape.active = false;
    //}

    // Draw each player
    for (id in this.playerData) {
        shape = this.playerShapes[count];
        data = this.playerData[id];
        shape.position = data.position;
        shape.rotation = data.rotation;
        shape.thrust = data.thrust;
        shape.health = data.health;
        shape.color = data.color;
        shape.name = id;
        // TODO: Add an explosion here the first time this value gets set to "false"
        shape.active = data.dead === null ? true : false;
        count += 1;
    }

    // Reset bullet shapes
    for (id = 0, count = this.bulletShapes.length; id < count; id += 1) {
        shape = this.bulletShapes[id];
        shape.active = false;
    }

    // Draw each bullet
    for (id = 0, count = this.bulletData.length; id < count; id += 1) {
        shape = this.bulletShapes[id];
        data = this.bulletData[id];
        shape.position = data.position;
        shape.color = data.color;
        shape.active = true;
    }
};

Client.prototype.onReceiveData = function (data) {
    // if (Date.now() % 1000 === 0) {
    //     console.log("Got data from server", data);
    // }
    this.playerData = data.players;
    this.bulletData = data.bullets;
};

Client.prototype.onConnect = function (data) {
    console.log("Client has connected", data);
    this.socket.emit('new player');
};

Client.prototype.onDisconnect = function (data) {
    console.log("Disconnect:", data);
};

Client.prototype.onNewPlayer = function (data) {
    console.log("New player: ", data.id);
    this.id = data.id;
    this.target = this.playerShapes[0];
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