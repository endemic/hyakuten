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
    @speed = 3
    @health = 100
    @maxHealth = 100
    @dead = false
    @regen = 7.5
    @bounty = 1
    @size = 20
    @color = 'rgba(255, 255, 255, 1)'

  collidesWith: (other) ->
    Math.sqrt(Math.pow(other.position.x - @position.x, 2) + Math.pow(other.position.y - @position.y, 2)) < @size / 2 + other.size / 2

exports.Player = Player
