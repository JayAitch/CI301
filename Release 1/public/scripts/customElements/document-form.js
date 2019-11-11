const taskStatus = {
	"UNAPPROVED": "UNAPPROVED",
	"ACTIVE": "ACTIVE",
	"COMPLETE": "COMPLETE"
}
const teamType = {
	"HORIZONTAL":"HORIZONTAL",
	"VERTICAL":"VERTICAL"
}


// stubbed base team, currently not using team type properly as it hasnt got any relevance yet
const team = {
//	"timestamp" : "",
//	"owner": "",
	"team-type":teamType.HORIZONTAL,
	"name": "",
	"description": "",
}

// collection to location the base object types
const newObject = {"team":team}



// base document for knows how to create an ok button and how to generate data from form fields
class documentForm extends HTMLElement{
  constructor() {
    super();
	this._submitHandler = this._submitHandler.bind(this);
	this.currentDocument;
	this.isEditMode;
  }
  
  // not overriden base functionality of the form submit
  _submitHandler(ev){
	 ev.preventDefault();
	 if(this.isValid()){
		 this.submitChanges();
	 }

  }
  
  // virtual method for overriding to check clientside whether the data is valid
  isValid(){ return true };
  
  // to be overriden does form submit action
  submitChanges(){
	this.populateObjectFromForm();
  }
  
  
  // breaks down form data into our new object
  // we submit that object to firebase
  populateObjectFromForm(){
	 console.log("formChildren");
	 let formChildren = this.formElem.elements;
	 let formChildrenCount = this.formElem.childElementCount;		 
	 console.log(formChildren);
	 
	 for(let i = 0; i < formChildrenCount; i++){

		let currentFormRow = formChildren[i];
		if(currentFormRow.type !== "submit"){
			let fieldName = currentFormRow.name;
			let fieldValue = currentFormRow.value;
			this.currentDocument[fieldName] =  fieldValue
		}
		
	 }

  }
  
  connectedCallback() {
	this.initBaseForm();
  }
  
  // every form will most likely have an ok button
  initBaseForm(){
  	const formTemplate = `				<h3 class="form-header">
													Unamed Document
												</h3>
												<form class="document-form"><input type="submit" value="OK"></input></form>
												
											`;
	
	// dont do it like this maybe? potential dom lag
	this.innerHTML = formTemplate;
	// find the UL containing the nofications
	this.formElem = this.querySelector(".document-form");
	this.formHeader = this.querySelector(".form-header");
	this.formElem.addEventListener("submit", this._submitHandler);
  }
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
	
	// assign the object from our types list and trigger the relivant generation
	createNewForm(type){
		let object = newObject[type];	
		this.documentType = type;		
		this.createNewTeamForm(object);
		this.currentDocument = object;

	}
	
	
	// create fields on the form to change specific values on the object
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
					this.createSelectfield(fieldName, object[fieldName]);
					break;
				default:

			}
		}
	}
	
	//create a select field (need a good way to get this to generate values for us, we may then be able to store it server side as an int and interpret here)
	createSelectfield(key, value){
		let newTextField = document.createElement("select");
		newTextField.name = key;
		newTextField.value = value;
		this.formElem.appendChild(newTextField);
	}
	
	
	// create text field to input data
	createTextInputField(key, value){
		let newTextField = document.createElement("input");
		newTextField.name = key;
		newTextField.type = "text";
		newTextField.value = value;
		newTextField.placeholder = key;
		this.formElem.appendChild(newTextField);
	}
	
	
	
	// ovrride of the submit changes, different actions for creating differnt objects
	submitChanges(){
		this.populateObjectFromForm();

		switch(this.documentType){
			case "team":
				this.createNewTeam();
				break;
			case "description":
				break;
			default:

		}
	}
	
	
	// create team on server, use the current users as the owner and add this to the collection under the user
	createNewTeam(){
		let userId = getUserId();
		firebase.firestore().collection("teams").add({
			"owner": userId,
			"name": this.currentDocument.name,
			"description": this.currentDocument.description
		}).then((docRef)=> {
				console.log(docRef);
			//	also create a reference to the team under the player
				firebase.firestore().collection("accounts/" + userId + "/users-teams").add({
				name: this.currentDocument.name,
				"team-reference": docRef
			})
		})
		.catch(function(error) {
			console.error("Error adding document: ", error);
		});
		
	}

}

window.customElements.define('document-form', newDocumentForm);
