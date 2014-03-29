var root = module.exports;
var mod = require("../page/util/mod.js");

var startingLength = 1;

SnakeConnection = function(socket, id, others, boardData){
  this.thisListen = function(name, f){
    var that = this;
    this.jsonws.listen(name, function(event){ f.apply(that, [event]); });
  }

  this.connections = others;
  this.jsonws = socket;
  this.id = id;
  this.boardData = boardData;
  var that = this;


  this.connections.push(this);

  // inform client of join
  var event = {name:"joinGame"};

  // respond with id
  event.id = this.id;
  // respond with board size
  event.board = {xrad:this.boardData.xrad, yrad:this.boardData.yrad};

  // respond with initial snake
  event.snakes = [];
  event.apples = this.boardData.appleList;

  var newSnake = {color:this.getRandomColor(this.id)};
  newSnake.points = this.getStartingPoints(this.id);
  newSnake.id = this.id;

  event.snakes[0] = newSnake;
  this.snake = newSnake;

  console.log("letting " + this.id + " join");

  this.jsonws.sendJSON(event);
  // end send join

  this.jsonws.on('close', function(){(function() {
    // remove from connections
    for ( var i = 0; i < this.connections.length; i++ ){
      var checkConnection = this.connections[i];
      if ( this.id === checkConnection.id ){
        console.log("closed: " + this.id);
        this.connections.splice(i, 1);
        break;
      }
    }

    var message = {name:"playerQuit", "id":this.id};

    // tell the other users about the disconnect
    for ( var i = 0; i < this.connections.length; i++ ){
      this.connections[i].jsonws.sendJSON( message );
    }

    // tell snake spawner player left
    this.boardData.appleSpawner.playerLeft();

  }).apply(that);});




  this.thisListen( "snakeChanged", function(event){
    // send to all other connections
    this.snake = event.snake;
    this.snake.id = this.id;

    // check for collision
    var head = this.snake.points[this.snake.points.length - 1];
    var deaths = [];
    for ( var i = 0; i < this.connections.length; i++ ){
      var otherPoints = this.connections[i].snake.points;
      for ( var j = 0; j < (otherPoints.length - ((this.id === this.connections[i].id) ? 1 : 0 )); j++){
        var body = otherPoints[j];
        if ( body.x === head.x && body.y === head.y ){
          deaths[this.id] = 1;
          if ( j === otherPoints.length - 1 ){
            // they died too
            deaths[this.connections[i].id] = 1;
          }
        }
      }
    }

    // go through all connections, notify the dead
    for ( var i = 0; i < this.connections.length; i++ ){
      if( ( deaths[this.connections[i].id] || false ) ){
        // notify about death
        this.connections[i].snake.points = this.connections[i].getStartingPoints();
        var msg = {name:"collision", snake:this.connections[i].snake};
        this.connections[i].jsonws.sendJSON( msg );

        // notify others about changed
        for ( var j = 0; j < this.connections.length; j++ ){
          if ( this.connections[j].id === this.connections[i].id ) continue;
          this.connections[j].notifySnakeChange(this.connections[i]);
        }
      }
    }
    // end check for collision

    if ( deaths.length === 0 ){
      // check if apples eaten, look to see if an apple is underneath the head, if so then
      // eat the apple
      this.boardData.appleLocations[head.y] = this.boardData.appleLocations[head.y] || [];
      if ( this.boardData.appleLocations[head.y][head.x] ){
        this.boardData.appleSpawner.appleEaten(head);
        // tell this snake it ate the apple
        this.notifyAteApple();

        // notify all that the apple is now gone
        for ( var i = 0; i < this.connections.length; i++ ){
          this.connections[i].notifyRemoveApple(head);
        }
      }
    }

    this.boardData.appleSpawner.fillApples();

    // notify others of changed snake
    for ( var i = 0; i < this.connections.length; i++){
      if ( this.connections[i].id === this.id ) continue;
      this.connections[i].notifySnakeChange(this);
    }
  });

}

SnakeConnection.prototype.getStartingPoints = function(){
  var x = this.id;
  var res = [];
  for ( var i = 0; i < startingLength - 1; i++ ){
    res.push({x:0,y:x});
  }
  res.push({x:1,y:x});
  return res;
}

SnakeConnection.prototype.notifySnakeChange = function(otherConnection){
  otherConnection.snake.id = otherConnection.id;
  var msg = {name:"snakeChanged", snake:otherConnection.snake};
  this.jsonws.sendJSON(msg);
}

SnakeConnection.prototype.notifyNewApple = function(point){
  var msg = {name:"newApple"};
  msg.location = point;
  this.jsonws.sendJSON( msg );
}


SnakeConnection.prototype.notifyRemoveApple = function(point){
  var msg = {name:"removeApple"};
  msg.location = point;
  this.jsonws.sendJSON( msg );
}


SnakeConnection.prototype.notifyAteApple = function(point){
  var msg = {name:"ateApple"};
  msg.location = point;
  this.jsonws.sendJSON( msg );
}


SnakeConnection.prototype.getRandomColor = function(){
  var id = this.id;
  var p = 31;
  var x = 234;

  var randomNum = mod.expmod(x,id + 2,p);

  randomNum = randomNum / p * 360;

  var rgbColor = HSBToRGB({h:randomNum, s:100, b:100});
  rgbColor = ((rgbColor.r << 16) + (rgbColor.g << 8) + rgbColor.b).toString(16);

  var pad = ("000000").substring(0,6 - rgbColor.length);

  return "#" + pad + rgbColor;
}


root.SnakeConnection = SnakeConnection;
