var SnakePointLib = function(){

}

SnakePointLib.prototype.normalize = function( p1, boardData ){
  var ret = {x:p1.x,y:p1.y};
  if ( ret.x < -boardData.xrad ){
    ret.x = boardData.xrad + 1 - (-boardData.xrad - ret.x);
  }
  if ( ret.y < -boardData.yrad ){
    ret.y = boardData.yrad + 1 - (-boardData.yrad - ret.y);
  }
  if ( ret.x > boardData.xrad ){
    ret.x = -boardData.xrad - 1 + (ret.x - boardData.xrad);
  }
  if ( ret.y > boardData.yrad ){
    ret.y = -boardData.yrad - 1 + (ret.y - boardData.yrad);
  }
  return ret;
}

SnakePointLib.prototype.getDistance = function( p1, p2, boardData ){
  return Math.abs(this.getXDiff(p1,p2,boardData)) + Math.abs(this.getYDiff(p1,p2,boardData));
}

SnakePointLib.prototype.getXDiff = function( p1, p2, boardData ){
  var p1n = this.normalize(p1, boardData);
  var p2n = this.normalize(p2, boardData);

  var ret = p1n.x - p2n.x;
  if ( Math.abs(boardData.xrad + 1 - (-boardData.xrad - p1n.x) - p2n.x) < Math.abs(ret) ){
    ret = boardData.xrad + 1 - (-boardData.xrad - p1n.x) - p2n.x;
  }
  if ( Math.abs(-boardData.xrad - 1 + (p1n.x - boardData.xrad) - p2n.x) < Math.abs(ret) ){
    ret = -boardData.xrad - 1 + (p1n.x - boardData.xrad) - p2n.x;
  }

  return ret;
}

SnakePointLib.prototype.getYDiff = function( p1, p2, boardData ){
  var p1n = this.normalize(p1, boardData);
  var p2n = this.normalize(p2, boardData);

  var ret = p1n.y - p2n.y;
  if ( Math.abs(boardData.yrad + 1 - (-boardData.yrad - p1n.y) - p2n.y) < Math.abs(ret) ){
    ret = boardData.yrad + 1 - (-boardData.yrad - p1n.y) - p2n.y;
  }
  if ( Math.abs(-boardData.yrad - 1 + (p1n.y - boardData.yrad) - p2n.y) < Math.abs(ret) ){
    ret = -boardData.yrad - 1 + (p1n.y - boardData.yrad) - p2n.y;
  }

  return ret;
}

var snakePointLib = new SnakePointLib();
if( typeof exports !== 'undefined' ){
  exports.SnakePointLib = snakePointLib;
}
