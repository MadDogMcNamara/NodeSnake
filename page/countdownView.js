function CountdownView(){
  var textDiv = $("span.countdownText");
  var wrapper = $("div.countdownTextWrapper");

  function setNumber(num, time, f){
    var pageWidth = parseInt(getStyle(document.body, "width"));
    var pageHeight = parseInt(getStyle(document.body, "height"));
    wrapper.css("height", pageHeight + "px");
    wrapper.css("width", pageWidth + "px");

    textDiv[0].innerText = "" + ((num == 0) ? "GO" : num);
    textDiv[0].style.fontSize = pageWidth * .2 + "pt";
    textDiv.animate({"font-size":pageWidth * .1 + "pt"},{duration:time,easing:"easeOutExpo", done:f});
  }

  function hide(){
    wrapper.parent()[0].style.display = "none";
  }
  function show(){
    wrapper.parent()[0].style.display = "block";
  }

  function countdownFrom(i){
    show();
    if ( i <= 1 ){
      hide();
      return;
    }
    var time = 500;
    var display = i - 1;
    if ( i > Math.floor(i) ){
      time = (i - Math.floor(i)) / 2 * 1000;
      display = Math.ceil(display);
   }


    setNumber(display, time, function(){ countdownFrom(display); });
  }

  this.countdownFrom = countdownFrom;
}

CountdownView.prototype.countdownFromDate = function(date){
  var then = date.getTime();
  var now = new Date().getTime();

  // delta in half seconds
  var delta = then - now;
  delta /= 500;

  this.countdownFrom(delta);


}

