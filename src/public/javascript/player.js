/*jslint sloppy: true, browser: true, plusplus: true */
/*globals Vectr: false, EngineParticle: false */

var Player = function (x, y) {
    Vectr.Shape.call(this, x, y);

    this.shape = 'triangle';
    this.size = 20;
    this.lineWidth = 2;
    this.thrust = 0;
    this.health = 0;
    this.glow = 10;
    this.name = 'player';
    this.timer = 0;

    this.healthLabel = new Vectr.Label(0, this.size, this.health);
    this.healthLabel.font = '10px sans-serif';
    this.healthLabel.fixed = false;

    this.nameLabel = new Vectr.Label(0, -this.size, this.name);
    this.nameLabel.font = '10px sans-serif';
    this.nameLabel.fixed = false;

    this.add(this.nameLabel);
    this.add(this.healthLabel);

    this.exhaustPool = new Vectr.Pool();
    this.i = 25;
    var e;
    while (this.i--) {
        e = new EngineParticle();
        this.add(e);
        this.exhaustPool.add(e);
    }
    // this.add(this.exhaustPool);
};

Player.prototype = new Vectr.Shape();

Player.prototype.path = function (context) {
    context.beginPath();
    context.moveTo(this.size / 2 * Math.cos(0), this.size / 2 * Math.sin(0));
    context.lineTo(this.size / 2 * Math.cos(120 * Math.PI / 180), this.size / 2 * Math.sin(120 * Math.PI / 180));
    context.lineTo(-this.size / 10, 0);
    context.lineTo(this.size / 2 * Math.cos(240 * Math.PI / 180), this.size / 2 * Math.sin(240 * Math.PI / 180));
    context.lineTo(this.size / 2 * Math.cos(0), this.size / 2 * Math.sin(0));
    context.closePath();

    context.strokeStyle = this.color;
    context.stroke();
};

Player.prototype.update = function (delta) {
    Vectr.Shape.prototype.update.call(this, delta);

    this.healthLabel.text = Math.round(this.health);
    this.timer += delta;

    // Draw engine fire
    if (this.thrust && this.timer > 0.05) {
        this.timer = 0;
        this.i = this.exhaustPool.activate();
        if (this.i) {
            this.i.position.x = this.i.startPosition.x = this.position.x;
            this.i.position.y = this.i.startPosition.y = this.position.y;
        }
    }

    this.exhaustPool.update(delta);
};
