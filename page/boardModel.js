function BoardModel(xrad, yrad){
    this.xrad = xrad;
    this.yrad = yrad;
    this.width = xrad * 2 + 1;
    this.height = yrad * 2 + 1;
    var that = this;
    this.initialize();

    networkManager.listen("snakeChanged", function( snake ){ that.onChangedSnake(snake);});
    networkManager.listen("playerQuit", function(obj){that.onPlayerQuit(obj);});
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

    if ( obj && obj.snakes ){
      for( var i = 0; i < obj.snakes.length; i++ ){
        this.snakes[i] = new SnakeModel(obj.snakes[i]);
      }
    }
}

BoardModel.prototype.onChangedSnake = function(changedObject){
  if ( changedObject.id !== changedObject.snake.id ){
    console.debug("disagrreeee");
    console.debug(this);
  }
  var snake = changedObject.snake;
  var i;
  for (i = 0; i < this.snakes.length; i++){
    if (typeof this.snakes[i].id !== 'undefined' && this.snakes[i].id === snake.id){
      break;
    }
  }
  this.snakes[i] = snake;
  this.notifyDrawChange();
}

BoardModel.prototype.redraw = function(){
  boardView.drawBoard( this );
  this.changesToDraw = false;
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

