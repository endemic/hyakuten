class Player
  constructor: (id, x, y) ->
    @id = id
    @position =
      x: x
      y: y
    @velocity =
      x: 0
      y: 0
    @acceleration =
      x: 0
      y: 0
    @health = 100
    @rotation = 0
    @rotate = 0
    @thrust = 0
    @speed = 0.5
    @health = 100
    @bounty = 1
    @size = 20

exports.Player = Player
