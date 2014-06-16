function InactiveMenuView()
{
  function onUserRespawnClick(){
    if ( pageState == "mainMenu" ){
      pageEvents.menuRespawn();
    }
  }
  this.wrapper = $("div.inactiveMenuWrapper");
  this.resize();
  var spawnButton = $("div.inactiveMenuWrapper input")[0];
  var helpButton = $("div.inactiveMenuWrapper input")[1];
  var leaderboardButton = $("div.inactiveMenuWrapper input")[2];
  spawnButton = jQuery(spawnButton);
  helpButton = jQuery(helpButton);
  leaderboardButton = jQuery(leaderboardButton);

  leaderboardButton.click(function(){
    pageEvents.menuLeaderboard();
  });

  helpButton.click(function(){
    pageEvents.menuHelp();
  });

  spawnButton.click(function(){
    onUserRespawnClick();
  });

  $(document).keydown(function(e) {
    // if space
    if ( e.keyCode === 32 ){
      onUserRespawnClick();
    }
  });
}

InactiveMenuView.prototype.resize = function(){
  var pageWidth = parseInt(getStyle(document.body, "width"));
  var pageHeight = parseInt(getStyle(document.body, "height"));
  this.wrapper[0].style.height = pageHeight + "px";
  this.wrapper[0].style.width = pageWidth + "px";

  var buttonWrapper = $(this.wrapper.find("div")[1])[0];
  buttonWrapper.style.width = pageWidth * .75 + "px";
  buttonWrapper.style["margin-left"] = pageWidth * .125 + "px";
  buttonWrapper.style["margin-right"] = pageWidth * .125 + "px";

  $(buttonWrapper).find("input").css("font-size", pageWidth * .05 + "pt");
  $(buttonWrapper).find("input").css("padding", pageWidth * .01 + "px");
  $(buttonWrapper).find("input").css("border-radius", pageWidth * .01 + "px");

  var titleText = $(this.wrapper.find("p"));
  titleText.css("font-size", pageWidth * .10 + "pt");

  $(this.wrapper.find("div")[0]).css("padding-bottom", pageHeight * .125 + "px")
}


InactiveMenuView.prototype.hide = function(){
  this.wrapper[0].style.display = "none";
}
InactiveMenuView.prototype.show = function(){
  this.wrapper[0].style.display = "block";
  this.resize();
}
