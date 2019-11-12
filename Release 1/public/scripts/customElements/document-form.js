// lookups for statuses/types doing it this way means we dont have to store/transfer the big strings

const taskStatus = {
	"UNAPPROVED": 0,
	"ACTIVE": 1,
	"COMPLETE": 2
}
const teamType = {
	"HORIZONTAL":0,
	"VERTICAL":1
}


// base team used on creating a new team to create the form
const team = {
//	"timestamp" : "",
//	"owner": "",
	"team-type": teamType.HORIZONTAL,
	"name": "",
	"description": "",
}

const task = {
	"name": "",
	"description": "",
}


// collection to location the base object types
const newObjectLookup = {"team":team, "task":task}

// all lookups to link data options with field name
const selectLookup = {"team-type":teamType}


// base document for knows how to create an ok button and how to generate data from form fields
class documentForm extends HTMLElement{
  constructor() {
    super();
	this._submitHandler = this._submitHandler.bind(this);
	  this._cancelHandler = this._cancelHandler.bind(this);
	this.currentDocument;
	this.isEditMode;
  }
	// every form will most likely have an ok button
	initBaseForm(){
		const formTemplate = `				
				<div class="fullscreen-popup">
					<div class="modal">
										<div class="content">
						<h3 class="form-header">
													Unamed Document
												</h3>
												<form class="document-form"><fieldset class="form-data"></fieldset><input type="submit" value="OK"><input type="button" class="cancel-form" value="Cancel"></form>
												</div>
					</div>
				</div>
											`;

		this.hidden = true;
		// dont do it like this maybe? potential dom lag
		this.innerHTML = formTemplate;
		// find the UL containing the nofications
		this.formElem = this.querySelector(".document-form");
		this.formDataElem = this.querySelector(".form-data");
		this.formHeader = this.querySelector(".form-header");
		this.formElem.addEventListener("submit", this._submitHandler);
		this.querySelector(".cancel-form").addEventListener("click", this._cancelHandler);
	}

  // not overriden base functionality of the form submit
	// document validations should be performed on a per type basis
  _submitHandler(ev){
	 ev.preventDefault();
	 if(this.isValid()){
		 this.submitChanges();
	 }

  }
	_cancelHandler(){
		this.closeForm();
	}
  // virtual method for overriding to check clientside whether the data is valid
	// could also contain any base validations common to all objects
  isValid(){ return true };
  
  // to be overriden does form submit action
  submitChanges(){
	this.populateObjectFromForm();
  }
  
  closeForm(){
  	this.hidden = true;
  }


  // breaks down form data into our new object
  // we submit that object to firebase
  populateObjectFromForm(){


	 let formChildren = this.formDataElem.elements;
	 let formChildrenCount = this.formDataElem.childElementCount;

	  // going through these manually to have control over elements that need ignoring
	 for(let i = 0; i < formChildrenCount; i++){

		let currentFormRow = formChildren[i];

		 let fieldName = currentFormRow.name;
		 let fieldValue = currentFormRow.value;
		 // we want to have control over the data passed into our object via forms
		 // should contain any different form type object and how i parse them
		 switch(currentFormRow.type){
			 case "text":
				 this.currentDocument[fieldName] =  fieldValue;
			 	break;
			 case "select-one":
				 this.currentDocument[fieldName] =  parseInt(fieldValue);
			 default:
		 }
	 }

  }
	// assign the object from the types list and trigger the relivant generation
	createNewForm(type){
		this.clearFormDataFields();
		let object = newObjectLookup[type];
		this.documentType = type;
		// this will be more than just the team form, we may be able to do this with the same function
		this.createNewTeamForm(object);
		this.currentDocument = object;
	}

	createFormFromExisting(type, object){
  		this.clearFormDataFields();
		this.documentType = type;
		// this will be more than just the team form, we may be able to do this with the same function
		// in this case we are passing in a populated object
		this.createNewTeamForm(object);
		this.currentDocument = object;
	}

