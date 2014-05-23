var PlayerStatistics = function(other){
  var numberKills = (other && other.numberKills) || 0;
  var numberDeaths = (other && other.numberDeaths) || 0;
  var longestSnakeLength = (other && other.longestSnakeLength) || 0;
  var joinDate = new Date().getTime();


  this.getNumberKills = function(){
    return numberKills;
  }
  this.getNumberDeaths = function(){
    return numberDeaths;
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
    ret -= 5 * numberDeaths;
    ret += Math.min(400, (new Date().getTime() - joinDate) / 100000);
    ret += longestSnakeLength / 100;
  }

  this.getData = function(){
    var ret = {};
    ret.numberKills = this.getNumberKills();
    ret.numberDeaths = this.getNumberDeaths();
    ret.longestSnakeLength = this.getLongestSnakeLength();
    ret.joinDate = this.getJoinDate();
    return ret;
  }
}
if ( exports ){
  exports.PlayerStatistics = PlayerStatistics;
}
