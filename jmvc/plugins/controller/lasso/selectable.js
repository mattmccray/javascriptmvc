/**
 * Allows actions to handle being dropped on.  Adds the following actions:<br/>
 * dropadd    -> Called when selectables are added, when a drag starts
 * dropover -> Called when a drag is over a drop
 * dropout    -> Called when a drag is moved out of a drop area
 * dropped    -> Called when a drag is dropped on the drop
 * dropmove   -> Called as an element moves over a drop
 */
MVC.Controller.SelectableAction = MVC.Controller.Action.Event.extend({
    match: new RegExp("(.*?)\\s?(selectover|selected|selectout|selectadd|selectmove)$")
},
/* @prototype */
{    
    init: function(action, f, controller){
        this.action = action;
        this.func = f;
        this.controller = controller;
        this.css_and_event();
        var selector = this.selector();
        
		// add selector to list of selectors:
        if(! MVC.Selectables.selectors[selector]) MVC.Selectables.selectors[selector] = {};
        MVC.Selectables.selectors[selector][this.event_type] = controller.dispatch_closure(action); 
    }
});
MVC.Selectable = MVC.Controller.Params

MVC.Selectable.prototype = new MVC.Controller.Params();
MVC.Object.extend(MVC.Selectable.prototype, {
    /**
     * Caches positions of draggable elements.  Call in dropadd
     */
	cache_position: function(){
        this._cache = true;
    },
	/**
	 * cancels this drop
	 */
    cancel : function(){
        this._cancel = true;
    }
})

MVC.Selectables = {
	selectables: [],
	selectors: {},
	/**
	 * Creates a new droppable and adds it to the list.
	 * @param {Object} element
	 * @param {Object} functions - callback functions for drop events
	 */
	add: function(element, functions) {
		element = MVC.$E(element);
		functions = MVC.Object.extend({
			selectover: MVC.Lasso.k,
			selected:MVC.Lasso.k,
			selectout:MVC.Lasso.k,
			selectadd:MVC.Lasso.k,
			selectmove:MVC.Lasso.k
		},functions)
		functions.element = element;
		functions._is_selected = false;
		var selectable = new MVC.Selectable(functions);
		if(selectable.selectadd) selectable.selectadd(selectable);
		if(!selectable._canceled){
		    MVC.Element.make_positioned(element);
		    this.selectables.push(selectable);
		}
	    
	},
	/**
	* For a list of affected selectables, finds the one that is deepest in
	* the dom.
	* @param {Object} selectables
	* @return {MVC.Selectable} deepest
	*/
	findDeepestChild: function(selectables) {
		//return right away if there are no selectables
		if(selectables.length == 0) return null;
		var deepest = selectables[0];
		  
		for (i = 1; i < selectables.length; ++i)
		  if (MVC.Element.has(selectables[i].element, deepest.element))
		    deepest = selectables[i];
		
		return deepest;
	},
	/**
	 * Tests if a drop is within the point.
	 * @param {Object} point
	 * @param {Object} element
	 * @param {Object} drop
	 */
	isAffected: function(lasso, selectable) {
		return ( lasso.contains(selectable) );
	},
	/**
	 * Calls dropout and sets last active to null
	 * @param {Object} drop
	 * @param {Object} drag
	 * @param {Object} event
	 */
	deactivate: function(drop, drag, event) {
		this.last_active = null;
		if(drop.dropout) drop.dropout( {element: drop.element, drag: drag, event: event });
	}, 
	/**
	 * Calls dropover
	 * @param {Object} drop
	 * @param {Object} drag
	 * @param {Object} event
	 */
	activate: function(drop, drag, event) { //this is where we should call over
		this.last_active = drop;
		if(drop.dropover) drop.dropover( {element: drop.element, drag: drag, event: event });
	},
    dropmove : function(drop, drag, event){
        if(drop.dropmove) drop.dropmove( {element: drop.element, drag: drag, event: event });
    },
	/**
	* Gives a point, the object being dragged, and the latest mousemove event.
	* Go through each droppable and see if it is affected.  Called on every mousemove.
	* @param {Object} point
	* @param {Object} drag
	* @param {Object} event
	*/
	show: function(point, lasso, event) {
		
		//var element = drag.drag_element;
		if(!this.selectables.length) return;
		
		var drop, affected = [];
		
		for(var d =0 ; d < this.selectables.length; d++ ){
			var select = this.selectables[d]
		    var ef = MVC.Selectables.isAffected(lasso, this.selectables[d])
			//if(ef) affected.push(this.selectables[d]);  
			if(ef && ! select._is_selected){
				select.selectover({element: select.element})
				select._is_selected = true;
			}
			if(ef){
				select.selectmove({element: select.element});
			}
			if(!ef && select._is_selected){
				select._is_selected = false;
				select.selectout({element: select.element})
			}
		}
		//need to cal

		//drop = MVC.Selectables.findDeepestChild(affected);
		
        
		//if we've activated something, but it is not this drop, deactivate (dropout)
		//if(this.last_active && this.last_active != drop) 
		//    this.deactivate(this.last_active, drag, event);
		
		//if we have something, dropover it
		//if (drop && drop != this.last_active) 
		//  this.activate(drop, drag, event);
		
        //if(drop && this.last_active){
        //  this.dropmove(drop, drag, event);
        //}
	},
	/**
	 * Called on mouse up of a dragged element.
	 * @param {Object} event
	 * @param {Object} element
	 */
	fire: function(event, lasso) {
		//if(!this.last_active) return;
		MVC.Position.prepare();
		for(var d =0 ; d < this.selectables.length; d++ ){
			var select = this.selectables[d]
		    var ef = MVC.Selectables.isAffected(lasso, this.selectables[d])
			if(ef){
				select.selected({element: select.element, event: event});
			}
		}
	},
	/**
	* Called when the user first starts to drag.  Uses query to get
	* all possible droppable elements and adds them.
	*/
	compile : function(){
	  var elements = [];
	  for(var selector in MVC.Selectables.selectors){
	      var sels = elements.concat( MVC.Query(selector) )
	      for(var e= 0; e < sels.length; e++){
	          MVC.Selectables.add(sels[e], MVC.Selectables.selectors[selector])
	      }
	  }
	},
	/**
	* Called after dragging has stopped.
	*/
	clear : function(){
	  this.selectables = [];
	}
};