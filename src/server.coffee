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
app.use(express.static(__dirname + '/public'))

server = http.createServer(app).listen 8000
console.log "Express running on port 8000"

# Configure Socket.IO
socket = io.listen server
socket.configure ->
  #socket.set 'transports', ['websockets']
  socket.set 'log level', 2

WIDTH = 1000
HEIGHT = 600
MAX_VELOCITY = 0.25

players = {}
bullets = []

onNewPlayer = (data) ->
  util.log "New player: #{this.id}"
  players[this.id] = new Player this.id, 100, 100

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
      bullets.push new Bullet(this.id,
                              players[this.id].position.x + Math.cos(players[this.id].rotation) * players[this.id].size / 2,
                              players[this.id].position.y + Math.sin(players[this.id].rotation) * players[this.id].size / 2,
                              Math.cos(players[this.id].rotation) + players[this.id].velocity.x,
                              Math.sin(players[this.id].rotation) + players[this.id].velocity.y)

onConnection = (client) ->
  util.log "New client connected: #{client.id}"

  # Set up callbacks for new client
  client.on 'disconnect', onDisconnect
  client.on 'new player', onNewPlayer
  client.on 'move player', onMovePlayer

onDisconnect = ->
  delete players[this.id]
  util.log "Player #{this.id} has disconnected"

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
    player.rotation += player.rotate * delta * 2
    player.acceleration.x = Math.cos(player.rotation) * player.thrust * delta
    player.acceleration.y = Math.sin(player.rotation) * player.thrust * delta
    player.velocity.x += player.acceleration.x
    player.velocity.y += player.acceleration.y
    player.position.x += player.velocity.x * player.speed
    player.position.y += player.velocity.y * player.speed

    # Enforce a maximum velocity - not realistic, but no fun otherwise
    if player.velocity.x > MAX_VELOCITY then player.velocity.x = MAX_VELOCITY
    if player.velocity.y > MAX_VELOCITY then player.velocity.y = MAX_VELOCITY
    if player.velocity.x < -MAX_VELOCITY then player.velocity.x = -MAX_VELOCITY
    if player.velocity.y < -MAX_VELOCITY then player.velocity.y = -MAX_VELOCITY

  # Update bullet position
  for bullet, i in bullets
    if not bullet then continue

    bullet.position.x += bullet.velocity.x * bullet.speed * delta
    bullet.position.y += bullet.velocity.y * bullet.speed * delta

    if bullet.position.x < 0 || bullet.position.x > WIDTH then bullets.splice i, 1
    if bullet.position.y < 0 || bullet.position.y > HEIGHT then bullets.splice i, 1

    # TODO: bullet collision

  # Send to all connections
  socket.sockets.emit 'data', { players: players, bullets: bullets }
  #util.debug "Sending data to client: #{JSON.stringify(players)}"
, 1
