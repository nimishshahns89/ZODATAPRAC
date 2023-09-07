sap.ui.define(
	["nim/kmbs/cto/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast"],
	function(oController,MessageBox,MessageToast) {
		return oController.extend("nim.kmbs.cto.controller.View1", {
			onInit: function() {
				//Controller does not have the Router Object required for navigation
				//Only the Component.js file has it
				//NPS Change1 from ZODATAPRAC Project 
				//NPS Change2 from ZODATAPRAC Project
				//NPS Change3 from 10ODATAMASTEDET 
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.attachRoutePatternMatched(this.herculis, this);
			},
			herculis: function(oEvent) {
				//Code here is loaded only after UI5 is loaded, and route is matched.
				
				//1.Problem statement - Using the back and forth button, selected item in the List Control
				//is not changing
				//2. External CSS is not getting applied since the application load time is slow and the custom styling is getting overwritten
				setTimeout(function(){
				 $(".sapMBtn").css("background-color","yellow");	
				}, 3000);
			},
			onSearch: function(oEvent) {
				var sText = oEvent.getSource().getValue();
				var oList = this.getView().byId("idFruitsList");
				var oBinding = oList.getBinding("items");
				if (sText.indexOf("-") !== -1) {
                //Do a manual read call for the Searched string and pass the path through routing
                //Take this approach only if needed
                var sPath = "/ETS_PRODHEADER('" + sText + "')";
                //Step 1. We need to get the OData Model Object (Default Model)
                var oDataModel = this.getView().getModel();
                var that = this;
                //Step 2. Make a read call on the object - This statement triggers a manual GET call with the path 
                oDataModel.read(sPath,{
                	success: function(data){
                		// alert('Maza aavi gayo');
                		that.oRouter.navTo("detail",{
                			FruitId: "ETS_PRODHEADER('" + sText + "')"
                		});
                		MessageToast.show('Search is successfull');
                	},
                	error: function(oError){
                		//Instead of hardcoding the error message on UI, get the return messages passed from BAPI 
                		//Here we are reading just one message
                		var oErrorMsg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                		MessageBox.error(oErrorMsg);
                	}
                });
				} else {
					//Prepare Filter
					var oFilter1 = new sap.ui.model.Filter("Category", sap.ui.model.FilterOperator.Contains, sText);
					//var oFilter2 = new sap.ui.model.Filter("ProductId",sap.ui.model.FilterOperator.Contains,sText); 
					//var oFilterFinal = new sap.ui.model.Filter({
					//    filters: [oFilter1,oFilter2],
					//    and: false
					//}); 
					//oBinding.filter([oFilterFinal]);
					oBinding.filter([oFilter1]);
				}
			},
			
			//Get most expensive Product, for the Category entered in the Search field 
			onExpensive:function(){
			//1.Get the object of oData model
			//2.Query the "CallFunction" method of oData v2 to call the Function Import
			var oODataModel = this.getView().getModel();
			var that = this;
			oODataModel.callFunction("/GetMostExpensiveProduct",{
			  urlParameters: {
			  	Category : this.getView().byId("idSearch").getValue()
			  },
			  success: function(data){
			  	var expProductId = data.ProductId;
			  	that.oRouter.navTo("detail",{
			  		FruitId: "ETS_PRODHEADER('" + expProductId + "')"
			  	});
			  },
			  error: function(oError){} 
			});
			},

			onSelect: function(oEvent) {
				// Working code - when view objects were defined in createContent() method of Component.js
				//Commented while learning Routing concept
				//After removing the Parent Control concept, now we cannot access the View2(oDetailPage) object
				//inside the view1 controller, since the Router is creating view objects now at runtime
				//on click on List items 

				//  var selectedItem = oEvent.getParameter("listItem");
				//  var sPath = selectedItem.getBindingContextPath();
				//  var oSAppCont = this.getView().getParent().getParent();
				//  var oDetailPage = oSAppCont.getDetailPages()[0];
				//  var oPageControl = oDetailPage.getContent()[0];
				//  var oObjectHdr = oPageControl.getContent()[0];
				//  oObjectHdr.bindElement(sPath);

				//Using Router concept and route name "detail", display details of selected item in 
				//the details page- no need to use Container Control for navigation
				//Problem here is all the list items have the same endpoint, hence we need to 
				//attach an list index to the pattern to make it unique every time a different list item 
				// is selected
				//  "pattern":"toDetail/{FruitId}",

				var selectedItem = oEvent.getParameter("listItem");
				var sPath = selectedItem.getBindingContextPath();  // sPath : "/fruits/3", "/ETS_PRODHEADER('HT-1002')"
				var sIndex = sPath.split("/")[sPath.split("/").length - 1]; // ["", "fruits", "3"]
				this.oRouter.navTo("detail", {
					FruitId: sIndex
				});
				// We are passing only index to the View2 controller to make the URL unique, since passing
				// the entire path would cause a dump 
				// #/toDetail/0
				// #/toDetail/2
				// #/toDetail/4

			},

			onAddView: function() {
				this.oRouter.navTo("addView");
			}

		});
	}
);