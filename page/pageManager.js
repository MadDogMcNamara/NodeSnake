function PageManager(){

}

var pageManager;
var countdownView;
var boardView;
var inactiveMenuView;
var helpMenuView;
var gameDriver;

var pageState = "mainMenu";



window.addEventListener( "load", function onLoad() {
    inactiveMenuView = new InactiveMenuView();
    helpMenuView = new HelpMenuView();
    helpMenuView.hide();
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
      helpMenuView.hide();
    }
  },
  menuHelp:function(){
    inactiveMenuView.hide();
    helpMenuView.show();
  },

  playerDeath:function(){
    inactiveMenuView.show();
    helpMenuView.hide();
    pageState = "mainMenu";
  }
}


