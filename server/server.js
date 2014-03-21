var WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , wsJSON = require("../page/util/wsJSON.js");

app.use(express.static(__dirname + '/../page'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');

var nextID = 0;
var connections = [];

wss.on('connection', function(ws) {
    var jsonws = wsJSON.getJSONWebSocket(ws);
    var id;

    jsonws.on('close', function() {
      // remove from connections
      for ( var i = 0; i < connections.length; i++ ){
        var connection = connections[i];
        if ( connection.id === id ){
          console.log("removed" +  connection.id);
          connections.splice(i, i+1);
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
          id = nextID;
          nextID++;
          connections.push({"id":id,socket:jsonws});

          // respond with id
          event.id = id;

          // respond with initial snake
          event.snakes = [];
          event.snakes[0] = {points:[{x:0,y:0},{x:0,y:0},{x:0,y:0},{x:0,y:0}], color:"#0000FF"};

          jsonws.sendJSON(event);
        }
        else if ( event.name && event.name === "snakeChanged" ){
          // send to all other connections
          event.snake.id = id;

          for ( var i = 0; i < connections.length; i++){
            var conn = connections[i];
            if ( conn.id === id ) continue;
            var connSocket = connections[i];
            connSocket.socket.sendJSON(event);
          }
        }
      }
    };
});
