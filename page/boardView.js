function BoardView( canvas )
{
    this.canvas = canvas;
}


BoardView.prototype.setRatio = function(width, height){
    var r = width;
    // assume r is ratio unless height is given
    if (typeof height !== "undefined" ){
        r = width / height;
    }

    var marginLeft = parseInt(getStyle(document.body, "margin-left"), 10);
    var marginRight = parseInt(getStyle(document.body, "margin-right"), 10);
    var marginBottom = parseInt(getStyle(document.body, "margin-bottom"), 10);
    var marginTop = parseInt(getStyle(document.body, "margin-top"), 10);
    var maxWidth = document.body.clientWidth - ( marginLeft + marginRight ); // 4 for border
    var maxHeight = document.body.clientHeight - ( marginTop + marginBottom ); // 4 for border


    if ( r <= maxWidth / maxHeight ){
        this.canvas.height = maxHeight;
        this.canvas.width = r * this.canvas.height;
    }
    else{
        this.canvas.width = maxWidth;
        this.canvas.height = 1 / ( r / this.canvas.width );
    }

    this.canvas.style.top = (maxHeight - this.canvas.height)/2;
    this.canvas.style.left = (maxWidth - this.canvas.width)/2;

}

BoardView.prototype.drawCell = function( ctx, boardData, point, padRatio ){
    var cellSize = this.canvas.width / ( boardData.width );
    var cellPad = padRatio * cellSize;

    var left = -boardData.xrad;
    var top = -boardData.yrad;

    var x = point.x - left;
    var y = point.y - top;

    ctx.fillRect( x * cellSize + cellPad, y * cellSize + cellPad, cellSize - 2 * cellPad, cellSize - 2 * cellPad );


}

BoardView.prototype.drawBoard = function( boardData ){

    this.setRatio(boardData.width, boardData.height );

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    ctx.fillStyle = "#000000";
    ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );


    var cellPad = 1.0 / 4;

    for ( var i = 0; i < boardData.apples.length; i++ ){
      ctx.fillStyle = "#00FF00";
      this.drawCell(ctx, boardData, boardData.apples[i], cellPad);
    }
    cellPad = 1.0/30;
    cellPadMax = 1.0 / 4;
    for ( var i = 0; i < boardData.snakes.length; i++ ){
      var snake = boardData.snakes[i];
      ctx.fillStyle = snake.color;

      for ( var j = 0; j < snake.points.length; j++ ){
        var currPad = cellPad + (snake.points.length - j -1) / (snake.points.length) * (cellPadMax - cellPad);
        this.drawCell(ctx, boardData, snake.points[j], currPad);
      }
    }

    var respawnAnimationTime = 500;
    var respawnAnimationDistance = 10;

    for ( var i = 0; i < boardData.respawns.length; i++ ){
      var respawn = boardData.respawns[i];

      var head = respawn.snake.points[respawn.snake.points.length - 1];
      ctx.fillStyle = respawn.snake.color;

      var timeUntil = respawn.time.getTime() - new Date().getTime();
      var dist = Math.floor(timeUntil / respawnAnimationTime * respawnAnimationDistance);
      dist++;
      if ( timeUntil <= respawnAnimationTime && dist >= 0 ){
        var perimeter = (dist * 2 + 2) * (dist * 2 + 2) - (4 * dist * dist);
        var sideLen = dist * 2 + 1;
        var x = -dist + head.x;
        var y = -dist + head.y;
        for ( var j = 0; j < perimeter; j++ ){
          this.drawCell(ctx, boardData, {x:x, y:y}, cellPad);
          if ( j < sideLen - 1 ){
            x++;
          }
          else if ( j < ( sideLen - 1 ) * 2 ){
            y++;
          }
          else if ( j < ( sideLen - 1 ) * 3 ){
            x--;
          }
          else if ( j < ( sideLen - 1 ) * 4 ){
            y--;
          }
        }
      }
    }
}


var boardView;
