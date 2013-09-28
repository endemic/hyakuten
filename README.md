# 百点

## Multiplayer arena shooter

### Installation

Requires NodeJS, the installation of which is outside the scope of this 
document (OS X users can use [Homebrew](http://brew.sh/)). Download source, 
and install dependencies with `npm install`. Run server with 
`coffee src/server.coffee`. 

### Instructions

Play using arrow keys to move and space or Z to shoot. Your objective is to 
score 100 points faster than your opponents. Each ship is worth 1 point, but 
each time you destroy another ship, yours is worth more. Also note that your 
ship's energy is used for ammunition; however, it regenerates over time.