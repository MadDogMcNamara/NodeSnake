function InactiveMenuView()
{
  this.wrapper = $("div.inactiveMenuWrapper");
  this.wrapper[0].style.height = getStyle(document.body, "height");
  this.wrapper[0].style.width = getStyle(document.body, "width");

  var inner = $("div.inactiveMenuWrapper > div");
  var height = parseInt(getStyle(inner[0],"height"), 10);
  inner[0].style.top = parseInt(this.wrapper[0].style.height,10) / 2 - height / 2;

  var spawnButton = $("div.inactiveMenuWrapper input");
  spawnButton.click(function(){pageEvents.menuRespawn();})

}

InactiveMenuView.prototype.hide = function(){
  this.wrapper[0].style.display = "none";
}
InactiveMenuView.prototype.show = function(){
  this.wrapper[0].style.display = "block";
}
