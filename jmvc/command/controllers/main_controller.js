MainController = MVC.Controller.extend('main',{
    load: function(params){
	    MVC.file_base = Mozilla.getCurrentPath();
	    this.files = Mozilla.getFileNames(MVC.file_base.replace(/\//g, "\\") + "\\apps");
		var res = new MVC.View({absolute_url: 'command/views/projects.ejs'}).render(this);
	    document.getElementById('projects').innerHTML = res;
    }
});