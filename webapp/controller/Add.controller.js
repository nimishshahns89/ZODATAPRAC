sap.ui.define(
	["nim/kmbs/cto/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox"
	],
	function(oBaseController, JSONModel, MessageToast, MessageBox) {
		oBaseController.extend("nim.kmbs.cto.controller.Add", {
			onInit: function() {
				//1.Create a local JSON Model with the same format as your create payload to ease your coding
				var oJSONModel = new JSONModel();
				//2. Set Product data - We will take Product Id, Name and Description from the User as input - hence keeping it blank
				oJSONModel.setData({
					"productData": {
						"ProductId": "",
						"TypeCode": "PR",
						"Category": "Notebooks",
						"Name": "",
						"Description": "",
						"SupplierId": "100000046",
						"SupplierName": "SAP",
						"Price": "956.0000",
						"CurrencyCode": "EUR"
					}
				});
				//3.Set the model to the view and name it as local - since the default model in manifest is already an oData model
				this.getView().setModel(oJSONModel, "local");
			},

			onSave: function() {
				//1.Get the object of OData Model
				var oDataModel = this.getView().getModel();
				//2.Fetch the data from screen which is actually binded to your local JSON model
				var payload = this.getView().getModel("local").getProperty("/productData");
				//3.Call the SAP OdData service to POST the data
				oDataModel.create("/ETS_PRODHEADER", payload, {
					success: function(data) {
						MessageToast.show("Product Created successfully");
					},
					error: function(oError) {
						//Instead of hardcoding the error message on UI, get the return messages passed from BAPI 
						//Here we are reading just one message
						var oErrorMsg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
						MessageBox.error(oErrorMsg);
					}
				});

			},

			onSuppIdPopup: null,
			onF4click: null,
			onValueHelp: function(oEvent) {
				//Capture the source of the field on which F4 was clicked so that we can set the selected item value to this field
				this.onF4click = oEvent.getSource();
				if (!this.onSuppIdPopup) {
					this.onSuppIdPopup = sap.ui.xmlfragment("idSuppIdPopup", "nim.kmbs.cto.fragments.popup", this);
					this.getView().addDependent(this.onSuppIdPopup);
				}
				this.onSuppIdPopup.setMultiSelect(false);
				this.onSuppIdPopup.setTitle("Suppliers");
				this.onSuppIdPopup.bindAggregation("items", {
					path: '/ETS_SUPPLIER',
					template: new sap.m.DisplayListItem({
						label: "{BpId}",
						value: "{CompanyName}"
					})
				});
				this.onSuppIdPopup.open();
			},

			onConfirm: function(oEvent) {
				//"idSuppFrag--idDialog" 
				var oFragId = oEvent.getSource().getId();
				//Since the SelectDialog event onConfirm will trigger from multiple popups, we need to
				//identify the correct event based on id.  
				if (oFragId.indexOf("idSuppIdPopup") !== -1) {
 					//Requirement- Set the value selected in the Popup to the table input field 
					//1.We need to know which item was selected by user   
					var oSelectedItem = oEvent.getParameter("selectedItem");
					var oSupplierId = oSelectedItem.getLabel();
					//2.This city name we need to set as the input field, but how will we know on which input field
					//F4 help button was clicked. Source of the F4 click is captured in other event and set as 
					//global variable 
					this.onF4click.setValue(oSupplierId);
				}
			}

		});
	});