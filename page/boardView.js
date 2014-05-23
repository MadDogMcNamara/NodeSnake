function BoardView( canvas, boardData )
{
    this.canvas = canvas;
    this.boardData = boardData;
    this.follow = true;
    this.followIndex = -1;
    this.smoothFollow = true;
    this.manualZoom = 40;
    this.minimapVisible = true;
    this.lastFrame = new Date().getTime();
    this.followSnakeHistory = [];
    this.historyLength = 10;
    this.previousCameraPosition = undefined;
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
  if ( c === "M" ){
    this.minimapVisible = !this.minimapVisible;
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

BoardView.prototype.drawCellFinal = function( ctx, point, circle, clipData, drawData ){
  var padRatio = drawData.pad;
  var cellSize = clipData.width / (drawData.xrad * 2 + 1);
  var cellPad = padRatio * cellSize;
  var x = point.x;
  var y = point.y;

  var left = -drawData.xrad;
  var top = -drawData.yrad;

  x += -left - drawData.cx;
  y += -top - drawData.cy;

  x = x * cellSize + cellPad;
  y = y * cellSize + cellPad;

  x += clipData.x;
  y += clipData.y;

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

BoardView.prototype.drawCell = function( ctx, point, circle, clipData, drawData ){
  if ( Math.abs(point.x) > this.boardData.xrad ||
    Math.abs(point.y) > this.boardData.yrad ){
    // never draw points that are outside the actual game board
    return false;
  }
  var xrad = this.boardData.xrad;
  var yrad = this.boardData.yrad;
  var cpoint = {};
  for ( var x = -1; x <= 1; x++ ){
    for ( var y = -1; y <= 1; y++ ){
      cpoint.x = point.x;
      cpoint.y = point.y;
      if ( x < 0 ){
        cpoint.x = xrad + 1 - (-xrad - point.x);
      }
      if ( y < 0 ){
        cpoint.y = yrad + 1 - (-yrad - point.y);
      }
      if ( x > 0 ){
        cpoint.x = -xrad - 1 + ( point.x - xrad );
      }
      if ( y > 0 ){
        cpoint.y = -yrad - 1 + ( point.y - yrad );
      }
      this.drawCellFinal(ctx,cpoint,circle,clipData,drawData);
    }
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
      var points = this.followSnakeHistory;

      if ( typeof this.previousCameraPosition === 'undefined' ){
        this.previousCameraPosition = points[points.length - 1];
      }

      var pos = this.followSnakeHistory[this.followSnakeHistory.length - 1];
      if ( this.smoothFollow){
        var points = this.followSnakeHistory;
        var averageCount = points.length;
        var j = points.length - 1;
        var averagePoints = [];
        var framePercentage = -this.lastFrame + new Date().getTime();
        framePercentage /= constants.frameTime;

        averagePoints.push(points[points.length-1]);
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
        }

        // make pos the smoothed current head
        if ( averagePoints.length > 1 ){
          var firstDiff = {x:averagePoints[0].x - averagePoints[1].x, y:averagePoints[0].y - averagePoints[1].y};
          firstDiff.x *= framePercentage;
          firstDiff.y *= framePercentage;
          pos = {x:firstDiff.x + averagePoints[1].x, y:firstDiff.y + averagePoints[1].y};
        }
      }
      return pos;
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

BoardView.prototype.drawGame = function(){
  this.setRatio(this.boardData.width, this.boardData.height );

  this.drawMainBoard();
  if ( this.minimapVisible ){
    this.drawMinimap();
  }
  if ( this.boardData.willResize ){
    this.drawResizeIndication();
  }
}

BoardView.prototype.drawResizeIndication = function(){
  var currSize = this.boardData;
  var nextSize = this.boardData.targetBoardSize;
  var color = "#00FF00";
  if ( currSize.isBoardSizeGreater(nextSize) ){
    // decreasing
    color = "#FF0000";
  }

  var percentFadeIn = .1;
  var ctx = this.canvas.getContext("2d");
  var hgrad = ctx.createLinearGradient(0,0,0,this.canvas.height);
  var vgrad = ctx.createLinearGradient(0,0,this.canvas.width,0);

  vgrad.addColorStop(0, color);
  vgrad.addColorStop(percentFadeIn, 'rgba(0,0,0,0)');
  vgrad.addColorStop(1 - percentFadeIn, 'rgba(0,0,0,0)');
  vgrad.addColorStop(1, color);

  hgrad.addColorStop(0, color);
  hgrad.addColorStop(percentFadeIn, 'rgba(0,0,0,0)');
  hgrad.addColorStop(1 - percentFadeIn, 'rgba(0,0,0,0)');
  hgrad.addColorStop(1, color);

  // draw vert bars
  ctx.fillStyle = vgrad;
  ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

  // draw horiz bars
  ctx.fillStyle = hgrad;
  ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

}

BoardView.prototype.drawMainBoard = function(){
  this.drawGenericBoard();
}

BoardView.prototype.drawMinimap = function(){
  var miniMapWidth = this.canvas.width / 9;
  var miniMapHeight = this.canvas.height / 9;
  clipData = {};
  clipData.x = this.canvas.width - miniMapWidth;
  clipData.y = this.canvas.height - miniMapHeight;
  clipData.width = miniMapWidth;
  clipData.height = miniMapHeight;

  drawData = {};
  drawData.xrad = this.boardData.xrad;
  drawData.yrad = this.boardData.yrad;
  drawData.cx = 0;
  drawData.cy = 0;
  drawData.pad = 0;

  this.drawGenericBoard(clipData, drawData);
}

BoardView.prototype.drawGenericBoard = function(clipData, drawData){

  if ( typeof clipData === 'undefined' ){
    clipData = {};
    clipData.x = 0;
    clipData.y = 0;
    clipData.width = this.canvas.width;
    clipData.height = this.canvas.height;
  }

  if ( typeof drawData === 'undefined' ){
    drawData = {};
    drawData.xrad = this.getDrawXrad();
    drawData.yrad = this.getDrawYrad();
    drawData.cx = this.getDrawCx();
    drawData.cy = this.getDrawCy();
    drawData.pad = 1/4.0;
  }

  var ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.rect(clipData.x, clipData.y, clipData.width, clipData.height);
  ctx.clip();
  ctx.clearRect( clipData.x, clipData.y, clipData.width, clipData.height );
  ctx.fillStyle = "#000000";
  ctx.fillRect( clipData.x, clipData.y, clipData.width, clipData.height );


  var basePad = drawData.pad;

  var cellPad = 1.0 / 4;

  for ( var i = 0; i < this.boardData.apples.length; i++ ){
    ctx.fillStyle = "#00FF00";
    drawData.pad = cellPad;
    this.drawCell(ctx, this.boardData.apples[i], true, clipData, drawData);
  }
  cellPad = basePad / 7.5;
  cellPadMax = basePad;
  for ( var i = 0; i < this.boardData.snakes.length; i++ ){
    var snake = this.boardData.snakes[i];
    ctx.fillStyle = snake.color;

    for ( var j = 0; j < snake.points.length; j++ ){
      drawData.pad = cellPad + (snake.points.length - j -1) / (snake.points.length) * (cellPadMax - cellPad);
      this.drawCell(ctx, snake.points[j], false, clipData, drawData);
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
        drawData.pad = cellPad;
        this.drawCell(ctx, {x:x, y:y}, false, clipData, drawData);
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

  ctx.restore();
}


var boardView;
