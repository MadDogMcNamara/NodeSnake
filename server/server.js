var WebSocket = require('ws'),
    WebSocketServer = WebSocket.Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000
  , wsJSON = require("../page/util/wsJSON.js")
  , mod = require("../page/util/mod.js")
  , snakeConnection = require("./snakeConnection.js")
  , appleSpawner = require("./appleSpawner.js")
  , BoardResizer = require("./boardResizer.js").BoardResizer;

app.use(express.static(__dirname + '/../page'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server, path:"/snakews/"});
console.log('websocket server created');

var nextID = 0;
var connections = [];
var unusedConnections = [];
var playingConnections = 0;
var serverData = {
  connections:connections,
  getPlayingConnections : function(){
    return playingConnections;
  },
  playerActive : function(){
    playingConnections++;
    numPlayersChanged();
  },
  playerInactive : function(){
    playingConnections--;
    numPlayersChanged();
  }
};

var onNotifyBoardSizeWillChange = function(newBoardDim, time){
  var msg = {name:"boardSizeWillChange", newSize:newBoardDim, time: time};
  for ( var i = 0; i < connections.length; i++ ){
    connections[i].jsonws.sendJSON(msg);
  }
}

var onNotifyBoardSizeChange = function(boardData){
  var newBoardDim = {xrad: boardData.xrad, yrad: boardData.yrad};
  var msg = {name:"boardSizeChange", newSize:newBoardDim};
  for ( var i = 0; i < connections.length; i++ ){
    connections[i].jsonws.sendJSON(msg);
  }
  if ( boardResizer && !boardResizer.isSizeIncreasing() ){
    //todo bad to remove all apples just because board shrunk
    for ( var i = 0; i < connections.length; i++ ){
      for ( var j = 0 ; j < appleFactory.boardData.appleList.length; j++ ){
        connections[i].notifyRemoveApple(appleFactory.boardData.appleList[j]);
      }
    }
    appleFactory.boardShrunk();
  }
}

var boardResizerCallback = {notifyBoardSizeChange:onNotifyBoardSizeChange, notifyBoardSizeWillChange: onNotifyBoardSizeWillChange};

var boardResizer = new BoardResizer(boardResizerCallback);


var boardData = boardResizer.boardData;



var numPlayersChanged = function(){
  return boardResizer.updateWithPlayerCount(playingConnections);
}

var appleFactory = new appleSpawner.AppleSpawner(connections, boardData, serverData);

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
    var id;
    if (unusedConnections.length > 0){
      id = unusedConnections[0];
      unusedConnections.shift();
    }
    else{
      id = nextID;
      nextID++;
    }
    connection = new SnakeConnection(jsonws, id, connections, boardData, unusedConnections, serverData);
  });

});
