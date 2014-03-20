function SnakeModel(point){
    this.color = "#0000FF";
    this.points = [];
    if ( point && point.length ){
      for ( var i = 0; i < point.length; i++){
        this.points.push( point[i] )
      }
    }
}
