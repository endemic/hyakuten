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
    @damage = 10
    @cost = 5
    @size = 1

exports.Bullet = Bullet
