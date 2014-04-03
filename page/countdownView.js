function CountdownView(){
  var textDiv = $("div.countdownText");
  var wrapper = $("div.countdownTextWrapper");

  function setNumber(num, time, f){
    textDiv[0].innerText = "" + num;
    textDiv[0].style.fontSize = "400pt";
    textDiv.animate({"font-size":"90pt"},{duration:time,easing:"easeOutExpo", done:f});
  }

  function center(){
    var width = parseInt(getStyle( textDiv[0], "width"), 10);
    var height = parseInt(getStyle( textDiv[0], "height"), 10);

    wrapper[0].style.top = document.body.clientHeight / 2 - height / 2;
    wrapper[0].style.left = document.body.clientWidth / 2 - width / 2;
  }

  function hide(){
    wrapper.parent()[0].style.display = "none";
  }
  function show(){
    wrapper.parent()[0].style.display = "block";
  }

  function countdownFrom(i){
    center();
    show();
    if ( i <= 0 ){
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

var countdownView;
window.addEventListener( "load", function onLoad(){
  countdownView = new CountdownView();
});
