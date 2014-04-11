function PageManager(){

}

var pageManager;
var countdownView;
var boardView;
var inactiveMenuView;
var gameDriver;



window.addEventListener( "load", function onLoad() {
    inactiveMenuView = new InactiveMenuView();
    countdownView = new CountdownView();
    var canvas = $("#boardCanvas")[0];

    boardView = new BoardView(canvas);
    gameDriver = new GameDriver(canvas);
    //driver.startGame();
});


var pageEvents = {
  menuRespawn:function(){
    gameDriver.spawn();
    inactiveMenuView.hide();
  }
}
