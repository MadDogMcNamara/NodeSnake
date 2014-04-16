// args: snake - the snake data this contoller is responsible for
function LocalSnakeController(snake, boardModel){
    this.snakeModel = snake;
    this.boardModel = boardModel;
    this.snakeModel.direction = this.snakeModel.direction || 0;
    this.queuedApples = 0;
    this.freeze = false;
    var that = this;
    networkManager.listen("ateApple", function(){that.queuedApples++});
}


LocalSnakeController.prototype.simulateFrame = function( inputs ){
    if ( this.freeze ) return;
    if ( this.snakeModel.points.length === 0 ) return;
    while ( inputs.length > 0 ){
        var headInput = inputs.shift();

        // allow orthogonal movement only
        if ( ( this.snakeModel.direction + headInput ) % 2 !== 0 ){
            this.snakeModel.direction = headInput;
            break;
        }
    }

    // move one unit
    var dir = constants.dirs[this.snakeModel.direction];

    var frontPoint = this.snakeModel.points[this.snakeModel.points.length-1];

    // remove rear of snake
    if ( this.queuedApples === 0 ){
      this.snakeModel.removePoint(this.snakeModel.points[0]);
    }
    else{
      this.queuedApples--;
    }


    // add to make snake travel
    var pointToAdd = {x: frontPoint.x + dir.x, y: frontPoint.y + dir.y };

    //correct x
    while ( pointToAdd.x < -this.boardModel.xrad){
      pointToAdd.x += this.boardModel.width;
    }
    while ( pointToAdd.x > this.boardModel.xrad){
      pointToAdd.x -= this.boardModel.width;
    }

    //correct y
    while ( pointToAdd.y < -this.boardModel.yrad){
      pointToAdd.y += this.boardModel.height;
    }
    while ( pointToAdd.y > this.boardModel.yrad){
      pointToAdd.y -= this.boardModel.height;
    }
    this.snakeModel.addPoint(pointToAdd);
    this.boardModel.notifyNetworkChange();

}
