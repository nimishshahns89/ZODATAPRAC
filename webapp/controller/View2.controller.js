sap.ui.define(
    ["nim/kmbs/cto/controller/BaseController",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageBox",
        "sap/m/MessageToast"],
    function (oController, Filter, FilterOperator, MessageBox, MessageToast) {
        return oController.extend("nim.kmbs.cto.controller.View2", {
            onInit: function () {
                //Get the router object from Component.js
                this.oRouter = this.getOwnerComponent().getRouter();
                //***herculis method will be called everytime the ENDPOINT changes in the URL

                //Problem here is all the list items have the same endpoint, hence while using the 
                // router navTo method in View1.controller we need to  attach an list index to the 
                // pattern to make it unique every time a different list item is selected 
                this.oRouter.attachRoutePatternMatched(this.herculis, this);
            },
            herculis: function (oEvent) {
            	debugger;
                var fruitIndex = oEvent.getParameter("arguments").FruitId;
                var sPath = "/" + fruitIndex;
               
                //Element Binding
                //this.getView().byId("ObjHeader").bindElement(sPath);
                //We are binding the absolute path to the entire view "Detail Pages", so that it can be used in all controls     
                this.getView().bindElement({
                	path: sPath,
                	parameters:{
                		expand: 'To_Supplier'
                	}
                });
                
                //Separte binding for the images to be displayed in one of the sections
                //"/sap/opu/odata/sap/ZGWP_ALS_PRODUCTS_SRV/ETS_PRODHEADER('HT-1007')/$value"
                var oComponent = this.getOwnerComponent();
                var sContext = oComponent.getManifestObject().getEntry("/sap.app").dataSources.ZGWP_ALS_PRODUCTS_SRV.uri +
                               fruitIndex +
                               "/$value"
                this.getView().byId("idMyImage").setSrc(sContext);
                	
            },
            hide: false,
            onHide: function (oEvent) {
                var oTable = this.getView().byId("suppliertable");
                var aColumns = oTable.getColumns();
                if (this.hide === false) {
                    //Make the Country column disabled
                    aColumns[2].setVisible(false);
                    oEvent.getSource().setText("Show Column");
                    this.hide = true;
                }
                else {
                    //Make the Country column enabled
                    aColumns[2].setVisible(true);
                    oEvent.getSource().setText("Hide Column");
                    this.hide = false;

                }
            },
            //Do not always create the fragment object again and again, if the user closes and opens the same popup  
            oSuppPopup: null,
            onFilter: function () {
                //  You have been asked to implement a popup which displays all the list of suppliers 
                //  on click of the filter button on the Supplier section header. Also we want to enable F4 help for the input fields 
                //  inside the table, and on click of F4, we want to open a popup showing all the cities.

                //Step1.Create a brand new fragment object
                //this.oSuppPopup is your remote control of the fragment, using this you can use any property
                // SelectDialog Control
                if (!this.oSuppPopup) {
                    this.oSuppPopup = new sap.ui.xmlfragment("idSuppFrag",
                        "nim.kmbs.cto.fragments.popup", this);

                    //Even after data binding is done correctly, Step2 will not work and data will not be displayed
                    //This is because fragment is a child of the view, and it does not have access to the model directly
                    //So you need to add fragment object as a dependent of the view object
                    //So that all the resources of the Views(models) can be accessed by Fragments as well 
                    this.getView().addDependent(this.oSuppPopup);
                    //Step2.The fragment will return a SelectDialog object, we will use the same to set the title and 
                    //bind it with data
                    this.oSuppPopup.setTitle("Cities");
                    this.oSuppPopup.bindAggregation("items", {
                        path: '/cities',
                        template: new sap.m.DisplayListItem({
                            label: "{cityname}",
                            value: "{famous}"
                        })
                    });
                } else {
                    this.oSuppPopup.getBinding("items").filter([]);
                }
                //Step3.Open the fragment
                this.oSuppPopup.open();

            },

            onCityPopup: null,
            onF4click: null,
            onF4: function (oEvent) {
                //This statement is to capture the Input field on which F4 help button was clicked
                //and pass it to other methods through a global variable   
                this.onF4click = oEvent.getSource();

                if (!this.onCityPopup) {
                    //1.Create a brand new fragment object
                    // "onConfirm" event coded in the View2 controller will not be triggered initially, since the
                    //fragment does not know where the event is placed
                    //To handle this issue, we need to pass the controller object(this) while instantiating
                    // the fragment in View2 controller

                    this.onCityPopup = new sap.ui.xmlfragment("idCityFrag", "nim.kmbs.cto.fragments.popup", this);
                    this.getView().addDependent(this.onCityPopup);
                    //Override the property set in the fragment 
                    this.onCityPopup.setMultiSelect(false);

                    //2.This object can be used to bind data
                    // this.onCityPopup.setTitle("Cities");
                    // EXTRA STEPS to display i18n title
                    var oResourceModel = this.getOwnerComponent().getModel("i18n");
                    var sText = oResourceModel.getResourceBundle().getText("XTIT_CITY");
                    this.onCityPopup.setTitle(sText);

                    this.onCityPopup.bindAggregation("items", {
                        path: '/cities',
                        template: new sap.m.DisplayListItem({
                            label: "{cityname}",
                            value: "{famous}"
                        })
                    });
                } else {
                    this.onCityPopup.getBinding("items").filter([]);
                }

                //3. Open the fragment
                this.onCityPopup.open();
            },

            onConfirm: function (oEvent) {
                //"idSuppFrag--idDialog" 
                var oFragId = oEvent.getSource().getId();
                //Since the SelectDialog event onConfirm will trigger from multiple popups, we need to
                //identify the correct event based on id.  
                if (this.isSupplierPopup(oFragId)) {
                    //Requirement - Filter the table based on the cities selected in the popup  
                    //1.Get selected items from the popup
                    var oSelectedItems = oEvent.getParameter("selectedItems");
                    //2.For each selected item we will build a filter object and push into one array
                    var aFilters = [];
                    for (let i = 0; i < oSelectedItems.length; i++) {
                        const element = oSelectedItems[i];
                        var CityName = element.getLabel();
                        var oFilter = new Filter("city", FilterOperator.EQ, CityName);
                        aFilters.push(oFilter);
                    }
                    //3.Build a Main filter object with OR condition
                    var oMainFilter = new Filter({
                        filters: aFilters,
                        and: false
                    });
                    //4.Get the table binding and inject the filter
                    var oTableBinding = this.getView().byId("suppliertable").getBinding("items");
                    oTableBinding.filter([oMainFilter]);
                }
                else {
                    //Requirement- Set the value selected in the Popup to the table input field 
                    //1.We need to know which item was selected by user   
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    var oCityName = oSelectedItem.getLabel();
                    //2.This city name we need to set as the input field, but how will we know on which input field
                    //F4 help button was clicked. Source of the F4 click is captured in other event and set as 
                    //global variable 
                    this.onF4click.setValue(oCityName);
                    console.log(oSelectedItem);
                }
            },

            onPopupSearch: function (oEvent) {
                var oFragId = oEvent.getSource().getId();
                var oSearchText = oEvent.getParameter("value");
                var oFilter1 = new Filter("cityname", FilterOperator.Contains, oSearchText);
                var oFilter2 = new Filter("famous", FilterOperator.Contains, oSearchText);
                var oFilterMain = new Filter({
                    filters: [oFilter1, oFilter2],
                    and: false
                });
                if (this.isSupplierPopup(oFragId)) {
                    //Get the binding for Filter Popup
                    var oListItems = this.oSuppPopup.getBinding("items");
                    oListItems.filter([oFilterMain]);
                } else {
                    //Get the binding for F4 Popup
                    var oListItems = this.onCityPopup.getBinding("items");
                    oListItems.filter([oFilterMain]);
                }
            },

            isSupplierPopup: function (id) {
                //"idSuppFrag--idDialog"
                if (id.indexOf("idSuppFrag") != -1) {
                    return true;
                } else {
                    return false;
                }
            },

            onCancel: function () {
                //Clear the filter on table
                this.getView().byId("suppliertable").getBinding("items").filter([]);
            },

            onSave: function () {
                MessageBox.confirm("Do you want to SAVE your order?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					MessageToast.show("Action selected: " + sAction);
				}
			});

            },
            onBack: function(){
            	window.history.go(-1);
            },
            onDelete: function(){
            //1.We need to know which Product is currently selected/opened by the user --> /ETS_PRODHEADER('HT-1001')
             //before replace --> "toDetail/ETS_PRODHEADER('HT-1003')"
             //after replace --> "/ETS_PRODHEADER('HT-1003')"
             var sContext = this.oRouter.getHashChanger().getHash().replace("toDetail","");
             //2.Get the object of OData model
             var oDataModel = this.getView().getModel();
             //3.Pass the context of the Product which is selected to the oData delete call
             oDataModel.remove(sContext,{
             	success: function(data){
             	 MessageToast.show("Product deleted successfully");	
             	},
             	error: function(oError){
             		//Instead of hardcoding the error message on UI, get the return messages passed from BAPI 
                	//Here we are reading just one message
                	var oErrorMsg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
                	MessageBox.error(oErrorMsg);
             	}
             });	
            }

        });
    }
);