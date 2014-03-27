var WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , wsJSON = require("../page/util/wsJSON.js")
  , mod = require("../page/util/mod.js")
  , snakeConnection = require("./snakeConnection.js")
  , appleSpawner = require("./appleSpawner.js");

app.use(express.static(__dirname + '/../page'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var nextID = 0;
var connections = [];


var boardData = {xrad:20, yrad:10};

var appleTime = 1000;

var appleFactory = new appleSpawner.AppleSpawner(connections, boardData);

appleFactory.onAppleSpawn(function(point){
  // tell all the connections about it
  for ( var i = 0; i < connections.length; i++ ){
    connections[i].notifyNewApple(point);
  }
});




wss.on('connection', function(ws) {
  var jsonws = wsJSON.getJSONWebSocket(ws);
  var connection;

  jsonws.listen("joinGame", function(event){
    // request to join, fulfill immediately
    connection = new SnakeConnection(jsonws, nextID, connections, boardData);
    appleFactory.playerJoined();
    nextID++;
  });

});
