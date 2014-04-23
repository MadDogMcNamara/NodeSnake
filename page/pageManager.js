function PageManager(){

}

var pageManager;
var countdownView;
var boardView;
var inactiveMenuView;
var gameDriver;

var pageState = "mainMenu";



window.addEventListener( "load", function onLoad() {
    inactiveMenuView = new InactiveMenuView();
    countdownView = new CountdownView();
    var canvas = $("#boardCanvas")[0];

    gameDriver = new GameDriver(canvas);
    boardView = new BoardView(canvas, gameDriver.boardData);
});


var pageEvents = {
  menuRespawn:function(){
    if ( gameDriver.spawn() ){
      inactiveMenuView.hide();
      pageState = "playing";
    }
  },

  playerDeath:function(){
    inactiveMenuView.show();
    pageState = "mainMenu";
  }
}


