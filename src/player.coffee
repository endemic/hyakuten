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
    @maxHealth = 100
    @dead = false
    @regen = 0.05
    @bounty = 1
    @size = 20

  collidesWith: (other) ->
    Math.sqrt(Math.pow(other.position.x - @position.x, 2) + Math.pow(other.position.y - @position.y, 2)) < @size / 2 + other.size / 2

exports.Player = Player
