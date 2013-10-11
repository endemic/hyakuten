/*jslint sloppy: true, browser: true */
/*globals Vectr, Player */

var Player = function (x, y) {
    Vectr.Shape.apply(this, arguments);

    this.shape = 'triangle';
    this.size = 20;
    this.lineWidth = 1.5;
    this.thrust = 0;
    this.health = 0;
    this.name = 'player';

    this.healthLabel = new Vectr.Label(x, y + this.size, this.health, '10px sans-serif', null, 'center');
    this.nameLabel = new Vectr.Label(x, y - this.size, this.name, '10px sans-serif', null, 'center');

    this.shadow = {
        'x': 0,
        'y': 0,
        'blur': 10,
        'color': {
            'red': 255,
            'green': 255,
            'blue': 255,
            'alpha': 1
        }
    };
};

Player.prototype = new Vectr.Shape();

Player.prototype.draw = function (context) {
    Vectr.Shape.prototype.draw.call(this, context);

    if (this.active === true) {
      this.healthLabel.draw(context);
      this.nameLabel.draw(context);
    }
};

Player.prototype.customPath = function (context) {
    context.beginPath();
    context.moveTo(this.size / 2 * Math.cos(0), this.size / 2 * Math.sin(0));
    context.lineTo(this.size / 2 * Math.cos(120 * Math.PI / 180), this.size / 2 * Math.sin(120 * Math.PI / 180));
    context.lineTo(-this.size / 10, 0);
    context.lineTo(this.size / 2 * Math.cos(240 * Math.PI / 180), this.size / 2 * Math.sin(240 * Math.PI / 180));
    context.lineTo(this.size / 2 * Math.cos(0), this.size / 2 * Math.sin(0));
    context.closePath();

    context.strokeStyle = 'rgba(' + this.color.red + ', ' + this.color.green + ', ' + this.color.blue + ', ' + this.color.alpha + ')';
    context.stroke();

    // Draw engine fire
    if (this.thrust) {
      context.beginPath();
      context.arc(0, 0, 2, 0, Math.PI * 2, true);
      context.closePath();

      context.fillStyle = 'rgba(255, 0, 0, 0.75)';
      context.fill();
    }
};

Player.prototype.update = function (dt) {
    Vectr.Shape.prototype.update.call(this, dt);
    this.healthLabel.position.x = this.position.x;
    this.healthLabel.position.y = this.position.y + this.size;
    this.nameLabel.position.x = this.position.x;
    this.nameLabel.position.y = this.position.y - this.size;

    this.healthLabel.text = Math.round(this.health);
};
