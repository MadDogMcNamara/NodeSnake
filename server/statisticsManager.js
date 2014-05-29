
var StatisticsManger = function(snakeConnection, connections){
  var playerStatsList = [];
  this.snakeConnection = snakeConnection;
  this.connections = connections;
  var that = this;
  this.snakeConnection.jsonws.listen("getAllPlayerData",function(){return that.getAllData();});
}

StatisticsManger.prototype.getAllData = function(){
  var msg = {name:"allPlayerData"};
  msg.data = [];
  for ( var i = 0; i < this.connections.length; i++ ){
    var connection = this.connections[i];
    msg.data.push(connection.playerStatistics.getData());
  }
  this.snakeConnection.jsonws.sendJSON(msg);
}

if ( exports ){
  exports.StatisticsManager = StatisticsManger;
}

