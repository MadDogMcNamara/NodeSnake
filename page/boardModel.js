function BoardModel(xrad, yrad){
    var that = this;
    this.initialize();
    this.apples = [];
    this.respawns = [];
    networkManager.listen("snakeChanged", function( snake ){ that.onChangedSnake(snake);});
    networkManager.listen("playerQuit", function(obj){that.onPlayerQuit(obj);});
    networkManager.listen("newApple", function(obj){ that.newApple(obj); });
    networkManager.listen("removeApple", function(obj){ that.removeApple(obj)});
}

BoardModel.prototype.newApple = function(obj){
  this.apples.push(obj.location);
}

BoardModel.prototype.removeApple = function(obj){
  for ( var i = 0; i < this.apples.length; i++ ){
    if ( (this.apples[i].x === obj.location.x) && (this.apples[i].y === obj.location.y )){
      this.apples.splice(i,1);
      break;
    }
  }
}

BoardModel.prototype.setSize = function(xrad, yrad){
    this.xrad = xrad || 10;
    this.yrad = yrad || 5;
    this.width = this.xrad * 2 + 1;
    this.height = this.yrad * 2 + 1;
}

BoardModel.prototype.onPlayerQuit = function(obj){
  for( var i = 0; i < this.snakes.length; i++ ){
    var snake = this.snakes[i];
    if ( obj.id === snake.id ){
      this.snakes.splice(i,1);
      i--;
    }
  }
}

BoardModel.prototype.initialize = function(obj){
    this.snakes = [];
    this.changesToDraw = false;
    if ( obj ){
      this.setSize(obj.board.xrad, obj.board.yrad);
      this.apples = obj.apples;
    }

    if ( obj && obj.snakes ){
      for( var i = 0; i < obj.snakes.length; i++ ){
        this.snakes[i] = new SnakeModel(obj.snakes[i]);
      }
    }
}

BoardModel.prototype.respawnLocal = function(obj){
  this.snakes[0].points = obj.snake.points;
  this.snakes[0].color = obj.snake.color;
  this.snakes[0].id = obj.snake.id;
}

BoardModel.prototype.onChangedSnake = function(changedObject){
  var snake = changedObject.snake;
  var i;
  for (i = 0; i < this.snakes.length; i++){
    if (typeof this.snakes[i].id !== 'undefined' && this.snakes[i].id === snake.id){
      break;
    }
  }
  if ( this.snakes.length <= i ){
    this.snakes[i] = new SnakeModel(changedObject.snake);
  }
  this.snakes[i].update(changedObject);
  this.notifyDrawChange();
}

BoardModel.prototype.redraw = function(){
  if ( boardView && boardView.drawBoard ){
    boardView.drawBoard( );
    this.changesToDraw = false;
  }
}

BoardModel.prototype.notifyDrawChange = function(){
  //for now send the whole snake
  this.changesToDraw = true;
  this.redraw();
}

BoardModel.prototype.notifyNetworkChange = function(){
  networkManager.sendChangedSnake( this.snakes[0] );
  this.notifyDrawChange();
}

BoardModel.prototype.addSnake = function(snake){
  var ret = new SnakeModel(snake);
  this.snakes.push(ret);
  return ret;
}

BoardModel.prototype.addRespawn = function(respawn){
  var that = this;
  if ( respawn.snake && respawn.time ){
    this.respawns.push(respawn);
    setTimeout(function(){
      that.respawns.shift(that.respawns.indexOf(respawn));
    }, respawn.time.getTime() - new Date().getTime() );
  }
}