	clearFormDataFields(){
		let formChildren = this.formDataElem.elements;
		let formChildrenCount = this.formDataElem.childElementCount;

		// going through these manually to have control over elements that need ignoring
		for(let i = 0; i < formChildrenCount; i++){
			let currentFormElement = formChildren[i]
			console.log(currentFormElement);
			this.formDataElem.parentElement.removeChild(currentFormElement)
		}
	}

	// create fields on the form to allow the user change specific values on the object
	createNewTeamForm(object){
		for(var fieldName in object){
			console.log(fieldName);
			switch(fieldName){
				case "name":
					this.createTextInputField(fieldName, object[fieldName]);
					break;
				case "description":
					this.createTextInputField(fieldName, object[fieldName]);
					break;
				case "team-type":
					this.createSelectField(fieldName, object[fieldName]);
					break;
				default:

			}
		}
	}



 	 // create text field for the user to input data
	createTextInputField(key, value){
  		// create the field and propulate with any data from the object
		let newTextField = document.createElement("input");
		newTextField.name = key;
		newTextField.type = "text";
		newTextField.value = value;
		newTextField.placeholder = key;
		this.formDataElem.appendChild(newTextField);
	}

	// create select for the user to input data
	createSelectField(key, value){

  		// set-up the select parent element
		let newSelectField = document.createElement("select");
		newSelectField.name = key;
		newSelectField.value = value;

		// get the lookup values from our list of lookups
		let selectOptionsJson = selectLookup[key];

		// make an option field for each
		for(let option in selectOptionsJson){
			let optionElem = this.createOption(option, selectOptionsJson[option])
			newSelectField.appendChild(optionElem);
		}

		this.formDataElem.appendChild(newSelectField);
	}
	
	
	createOption(key, value){
  		let newOption = document.createElement("option");
		newOption.value = value;
		newOption.innerHTML = key;
  		return newOption;
	};

}



class newDocumentForm extends documentForm{
	  constructor() {
		super();
	  }
	
	connectedCallback() {
		this.initBaseForm();
	}
	
	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['obj-type'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		let type = this.getAttribute("obj-type");
		this.formHeader.innerHTML = "create new" + type;
		this.createNewForm(type);
	}
	


	
	// override of the submit changes, different actions for creating differnt objects
	submitChanges(){
		this.populateObjectFromForm();

		switch(this.documentType){
			case "team":
				this.createNewTeam();
				break;
			case "task":
				break;
			default:

		}
		this.closeForm();
	}

	isValid() {
		return super.isValid();
	}
	
	// create team on server, use the current users as the owner and add this to the collection under the user
	createNewTeam(){

		let userId = getUserId();
		firebase.firestore().collection("teams").add({
			"owner": userId,
			"name": this.currentDocument.name,
			"description": this.currentDocument.description,
			"team-type": this.currentDocument["team-type"]
		}).then((docRef)=> {
				console.log(docRef);
			//	also create a reference to the team under the player
				firebase.firestore().collection("accounts/" + userId + "/users-teams").add({
				//name: this.currentDocument.name,
				"team-reference": docRef
			})
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});

	}

}




class changeDocumentForm extends documentForm{
	constructor() {
		super();
	}

	connectedCallback() {
		this.initBaseForm();
	}

	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['document-target', 'obj-type'];
	}

	// intiate document grab when we change the location reference
	attributeChangedCallback(name, oldValue, newValue) {
		let type = this.getAttribute("obj-type");
		let target = this.getAttribute("document-target");

		if(name == "document-target" && oldValue != newValue) {
			this.formHeader.innerHTML = "changing document";
			this.documentReference = firebase.firestore().doc(target);
			this.documentReference.get().then((doc) => {
				if (doc.exists) {
					this.createFormFromExisting(type, doc.data());
				} else {
					// doc.data() will be undefined in this case
					console.log("No such document!");
				}

			})
		}
	}

	isValid() {
		return super.isValid();
	}

	submitChanges(){
		console.log(this.currentDocument)
		this.populateObjectFromForm();
		let change = this.documentReference.set(
			this.currentDocument
		, { merge: true });

		this.closeForm();
	}


}


window.customElements.define('document-form', newDocumentForm);
window.customElements.define('change-document-form', changeDocumentForm);