var suitecrmanalytics = {}


suitecrmanalytics.objs = {
        
    projectName:"SuiteCRM",
	projectRootDir:"suitecrm"
        
}

suitecrmanalytics.functions = {
    
    initSuiteCRMAnalytics:function(properties){
        Dashboards.log("Initialising SuiteCRM Analytics");

        // Get Recents Data
        recentsDataArray = this.getRecents();

        var now = new Date().getTime();
        var solutionPath = Dashboards.context.path;
        var solutionFilenameArray = Dashboards.context.path.split("/");
        var solutionFilename = solutionFilenameArray[solutionFilenameArray.length-1];

        var newSolutionObject = {
            fullPath: solutionPath,
            lastUse: now,
            title: solutionFilename
        }

        // Add solution to recents
        this.setRecents(recentsDataArray,newSolutionObject)

        // Generate Recents menu
        this.generateRecentsMenu(recentsDataArray);

        // Admin check
        if(this.adminCheck() && properties.pageID !== "home"){

            var editURL = window.location.href.slice(0,window.location.href.length-33)+"/edit";
            //$('.content-header').append("<a href='"+editURL+"' target='_blank'>Edit</a>");
        }

        this.getSolutions("Dashboards");
        this.getSolutions("Reports");

        // Set the dashboard title
        $('.content-header h1').html(properties.pageTitle+" <small>"+properties.pageSubtitle+"</small>");
        $('#sidebar-username').html(Dashboards.context.user);
        $('title').html('SuiteCRM Analytics | '+properties.pageTitle);

        // Generate breadcrumb
        var pageBreadcrumbHTML ='<li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>';

        if(properties.pageBreadcrumb.length !== 0){
            $.each(properties.pageBreadcrumb, function(i,v){
                pageBreadcrumbHTML += "<li>"+v+"</li>";
            });
        }

        $('#page-breadcrumb').html(pageBreadcrumbHTML);

        // Expand menu items
        switch(properties.pageSection){
            case "dashboards":
                $('#dashboards-list').addClass('menu-open');
                $('#dashboards-list').css('display','block');
            break;

            case "reports":
                $('#reports-list').addClass('menu-open');
                $('#reports-list').css('display','block');
            break;
        }
    },

    adminCheck:function(){
        
        if($.inArray("Administrator",Dashboards.context.roles) !== -1 ){
            return true;
        }

    },

    getSolutions:function(folder){

        var extension = folder === "Dashboards" ? "wcdf" : "prpt";

        $.get( window.location.protocol+"//"+window.location.host+"/suitecrmanalytics/api/repo/files/:public:SuiteCRM%20Analytics:"+folder+"/children?showHidden=false&filter=*."+extension, function( data ) {
            $(data).find("repositoryFileDto").each(function(index, value){
                //console.log(value);
            });
        })
    },

    reRenderCCC:function(){ 
        for(var z = 0; z < Dashboards.components.length; z++){
            if(Dashboards.components[z].type.indexOf("ccc")!=-1 && Dashboards.components[z].chart != null){
                Dashboards.components[z].chart.options.width=$("#"+Dashboards.components[z].htmlObject).width();
                Dashboards.components[z].chart.render(true,true,false);
            }
        }
    },

    getRecents:function(){
        // Get existing favourites array
        var dat = {};
        var parsedData;
        var url = window.location.protocol + '//' + window.location.host + '/suitecrmanalytics/api/user-settings/recent';
    
        $.get(url, dat, function(recentsData) {
    
            if(recentsData !== "" || recentsData){
                parsedData = recentsData;
            }
    
        });
    
        return parsedData;
    },

    setRecents:function(existingRecentsArray,newSolutionObject){

        if(newSolutionObject.title !== "main.wcdf" || newSolutionObject.title !== "settings.wcdf" || newSolutionObject.title !== "help.wcdf"){
            var recentExists = 0;
            var recentExistsPosition = 0;

            $.each(existingRecentsArray, function(i, v) {
                if (existingRecentsArray[i].fullPath === newSolutionObject.fullPath) {
                    recentExists = 1;
                    recentExistsPosition = i;
                }
            });     

            if (recentExists === 1) { 
                // Remove existing recent
                existingRecentsArray.splice(recentExistsPosition, 1);

                // Add new recent to the end of the array
                existingRecentsArray.splice(0,0,newSolutionObject);

            } else {
                existingRecentsArray.splice(0,0,newSolutionObject);
            }

            $.ajax({
                url:window.location.protocol + '//' + window.location.host + '/suitecrmanalytics/api/user-settings/recent',
                type:"POST",
                data:JSON.stringify(existingRecentsArray),
                contentType:"text/plain; charset=utf-8",
                dataType:"json",
                success: function(){
                    
                }
            });
        }
    },

    generateRecentsMenu:function(recentsData){

        var recentsHTML = "";
        var contentGenURL = "";

        $.each(recentsData, function(i, v) {

            var solutionExtension = v.fullPath.substr((v.fullPath.lastIndexOf('.') + 1));

            switch (solutionExtension) {
                case 'wcdf':
                    contentGenURL = "/generatedContent";
                break;
                case 'prpt':
                    contentGenURL = "/viewer";
                break;
            }

            cleanTitle = "";

            switch (v.title) {
                case 'CasePerformanceDashboard.wcdf':
                    cleanTitle = "Case Performance";
                break;
                case 'LeadPerformanceDashboard.wcdf':
                    cleanTitle = "Lead Performance";
                break;
                case 'ReportDashboard.wcdf':
                    cleanTitle = "Report Sample";
                break;
                default:
                    cleanTitle = v.title;
            }

            var fileURL = "/suitecrmanalytics/api/repos/"+v.fullPath.replace(/\//g, "\:");
            fileURL += contentGenURL;

            //recentsHTML += '<li class="solutionButton" ><a href="' + fileURL + '"><i class="fa fa-circle-o"></i><span>' + v.title + '</span></a></li>';
            recentsHTML += '<li class="solutionButton" ><a href="' + fileURL + '"><i class="fa fa-circle-o"></i><span>' + cleanTitle + '</span></a></li>'
        });

        $("#recents-list").html(recentsHTML);
    }
}