var asdfasdf = 3;

{
  var root;
  if ( typeof exports !== 'undefined' && (typeof window === 'undefined') ){
    root = exports;
  }
  else if ( typeof window !== 'undefined' )
  {
    root = window;
  }
  else{
    // error
    console.log("unknown env");
    var x = 1/0;
  }

  root.getJSONWebSocket = function( socket ){
    var ret = Object.create(socket);

    ret.sendJSON = function( obj, f ){
      var stringObj = JSON.stringify( obj );
     // console.log(stringObj);
      // ensure context

      ret.send.apply(Object.getPrototypeOf(ret), [stringObj ]);
    }

    ret.onJSONMessage = function(obj){};

    socket.onmessage = function(event){
      // extract json messsage
      var obj = JSON.parse(event.data);
      ret.onJSONMessage( obj );
    }

    return ret;
  }

}
