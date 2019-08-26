(function($){
	/**
		Event :
			q-suggest-user-action
			q-suggest-hide
			q-suggest-show
			q-suggest-dispose

	*/



	/**
        usage : 
            bind :
                detect_oninput.bind( element , callback )
            unbind : 
                detect_oninput.unbind( element , callback )
            set value safely , prevent to call back :
                detect_oninput.set( element , value )
            
            ------
            callback parameter:
                callback( new_value , old_value)

        warn :
            in some browser , it may call the function back when the input's value was changed by javascript unless using detect_input.set()
    */
    var detect_oninput = (function(){
        var _h = 'data-detect-oninput', _cache = {} , _check = {} , $$guid = 1 , $$eid = 1;
        var _bindEvent = function( element , type , handler , _guid ){
            if( element.addEventListener )
                element.addEventListener( type , handler , false );
            else if( element.attachEvent )
                element.attachEvent( 'on' + type , handler );
            
            ( _cache[ _guid ] || ( _cache[ _guid ] = [] ) ).push( { 't' : type , 'h' : handler } );
        };
        var _removeEvent = function( element , _guid ){
            if( !_cache[ _guid ] )
                return;
            for( var i = 0 , _evt  ; _evt = _cache[ _guid ][i] ; i++ )
                if( element.removeEventListener )
                    element.removeEventListener( _evt['t'] , _evt['h'] , false);
                else if( element.detachEvent )
                    element.detachEvent( 'on' + _evt['t'] , _evt['h'] );
            delete _cache[ _guid ];
        };

        var _create_checker = function( input , callback ){
            var _old = input.value;
            var _checker = function(){
                var _new;
                if( ( _new = input.value ) !== _old ){
                    if( _checker._sleep !== true )
                        callback.call( input , _new , _old );
                    _old = input.value;
                }
            }
            return _checker;
        };

        var ua = navigator.userAgent.toLowerCase();

        return {
            version : '1.3',
            bind : function( input , callback ){
                var _eid , _guid = callback[ _h ];
                if( !_guid )
                    callback[ _h ] = _guid = $$guid++;
                if( !( _eid = input.getAttribute( _h ) ) )
                    input.setAttribute( _h , _eid = "" + $$eid++ );

                var _cb = _create_checker( input , callback );
                if( 'oninput' in input && !/opera/.test( ua ) )
                    _bindEvent( input , 'input'  , _cb , _guid );
                else{
                    var _check_handler;
                    _bindEvent( input , 'focus' , function(){
                        if( !_check_handler )
                            _check_handler = setInterval( _cb , 100 );
                    } , _guid );
                    _bindEvent( input , 'blur' , function(){
                        if( _check_handler ){
                            clearInterval( _check_handler );
                            _check_handler = null;
                        }
                    } , _guid );
                }
                _check[ _guid ] = { eid : _eid , checker : _cb };
                return input;
            } ,
            unbind : function( input , callback ){
                if( callback[ _h ] ){
                    _removeEvent( input ,  callback[ _h ] );
                    delete _check[ callback[ _h ] ];
                }
                return input;
            },
            set : function( input , value ){
                var _eid = input.getAttribute( _h );
                if( _eid ){
                    var _checkers = [];
                    for( var _x in _check )
                        if( _check[ _x ][ 'eid' ] === _eid ){
                            _checkers.push( _check[ _x ][ 'checker' ] );
                            _check[ _x ][ 'checker' ]._sleep = true;
                        }
                    input.value = value;
                    for( var i = 0 , len = _checkers.length ; i < len ; i++ ){
                        _checkers[i].call( input );
                        _checkers[i]._sleep = false;
                    }
                }else
                    input.value = value;
            }
        };
    })();


	/*
		plugin detect oninput end
	*/

    /*
     *arg description
     *@ajax the suggest's ajax option
     *render  : render the data back from the interface, you can also cache the data , this function is open
     *focus   : true means the 'input' will request the ajax.url when it focus   add by jieqing.song
     *
     *
     * added by liao.zhang
     *
     * 目前的这种情况，所有的参数都拼接到了url中，对于单一的suggest 比如就一个车次，一个车站，会用当前的值中的*进行，没有问题
     * 当需要多个值得时候，比如火车已知 上车车站 和 下车车站，需要对车次进行suggest的时候，会有问题：
     * 现在的处理方式是在上车车站和下车车站上监听change 事件，然后每次change 重新刷新车次suggest的url 不仅浪费资源而且不符合设计原则
     * 这里提供一个获取额外参数的回调函数 extraData，url中只拼接带*的信息（也就是当前suggest的信息）,其他的参数在发送suggest的时候通过回调获取
     *
     * 以前的调用方式是在外层判断条件后多次进行suggest绑定，现在改为一次性绑定，提供一个检测函数 pauseSuggest ，如果满足条件不进行suggest操作就行
     *
     * 增加一个当前元素对应的请求参数的key paramName,不用每次都手动拼在url中，后来再替换带*的参数,便于一并处理其他参数
     *
     * 为了满足不同条件下，需要使用不同的URl进行suggest(当初接口咋设计的，这特么要前端来区分！！！)，添加一个配置changeUrl,返回新的url的时候进行替换
     * 对于使用代理的url，suggest的url会作为代理url的参数，此时的extraData应该做为suggest url的参数，进行encodeURIComponent,需要指定属性useProxy
    */
	$.qsuggest = { version : '1.3' };
	
	var ROOT_KEY = $.qsuggest.ROOT_KEY = 'q-suggest';

	var gInd = 0;

	var defArgs = {
		ajax : {
			useProxy:false,  //true extraData数据拼接到suggest url中
			url : null ,
			cache : false,
			success : function(){}
		},
		reader : function( data ){ return data; },
		loader : function( val ){ return val; },
		extraData:function(){return {}},
		pauseSuggest:function(){return false},
		paramName:'',
		changeUrl:function(){return false},
		max : 10,
		min : 1,
		container : null,
		delay : 100 ,	// Reaction time
		rdelay : 1000,	// Reaction time after request ( delay hiding when no response )
		requestWithNothing : false,
		trimQuery : true ,
        focus : false,//增加文本框获取焦点时候的时候就请求
		css : { 'z-index' : 10000 },
		// 是否出来服务器返回的不正确的消息
		receiveErrorMsg: false,
		render : function( val ){ return String( val ).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") }
	};

	
	function _calc_pos( el ){
			var of = el.offset();
			of['top'] += el.outerHeight();
			return of;
	}	
	
	function _getData ( el ){
		return el && el.length && el.closest("table").data('data')[ el.attr('data-ind') * 1 ];
	}
	function QSuggest( el , args ){
		if( !this.init )
			return new qsuggest( el , args );
		else
			return this.init( el , args );
	}
	
	$.extend(QSuggest.prototype,{
		init : function ( aEl , args ){
			this.key = ++gInd;
			var ns = this.ns = ROOT_KEY + this.key;
			args = this.args = $.extend( true , {} , defArgs ,args || {} );
			var activeEl = this.activeEl = $(aEl);
			var self = this;
			
			this.el = $('<div class="' + ROOT_KEY + (args.customClass ? ' ' + args.customClass : '') + '"></div>').appendTo( args['container'] || document.body ).hide();
			this.el.data( ROOT_KEY , this );
			
			this._handler = null;
			this._ajaxHandler = null;
			this._excludeEl = null;
			this._mouseFocus = null;
			this._last = []; // [ cond , result ]
			this._cache = {};
			this._value = null;

            this.timer =new Date().getTime();
			
			$.each( args['on'] || {} , function ( k , v ){
				activeEl.bind( k + '.' + ns  , v );
			});
			
			if( args['css'] )
				this.el.css( self.args['css'] );
				
			var self = this;
			
            activeEl.bind("focus",function(){
                self.timer = (new Date()).getTime();
            });
			detect_oninput.bind( activeEl[0] , function(){
				self.show();
			});
			activeEl.bind('keyup.' + ns  , function( evt ){
			    //速度快的时候发送N多请求	
                var d =new Date().getTime();
                if(d-self.timer<200){
                    self.timer = d;
                    return;
                }
                self.timer = d;
				var visible = self.visible();
				var code = evt.keyCode;
				
				if( code === 40 && !visible ){
					self.show();
					return;
				}
				
				var elements = self.el.find( 'tr[data-suggest="0"]' );
				var active = elements.filter('.active');
				
				switch( code ){
					case 38 :  //	up
					case 40 :  //	down
						if( visible ){
							self._excludeEl = self._mouseFocus;
							active.removeClass('active');
							var index = elements.index(active);
	                        index = evt.keyCode === 38 ? index - 1 : index + 1;
	                        if (index >= elements.length) {
	                            index = 0;
	                        }
	                        if (index < 0) {
	                            index = elements.length - 1;
	                        }
	                        p = elements.eq(index);
							var val = _getData( p );
							self.setValue( val || '' );
							p.addClass('active');
							evt.preventDefault();
							self._trigger('q-suggest-user-action' , [ evt.type , val , code ] );
						}
						break;
					case 13 :  
                        if( visible ){
							self._excludeEl = self._mouseFocus;
							var val = _getData( active );
							self.setValue( val || '' );
							evt.preventDefault();
							self._trigger('q-suggest-user-action' , [ "enter" , val , code ] );
                            self.hide();
						}
                        
                        break;
					case 27 :  //	esc
						if( visible ){
							self.hide();
							self._trigger('q-suggest-user-action' , [ evt.type , self.getValue() , code ] );
						}
						break;
					case 18 :	//	alt
					case 9	:	//	tab
						break;
					default :
						;
				}
			});

			activeEl.bind('blur.' + ns , function( evt ){
				if( self.visible() )
					self.hide();
			});
            if( self.args.focus){
                activeEl.bind('focus.' + ns , function( evt ){
                     self.show();
                });	
            }
			$('tr' , this.el[0]).live('mouseover.' + ns + ' mouseout.' + ns + ' mousedown.' + ns , function( evt ){
				var el = $.nodeName( evt.target , 'tr' ) ? $( evt.target ) : $( evt.target ).parents('tr').eq(0);
				if ($(el[0]).attr("data-suggest") == "1") {
                    evt.preventDefault();
                    return;
                }
				var v = el[0]  != self._excludeEl;
				if( evt.type === 'mouseover' ){
					if( v ){
						el.parents().children().removeClass( 'active' );
						el.addClass( 'active' );
						self._excludeEl = null;
					}
					self._mouseFocus = el[0];
				}else if( evt.type === 'mouseout' ){
					self._mouseFocus = null;
				}else{
					self.setValue( _getData( el ) || '' );
					self.hide();
					self._trigger('q-suggest-user-action' , [ evt.type , self.getValue() , null ] );
				}
			});

			return this;
		},
		req : function(){
			var self = this;
			if(self._handler) {
				clearTimeout( self._handler );
			}

			if(self._timeoutHandler){
				clearTimeout( self._timeoutHandler );
				self._timeoutHandler = null;
			}

			if(self._ajaxHandler){
				self._ajaxHandler.abort();
				self._ajaxHandler = null;
			}

			self._handler = setTimeout( function(){

				if(!self.args.ajax.url || self.args.pauseSuggest()){
					return;
				}
				
				var sv = self.activeEl.val() , val = self.args.loader( sv ) , dataList = null , status;
			    if(self.args.focus){
                    val = "a";
                }
				if( self.args.trimQuery ){
					val = $.trim( val );
				}

				if( self._last && self._last[0] == val ){
					//
				}else if( self.args.cache && self._cache[val] ){
					self._last = self._cache[ val ];
				}else{
					self._last = [];
				}

				dataList = self._last[1];
				if(!(Array.isArray(dataList) && dataList.length > 0)){
					dataList = false;
				}

				if(dataList){
					self.draw(dataList);
				}else{
					var url = self.args.ajax.url;

					var changeUrlFunc = self.args.changeUrl;
					var newUrl =  changeUrlFunc && $.isFunction(changeUrlFunc) && changeUrlFunc();
					newUrl && typeof newUrl === 'string' && (url = newUrl);

					var extraData = self.args.extraData;
					var params = extraData && $.isFunction(extraData) && extraData();
					if(!params){
						params = {}
					}

					var paramName = self.args.paramName;
					if(paramName){
					//使用新版的不拼url的方式
						params[paramName] = val;
					}else{
						//兼容旧版
						url = self.args.ajax.url.replace(/\*([^*]+)*$/, encodeURIComponent( val ) + '$1');
					}

					var _success = self.args.ajax.success;

					//使用url代理的时候，额外参数需要拼接到原始URL中，并去掉params中的值
					if(self.args.ajax.useProxy){
						var paramsStr = $.param(params);
						if(url.indexOf('?') === -1){
							url = [url,'?',paramsStr].join('');
						}else{
							if(url.charAt(url.length - 1) === '&'){
								url = url + paramsStr;
							}else{
								url = [url,'&',paramsStr].join('');
							}
						}
						//原始URL中的值已经带上了，这里不需要了
						params = {};
						url = QNR.util.proxy.formatUrl(url);
					}

					self._timeoutHandler = setTimeout( function(){ self.hide(); } , self.args.rdelay );

					self._ajaxHandler = $.ajax(
						$.extend({}, self.args.ajax, {
							url: url,
							data: params,
							success: function(data, status) {
								clearTimeout(self._timeoutHandler);
								self._timeoutHandler = null;
								self._ajaxHandler = null;

								// double check if returns too late
								if (sv !== self.activeEl.val())
									return;
								var dataList = self.args.reader.call(self, data, status);
								if (self.type(dataList) === "Array") {
									self.draw(dataList);
									self._last = self._cache[val] = [val, dataList, status];
								}

								_success.apply(this, arguments);
							},
							error: function(resp, status) {
								// 如果客户端标识自己能出来错误消息，那么把这条消息返回
								try{
									if(resp.status === 200) {
										var data = JSON.parse(resp.responseText);
										clearTimeout(self._timeoutHandler);
										self._timeoutHandler = null;
										self._ajaxHandler = null;

										self.args.receiveErrorMsg && self.args.reader.call(self, data, status);
									}
								} catch(err) {

								}
							}
						}));
				}
			} , self.args.delay );
		},
		type : function(data){
			return Object.prototype.toString.call(data).slice(8,-1);
		},
		show : function( ){
			this.req();
		},
		hide : function(){
			if( this.visible() ){
				this.el.hide();
				this._trigger( 'q-suggest-hide' );
			}
		},
		draw : function( data ){
			this.el.empty();
			
			var min = this.args.min , max = this.args.max;
			if( !data || !data.length || data.length < min ){
				this.hide();
				return;
			}

			var x = [] , r = this.args.render,u = true;
			x.push('<table cellspacing="0" cellpadding="2"><tbody>');
			$.each( data , function( ind , v ){
				if( ind >= max )
					return false;
				var w = "";
                if ( typeof v.stype!=="undefined" && v.stype !== 1 && u) {
                    u = false;
                    w = ' class="active" ';
                }
                if(v instanceof Object){
				    x.push('<tr ',w,' data-suggest="',(typeof v.stype=="undefined"?0:v.stype),'" data-ind="', ind ,'"><td did="',v.id,'">' , r( v.name ) , '</td></tr>');
                }else{
				    x.push('<tr ',w,' data-suggest="',(typeof v.stype=="undefined"?0:v.stype),'" data-ind="', ind ,'"><td>' , r( v ) , '</td></tr>');
                }
			});
			x.push('</tbody></table>');
			var o = $( x.join('') ).appendTo( this.el ).data( 'data' , data );
			
			// calc position & width
			if( !this.args['container'] )
				this.el.css( _calc_pos( this.activeEl ) );
			
			var width = this.args['width'] ;
			if( !width )
				this.el.css( 'width' , this.activeEl.outerWidth() );
			else
				this.el.css( 'width' , width );
				
			this.el.show();
			width = Math.max(width, $("table", this.el).width() + 2);
			this.el.css( 'width' , width );
			this._trigger('q-suggest-show' , [ data ] );
		},
		dispose : function(){
			this._trigger('q-suggest-dispose');
			this.activeEl.unbind( '.' + this.ns );
			$( window ).unbind( '.' + this.ns )
			this.el.remove();
		},
		visible : function(){
			return this.el.is(":visible");
		},
		_trigger : function(){
			this.activeEl.triggerHandler.apply( this.activeEl , arguments );
		},
		setValue : function( val ){
            if (val instanceof Object){
                detect_oninput.set( this.activeEl[0] , val.name ); 
            }else{
                detect_oninput.set( this.activeEl[0] , val);
            }
			//this.activeEl.val( val );
			this._value = val;
		},
		getValue : function(){
			return this._value;
		},
		set : function( key , value ){
			var handled = false;
			switch( key ){
				case 'container' :
					this.el.appendTo( value || document.body );
					this.el.css( { top : '' , left : '' } );
				break;
				//by t.z,增加了一个改变suggestURL的参数
				case "url":
				this.args.ajax.url=value;
				break;
			}
			if( !handled )
				for( var i = 0 , w = key.split( '.' ) , len = w.length , z = this.args; i < len && ( i !== len - 1 && ( z[ w[i] ] || ( z[ w[i] ] = {} ) ) || ( z[ w[i] ] =  value ) ); z = z[ w[i] ] , i++ ){}
			return value;	
		},
		get : function( key ){
			for( var i = 0 , z = this.args , w = key.split(".") , len = w.length ; i < len && ( z = z[ w[i] ] ); i++ ){}
			return z;
		}
	});
	
	$.fn.qsuggest = function( ){
		var args = arguments;
		
		if( arguments.length > 1 && this.data( ROOT_KEY )){
			var val = null;
			if( arguments[0] === 'option' || arguments[0] === 'setting' ){
				this.each( function( ind , el ){
					var jEl = $( el );
					var sug = jEl.data( ROOT_KEY );
					if( sug )
						val = val || ( args.length > 2 ? sug.set(args[1] , args[2]) : sug.get(args[1]) );
				});
			};
			return val;
		//init a suggest
		}else if( arguments.length <= 1) {
			this.each( function( ind , el ){
				var jEl = $( el );
				if( jEl.data( ROOT_KEY ) ){
					jEl.data( ROOT_KEY ).dispose();
					jEl.removeData(ROOT_KEY);
				}
				var sug = new QSuggest( el , args[0] );
				jEl.data( ROOT_KEY , sug );
			});
			
		}
		return this;
	}
})(jQuery);
