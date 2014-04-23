var AppleSpawner = function(connections, boardData){
  this.connections = connections;
  this.boardData = boardData;
  this.boardData.appleSpawner = this;

  this.boardData.targetAppleCount = 0;
  this.boardData.appleLocations = [];
  this.boardData.appleList = [];


}

AppleSpawner.prototype.spawnApple = function(){
  // find apple position, todo this is slooooooow

  var snakeQ = [];
  for ( var i = -this.boardData.yrad; i <= this.boardData.yrad; i++ ){
    snakeQ[i] = [];
  }

  var snakeCount = 0;
  for ( var i = 0; i < this.connections.length; i++ ){
    snakeCount += this.connections[i].snake.points.length;
    for ( var j = 0; j < this.connections[i].snake.points.length; j++ ){
      var point = this.connections[i].snake.points[j];
      snakeQ[point.y] = snakeQ[point.y] || [];
      snakeQ[point.y][point.x] = true;
    }
  }

  var emptySize = (this.boardData.xrad * 2 + 1) * (this.boardData.yrad * 2 + 1) - snakeCount - this.boardData.appleList.length;

  var rand = Math.random();
  rand *= emptySize;
  rand = Math.floor(rand);
  var spawn;
  for (var i = -this.boardData.yrad; i <= this.boardData.yrad; i++ ){
    for ( var j = -this.boardData.xrad; j <= this.boardData.xrad; j++ ){
      if ( snakeQ[i][j] || ( this.boardData.appleLocations[i] && this.boardData.appleLocations[i][j] ) ){
      }
      else{
        if (rand === 0 ){
          // here is the spawn
          spawn = {x:j,y:i};
        }
        rand--;
      }
    }
  }
  return this.spawnAppleAtPosition(spawn);
}

AppleSpawner.prototype.appleEaten = function(point){
  if ( point ){
    this.boardData.appleLocations[point.y] = this.boardData.appleLocations[point.y] || [];
    if ( this.boardData.appleLocations[point.y][point.x] ){
      // search for and delete in appleList
      for ( var i = 0; i < this.boardData.appleList.length; i++ ){
        var thisPoint = this.boardData.appleList[i];
        if ( thisPoint.x === point.x && thisPoint.y === point.y ){
          this.boardData.appleList.splice(i,1);
          this.boardData.appleLocations[point.y][point.x] = false;
          break;
        }
      }
    }
  }
}
AppleSpawner.prototype.fillApples = function(){
  for ( var i = this.boardData.appleList.length; i < this.boardData.targetAppleCount; i++ ){
    this.spawnApple();
  }
}

AppleSpawner.prototype.spawnAppleAtPosition = function(point){
  if ( this.onAppleSpawn && point ){
    // add to storage
    this.boardData.appleLocations[point.y] = this.boardData.appleLocations[point.y] || [];
    this.boardData.appleLocations[point.y][point.x] = true;
    this.boardData.appleList.push(point);
    this.appleSpawnCallback(point);

  }
}

AppleSpawner.prototype.onAppleSpawn = function(f){
  this.appleSpawnCallback = f;
}

AppleSpawner.prototype.playerJoined = function(){
  console.log('player joined');
  this.boardData.targetAppleCount++;
  this.fillApples();
}

AppleSpawner.prototype.playerLeft = function(){
  this.boardData.targetAppleCount--;
}

module.exports.AppleSpawner = AppleSpawner;
