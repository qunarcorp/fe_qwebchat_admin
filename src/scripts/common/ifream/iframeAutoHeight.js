require('./jquery.cookie.js');
require('./auto-height-client.js');
;$(function(){
	// var host='https://tb2c.test.com';   open
	var host = ''
	if(/^http(s)?:\/\/.+$/.test($.cookie('QN52'))){
		host=$.cookie('QN52');
	}
	autoheight.config = { "id":"show_info", "interval":"100", "url":host+"/delegate.html", "origin":"*", "query":function(){} };
});

