
function status_server(){};

status_server.prototype = {
  //vars
  tbb_token : null,

  //methods
  set_auth_token : function(data){
    this.tbb_token = data;
  },
  get_saved_token : function(){
    return this.tbb_token;
  },
  get_auth_token : function(id, pw) {
    var self = this;
     $.ajax({
        url: "http://175.126.232.145:8000/api-token-auth/",
        type: "POST",
        data: {
            "username": id.toString(),
            "password": pw.toString(),
        },
        async: false,
    })
    .done(function(data) {
      
      self.set_auth_token(data);
    })
    .fail(function() {
      // do something...
    });
  }

};

