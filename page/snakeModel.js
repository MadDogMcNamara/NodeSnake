function SnakeModel(oldSnake){
    this.color = "#0000FF";
    this.points = [];
    this.queuedRemovePoints = [];
    this.queuedAddPoints = [];
    if ( oldSnake ){
      this.color = oldSnake.color || "#0000FF";
      this.points = oldSnake.points || [];
      this.id = oldSnake.id;
    }
}

SnakeModel.prototype.removePoint = function(p){
  for ( var i = 0; i < this.points.length; i++ ){
    if (this.points[i].x == p.x && this.points[i].y == p.y ){
      this.points.shift(i);
      this.queuedRemovePoints.push(p);
    }
  }
}

SnakeModel.prototype.addPoint = function(p){
  this.points.push(p);
  this.queuedAddPoints.push(p);
}


SnakeModel.prototype.getDiffSinceLastQuery = function(){
  var ret = {add:this.queuedAddPoints.slice(0,this.queuedAddPoints.length), remove:this.queuedRemovePoints.slice(0,this.queuedRemovePoints.length)};

  this.resetDelta();
  return ret;
}


SnakeModel.prototype.update = function(data){
  if ( data.death ){
    this.points = [];
    this.resetDelta();
  }
  else if ( data.diff ){
    if ( this.points.length > 0 ){
      for ( var i = 0; i < data.snake.delta.remove.length; i++ ){
        var p = data.snake.delta.remove[i];

        if ( this.points[0].x !== p.x || this.points[0].y !== p.y){
          console.log("doesn't make sense to remove that point...");
        }
        this.points.shift(0);
      }
    }
    for ( var i = 0; i < data.snake.delta.add.length; i++ ){
      this.points.push(data.snake.delta.add[i]);
    }
  }
  else{
    this.points = data.snake.points;
  }
}

SnakeModel.prototype.resetDelta = function(){
  this.queuedAddPoints.length = 0;
  this.queuedRemovePoints.length = 0;
}

// if node
if ( typeof exports !== "undefined" ){
  // todo verify works
  exports.SnakeModel = SnakeModel;
}
