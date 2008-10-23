MainController = MVC.Controller.extend('main',{
	load : function(){
		success('load');
	},
	resize : function(){
		success('resize')
	},
	scroll : function(){
		success('scroll')
	},
	unload : function(){
		success('unload')
	},
	click: function(){
		success('mainclick')
	}
});

LoginController = MVC.Controller.extend('login',{
	'# submit' :function(params){
		params.event.kill();
		if(params.element) success('form_submit')
	},
});



TestsController = MVC.Controller.extend('tests',{
	change: function(){
		success('change')
	},
	click : function(params){
		success('click')
	},
	focus : function(params){
		success('focus')
	},
	blur : function(){
		success('blur')
	},
	'# submit' :function(params){
		success('submit')
		params.event.kill();
	},
	mousedown : function(params){
		success('mousedown')
	},
	mousemove : function(params){
		success('mousemove')
	},
	mouseup : function(params){
		success('mouseup')
	},
	mouseover : function(params){
		success('mouseover')
	},
	mouseout : function(params){
		success('mouseout')
	},
	contextmenu : function(params){
		success('contextmenu')
	},
	to : function(params){
		this.data = 'HelloWorld'
		this.render({to: 'render_here'});
	},
	to_element : function(params){
		this.data = 'HelloWorld'
		this.render({to: document.getElementById('render_here')});
	},
	after : function(params){
		this.data = 'HelloWorld'
		this.render({after: 'render_here'});
	}
});

ScrollController = MVC.Controller.extend('scroll',{
    scroll : function(){

    }
});
(function(){
    

})()
