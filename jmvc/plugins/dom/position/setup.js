/**
 * @class MVC.Position
 * Provides helper functions that let you know if a coordinate is within an X,Y value
 */
MVC.Position = 
/* @Static*/
{
  /**
   * Needs to be called once before any calculations are made, but after
   * all CSS has been applied.  Sets deltaX and deltaY
   * @return {Boolean} true if scrolling hasn't been changed
   */
  prepare: function() {
    var oldx = this.deltaX, oldy = this.deltaY;
	this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
	this._static = ((oldx - this.deltaX)==0) && ((oldy - this.deltaY) == 0);
	return this._static;
  },
  /**
   * Returns if a coordinate is within another element.
   * caches x/y coordinate pair to use with overlap
   * @param {HTMLElement} element
   * @param {Number} x
   * @param {Number} y
   * @return {Boolean} true if x, y is inside the element, false if otherwise.
   */
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = MVC.Element.offset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },
  /**
   * Returns if a coordinate is within an element taking scrolling into account.
   * @param {HTMLElement} element
   * @param {Number} x
   * @param {Number} y
   * @param {Object} cache If present, an object that will be used to cache position lookups
   * @return {Boolean} true if x, y is inside the element, false if otherwise.
   */
  withinIncludingScrolloffsets: function(element, x, y, cache) {
  	cache = cache || {};
	var caching = 	this._static && 
					cache._cache && 
					cache._cumulative_scroll_offset && 
					cache._cumulative_offset;
	if(!caching){
		cache._cumulative_scroll_offset = MVC.Element.scroll_offset(element);
		cache._cumulative_offset = MVC.Element.offset(element);
	}
	
    var xcomp = x + cache._cumulative_scroll_offset[0] - this.deltaX;
    var ycomp = y + cache._cumulative_scroll_offset[1] - this.deltaY;
	
	

    return this.within_box(xcomp, ycomp, 
		cache._cumulative_offset[0],cache._cumulative_offset[1],
		element.offsetWidth,  element.offsetHeight )
  },
  withinBoxIncludingScrollingOffsets : function(element, left, top, width, height, cache){
  	cache = cache || {};
	var caching = 	this._static && 
					cache._cache && 
					cache._cumulative_scroll_offset && 
					cache._cumulative_offset;
	if(!caching){
		cache._cumulative_scroll_offset = MVC.Element.scroll_offset(element);
		cache._cumulative_offset = MVC.Element.offset(element);
	}
	
	//get element coords
	var ex = cache._cumulative_offset[0];
	var ey = cache._cumulative_offset[1];
	
	var ew = element.clientWidth, eh = element.clientHeight;
	
    //var xcomp = x + cache._cumulative_scroll_offset[0] - this.deltaX;
    //var ycomp = y + cache._cumulative_scroll_offset[1] - this.deltaY;
	//console.log("- the top of box A lies below the bottom of box B "+(ey > top+height))
	//console.log("- the bottom of box A lies above the top of box B "+(ey+eh < top))
	//console.log("- the left edge of A lies to the right of B's right edge "+(ex > left+width ) )
	//console.log("- the right edge of A lies to the left of B's left edge "+(ex+ew < left) )
	
	
	return !( (ey > top+height) || (ey+eh < top) || (ex > left+width ) || (ex+ew < left));

  },
  within_box : function(x, y, left, top, width, height ){
	return (y >= top &&
            y <  top + height &&
            x >= left &&
            x <  left + width)
  },
  event_position_relative_to_element : function(element, event, cache){
      cache = cache || {};
      var caching = 	this._static && 
    					cache._cache && 
    					cache._cumulative_scroll_offset && 
    					cache._cumulative_offset;
     if(!caching){
		cache._cumulative_scroll_offset = MVC.Element.scroll_offset(element);
		cache._cumulative_offset = MVC.Element.offset(element);
	 }
     var point = MVC.Event.pointer(event);
     var xcomp = point.x() + cache._cumulative_scroll_offset[0] - this.deltaX;
     var ycomp = point.y() + cache._cumulative_scroll_offset[1] - this.deltaY;
     
     return new MVC.Vector(xcomp -cache._cumulative_offset[0] , ycomp - cache._cumulative_offset[1]);
  },
  window_dimensions: function(){
         var de = document.documentElement, 
             st = window.pageYOffset ? window.pageYOffset : de.scrollTop,
             sl = window.pageXOffset ? window.pageXOffset : de.scrollLeft;
         
         var wh = window.innerHeight ? window.innerHeight : de.clientHeight, 
             ww = window.innerWidth ? window.innerWidth :de.clientWidth;
         if(wh == 0){
             wh = document.body.clientHeight;
             ww = document.body.clientWidth;
         }
         return {
             window_height: wh,
             window_width: ww,
             document_height: MVC.Browser.IE ? document.body.offsetHeight : de.offsetHeight,
             document_width: MVC.Browser.IE ? document.body.offsetWidth :de.offsetWidth,
             scroll_left: sl,
             scroll_top: st,
             window_right: sl+ ww,
             window_bottom: st+ wh
         }
    },
    // Compare Position - MIT Licensed, John Resig
    /**
     * Compares the position of two nodes and returns at bitmask detailing how they are positioned 
     * relative to each other.  You can expect it to return the same results as 
     * [http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition | compareDocumentPosition].
     * Parts of this documentation and source come from [http://ejohn.org/blog/comparing-document-position | John Resig].
     * @param {Object} a the first node
     * @param {Object} b the second node
     * @return {Number} A bitmap with the following digit values:
     * <table class='options'>
     *     <tr><th>Bits</th><th>Number</th><th>Meaning</th></tr>
     *     <tr><td>000000</td><td>0</td><td>Elements are identical.</td></tr>
     *     <tr><td>000001</td><td>1</td><td>The nodes are in different documents (or one is outside of a document).</td></tr>
     *     <tr><td>000010</td><td>2</td><td>Node B precedes Node A.</td></tr>
     *     <tr><td>000100</td><td>4</td><td>Node A precedes Node B.</td></tr>
     *     <tr><td>001000</td><td>4</td><td>Node B contains Node A.</td></tr>
     *     <tr><td>010000</td><td>16</td><td>Node A contains Node B.</td></tr>
     *     </tr>
     * </table>
     */
    compare: function(a, b){
        if(a.compareDocumentPosition){
            return a.compareDocumentPosition(b)
        }else if(a.contains){
            
        }
        var number = (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8);
        if(a.sourceIndex){
            number += (a.sourceIndex < b.sourceIndex && 4)
            number += (a.sourceIndex > b.sourceIndex && 2)
        }else{
            range = document.createRange();
            range.selectNode(a);
            sourceRange = document.createRange();
            sourceRange.selectNode(b);
            compare = range.compareBoundaryPoints(Range.START_TO_START, sourceRange);
            number += (compare == -1 && 4)
            number += (compare == 1 && 2)
        }
        return number;
    }
}





	

