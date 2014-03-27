function SnakeInput(){
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

    networkManager.listen("collision", function(){
      that.inputs.splice(0,that.inputs.length);
    });
}

SnakeInput.prototype.getInputs = function(){
    return this.inputs;
}
