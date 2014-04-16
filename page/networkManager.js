// handles network interactions for client
function NetworkManager(f){
    var that = this;
    var host = location.origin.replace(/^http(s)?/, 'ws') + "/snakews/"
    var connected = false;
    this.events = {};
    this.id = -1;

    var ws = new WebSocket(host);

    this.jsonSocket = getJSONWebSocket(ws);
    this.jsonSocket.onJSONMessage = function(obj){
      if ( obj && obj.name ){
        if ( that.events[obj.name] ){
          for ( var i = 0; i < that.events[obj.name].length; i++ ){
            that.events[obj.name][i](obj);
          }
        }
      }
    }

    this.jsonSocket.onopen = (function(g){
      return function(){
        that.connected = true;
        g();
      }
    })(f);

    this.listen("joinGame", function(event){
      that.id = event.id;
    });
}

NetworkManager.prototype.canSend = function(){
  return this.connected;
}

NetworkManager.prototype.sendChangedSnake = function(snake){
  if ( this.canSend() ){
    var sendSnake = {id:snake.id, color:snake.color};
    sendSnake.delta = snake.getDiffSinceLastQuery();
    var obj = {name:"snakeChanged", diff:true, "snake":sendSnake};

    this.jsonSocket.sendJSON( obj );
  }
}

NetworkManager.prototype.requestRespawn = function(){
  if ( this.canSend() ){
    this.jsonSocket.sendJSON( {name:"requestRespawn"} );
  }
}

NetworkManager.prototype.listen = function(name, f){
  this.events[name] = this.events[name] || [];
  this.events[name].push(f);
}

