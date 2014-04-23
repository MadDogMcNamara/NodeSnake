var root = module.exports;
var mod = require("../page/util/mod.js");
var respawnTime = 2000;
var invincibleTime = 4000;
var startingLength = 1;
var SnakeModel = require("../page/snakeModel.js").SnakeModel;

SnakeConnection = function(socket, id, others, boardData, unusedConnections){
  this.state = "dead";
  this.unusedConnections = unusedConnections;
  this.thisListen = function(name, f){
    var that = this;
    this.jsonws.listen(name, function(event){ f.apply(that, [event]); });
  }

  this.connections = others;
  this.jsonws = socket;
  this.id = id;
  this.boardData = boardData;
  var that = this;
  this.lastSpawn = null;



  // inform client of join
  var event = {name:"joinGame"};

  // respond with id
  event.id = this.id;
  // respond with board size
  event.board = {xrad:this.boardData.xrad, yrad:this.boardData.yrad};

  // respond with initial snake
  event.snakes = [{id:event.id, points:[]}];
  // include other snakes
  for ( var i = 0; i < this.connections.length; i++ ){
    event.snakes.push(this.connections[i].snake);
  }

  // add self to connections list
  this.connections.push(this);

  event.apples = this.boardData.appleList;

  console.log("letting " + this.id + " join");

  this.jsonws.sendJSON(event);
  this.snake = new SnakeModel({id:this.id, points:[], color:"#FFFFFF"});
  // end send join

  this.jsonws.on('close', function(){(function() {
    this.unusedConnections.push(this.id);

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

    if ( this.state === "alive" ){
      // tell snake spawner player left
      this.boardData.appleSpawner.playerLeft();
    }
  }).apply(that);});




  this.thisListen( "snakeChanged", function(event){
    // send to all other connections
    this.snake.update(event);
    this.snake.id = this.id;
    this.snake.resetDelta();

    // check for collision
    var head = this.snake.points[this.snake.points.length - 1];
    var deaths = [];
    for ( var i = 0; i < this.connections.length; i++ ){
      var otherPoints = this.connections[i].snake.points;
      for ( var j = 0; j < (otherPoints.length - ((this.id === this.connections[i].id) ? 1 : 0 )); j++){
        var body = otherPoints[j];
        if ( body.x === head.x && body.y === head.y ){
          if ( !this.isInvincible() ){
            deaths[this.id] = 1;
          }
          if ( j === otherPoints.length - 1 ){
            // they died too
            if ( !this.connections[i].isInvincible() ){
              deaths[this.connections[i].id] = 1;
            }
          }
        }
      }
    }

    // notify others of changed snake
    for ( var i = 0; i < this.connections.length; i++){
      if ( this.connections[i].id === this.id ) continue;
      this.connections[i].notifySnakeChange(this, event);
    }

    // go through all connections, notify the dead
    for ( var i = 0; i < this.connections.length; i++ ){
      if( ( deaths[this.connections[i].id] || false ) ){
        // notify about death
        // delete points so snake is invisible
        this.connections[i].snake.points = [];
        this.connections[i].notifyDeath();

        // notify others about changed
        for ( var j = 0; j < this.connections.length; j++ ){
          if ( this.connections[j].id === this.connections[i].id ) continue;
          this.connections[j].notifyOtherSnakeDeath(this.connections[i]);
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

  });
  this.thisListen("requestRespawn", function(){
    this.sendRespawn();
  });

}

SnakeConnection.prototype.sendRespawn = function(){
  this.state = "alive";
  this.boardData.appleSpawner.playerJoined();
  console.log("respawnin");
  var event = {name:"respawn"};
  var newSnake = {color:this.getRandomColor(this.id)};
  newSnake.points = this.getStartingPoints(this.id);
  newSnake.id = this.id;

  this.snake = new SnakeModel(newSnake);
  event.snake = this.snake;
  event.time = respawnTime;
  this.lastSpawn = new Date();
  // send to all the connections
  for ( var i = 0; i < this.connections.length; i++ ){
    event.mine = (this.connections[i] === this);
    this.connections[i].jsonws.sendJSON(event);
  }

  // clear points until player moves again
  this.snake.points = [];
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

SnakeConnection.prototype.isInvincible = function(){
  return ( this.lastSpawn && (new Date().getTime() - this.lastSpawn < invincibleTime) );
}

SnakeConnection.prototype.notifySnakeChange = function(otherConnection, delta){
  otherConnection.snake.id = otherConnection.id;
  var msg = delta;
  this.jsonws.sendJSON(msg);
}

SnakeConnection.prototype.notifyOtherSnakeDeath = function(otherConnection){
  otherConnection.snake.id = otherConnection.id;
  var msg = {name:"snakeChanged", death:true, id:otherConnection.id, snake:{id:otherConnection.id, color:otherConnection.snake.color}};
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

SnakeConnection.prototype.notifyDeath = function(){
  this.boardData.appleSpawner.playerLeft();
  this.state = "dead";
  var msg = {name:"collision", snake:this.snake};
  this.jsonws.sendJSON( msg );
}




SnakeConnection.prototype.getRandomColor = function(){
  var randomNum;

  // pie slices strat for max color distinguishability
  if ( this.id === 0 ){
    randomNum = 0;
  }
  else{
    var k = Math.floor(Math.log(this.id) / Math.log(2));
    var l = 1 << k;
    var r = this.id - l;
    randomNum = (1 + 2 * r) / (2 * l);
    randomNum *= 360;
  }


  // old color gen
  /*
  var id = this.id;
  var p = 31;
  var x = 234;

  var randomNum = mod.expmod(x,id + 2,p);

  randomNum = randomNum / p * 360;*/

  var rgbColor = HSBToRGB({h:randomNum, s:100, b:100});
  rgbColor = ((rgbColor.r << 16) + (rgbColor.g << 8) + rgbColor.b).toString(16);

  var pad = ("000000").substring(0,6 - rgbColor.length);

  return "#" + pad + rgbColor;
}


root.SnakeConnection = SnakeConnection;
