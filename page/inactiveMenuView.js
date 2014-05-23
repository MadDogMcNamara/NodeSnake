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
  spawnButton = jQuery(spawnButton);
  helpButton = jQuery(helpButton);
  helpButton.click(function(){
    pageEvents.menuHelp();
  });

  spawnButton.click(function(){
    onUserRespawnClick();
  });

  $(document).keydown(function(e) {
    // if space
    if ( e.keyCode == 32 ){
      onUserRespawnClick();
    }
  });
}

InactiveMenuView.prototype.resize = function(){
  this.wrapper[0].style.height = getStyle(document.body, "height");
  this.wrapper[0].style.width = getStyle(document.body, "width");

  var inner = $("div.inactiveMenuWrapper > div");
  var height = parseInt(getStyle(inner[0],"height"), 10);
  inner[0].style.top = parseInt(this.wrapper[0].style.height,10) / 2 - height / 2;
}


InactiveMenuView.prototype.hide = function(){
  this.wrapper[0].style.display = "none";
}
InactiveMenuView.prototype.show = function(){
  this.wrapper[0].style.display = "block";
  this.resize();
}
