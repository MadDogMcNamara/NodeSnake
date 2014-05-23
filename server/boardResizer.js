function BoardResizer(callback){
  // callback is expected to have two functions
  // 1. notifyBoardSizeWillChange
  // 2. notifyBoardSizeChange
  var that = this;
  this.callback = callback;
  this.desiredBoardRatio = 2;
  this.boardResizeDelay = 6000;
  this.boardData = {xrad:0,yrad:0};
  this.resizeIntervalId = -1;
  this.targetSize = null;
  this.willResize = false;
  this.isSizeIncreasing = function(){
    return that.willResize && ((that.targetSize.xrad > that.boardData.xrad) ||
                         (that.targetSize.yrad > that.boardData.yrad));
  };

  this.clearResize();
  this.boardData = this.computeBoardSize(0);
}


BoardResizer.prototype.clearResize = function(){
  // todo not hte place for this
  this.callback.notifyBoardSizeChange(this.boardData);

  if ( this.willResize ){
    clearInterval(this.resizeIntervalId);
  }
  this.resizeIntervalId = -1;
  this.targetSize = null;
  this.willResize = false;

}

BoardResizer.prototype.computeBoardSize = function(playingConnections){
  var desiredBoardRatio = this.desiredBoardRatio;
  var xrad;
  var yrad;
  var ret;

  playingConnections = Math.max(playingConnections,1);

  var cellsPerConnection = 200;
  xrad = Math.sqrt(cellsPerConnection * playingConnections * desiredBoardRatio);
  xrad -= 1;
  xrad /= 2;
  yrad = xrad / desiredBoardRatio;
  ret = {xrad:Math.floor(xrad), yrad:Math.floor(yrad)};

  return ret;
}
BoardResizer.prototype.applyChangeBoardSize = function(){

  this.callback.notifyBoardSizeChange(this.targetSize);

  this.boardData.xrad = this.targetSize.xrad;
  this.boardData.yrad = this.targetSize.yrad;

  this.clearResize();
}


BoardResizer.prototype.scheduleBoardSizeChange = function(newSize){
  if ( this.willResize ){
    var currentIncreasing = this.isSizeIncreasing();
    this.targetSize = newSize;
    // if we are changing increasing to decreasing or vice versa,
    // clearresize first
    if ( this.isSizeIncreasing !== currentIncreasing ){
      this.clearResize();

    }
  }

  this.targetSize = newSize;
  this.willResize = true;
  var that = this;
  this.resizeIntervalId = setInterval(function(){
    that.applyChangeBoardSize();
  }, this.boardResizeDelay);

  this.callback.notifyBoardSizeWillChange( this.targetSize, this.boardResizeDelay );
}

BoardResizer.prototype.updateWithPlayerCount = function(count){
  var boardData = this.boardData;
  var newBoardDim = this.computeBoardSize(count);
  if ( newBoardDim.xrad != boardData.xrad || newBoardDim.yrad != boardData.yrad ){
    this.scheduleBoardSizeChange(newBoardDim);
  }
  else{
    this.clearResize();
  }
}


exports.BoardResizer = BoardResizer;
