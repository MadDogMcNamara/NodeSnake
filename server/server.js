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


var connections = [];

wss.on('connection', function(ws) {
    var jsonws = wsJSON.getJSONWebSocket(ws);
    var id = connections.length;
    connections.push(jsonws);
    console.log('websocket connection open');

    jsonws.on('close', function() {
        console.log('websocket connection close');
        clearInterval(id);
    });

    jsonws.onJSONMessage = function (event) {
      if ( event.name && event.name === "snakeChanged" ){
        // send to all other connections
        event.snake.id = id;

        for ( var i = 0; i < connections.length; i++){
          if ( i === id ) continue;
          if ( i % 2 === 1 && i - 1 === id ) continue;
          var connSocket = connections[i];
          connSocket.sendJSON(event);
        }
      }
    };
});
