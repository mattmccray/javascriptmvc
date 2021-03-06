/**
 * Mouseover and Mouseout sometimes cause unexpected behavior when using nested elements.
 * Mouseenter and mouseleave will only be called when a mouse enters or leaves an element even if
 * it moves over nested elements.
 * <h3>Example</h3>
@code_start
TasksController = MVC.Controller.extend('tasks',{
  mouseenter : function(params){ params.element.style.background = "red" },
  mouseleave : function(params){ params.element.style.background = "" }
})
@code_end
 * <h3>Install</h3>
@code_start
include.plugins('controller/hover')
@code_end
 */
MVC.Controller.Action.EnterLeave = MVC.Controller.Action.Event.extend(
/* @static */
{
    /* matches "(.*?)\\s?(mouseenter|mouseleave)$" */
    match: new RegExp("(.*?)\\s?(mouseenter|mouseleave)$")
},
//Prototype functions
{    
    /**
     * Sets up the new action to be called appropriately
     * @param {String} action
     * @param {Function} f
     * @param {MVC.Controller} controller
     */
    init: function(action_name, callback, className, element){
		//can't use init, so set default members
        this.action = action_name;
        this.callback = callback;
        this.className = className;
        this.element = element
        this.css_and_event();
        var selector = this.selector();
        this[this.event_type]()
    },
    /**
     * Attaches a mouseover event, but checks that the related target is not within the outer element.
     */
    mouseenter : function(){
        new MVC.Delegator(this.selector(), 'mouseover', MVC.Function.bind( function(params){
            //set a timeout and compare position
			var related_target = params.event.relatedTarget;
			if(params.element == related_target || MVC.$E(params.element).has(related_target)) return true;
			this.callback(params);
            
        }, this));
    },
    /**
     * Attaches a mouseout event, but checks that the related target is not within the outer element.
     */
    mouseleave : function(){
        //add myself to hover outs to be called on the mouseout
        new MVC.Delegator(this.selector(), 'mouseout', MVC.Function.bind( function(params){
            //set a timeout and compare position
			var related_target = params.event.relatedTarget;
			if(params.element == related_target || MVC.$E(params.element).has(related_target)) return true;
			this.callback(params);
        }, this));
    }
});


// Idea, and very small amonts of code taken from Brian Cherne <brian@cherne.net>
// http://cherne.net/brian/resources/jquery.hoverIntent.js  
/**
 * Provides hoverenter and hoverleave Controller actions.  
 * 
 * Hoverenter is called only when a user stops moving their mouse over an element.  This is
 * good to use when mouseover is expensive, or would be annoying to the user.
 * 
 * Hoverout is called on mouseout of an element that has had hoverenter called.
 * <h2>Example</h2>
@code_start
TasksController = MVC.Controller.extend('tasks',{
  hoverenter : function(params){ params.element.style.background = "red" },
  hoverleave : function(params){ params.element.style.background = "" }
})
@code_end
 * <h3>Install</h3>
@code_start
include.plugins('controller/hover')
@code_end
 * <h3>Adjusting Sensitivity and Interval</h3>
 * Change the sensitivity or interval to change how quickly a hoverover will take place.
 */
MVC.Controller.Action.Hover = MVC.Controller.Action.Event.extend(
/* @static */
{
    match: new RegExp("(.*?)\\s?(hoverenter|hoverleave)$"),
    /**
     * How many pixels the mouse can move and still trigger a hoverenter
     */
    sensitivity: 4,
    /**
     * Time between requests.
     */
    interval: 110,
    /**
     * Stores hover actions by CSS
     */
    hovers : {}
},
/* @prototype */
{    
    /**
     * If the first called, attaches mouseover, mouseout events
     * @param {Object} action
     * @param {Object} f
     * @param {Object} controller
     */
    init: function(action_name, callback, className, element){
        this.action = action_name;
        this.callback = callback;
        this.className = className;
        this.element = element
        this.css_and_event();
        var selector = this.selector();
        if(! this.Class.hovers[this.selector()]){
            this.Class.hovers[this.selector()] = {};
            new MVC.Delegator(this.selector(), 'mouseover', MVC.Function.bind(this.mouseover , this));
            new MVC.Delegator(this.selector(), 'mouseout', MVC.Function.bind( this.mouseout, this));
        }
        this.Class.hovers[this.selector()][this.event_type] = this;
    },
    /**
     * Calls hoverenter if there is one.
     * @param {Object} params
     */
	hoverenter : function(params){
		 var hoverenter = this.Class.hovers[this.selector()]["hoverenter"];
         if(hoverenter)
            hoverenter.callback(params);
	},
     /**
     * Calls hoverleave if there is one.
     * @param {Object} params
     */
	hoverleave : function(params){
		var hoverleave = this.Class.hovers[this.selector()]["hoverleave"];
        if(hoverleave)
            hoverleave.callback(params);
	},
    /**
     * Checks if 2 mouse moves are within sensitivity
     */
    check :function(){
        var diff = this.starting_position.minus(this.current_position);
        var size = Math.abs( diff.x() ) + Math.abs( diff.y() );
        if(size < this.Class.sensitivity){
            //fire hover and set as called
            this.called = true;
            this.hoverenter({element: this.element, mouseover_event: this.mouseover_event}) 
            MVC.Event.stop_observing(this.element, "mousemove", this.mousemove);
        }else{
            this.starting_position = this.current_position
            this.timer = setTimeout(MVC.Function.bind(this.check, this), this.Class.interval);
        }
    },
    /**
     * Called on the mouseover. Sets up the check.
     * @param {Object} params
     */
    mouseover : function(params){
        //set a timeout and compare position
        //if(this.event_type == "hoverenter"){
		var related_target = params.event.relatedTarget;
		if(params.element == related_target || MVC.$E(params.element).has(related_target))
			return true;
		//}
		
		
		this.called = false;
        this.starting_position = MVC.Event.pointer(params.event);
        this.element = params.element;
        this.mouseover_event = params.event;
        this.mousemove_function = MVC.Function.bind(this.mousemove , this)
        MVC.Event.observe(params.element, "mousemove", this.mousemove_function);

        this.timer = setTimeout(MVC.Function.bind(this.check, this), this.Class.interval);
        
    },
    /**
     * Updates the current_position of the mosuemove.
     * @param {Object} event
     */
    mousemove : function(event){
            this.mousemove_event = event;
            this.current_position = MVC.Event.pointer(event);
    },
    /**
     * 
     * @param {Object} params
     */
    mouseout : function(params){
        //the other mouse out, if there is one, will be handled
        //check if hoverover has been called, if it has fire hoverout, otherwise, do nothing
        //cancel timeout
        //unbind mousemove
        //run if only where you are going is right
		//if(this.event_type == "hoverenter"){
		var related_target = params.event.relatedTarget;
        if(params.element == related_target || MVC.$E(params.element).has(related_target))
			return true;
		//}
        clearTimeout(this.timer);
        MVC.Event.stop_observing(params.element, "mousemove", this.mousemove_function);
        if(this.called){ //call hoverleave
            this.hoverleave({element: this.element, event: params.event})
        }
    }
});



