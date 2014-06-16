function SnakeInput(canvas){

    this.canvas = canvas;
    var inputs = [];
    this.inputs = inputs;
    var that = this;

    // listen to keystrokes on window
    window.addEventListener("keydown", function(){(function(event){
        var code = event.keyCode - 37;
        if ( code >= 0 && code <= 3 ){
            code = ( -(code + 2) % 4 );
            code += 4;
            code %= 4;
            this.inputs.push(code);
        }
    }).apply(that, [event])});

    $(canvas).on("touchy-swipe",function(e, $target, data){
      var dirs = {right:0,up:1,left:2,down:3};
      that.inputs.push(dirs[data.direction]);
    });
    networkManager.listen("collision", function(){
      that.inputs.splice(0,that.inputs.length);
    });
}

SnakeInput.prototype.getInputs = function(){
    return this.inputs;
}
