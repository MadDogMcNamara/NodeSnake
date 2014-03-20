function GameDriver(canvas){

    this.networkManager = new NetworkManager();

    // give boarddata the network manager so it may update it as it sees fit
    this.boardData = new BoardModel(10,5, networkManager);
    this.localSnake = this.boardData.addSnake();

    this.localSnakeController = new LocalSnakeController(this.localSnake, this.boardData);


    this.input = new SnakeInput(canvas);
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
