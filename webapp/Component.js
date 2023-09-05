sap.ui.define(
["sap/ui/core/UIComponent"],
function(UIComponent){
 return UIComponent.extend("nim.kmbs.cto.Component",{
   metadata: {
       manifest: "json"
   },
   init: function(){
    UIComponent.prototype.init.apply(this);
    var oRouter = this.getRouter();
    oRouter.initialize();
   },
   destroy: function(){

   }
//View Objects will be created/instantiated using the Router    
//    createContent: function(){
//    //1.Create the object for App View(Root view) 
//    var oAppView = new sap.ui.view("idAppView",{
//           viewName:"nim.kmbs.cto.view.App",
//           type:"XML" 
//    }); 

//    var oMasterView = new sap.ui.view("idMasterView",{
//           viewName:"nim.kmbs.cto.view.View1",
//           type:"XML" 
//    }); 

//    var oDetailView = new sap.ui.view("idDetailView",{
//           viewName:"nim.kmbs.cto.view.View2",
//           type:"XML" 
//    }); 

//     //Get the object of splitapp control and add Master and Detail pages
//     var oSplitApp = oAppView.byId("idSplitApp"); 
//     oSplitApp.addMasterPage(oMasterView);  
//     oSplitApp.addDetailPage(oDetailView);

//     return oAppView;
//    }
 });
}
);