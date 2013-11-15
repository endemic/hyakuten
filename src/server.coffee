#!/usr/bin/env coffee

express = require 'express'
io = require 'socket.io'
util = require 'util'
http = require 'http'

# Game-related classes
Player = require('./player').Player
Bullet = require('./bullet').Bullet

app = express()

# Serve static files out of server/public
app.use express.static(__dirname + '/public')
app.set 'views', __dirname + '/views'

ip = '192.168.11.28'
port = 8000

app.get '/', (request, response) ->
  response.render 'index.ejs', { host: "http://#{ip}:#{port}" }

server = http.createServer(app).listen port
console.log "Express running on port #{port}"

# Configure Socket.IO
socket = io.listen server
socket.configure ->
  #socket.set 'transports', ['websockets']
  socket.set 'log level', 2

WIDTH = 1000
HEIGHT = 600
MAX_VELOCITY = 0.50
RESPAWN_TIMER = 3000
PLAYER_COLORS = [
  'rgba(161, 249, 79, 1)'
  'rgba(255, 169, 56, 1)'
  'rgba(255, 49, 165, 1)'
  'rgba(0, 171, 249, 1)'
  'rgba(176, 60, 246, 1)'
  'rgba(254, 250, 82, 1)'
  'rgba(255, 38, 102, 1)'
  'rgba(255, 255, 255, 1)'
]

players = {}
bullets = []

onNewPlayer = (data) ->
  util.log "New player: #{this.id}"
  players[this.id] = new Player this.id, 100, 100

  # Determine a color to assign to new player
  # TODO: this is janky - change player data structure to an array
  color = 0
  for id of players
    color += 1

  players[this.id].color = PLAYER_COLORS[color]
  players[this.id].name = this.id
  # TODO: This message should only go to the originating socket
  socket.sockets.emit 'new player', { id: this.id }

onMovePlayer = (data) ->
  #util.log "Move player #{this.id}: #{data}"
  switch data
    when 'left' then players[this.id].rotate += -1
    when 'right' then players[this.id].rotate += 1
    when 'up' then players[this.id].thrust += 1
    when 'down' then players[this.id].thrust += -1
    when 'left-stop' then players[this.id].rotate -= -1
    when 'right-stop' then players[this.id].rotate -= 1
    when 'up-stop' then players[this.id].thrust -= 1
    when 'down-stop' then players[this.id].thrust -= -1
    when 'shoot'
      bullet = new Bullet(this.id,
                              players[this.id].position.x + Math.cos(players[this.id].rotation) * players[this.id].size / 2,
                              players[this.id].position.y + Math.sin(players[this.id].rotation) * players[this.id].size / 2,
                              Math.cos(players[this.id].rotation) + players[this.id].velocity.x,
                              Math.sin(players[this.id].rotation) + players[this.id].velocity.y)
      bullets.push bullet
      players[this.id].health -= bullet.cost

respawn = (player) ->
  player.dead = null
  player.position.x = WIDTH / 2
  player.position.y = HEIGHT / 2
  player.velocity.x = player.velocity.y = 0
  player.acceleration.x = player.acceleration.y = 0
  player.rotation = Math.PI / 2
  player.health = player.maxHealth
  player.bounty = 1
  util.log "Respawning player ##{player.id}"

onConnection = (client) ->
  util.log "New client connected: #{client.id}"

  # Set up callbacks for new client
  client.on 'disconnect', onDisconnect
  client.on 'new player', onNewPlayer
  client.on 'move player', onMovePlayer

onDisconnect = ->
  delete players[this.id]
  util.log "Player #{this.id} has disconnected"
  socket.sockets.emit 'removePlayer', { id: this.id }

# Listen for connection events
socket.sockets.on 'connection', onConnection

# Set up game loop
previousDelta = Date.now()
setInterval ->
  currentDelta = Date.now()
  delta = (currentDelta - previousDelta) / 1000
  previousDelta = currentDelta

  # Update player position
  for id, player of players

    # Handle health
    if player.health < 0 and player.dead is null
      player.dead = Date.now()
    else if player.health < player.maxHealth and player.dead is null
      player.health += player.regen * delta
      if player.health > player.maxHealth then player.health = player.maxHealth
    else if player.dead? and Date.now() - player.dead > RESPAWN_TIMER
      respawn player

    if player.dead? then continue

    # Handle rotation/movement
    player.rotation += player.rotate * delta * 2
    player.acceleration.x = Math.cos(player.rotation) * player.thrust * delta
    player.acceleration.y = Math.sin(player.rotation) * player.thrust * delta

    player.velocity.x += player.acceleration.x
    player.velocity.y += player.acceleration.y

    velocityVector = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y)

    if velocityVector > MAX_VELOCITY
      player.velocity.x += (player.velocity.x / velocityVector) * (MAX_VELOCITY - velocityVector)
      player.velocity.y += (player.velocity.y / velocityVector) * (MAX_VELOCITY - velocityVector)

    player.position.x += player.velocity.x * player.speed
    player.position.y += player.velocity.y * player.speed

    # Temporarily wrap players
    # if player.position.x < 0 then player.position.x = WIDTH
    # if player.position.x > WIDTH then player.position.x = 0
    # if player.position.y < 0 then player.position.y = HEIGHT
    # if player.position.y > HEIGHT then player.position.y = 0

  # Update bullet position
  for bullet, i in bullets
    if not bullet then continue

    bullet.position.x += bullet.velocity.x * bullet.speed * delta
    bullet.position.y += bullet.velocity.y * bullet.speed * delta

    if bullet.position.x < 0 || bullet.position.x > WIDTH then bullets.splice i, 1
    if bullet.position.y < 0 || bullet.position.y > HEIGHT then bullets.splice i, 1

    # bullet collision
    for id, player of players
      if bullet.owner != player.id and player.dead is null and player.collidesWith(bullet) 
        player.health -= bullet.damage
        bullets.splice i, 1
        util.log "Bullet collision! Player health: #{player.health}"

  # Send to all connections
  socket.sockets.emit 'data', { players: players, bullets: bullets }
  #util.debug "Sending data to client: #{JSON.stringify(players)}"
, 1000 / 60
