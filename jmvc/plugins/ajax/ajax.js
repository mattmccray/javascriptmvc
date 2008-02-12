Ajax = {}
Ajax.Request = function(url,options){
	options.asynchronous = options.asynchronous || false
	options.method = options.method || 'post'
	
	var factory = Ajax.factory();
	this.transport =factory;
	if(options.asynchronous == false){
	   factory.open("GET", url, false);
	   try{factory.send(null);}
	   catch(e){return null;}
	   return;
	}else{
	   factory.onreadystatechange = function(){
			if(factory.readyState == 4){
				if(factory.status == 200){
					options.onComplete(factory);
				}else
				{
					options.onComplete(factory);
				}
			}
		};
		factory.open(options.method, url);
		factory.send(null);
	}
}

Ajax.factory = function(){
	var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	    for(var i = 0; i < factories.length; i++) {
	    try {
	        var request = factories[i]();
	        if (request != null)  return request;
	    }
	    catch(e) { continue;}
   }
}