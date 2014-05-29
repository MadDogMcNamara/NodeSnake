function PageManager(){

}
var pages = [];
var pageManager;
var countdownView;
var boardView;
var inactiveMenuView;
var helpMenuView;
var leaderboardView;
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
    leaderboardView = new LeaderboardView(gameDriver.boardData);
    leaderboardView.hide();


    pages.push(inactiveMenuView);
    pages.push(helpMenuView);
    pages.push(leaderboardView);

});

var hideAllPages = function(){
  for ( var i = 0; i < pages.length; i++ ){
    var page = pages[i];
    page.hide();
  }
}


var pageEvents = {
  menuRespawn:function(){
    if ( gameDriver.spawn() ){
      hideAllPages();
      pageState = "playing";
    }
  },
  menuHelp:function(){
    hideAllPages();
    helpMenuView.show();
  },
  menuLeaderboard:function(){
    hideAllPages();
    leaderboardView.show();
    networkManager.jsonSocket.sendJSON({name:"getAllPlayerData"});
    leaderboardView.updateView();
  },
  playerDeath:function(){
    inactiveMenuView.show();
    helpMenuView.hide();
    pageState = "mainMenu";
  },
  menuBack:function(){
    hideAllPages();
    inactiveMenuView.show();
  }
}


