var networkManager;

function GameDriver(canvas){
    var that = this;
    this.running = false;
    this.joined = false;
    networkManager = new NetworkManager(function(){
      networkManager.jsonSocket.sendJSON({name:"joinGame"});
      console.log("connection with server established");
      that.joined = true;
    });

    this.input = new SnakeInput(canvas);

    networkManager.listen("joinGame", function(obj){
      that.boardData.initialize(obj);
      that.localSnakeController = new LocalSnakeController(that.boardData.snakes[0], that.boardData);
      that.boardData.notifyDrawChange();
    });

    networkManager.listen("respawn", function(obj){
      that.boardData.addRespawn({"snake":obj.snake, "time":new Date(new Date().getTime() + obj.time)});
      if ( obj.mine ){
        countdownView.countdownFromDate(new Date(new Date().getTime() + obj.time));
        that.startGame();
        that.localSnakeController.freeze = true;
        setTimeout(function(){
          that.localSnakeController.freeze = false;
          that.boardData.respawnLocal(obj);
          that.startGame();
        }, new Date().getTime() + obj.time - new Date().getTime());
      }
      boardView.onSpawn();
    });

    networkManager.listen("collision", function(obj){
      that.boardData.snakes[0].points = obj.snake.points;
      that.boardData.snakes[0].direction = 0;
      that.boardData.notifyDrawChange();
      boardView.onCollision();
      pageEvents.playerDeath();
    });
    this.networkManager = networkManager;

    // give boarddata the network manager so it may update it as it sees fit
    this.boardData = new BoardModel(20,10, networkManager);
    this.boardData.notifyDrawChange();
}

GameDriver.prototype.gameLoop = function(){
  var input = this.input.getInputs();
  this.localSnakeController.simulateFrame(input);
  if ( this.boardData.respawns.length > 0 ){
    this.boardData.notifyDrawChange();
  }
}

GameDriver.prototype.startGame = function(){
    this.input.inputs.splice(0,this.input.inputs.length);

    if ( !this.running ){
      this.running = true;
      var that = this;
      setInterval(function(){
          that.gameLoop();
      }, constants.frameTime);
      setInterval(function(){
          that.boardData.notifyDrawChange();
      }, 33);
      that.boardData.notifyDrawChange();
      this.gameLoop();
    }
}

GameDriver.prototype.spawn = function(){
  return this.networkManager.requestRespawn();
}

