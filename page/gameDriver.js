var networkManager;

function GameDriver(canvas){
    var that = this;
    networkManager = new NetworkManager(function(){
      networkManager.jsonSocket.sendJSON({name:"joinGame"});
    });
    this.input = new SnakeInput(canvas);

    networkManager.listen("joinGame", function(obj){
      that.boardData.initialize(obj);
      that.localSnakeController = new LocalSnakeController(that.boardData.snakes[0], that.boardData);
      that.startGame();
    });

    networkManager.listen("collision", function(obj){
      that.boardData.snakes[0].points = obj.snake.points;
      that.boardData.snakes[0].direction = 0;
    });
    this.networkManager = networkManager;

    // give boarddata the network manager so it may update it as it sees fit
    this.boardData = new BoardModel(20,10, networkManager);
}

GameDriver.prototype.gameLoop = function(){
    var input = this.input.getInputs();
    this.localSnakeController.simulateFrame(input);
}


GameDriver.prototype.startGame = function(){
    var that = this;
    setInterval(function(){
        that.gameLoop();
    }, 150);
    this.gameLoop();
}
