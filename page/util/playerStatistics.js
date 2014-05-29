var PlayerStatistics = function(other){
  var numberKills = 0;
  var numberDeaths = 0;
  var numberAssassinated = 0;
  var applesEaten = 0;
  var longestSnakeLength = 0;
  var joinDate = new Date().getTime();
  var numberResets = 0;
  var state = "dead";
  var id = undefined;
  var color = "#0000FF";
  if ( other ){
    numberKills = other.numberKills;
    numberAssassinated = other.numberAssassinated;
    numberDeaths = other.numberDeaths;
    longestSnakeLength = other.longestSnakeLength;
    applesEaten = other.applesEaten;
    joinDate = other.joinDate;
    numberResets = other.numberResets;
    state = other.state;
    id = other.id;
    color = other.color;
  }

  this.getColor = function(){
    return color;
  }

  this.setColor = function(c){
    color = c;
  }

  this.getNumberKills = function(){
    return numberKills;
  }

  this.getNumberAssassinated = function(){
    return numberAssassinated;
  }

  this.getNumberDeaths = function(){
    return numberDeaths;
  }

  this.getKD = function(){
    if( this.getNumberDeaths() === 0 ) return "-";
    var ret = this.getNumberKills() / this.getNumberDeaths();
    ret = ret.toFixed(2);
    return ret;
  }

  this.getApplesEaten = function(){
    return applesEaten;
  }

  this.getLongestSnakeLength = function(){
    return longestSnakeLength;
  }

  this.getJoinDate = function(){
    return joinDate;
  }

  this.getScore = function(){
    var ret = 0;
    ret += 10 * numberKills;
    ret -= 9 * numberAssassinated;
    ret += 10 * applesEaten / ( numberDeaths + numberResets + 1 );
    ret += longestSnakeLength / 10;
    return Math.ceil(ret);
  }

  this.getNumberResets = function(){
    return numberResets;
  }

  this.getId = function(){
    return id;
  }

  this.setId = function(newId){
    id = newId;
  }

  this.addApple = function(){
    applesEaten++;
  }

  this.addKill = function(){
    numberKills++;
  }

  this.addAssassinated = function(){
    numberAssassinated++;
  }

  this.addDeath = function(){
    numberDeaths++;
  }
  this.addReset = function(){
    numberResets++;
  }

  this.setState = function(s){
    state = s;
  }
  this.getState = function(){
    return state;
  }

  this.updateSnakeLength = function( length ){
    longestSnakeLength = Math.max(length, longestSnakeLength);
  }

  this.getData = function(){
    var ret = {};
    ret.numberKills = this.getNumberKills();
    ret.numberAssassinated = this.getNumberAssassinated();
    ret.numberDeaths = this.getNumberDeaths();
    ret.applesEaten = this.getApplesEaten();
    ret.longestSnakeLength = this.getLongestSnakeLength();
    ret.joinDate = this.getJoinDate();
    ret.numberResets = this.getNumberResets();
    ret.state = this.getState();
    ret.id = this.getId();
    ret.color = this.getColor();

    return ret;
  }



  this.stringify = function(){
    return JSON.stringify(this.getData());
  }
}
if ( typeof exports !== 'undefined' ){
  exports.PlayerStatistics = PlayerStatistics;
}
