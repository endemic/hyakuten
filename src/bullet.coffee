class Bullet
  constructor: (id, x, y, vx, vy) ->
    @position =
      x: x
      y: y
    @velocity =
      x: vx
      y: vy
    @owner = id
    @speed = 100

exports.Bullet = Bullet
