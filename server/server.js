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

function getStartingPoints(x){
  var res = [];
  for ( var i = 0; i < startingLength - 1; i++ ){
    res.push({x:0,y:x});
  }
  res.push({x:1,y:x});
  return res;
}



function getRandomColor(id){
  var p = 7919;
  var x = 7000;

  mod.expmod(x,id + 2,p);

  x = x / p * 360;



  var randomNum = Math.random() * 360;

  var rgbColor = HSBToRGB({h:randomNum, s:100, b:100});
  rgbColor = ((rgbColor.r << 16) + (rgbColor.g << 8) + rgbColor.b).toString(16);

  var pad = ("000000").substring(0,6 - rgbColor.length);

  return "#" + pad + rgbColor;
}


wss.on('connection', function(ws) {
    var jsonws = wsJSON.getJSONWebSocket(ws);
    var connection = {};

    jsonws.on('close', function() {
      // remove from connections
      for ( var i = 0; i < connections.length; i++ ){
        var checkConnection = connections[i];
        if ( connection.id === checkConnection.id ){
          console.log("closed: " +  connection.id);
          connections.splice(i, 1);
          break;
        }
      }

      var message = {name:"playerQuit", "id":id};

      // tell the other users about the disconnect
      for ( var i = 0; i < connections.length; i++ ){
        var connection = connections[i];
        connection.socket.sendJSON( message );
      }
    });



    jsonws.onJSONMessage = function (event) {
      if ( event.name ){
        if ( event.name === 'joinGame' ){
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
          newSnake.points = getStartingPoints(0);
          newSnake.id = connection.id;

          event.snakes[0] = newSnake;
          connection.snake = newSnake;

          console.log("letting " + connection.id + " join");

          jsonws.sendJSON(event);

        }
        else if ( event.name && event.name === "snakeChanged" ){
          console.log(connection.id);
          // send to all other connections
          connection.snake = event.snake;

          // see what its colliding with
          var newSnake = connection.snake;
          var dead = false;
          var head = newSnake.points[newSnake.points.length-1];

          for ( var i = 0; i < newSnake.points.length -1; i++ ){
            var body = newSnake.points[i];

            if ( head.x === body.x && head.y === body.y ){
              // then they're colliding
              dead = true;
              break;
            }
          }
          // check if colliding with others
          for ( var i = 0; (!dead) && (i < connections.length); i++){
            // don't collide with self
            if ( connections[i].id === connection.id ) continue;
            var otherSnake = connections[i].snake;
            for ( var j = 0; j < otherSnake.points.length; j++ ){
              var body = otherSnake.points[j];
              if ( head.x === body.x && head.y === body.y ){
                // then they're colliding
                dead = true;
              }
            }
          }

          if ( dead ){
            var obj = {name:'collision'};
            obj.snake = connection.snake;
            obj.snake.id = connection.id;
            obj.snake.points = getStartingPoints(connection.id);

            connection.socket.sendJSON(obj);
          }
          // end check colliding

          // notify others of changed snake
          for ( var i = 0; i < connections.length; i++){
            var conn = connections[i];
            connection = conn;
            if ( conn.id === connection.id ) continue;
            var connSocket = connections[i];
            connSocket.socket.sendJSON(event);
          }
        }
      }
    };
});
