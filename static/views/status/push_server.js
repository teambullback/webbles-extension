var tbb_token;  
function set_auth_token(data) {
    tbb_token = data;
}      
function get_auth_token(id, pw) {
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
      set_auth_token(data);
    })
    .fail(function() {
      // do something...
    });
};   
//g

//make sites
function post_new_site(title, description) {
    $.ajax({
      url: "http://175.126.232.145:8000/api-list/sites/",
      type: "POST",
      data: {
        "title": title,
        "description": description,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function( data) {
      // do something...
      //location.reload();
       post_new_tutorial('test', 'test',data.id); //튜토리얼 정보 넣기 
    })
    .fail(function( ) {
      // do something...
    });
};
//make tutorials
function post_new_tutorial(title, description,site) {
    $.ajax({
      url: "http://175.126.232.145:8000/api-list/tutorials/",
      type: "POST",
      data: {
        "title": title,
        "description": description,
	    "is_finish": false, 
	    "is_public": false, 
	    "is_hidden": false, 
	    "site": site,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function(data) {
      console.log(data.id);
      tutorial_num =  data.id;
      //location.reload();
    })
    .fail(function( ) {
      // do something...
    });
};
//make pages
function post_new_page(title, description, address, is_init_tutorial,tutorial) {
    $.ajax({
      url: "http://175.126.232.145:8000/api-list/documents/",
      type: "POST",
      data: {
        "title": title,
        "description": description,
        "address": address,
    	"is_init_tutorial": is_init_tutorial, 
    	"tutorial": tutorial_num,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function( data) {
      console.log(data.id);
      page_num = data.id;
      if(is_init_tutorial){
      	post_new_bubble('title', 'description',"DIV","N",true,null,page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
      }
      else{
      	if(is_nextclick)
	 		post_new_bubble('test', 'test',"DIV","N",false,bubble_num,page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
	 	else
	 		post_new_bubble('title', 'description',"DIV","C",false,bubble_num,page_num);//dompath는 원경이에게 받은 값/  document는 post_new_page의 리턴값 id
 		
      }
    })
    .fail(function( ) {
      // do something...
    });
};
//make bubbles
function post_new_bubble(title, description,dompath,trigger,is_init_document,prev,documents) {
    $.ajax({
      url: "http://175.126.232.145:8000/api-list/bubbles/",
      type: "POST",
      data: {
        "title": title,
        "description": description,
    	"dompath": "html body div div div div", 
   		"trigger": trigger, 
   		"is_init_document": is_init_document, 
  		"prev": prev, 
   		"document": documents,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function( data) {
     	bubble_num = data.id;
     	push_realid();
     	bubblecount++;
    })
    .fail(function( ) {
      // do something...
    });
};





function putch_publish_tutorials(id) {
   $.ajax({
      url: "http://175.126.232.145:8000/api-list/tutorials/" + id.toString() + "/",
      type: "PATCH",
      data: {
      	"is_finish": true,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function( ) {
      // do something...
      //location.reload();
    })
    .fail(function( ) {
      // do something...
    });
};
function putch_new_bubble(id, title, description) {
   $.ajax({
      url: "http://175.126.232.145:8000/api-list/bubbles/" + id.toString() + "/",
      type: "PATCH",
      data: {
      	"title": title,
        "description": description,
      },
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", "JWT " + tbb_token.token);
      },
    })
    .done(function( ) {
      // do something...
      //location.reload();
    })
    .fail(function( ) {
      // do something...
    });
};