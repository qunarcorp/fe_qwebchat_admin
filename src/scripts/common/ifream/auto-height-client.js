(function(global, undefined){
	var _defaultconfig = {
		"query":"auto",
		"origin":"*",
		"interval":"1000",
		"id":"",
		"url":""
	};
	
	var hash = location.hash;
	var send,sendOnce;
	var ah = global.autoheight = global.autoheight || {name:"autoheight"};
	
	ah.config = ah.config || {name:"config"};
	var EXPR_ORIGIN = /^([\w-]+:\/\/[^\/]+)/;
	
	function getOrigin(url){
		if(EXPR_ORIGIN.test(url)){
			return RegExp.$1;
		} else{
			return url;
		}
	}
	
	var sendScroll = ah.scroll = function(top,left){
		var str = "id="+ah.config.id+"&top="+top;
		if(typeof left!="undefined"){
			str+="&left="+left;
		}
		
		ah.config.origin = ah.config.origin || getOrigin(ah.config.url) || "*";
		sendOnce(str,ah.config.origin);
	};
	
	// fit size mode function
	var sendSize = ah.send = function(size){
		var w, h;
		if(typeof size == "number"){
			h = size;
			if(typeof arguments[1] == "number"){
				w = h;
				h = arguments[1];
			}
		}else if(typeof size == "object"){
			h = ("height" in size)?size.height:("h" in size)?size.h:("y" in size)?size.y:undefined;
			w = ("width" in size)?size.width:("w" in size)?size.w:("x" in size)?size.x:undefined;
		}
		
		var resa = [];
		resa.push("id=" + ah.config.id);
		if(typeof w !== "undefined"){
			resa.push("width="+w);
		}
		
		if(typeof h !== "undefined"){
			resa.push("height="+h);
		}
		
		resa.push("IFRAM_DATA="+window.IFRAM_DATA);

		ah.config.origin = ah.config.origin || getOrigin(ah.config.url) || "*";
		send(resa.join("&"), ah.config.origin);
	};
	
	
	// create send method
	if(global.postMessage){
	/*use html5 postMessage*/
		send = function(str, url){
			clearInterval(send.itv);
			send.itv = setInterval(function(){
				global.parent.postMessage(str, url);
			}, ah.config.interval || _defaultconfig.interval);
		};
		sendOnce = function(str, url){
			global.parent.postMessage(str, url);
		}
	}else{
		$(function(){
			var seq = 0;
			var ifr = document.createElement("iframe");
			var ifrid = ifr.id = "_ifr_"+Math.random();
			var beginsrc = ah.config.url;
			var begininterval = ah.config.interval;
			ifr.src = "about:blank"/*beginsrc + "?interval=" + begininterval*/;
			ifr.style.display = "none";
			global.document.body.appendChild(ifr);
			ifr = null;
			
			send = function(str, url){
				var ifr = document.getElementById(ifrid);
				if(beginsrc != ah.config.url || begininterval != ah.config.interval) {
					beginsrc = ah.config.url;
					begininterval = ah.config.interval;
				}
				ifr.src = beginsrc + "?interval=" + begininterval + "&r=" + (seq++ % 2) + "#" + str;
			};
			
			sendOnce = function(str, url){
				var ifr = document.getElementById(ifrid);
				if(beginsrc != ah.config.url || begininterval != ah.config.interval) {
					beginsrc = ah.config.url;
					begininterval = 0;
				}
				ifr.src = beginsrc + "?interval=" + begininterval + "&r=" + (seq++ % 2) + "#" + str;
			}
		});
	}
	
	function _auto_query(){
		//return global.document.body.parentNode.scrollHeight;
		
		if(global.document.documentElement.offsetHeight&&global.document.documentElement.scrollHeight&&$.browser.mozilla){
			return Math.min(global.document.documentElement.offsetHeight,global.document.documentElement.scrollHeight);
		}
		
		return Math.max(global.document.documentElement.offsetHeight,global.document.documentElement.scrollHeight);
	}
	
	var itv;
	var last_height;
	$(function(){
		if(window != top){
			itv = setTimeout(function interval(){
				if(ah.config.id){
					var query = ah.config.query || _defaultconfig.query;
					var cur_height;
					if(typeof query == "function"){
						cur_height = query();
						if(cur_height === undefined){
							cur_height = _auto_query();
						}
					}else if(query == "auto"){
						cur_height = _auto_query();
					}else{
						cur_height = query;
					}
					
					if(last_height !== cur_height){
						last_height = cur_height;
						sendSize((/*document.body.offsetHeight || global.document.body.parentNode.scrollHeight*/ cur_height));
					}
					
					if(parseInt(ah.config.interval)!=0){
						itv = setTimeout(interval, ah.config.interval || _defaultconfig.interval);
					}
				}else{
					itv = setTimeout(interval, 13);
				}
			}, 50);
		}
		
	});
})(this);