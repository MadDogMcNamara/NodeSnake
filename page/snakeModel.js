function SnakeModel(oldSnake){
    this.color = "#0000FF";
    this.points = [];
    if ( oldSnake ){
      this.color = oldSnake.color || "#0000FF";
      this.points = oldSnake.points || [];
    }
}
