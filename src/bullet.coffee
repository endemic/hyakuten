class Bullet
  constructor: (id, x, y, vx, vy) ->
    @position =
      x: x
      y: y
    @velocity =
      x: vx
      y: vy
    @owner = id
    @speed = 125
    @damage = 20
    @cost = 10
    @size = 1

exports.Bullet = Bullet
