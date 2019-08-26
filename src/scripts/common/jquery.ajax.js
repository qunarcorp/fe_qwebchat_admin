if(typeof QNR=="undefined"){
	window.QNR={};
}

$.ajax=function(){

	var ajax=$.ajax;

	var rq=function(arg){

		var isComplete=false, spendtime=0;

		var config={
			url: arg.url||'',
			dataType: arg.dataType||'',
			processing: arg.processing||false,
			rate: arg.rate||5,
			type: arg.type||'get',
			success: arg.success||function(){
			},
			timeout: arg.timeout||0,
			error: arg.error||function(){
			},
			contentType: arg.contentType||'',
			complete: function(){
				isComplete=true;
				
				if(arg.complete&&arg.complete.apply){
					arg.complete.apply(this,Array.prototype.slice.call(arguments));
				}
			},
			data: arg.data||{}
		}
		
		config.data['_']=(new Date()).valueOf();
		
		if(config.processing){
			setInterval(function(){
				spendtime+=config.rate;
				if(!isComplete){
					config.processing(spendtime);
				}
			},config.rate*1000);
		}
		
		var request=ajax(config);
		
		return {
			xhr: request,
			resend: function(){
				var r=rq(arg);
				this.xhr=r.xhr;
				return this;
			},
			abort: function(){
				return this.xhr.abort();
			}
		}
	}
	
	return rq;

}();