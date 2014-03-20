function BoardModel(xrad, yrad){
    this.xrad = xrad;
    this.yrad = yrad;
    this.width = xrad * 2 + 1;
    this.height = yrad * 2 + 1;
    this.snakes = [];
    this.changesToDraw = false;
    var that = this;
    networkManager.listen("snakeChanged", function( snake ){ that.onChangedSnake(snake); });

}

BoardModel.prototype.onChangedSnake = function(changedObject){
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


BoardModel.prototype.addSnake = function(point){
  point = point || [{x:0,y:0},{x:0,y:0},{x:0,y:0}];
  var ret = new SnakeModel(point);
  this.snakes.push(ret);
  return ret;
}
