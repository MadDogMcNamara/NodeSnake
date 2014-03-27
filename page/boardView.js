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
    var maxWidth = document.body.clientWidth - ( marginLeft + marginRight ) - 4; // 4 for border
    var maxHeight = document.body.clientHeight - ( marginTop + marginBottom ) - 4; // 4 for border


    if ( r <= maxWidth / maxHeight ){
        this.canvas.height = maxHeight;
        this.canvas.width = r * this.canvas.height;
    }
    else{
        this.canvas.width = maxWidth;
        this.canvas.height = 1 / ( r / this.canvas.width );
    }

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
}


var boardView;

window.addEventListener( "load", function onLoad() {
    var canvas = $("#boardCanvas")[0];


    boardView = new BoardView(canvas);
    //boardView.drawBoard( data );

    var driver = new GameDriver(canvas);
    //driver.startGame();
});
