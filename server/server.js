var WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , wsJSON = require("../page/util/wsJSON.js")
  , mod = require("../page/util/mod.js");

app.use(express.static(__dirname + '/../page'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var nextID = 0;
var connections = [];

var startingLength = 10;

var appleTime = 1000;

function getStartingPoints(x){
  var res = [];
  for ( var i = 0; i < startingLength - 1; i++ ){
    res.push({x:0,y:x});
  }
  res.push({x:1,y:x});
  return res;
}



function getRandomColor(id){
  var p = 31;
  var x = 234;

  var randomNum = mod.expmod(x,id + 2,p);

  randomNum = randomNum / p * 360;

  var rgbColor = HSBToRGB({h:randomNum, s:100, b:100});
  rgbColor = ((rgbColor.r << 16) + (rgbColor.g << 8) + rgbColor.b).toString(16);

  var pad = ("000000").substring(0,6 - rgbColor.length);

  return "#" + pad + rgbColor;
}


function notifySnakeChange(srcConnection, destConnection){
  // don't notify player about self
  if ( srcConnection.id === destConnection.id ) return;
  var snake = srcConnection.snake;
  snake.id = srcConnection.id;
  var msg = {name:"snakeChanged", id:srcConnection.id, "snake":snake};
  destConnection.socket.sendJSON(msg);
}

wss.on('connection', function(ws) {
  var jsonws = wsJSON.getJSONWebSocket(ws);
  var connection = {};

  jsonws.on('close', function() {
    // remove from connections
    for ( var i = 0; i < connections.length; i++ ){
      var checkConnection = connections[i];
      if ( connection.id === checkConnection.id ){
        console.log("closed: " + connection.id);
        connections.splice(i, 1);
        break;
      }
    }

    var message = {name:"playerQuit", "id":connection.id};

    // tell the other users about the disconnect
    for ( var i = 0; i < connections.length; i++ ){
      connections[i].socket.sendJSON( message );
    }
  });

  jsonws.listen("joinGame", function(event){
    // request to join, fulfill immediately
    var id = nextID;
    nextID++;
    connection = {"id":id,socket:jsonws};
    connections.push(connection);

    // respond with id
    event.id = id;

    // respond with initial snake
    event.snakes = [];

    var newSnake = {color:getRandomColor(id)};
    newSnake.points = getStartingPoints(id);
    newSnake.id = connection.id;

    event.snakes[0] = newSnake;
    connection.snake = newSnake;

    console.log("letting " + connection.id + " join");

    jsonws.sendJSON(event);

  });

  jsonws.listen( "snakeChanged", function(event){
    // send to all other connections
    connection.snake = event.snake;
    connection.snake.id = connection.id;

    // check for collision
    var head = connection.snake.points[connection.snake.points.length - 1];
    var deaths = [];
    var dead = false;
    for ( var i = 0; i < connections.length; i++ ){
      var otherPoints = connections[i].snake.points;
      for ( var j = 0; j < (otherPoints.length - ((connection === connections[i]) ? 1 : 0 )); j++){
        var body = otherPoints[j];
        if ( body.x === head.x && body.y === head.y ){
          deaths[connection.id] = 1;
          if ( j === otherPoints.length - 1 ){
            // they died too
            deaths[connections[i].id] = 1;
          }
        }
      }
    }

    // go through all connections, notify the dead
    for ( var i = 0; i < connections.length; i++ ){
      if( ( deaths[connections[i].id] || false ) ){
        // notify about death
        connections[i].snake.points = getStartingPoints(connections[i].id);
        var msg = {name:"collision", snake:connections[i].snake};
        console.log("collision: " + connections[i].id);
        connections[i].socket.sendJSON( msg );

        // notify others about changed
        for ( var j = 0; j < connections.length; j++ ){
          if ( connections[j].id === connections[i].id ) continue;
          notifySnakeChange(connections[i], connections[j]);
        }
      }
    }
    // end check for collision

    // notify others of changed snake
    for ( var i = 0; i < connections.length; i++){
      if ( connections[i].id === connection.id ) continue;
      notifySnakeChange(connection, connections[i]);
    }
  });
});
