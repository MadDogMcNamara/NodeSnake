// args: snake - the snake data this contoller is responsible for
function LocalSnakeController(snake, boardModel){
    this.snakeModel = snake;
    this.boardModel = boardModel;
    this.snakeModel.direction = this.snakeModel.direction || 0;
}


LocalSnakeController.prototype.simulateFrame = function( inputs ){
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
    this.snakeModel.points.shift();

    // add to make snake travel
    var pointToAdd = {x: frontPoint.x + dir.x, y: frontPoint.y + dir.y };

    this.snakeModel.points.push( pointToAdd );
    this.boardModel.notifyNetworkChange();

}
