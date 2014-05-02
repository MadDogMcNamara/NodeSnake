function BoardView( canvas, boardData )
{
    this.canvas = canvas;
    this.boardData = boardData;
    this.follow = true;
    this.followIndex = -1;
    this.smoothFollow = true;
    this.manualZoom = 40;
    this.lastFrame = new Date().getTime();
    this.followSnakeHistory = [];
    this.historyLength = 10;
    var that = this;
    $(document).keydown(function(e) {
      that.keyDown(e);
    });
}

BoardView.prototype.onSpawn = function(){
  if ( this.follow ){
    this.lastFrame = new Date().getTime();
    this.followIndex = 0;
  }
  this.simulateFrame();
}

BoardView.prototype.onCollision = function(){
  this.followSnakeHistory.length = 0;
}

BoardView.prototype.simulateFrame = function(){
  this.lastFrame = new Date().getTime();
  if ( this.followSnakeHistory.length >= this.historyLength ){
    this.followSnakeHistory.shift(0);
  }
  if ( this.boardData.snakes[this.followIndex] && this.boardData.snakes[this.followIndex].points.length > 0 ){
    this.followSnakeHistory.push(this.boardData.snakes[this.followIndex].points[this.boardData.snakes[this.followIndex].points.length-1]);
  }
}

// Camera manip
BoardView.prototype.setFollow = function(set){
  if ( set && this.boardData && this.boardData.snakes[0] ){
    this.followIndex = 0;
    this.follow = true;
  }
  else{
    this.follow = false;
  }
}

