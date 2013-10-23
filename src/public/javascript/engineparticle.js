/*jslint sloppy: true, browser: true, plusplus: true */
/*globals Vectr: false, EngineParticle: false */

var EngineParticle = function (x, y) {
    Vectr.Shape.apply(this, arguments);

    this.shape = 'circle';
    this.size = 2;
    this.lineWidth = 2;
    this.solid = true;
    this.glow = 10;
    this.fade = 1.5;
    this.grow = 5;
    this.active = false;
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

    if (this.colors.alpha < 0) {
        this.active = false;
    }
};
