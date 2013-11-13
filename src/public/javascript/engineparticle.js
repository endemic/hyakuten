/*jslint sloppy: true, browser: true, plusplus: true */
/*globals Vectr: false, EngineParticle: false */

var EngineParticle = function (x, y) {
    Vectr.Shape.call(this, x, y);

    this.shape = 'circle';
    this.size = 2;
    this.lineWidth = 2;
    this.solid = true;
    this.glow = 10;
    this.fade = 1;
    this.grow = 3;
    this.active = false;
    this.startPosition = {
        x: this.position.x,
        y: this.position.y
    };
};

EngineParticle.prototype = new Vectr.Shape();

EngineParticle.prototype.activate = function () {
    this.colors.alpha = 1;
    this.scale = 1;
};

EngineParticle.prototype.update = function (delta) {
    Vectr.Shape.prototype.update.call(this, delta);

    this.colors.alpha -= this.fade * delta;
    this.scale += this.grow * delta;

    this.position.x = this.startPosition.x - this.parent.position.x;
    this.position.y = this.startPosition.y - this.parent.position.y;

    if (this.colors.alpha < 0) {
        this.active = false;
    }
};
