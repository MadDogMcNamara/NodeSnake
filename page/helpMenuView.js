function HelpMenuView()
{
  this.wrapper = $("div.helpMenuWrapper");
}


HelpMenuView.prototype.hide = function(){
  this.wrapper[0].style.display = "none";
}
HelpMenuView.prototype.show = function(){
  this.wrapper[0].style.display = "block";
  this.resize();
}

HelpMenuView.prototype.resize = function(){
  this.wrapper[0].style.height = getStyle(document.body, "height");
  this.wrapper[0].style.width = getStyle(document.body, "width");
}