// camera io manip
BoardView.prototype.keyDown = function(e){
  var c = String.fromCharCode( e.keyCode )
  if ( c === "F" ){
    this.setFollow( !this.follow );
  }
  if ( c === "S" ){
    this.smoothFollow = !this.smoothFollow;
  }
  // = push
  if( e.keyCode === 187 ){
    if ( this.manualZoom > 0 ){
      this.manualZoom--;
    }
  }
  if ( e.keyCode === 189){
    if ( this.manualZoom < this.boardData.xrad ){
      this.manualZoom++;
    }
  }
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

BoardView.prototype.drawCell = function( ctx, point, padRatio, circle ){
    var cellSize = this.canvas.width / ( this.getDrawWidth() );
    var cellPad = padRatio * cellSize;

    var left = -this.getDrawXrad();
    var top = -this.getDrawYrad();

    var x = point.x;
    var y = point.y;
    if( x - this.getDrawCx() >= (this.getDrawXrad() + 1) ){
      x = -this.boardData.xrad + (x - this.boardData.xrad - 1);
    }
    if( y - this.getDrawCy() >= (this.getDrawYrad() + 1) ){
      y = -this.boardData.yrad + (y - this.boardData.yrad - 1);
    }
    if( this.getDrawCx() - x >= (this.getDrawXrad() + 1) ){
      x = this.boardData.xrad - (-this.boardData.xrad - x) + 1;
    }
    if( this.getDrawCy() - y >= (this.getDrawYrad() + 1) ){
      y = this.boardData.yrad - (-this.boardData.yrad - y) + 1;
    }

    x += -left - this.getDrawCx();
    y += -top - this.getDrawCy();

    x = x * cellSize + cellPad;
    y = y * cellSize + cellPad

    if ( typeof circle === 'undefined' || !circle){
      ctx.fillRect( x, y, cellSize - 2 * cellPad, cellSize - 2 * cellPad );
    }
    else{
      var r = (cellSize - 2 * cellPad) / 2;
      x += r;
      y += r;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fill();
    }
}

BoardView.prototype.getDrawWidth = function() {
  return this.getDrawXrad() * 2 + 1;
}

BoardView.prototype.getDrawHeight = function() {
  return this.getDrawYrad() * 2 + 1;
}

BoardView.prototype.getDrawC = function() {
  if ( this.follow && this.followIndex != -1 ){
    var followSnake = this.boardData.snakes[this.followIndex];

    // check if that snake is spawned
    if ( followSnake.points.length === 0 ){
      var ret = {x:0,y:0};
      for ( var i = 0; i < this.boardData.respawns.length; i++ ){
        var respawn = this.boardData.respawns[i];
        if ( respawn.snake.id === followSnake.id ){
          // this is the respawning snake we're folllowing
          ret = respawn.snake.points[0];
        }
      }

      return ret;
    }
    if ( this.followSnakeHistory.length > 0 ){
      var pos = this.followSnakeHistory[this.followSnakeHistory.length - 1];
      if ( this.smoothFollow){
        var averageCount = this.historyLength;
        var framePercentage = new Date().getTime() - this.lastFrame;
        framePercentage /= constants.frameTime;
        var totalWeight = averageCount - 1;
        var points = this.followSnakeHistory;
        var j = points.length - 1;
        var averagePoints = [];

        var ret = {x:0, y:0};
        averagePoints.push(points[points.length-1]);
        ret.x += averagePoints[0].x * framePercentage;
        ret.y += averagePoints[0].y * framePercentage;
        for ( var i = 1; i < averageCount; i++ ){
          if ( j > 0 ) {
            j--;
          }
          var lastPoint = averagePoints[i-1];
          var thisPoint = {x:points[j].x, y:points[j].y};

          if ( snakePointLib.getXDiff( thisPoint, lastPoint, this.boardData ) === 0 ){
            thisPoint.x = lastPoint.x;
          }
          if ( snakePointLib.getYDiff( thisPoint, lastPoint, this.boardData ) === 0 ){
            thisPoint.y = lastPoint.y;
          }

          if ( snakePointLib.getXDiff( thisPoint, lastPoint, this.boardData ) >= 1 ){
            thisPoint.x = lastPoint.x + 1;
          }
          if ( snakePointLib.getXDiff( thisPoint, lastPoint, this.boardData ) <= -1 ){
            thisPoint.x = lastPoint.x - 1;
          }

          if ( snakePointLib.getYDiff( thisPoint, lastPoint, this.boardData ) >= 1 ){
            thisPoint.y = lastPoint.y + 1;
          }
          if ( snakePointLib.getYDiff( thisPoint, lastPoint, this.boardData ) <= -1 ){
            thisPoint.y = lastPoint.y - 1;
          }

          averagePoints.push(thisPoint);
          var mult = ((i === averageCount - 1) ? (1 - framePercentage) : 1);
          ret.x += averagePoints[i].x * mult;
          ret.y += averagePoints[i].y * mult;
        }

        // make pos the smoothed current head
        if ( averagePoints.length > 1 ){
          var firstDiff = {x:averagePoints[0].x - averagePoints[1].x, y:averagePoints[0].y - averagePoints[1].y};
          firstDiff.x *= framePercentage;
          firstDiff.y *= framePercentage;
          pos = {x:firstDiff.x + averagePoints[1].x, y:firstDiff.y + averagePoints[1].y};
        }


        ret.x /= totalWeight;
        ret.y /= totalWeight;
        var diff = {x:ret.x - pos.x, y:ret.y - pos.y};
        diff.x = -diff.x / 2 + pos.x;
        diff.y = -diff.y / 2 + pos.y;

        return diff;
      }
      else{
        return pos;
      }
    }
    else{
      return followSnake.points[0];
    }
  }
  return {x:0,y:0};
}

BoardView.prototype.getDrawCx = function() {
  return this.getDrawC().x;
}

BoardView.prototype.getDrawCy = function() {
  return this.getDrawC().y;
}

BoardView.prototype.getDrawXrad = function() {
  if ( this.boardData.xrad <= this.manualZoom ){
    return this.boardData.xrad;
  }
  return this.manualZoom;
}

BoardView.prototype.getDrawYrad = function() {
  return this.boardData.yrad / this.boardData.xrad * this.getDrawXrad();
}

BoardView.prototype.drawBoard = function(){

    this.setRatio(this.boardData.width, this.boardData.height );

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    ctx.fillStyle = "#000000";
    ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );

    var cellPad = 1.0 / 4;

    for ( var i = 0; i < this.boardData.apples.length; i++ ){
      ctx.fillStyle = "#00FF00";
      this.drawCell(ctx, this.boardData.apples[i], cellPad, true);
    }
    cellPad = 1.0/30;
    cellPadMax = 1.0 / 4;
    for ( var i = 0; i < this.boardData.snakes.length; i++ ){
      var snake = this.boardData.snakes[i];
      ctx.fillStyle = snake.color;

      for ( var j = 0; j < snake.points.length; j++ ){
        var currPad = cellPad + (snake.points.length - j -1) / (snake.points.length) * (cellPadMax - cellPad);
        this.drawCell(ctx, snake.points[j], currPad);
      }
    }

    var respawnAnimationTime = 500;
    var respawnAnimationDistance = 10;

    for ( var i = 0; i < this.boardData.respawns.length; i++ ){
      var respawn = this.boardData.respawns[i];

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
          this.drawCell(ctx, {x:x, y:y}, cellPad);
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
