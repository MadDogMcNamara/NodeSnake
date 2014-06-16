function HelpMenuView()
{
  this.wrapper = $("div.helpMenuWrapper");
  this.backButton = this.wrapper.find("input");
  this.backButton.click(function(){
    pageEvents.menuBack();
  });

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
  var pageHeight = parseInt(this.wrapper[0].style.height);

  this.wrapper.find("p").css("font-size", pageHeight * .04 + "px");
}
