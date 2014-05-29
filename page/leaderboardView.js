var LeaderboardView = function(boardData){
  this.innerDiv = $("span.innerLeaderboard");
  this.outerDiv = $("div.outerLeaderboard");
  this.tableDiv = this.outerDiv.find("div.tableDiv");
  this.boardData = boardData;
  this.backButton = this.outerDiv.find("input");
  this.backButton.click(function(){
    pageEvents.menuBack();
  });
}

LeaderboardView.prototype.makeTableFromArray = function(array){
  var ret = "<table>";
  for ( var i = 0; i < array.length; i++ ){
    var row = array[i];
    ret += "<tr>";
    for ( var j = 0; j < row.length; j++ ){
      ret += "<td>";
      ret += row[j];
      ret += "</td>";
    }

    ret += "</tr>";
  }
  ret += "</table>";
  return ret;
}

LeaderboardView.prototype.getSortFunction = function(){
  return function(x){
    return -x.getScore();
  }
}

LeaderboardView.prototype.updateView = function(){
  var tableData = [];
  this.tableDiv.empty();
  var sortedData = this.boardData.statisticsData;
  var sortBy = this.getSortFunction();
  sortedData = _.sortBy(sortedData, sortBy);
  var tableHeaders = ["rank","name", "score", "kills", "deaths", "apples", "long", "assass"];
  tableData.push(tableHeaders);

  for ( var j = 0; j < this.boardData.statisticsData.length; j++ ){
    var data = sortedData[j];
    var tableRow = [j+1,data.getId(), data.getScore(), data.getNumberKills(), data.getNumberDeaths(),
                    data.getApplesEaten(), data.getLongestSnakeLength(), data.getNumberAssassinated()];
    tableData.push(tableRow);
  }
  var htmlTable = $(this.makeTableFromArray(tableData));
  htmlTable.css("background-color","white");
  var rows = htmlTable.children(0).children();
  $(rows[0]).css("background-color","red");

  for ( var i = 1; i < rows.length; i++ ){
    var row = $(rows[i]);
    var data = sortedData[i-1];
    var pictureBlock = $(row.children()[1]);
    var width = 80;
    var height = 90;

    width += "px";
    height += "px;"

    var color = data.getColor();

    pictureBlock.empty();
    pictureBlock.append($("<div></div>").css("height",50).css("width",width).css("background-color",color));
    console.debug(pictureBlock);
  }


  this.tableDiv.append(htmlTable);
  this.resize();
}


LeaderboardView.prototype.hide = function(){
  this.outerDiv[0].style.display = "none";
}
LeaderboardView.prototype.show = function(){
  this.outerDiv[0].style.display = "block";
  this.resize();
}

LeaderboardView.prototype.resize = function(){
  var pageWidth = getStyle(document.body, "width");
  var pageHeight = getStyle(document.body, "height");
  this.outerDiv[0].style.height = pageHeight;
  this.outerDiv[0].style.width = pageWidth;
  pageWidth = parseInt(pageWidth);
  pageHeight = parseInt(pageHeight);

  var tableWidth = parseInt(this.innerDiv.css("width"));
  var tableHeight = parseInt(this.innerDiv.css("height"));

  this.innerDiv.css("left", "" + (pageWidth / 2 - tableWidth / 2) + "px");
  this.innerDiv.css("top", "" + (pageHeight / 2 - tableHeight / 2) + "px");

}
