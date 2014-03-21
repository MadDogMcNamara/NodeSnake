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
    })
    this.networkManager = networkManager;

    // give boarddata the network manager so it may update it as it sees fit
    this.boardData = new BoardModel(10,5, networkManager);





}

GameDriver.prototype.gameLoop = function(){
    var input = this.input.getInputs();
    this.localSnakeController.simulateFrame(input);
    var that = this;
    //setTimeout(function(){that.gameLoop()},100);
}


GameDriver.prototype.startGame = function(){
    var that = this;
    setInterval(function(){
        that.gameLoop();
    }, 170);
    this.gameLoop();
}
