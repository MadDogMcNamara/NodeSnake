// handles network interactions for client
function NetworkManager(){
    var that = this;
    var host = location.origin.replace(/^http/, 'ws')
    var connected = false;
    this.events = {};

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

    this.jsonSocket.onopen = function(){
      that.connected = true;
    };
}

NetworkManager.prototype.canSend = function(){
  return this.connected;
}

NetworkManager.prototype.sendChangedSnake = function(snake){
  if ( this.canSend() ){
    this.jsonSocket.sendJSON( {name:"snakeChanged", "snake": snake} );
  }
}

NetworkManager.prototype.listen = function(name, f){
  this.events[name] = this.events[name] || [];
  this.events[name].push(f);
}

var networkManager = new NetworkManager();
