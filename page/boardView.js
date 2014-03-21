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

BoardView.prototype.drawBoard = function( boardData ){

    this.setRatio(boardData.xrad * 2 + 1, boardData.height );

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );

    var left = -boardData.xrad;
    var top = -boardData.yrad;

    var cellSize = this.canvas.width / ( boardData.width );
    var cellPad = cellSize / 20;

    for ( var i = 0; i < boardData.snakes.length; i++ ){
        var snake = boardData.snakes[i];

        ctx.fillStyle = snake.color;

        for ( var j = 0; j < snake.points.length; j++ ){
            var point = snake.points[j];
            var x = point.x - left;
            var y = point.y - top;

            ctx.fillRect( x * cellSize + cellPad, y * cellSize + cellPad, cellSize - 2 * cellPad, cellSize - 2 * cellPad );
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
