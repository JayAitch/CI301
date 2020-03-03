// lookups for statuses/types doing it this way means we dont have to store/transfer the big strings
// consider changing these to form configuration to allow for ordering and validation rules

const taskStatus = {
	"Unapproved": "Unapproved",
	"Active": "Active",
	"Complete": "Complete"
}
const teamType = {
	"HORIZONTAL":0,
	"VERTICAL":1
}
const baseExperienceTypes = {
	"Strength":"Strength",
	"Intelligence":"Intelligence",
	"Endurance":"Endurance",
	"Agility":"Agility",
}





//team form configuration
const team = {
	'name': {
		'value': '',
		'field-properties': {
			'label-text': 'name',
			'validation': {
				required: true,
				min:3,
				max:25
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createTextInputField(key, value, parent, fieldProperties)
		},
	},
	'description': {
		'value': '',
		'field-properties': {
			'label-text': 'description',
			'help-text': 'select how your team creates and manages tasks.',
			'validation': {
				required: false,
				min:0,
				max:999
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createTextAreaField(key, value, parent, fieldProperties);
		},
	},
	'team-type': {
		'value': teamType.HORIZONTAL,
		'field-properties': {
			'label-text': 'team type',
			'help-text': 'select how your team creates and manages tasks.',
			'validation': {
				required: true
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createSelectField(key, value, parent, fieldProperties)
		}
	},
	'personalised-skills': {
		'value': '',
		'field-properties': {
			'label-text': 'team skills',
			'help-text': 'create skills to add to tasks.',
			'validation': {
				required: true
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createStringCollectionField(key, value, parent, fieldProperties)
		},
	},
}




// task form configuration
const task = {
	'name': {
		'value': '',
		'field-properties': {
			'label-text': 'name',
			'validation': {
				required: true,
				min:3,
				max:250
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createTextInputField(key, value, parent, fieldProperties)
		},
	},
	'description': {
		'value': '',
		'field-properties': {
			'label-text': 'description',
			'validation': {
				required: true,
				min:0,
				max:999
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createTextAreaField(key, value, parent, fieldProperties)
		},
	},
	'urgency': {
		'value': 1,
		'field-properties': {
			'label-text': 'urgency',
			'validation': {
				required: true,
				min:0,
				max:2
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createSliderInput(key, value, parent, fieldProperties)
		}
	},
	'importance': {
		'value': 1,
		'field-properties': {
			'label-text': 'importance',
			'validation': {
				required: true,
				min:0,
				max:2
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createSliderInput(key, value, parent, fieldProperties)
		}
	},
	'impact': {
		'value': 1,
		'field-properties': {
			'label-text': 'impact',
			'validation': {
				required: true,
				min:0,
				max:2
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createSliderInput(key, value, parent, fieldProperties)
		}
	},
	'requirements': {
		'value': 1,
		'field-properties': {
			'label-text': 'level requirements',
			'help-text': 'Levels required to complete tasks, set to 0 to add experience rewards without requirement.',
			'validation': {
				required: true
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createMapInputField(key, value, parent, fieldProperties)
		}
	},
	'deadline': {
		'value': new Date(),
		'field-properties': {
			'label-text': 'deadline',
			'validation': {
				required: true
			}
		},
		'construction': function (key, value, parent, fieldProperties) {
			createDateInputField(key, value, parent, fieldProperties)
		}
	}
}


// collection to location the base object types
const newObjectLookup = {"team":team, "task":task}

// all lookups to link data options with field name
const selectLookup = {"team-type":teamType, "requirements":baseExperienceTypes, "rewards": baseExperienceTypes}



function getExperienceTypes(){
	// copy the default experience types, for a pass by value, this would otherwise be a reference to the JSON
	let experienceTypes = JSON.parse(JSON.stringify(baseExperienceTypes)) ;

	// add any personalised skills defined on the team data this task is for
	let personalExperienceTypes = currentlyViewTeamData["personalised-skills"];
	for(experienceType in personalExperienceTypes){
		experienceTypes[experienceType] = experienceType;
	}
	return experienceTypes;
}



function createInputLabel(text,key, parent){

	if(text.length > 0){
		let newLabelField = document.createElement("label");
		newLabelField.setAttribute("for", key);
		newLabelField.className = "form-label";
		newLabelField.innerText = key;
		newLabelField.className = "form-row label";
		parent.appendChild(newLabelField);
	}

}

function createSliderInput(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);
	let newSliderField = document.createElement("input");
	newSliderField.name = key;
	newSliderField.type = "range";
	newSliderField.value = value;
	newSliderField.step = fieldConfig.step || 0.1
	newSliderField.min = fieldConfig.validation.min || 0;
	newSliderField.max = fieldConfig.validation.max || Infinity;
	newSliderField.placeholder = key;
	newSliderField.required = fieldConfig.validation.required || false;
	newSliderField.className = "form-row slider";

	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}



	let newSliderValueDisplay = document.createElement("div");
	newSliderValueDisplay.className = "form-row slider-text";
	newSliderValueDisplay.innerHTML = value;

	newSliderField.oninput = function(){
		newSliderValueDisplay.innerHTML = newSliderField.value;
	}

	parent.appendChild(newSliderField);
	parent.appendChild(newSliderValueDisplay);



	return newSliderField
}

function getLabelText(key, fieldConfig){
	let labelText = "";
	if(fieldConfig && fieldConfig["label-text"])
	{
		labelText = fieldConfig["label-text"];
	}
	return labelText;
}

function createNumberInput(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);
	// create the field and propulate with any data from the object
	let newNumberField = document.createElement("input");
	newNumberField.name = key;
	newNumberField.type = "number";
	newNumberField.value = value;
	newNumberField.placeholder = key;
	newNumberField.className = "form-row number";
	if(fieldConfig){
		newNumberField.required = fieldConfig.validation.required || false;
		newNumberField.min = fieldConfig.validation.min || 0;
		newNumberField.max = fieldConfig.validation.max || Infinity;
	}
	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	parent.appendChild(newNumberField);
	return newNumberField;
}

// create text field for the user to input data
function createTextInputField(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);

	// create the field and propulate with any data from the object
	let newTextField = document.createElement("input");
	newTextField.name = key;
	newTextField.type = "text";
	newTextField.value = value;
	newTextField.placeholder = key;
	newTextField.className = "form-row text";

	if(fieldConfig){
        newTextField.required = fieldConfig.validation.required || false;
        newTextField.minLength = fieldConfig.validation.min || 0;
        newTextField.maxLength = fieldConfig.validation.max || 999;
    }

	parent.appendChild(newTextField);


	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}


	return newTextField;
}

function createTextAreaField(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);

	// create the field and propulate with any data from the object
	let newTextField = document.createElement("textarea");
	newTextField.name = key;
	newTextField.value = value;
	newTextField.placeholder = key;
	newTextField.className = "form-row text";

	if(fieldConfig){
		newTextField.required = fieldConfig.validation.required || false;
		newTextField.minLength = fieldConfig.validation.min || 0;
		newTextField.maxLength = fieldConfig.validation.max || 999;
	}

	parent.appendChild(newTextField);


	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}


	return newTextField;
}


function createHelpTextRow(parent, text){
	let helpTextSpan = document.createElement("span");
	helpTextSpan.innerHTML = text;
	helpTextSpan.className = "form-row help-text";
	parent.appendChild(helpTextSpan);
}

function createDateInputField(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);
	let newDateField = document.createElement("input");
	let date = value;
	if(value.toDate) date = value.toDate();
	newDateField.name = key;
	newDateField.type = "date";
	newDateField.value =  convertToHTMLDate(date);
	newDateField.required = fieldConfig.validation.required || false;
	newDateField.className = "form-row date";

	parent.appendChild(newDateField);


	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	return newDateField
}



function createMultiSelect(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);
	// set-up the select parent element
	let newSelectField = document.createElement("select");
	newSelectField.name = key;
	newSelectField.value = value;
	newSelectField.multiple = true;
	newSelectField.required = fieldConfig.validation.required || false;
	// get the lookup values from our list of lookups
	let selectOptionsJson = selectLookup[key];
	newSelectField.className = "form-row multi-select";

	// make an option field for each
	for(let option in selectOptionsJson, fieldConfig){
		let optionElem = this.createOption(option, selectOptionsJson[option])
		newSelectField.appendChild(optionElem);

		if(value.hasOwnProperty(option)){
			optionElem.selected = true;
		}
	}

	parent.appendChild(newSelectField);

	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	return newSelectField;
}

// create select for the user to input data
function createSelectField(key, value, parent, fieldConfig){
	let labelText = getLabelText(key, fieldConfig);
	createInputLabel(labelText,key, parent);

	// set-up the select parent element
	let newSelectField = document.createElement("select");
	newSelectField.name = key;
	newSelectField.value = value;
	newSelectField.className = "form-row select";

	if(fieldConfig)	newSelectField.required = fieldConfig.validation.required || false;
	// get the lookup values from our list of lookups
	let selectOptionsJson


	// special case for requirements, allow team document to add experiences types to this list
	if(key === "requirements")
	{
		selectOptionsJson = getExperienceTypes();
	}
	else{
		selectOptionsJson = selectLookup[key];
	}


	// make an option field for each
	for(let option in selectOptionsJson){
		isSelected = false;
		if(option === value){
			isSelected = true;
		}
		let optionElem = this.createOption(option, selectOptionsJson[option], isSelected)
		newSelectField.appendChild(optionElem);
	}

	parent.appendChild(newSelectField);

	if(fieldConfig && fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	return newSelectField;
}


function createOption(key, value, isSelected){
	let newOption = document.createElement("option");
	newOption.value = value;
	newOption.innerHTML = key;
	if(isSelected) newOption.selected = true;
	return newOption;
}


function createMapInputField(mapkey, values, parent, fieldConfig){
	let labelText = getLabelText(mapkey, fieldConfig);
	createInputLabel(labelText,mapkey, parent);
	// create wrapper to remove input fields from the top level of this array
	let fieldMapWrapper = document.createElement("div");
	let addRowButton = document.createElement("button");
	addRowButton.innerHTML = "add " + mapkey;
	fieldMapWrapper.type = "select-value-map";
	fieldMapWrapper.name = mapkey;
	for(let key in values){
		let newSelectValueMap = document.createElement("select-value-map");
		let type = key;
		let amount = values[key]
		newSelectValueMap.setAttribute('select-lookup', mapkey);
		newSelectValueMap.setAttribute('selected-value', type);
		newSelectValueMap.setAttribute('value', amount);
		newSelectValueMap.className = "form-row select-map-wrapper";
		fieldMapWrapper.appendChild(newSelectValueMap);
	}

	if(fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	addRowButton.className = "select-map-btn";


	parent.appendChild(addRowButton);
	parent.appendChild(fieldMapWrapper);

	addRowButton.addEventListener("click", () => {
		event.preventDefault();
		let runTimeSelectMap = document.createElement("select-value-map");
		runTimeSelectMap.setAttribute('select-lookup', mapkey);
		runTimeSelectMap.setAttribute('selected-value', "Strength");
		runTimeSelectMap.setAttribute('value', "0");
		fieldMapWrapper.appendChild(runTimeSelectMap);
	});

	return fieldMapWrapper;
}

function createStringCollectionField(skey, values, parent, fieldConfig){
	let fieldMapWrapper = document.createElement("div");
	let addRowButton = document.createElement("button");

	let labelText = getLabelText(skey, fieldConfig);
	createInputLabel(labelText,skey, parent);


	addRowButton.innerHTML = "add " + skey;
	fieldMapWrapper.type = "string-collection";
	fieldMapWrapper.name = skey;

	for(let value in values){
		let newSelectValueMap = document.createElement("string-collection");

		let amount = value
		newSelectValueMap.setAttribute('key', skey);
		newSelectValueMap.setAttribute('value', amount);
		newSelectValueMap.className = "form-row select-map-wrapper";
		fieldMapWrapper.appendChild(newSelectValueMap);
	}

	if(fieldConfig["help-text"]){
		createHelpTextRow(parent,fieldConfig["help-text"]);
	}
	addRowButton.className = "form-row select-map-btn";

	parent.appendChild(addRowButton);
	parent.appendChild(fieldMapWrapper);

	addRowButton.addEventListener("click", () => {
		event.preventDefault();
		let runTimeSelectMap = document.createElement("string-collection");
		runTimeSelectMap.setAttribute('key', skey);
		runTimeSelectMap.setAttribute('value', "");
		runTimeSelectMap.className = "form-row select-map-wrapper";
		fieldMapWrapper.appendChild(runTimeSelectMap);
	});

	return fieldMapWrapper;
}








// basic form to create handlers and form data wrapper
class BasicForm extends HTMLElement{
	constructor() {
		super();
		this._submitHandler = this._submitHandler.bind(this);
		this._cancelHandler = this._cancelHandler.bind(this);
		this.currentDocument;
	}

	// create any elements required by the form
	connectedCallback() {
		this.initBaseForm();
	}


	// create template from extended classes and assign dom elements that will be modified by attribute changes
	initBaseForm(){
		const formTemplate = this.getFormTemplateHTML();
		// modal so dont show to begin with
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

	// the most basic form layout, the contents of form data will be populated when document targets are modified, this prevents the popup being re created and destroyed when its modified.
	getFormTemplateHTML(){
		return `				
				<div class="fullscreen-popup">
					<div class="modal">
						<div class="content">
							<h3 class="form-header">Unamed</h3>
							<form class="document-form"><fieldset class="form-data"></fieldset>
							<div class="form-controls-row">							
								<input type="submit" value="OK">
								<input type="button" class="cancel-form" value="Cancel"></form>
							</div>
						</div>
					</div>
				</div>
											`;
	}


	// not overriden base functionality of the form submit
	// document validations should be performed on a per type basis
	_submitHandler(ev){
		ev.preventDefault();
		if(this.isValid()){
			this.submitForm();
		}

	}
	// not overriden
	_cancelHandler(){
		this.closeForm();
	}

	// virtual method for overriding to check clientside whether the data is valid
	// could also contain any base validations common to all objects
	isValid(){ return true };

	// to be overriden does form submit action will be different for creating/modifying documents
	submitForm(){
	}

	// hide the form again
	closeForm(){
		this.hidden = true;
	}

}



// implementation of basic form, used to create invites through reading qr codes
class InviteForm extends BasicForm {
	connectedCallback() {
		// use supers version to create the basic form layout and fetch relivant dom elements
		super.connectedCallback();

		// from jarods sessions creates a listener chain to load qr data into the form
		$("#qr-input").change( (event) => {
			let files = event.target.files, file;
			if (files && files.length > 0) {
				file = files[0];
			}

			let image = new MegaPixImage(file);
			let reader = new FileReader();
			reader.onloadend =  () => {
				let exif = EXIF.readFromBinaryFile(new BinaryFile(reader.result));
				let scanDisplayElem = this.querySelector(".qr-scan-display")
				image.onrender = (target) =>{
					qrcode.callback = (data) => {
						this.querySelector(".invite-code-input").value = data;
					};
					qrcode.decode(target.src);
				};

				image.render(scanDisplayElem, {
					height: 200,
					orientation: exif.Orientation
				});
			};
			reader.readAsBinaryString(file);
		});
		this.inviteCodeInput = this.querySelector(".invite-code-input");
	}

	submitForm(){
		this._sendInvite();
	}

	// use the invite and team attribute changes to modify title display and team target of the form
	static get observedAttributes() {
		return ['team-invited', 'team-name'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if(name ==='team-invited'){
			this.teamTarget = newValue;
		} else if('team-name'){
			this.teamName = newValue;
			this.formHeader.innerHTML = "invite to: " + this.teamName
		} else{
			return;
		}
	}

	// own version of template html
	// this form will no change based on the document type so it can be static html
	getFormTemplateHTML(){
		return `<div class="fullscreen-popup">
					<div class="modal">
						<div class="content">
							<h3 class="form-header">Invite</h3>
							<form class="document-form">
								<fieldset class="form-data">
								<img class="qr-scan-display" class="media" src="">
									<label for="qr-input"><img src="something here instead of the browse"/></label><input hidden name="qr-input" id="qr-input" type="file" accept="image/*" capture="camera">
									<input type="text" minlength="28" maxlength="28" class="invite-code-input">
								</fieldset>
								<div class="form-controls-row">
								<input type="submit"  class="invite-form" value="Invite">
								<input type="button" class="cancel-form" value="Close"></form>
								</div>
						</div>
					</div>
				</div>`;
	}



	// create an invite notification for the target user
	// allows the user to accept the team invite as being part of pending invites will afford permissions
	_sendInvite(){

		let code = this.inviteCodeInput.value
		if(code.length != 28)
		{
			console.log("error, incorrect code entered");
			return;
		}

		let teamDocLocation = this.teamTarget;

		//https://firebase.google.com/docs/reference/node/firebase.firestore.FieldValue
		let addToPendingInvites = firebase.firestore().doc(teamDocLocation).set({
			"pending-invites": firebase.firestore.FieldValue.arrayUnion(code)
		}, { merge: true })




		// test invite
		firebase.firestore().collection("notifications").add({
			"for": code,
			"type": "team-invite",
			"is-read":false,
			"team": teamDocLocation,
			"message": "you have been invited to: " + this.teamName,
		}).catch(function(error) {
			console.error("Error adding document: ", error);
			return;
		}).then( () => {
			$(".invite-form").notify("invite sent");
		})


	}

}




// base document for knows how to create an ok button and how to generate data from form fields
//todo: create checking
class DocumentForm extends BasicForm{


  // to be overriden does form submit action
  submitForm(){
	this.populateDocumentFromForm();
  }

  // breaks down form data into our new object
  // we submit that object to firebase
  populateDocumentFromForm(){

	// let formChildren = this.formDataElem.elements;
	  let formChildren = this.formDataElem.children;
	 let formChildrenCount = formChildren.length;
	 let currentDocument = {};
	  // going through these manually to have control over elements that need ignoring
	 for(let i = 0; i < formChildrenCount; i++){

		 let currentFormRow = formChildren[i];
		 let fieldName = currentFormRow.name;
		 let fieldValue = currentFormRow.value;

			 switch(currentFormRow.type){
				 case "text":
					 currentDocument[fieldName] =  fieldValue;
					 break;
				 case "textarea":
					 currentDocument[fieldName] =  fieldValue;

					 break;
				 case "select-one":
					 currentDocument[fieldName] =  parseInt(fieldValue);
					 break;
				 case "select-multiple":
					 //this.currentDocument[fieldName] =  parseInt(fieldValue);
					 let formatedSelection = this.mapDataFromMultiSelect(currentFormRow);
					 currentDocument[fieldName] = formatedSelection;
					 break;
				 case "range":
					 currentDocument[fieldName] =  parseFloat(fieldValue);
					 break;
				 case "date":
					 currentDocument[fieldName] =  new Date(fieldValue);
					 break;
				 case "select-value-map":
					 currentDocument[fieldName] = this.mapDataFromValueSelectMap(currentFormRow);
					 break;
				 case "string-collection":
					 currentDocument[fieldName] = this.buildStringCollectionmap(currentFormRow);
					 break;
				 default:
			 }

		if(currentDocument.requirements){
			let req = currentDocument.requirements;
			let urg = currentDocument.urgency;
			let impo = currentDocument.importance;
			let impa = currentDocument.impact;
			let reward = calculateReward(req, urg, impo,impa);
			currentDocument['experience-rewards'] = reward;
		}
	 }

	  this.currentDocument = currentDocument;
  }

  buildStringCollectionmap(formRow){
	  let dataMap = formRow.childNodes;
	  let jsonMapping = {};

	  for(let dataMapIncrementor = 0; dataMap.length > dataMapIncrementor; dataMapIncrementor++){
		  let dataRowElem = dataMap[dataMapIncrementor];

		  let key = dataRowElem.getAttribute("value");
		  let value = key;

		  jsonMapping[key] = value;
	  }

	  return jsonMapping;
  }

  mapDataFromValueSelectMap(formRow){
  	let dataMap = formRow.childNodes;
  	let jsonMapping = {};

  	for(let dataMapIncrementor = 0; dataMap.length > dataMapIncrementor; dataMapIncrementor++){
  		let dataRowElem = dataMap[dataMapIncrementor];
  		let keyValueElem = dataRowElem;

		let key = dataRowElem.getAttribute("selected-value");
		let value = parseInt(dataRowElem.getAttribute("value"));

		jsonMapping[key] = value;
	}

  	return jsonMapping;
  }



  mapDataFromMultiSelect(formRow){
	  let selectedOptions = formRow.selectedOptions;
	  let formatedSelection = [];
	  for(let selectionCount = 0; selectedOptions.length > selectionCount; selectionCount++){
	  	let selectedOption = selectedOptions[selectionCount];
	  	let fieldName = selectedOption.value;
	  	formatedSelection[selectionCount] = fieldName;
	  }
	  return formatedSelection;
  }




	// assign the object from the types list and trigger the relivant generation
	createNewForm(type){
		this.clearFormDataFields();

        let formConfiguration = jQuery.extend(true, {}, newObjectLookup[type]);

		this.documentType = type;
		this.generateFormDisplay(formConfiguration);


		this.currentDocument = formConfiguration;
	}


	// remove any existing forms from the DOM
	clearFormDataFields(){
		let formChildren = this.formDataElem.childNodes;
		let formChildrenCount = this.formDataElem.childElementCount;

		// remove like this as removing a field will reduce the size of the array
		let lastFormDataChild = this.formDataElem.lastElementChild;
		while(lastFormDataChild){
			this.formDataElem.removeChild(lastFormDataChild);
			lastFormDataChild = this.formDataElem.lastElementChild
		}
	}


	// create fields on the form to allow the user change specific values on the object
	generateFormDisplay(formConfiguration){
		// go through the configuration objects and create as required
		for(let fieldRow in formConfiguration){

			let currentFieldRowConfig = formConfiguration[fieldRow];
			let documentField = fieldRow;
			let currentValue = currentFieldRowConfig['value'];
			let fieldProperties = currentFieldRowConfig['field-properties']

			let newFormElement = currentFieldRowConfig.construction(documentField, currentValue, this.formDataElem, fieldProperties)


		}
	}

}








class NewDocumentForm extends DocumentForm{
	  constructor() {
		super();
	  }


	// observe the attribute changes so we can modify dispalyed data
	static get observedAttributes() {
		return ['obj-type','collection-target'];
	}

	// set the display for these values onto the txt of the displays
	attributeChangedCallback(name, oldValue, newValue) {
		let type = this.getAttribute("obj-type");
		if(name === "obj-type"){
			this.formHeader.innerHTML = "create new " + type;
			//this.createNewForm(type);
		} else {
			this.collectionTarget = this.getAttribute('collection-target');
		}
		this.createNewForm(type);
	}
	


	
	// override of the submit changes, different actions for creating differnt objects
	submitForm(){
		this.populateDocumentFromForm();

		switch(this.documentType){
			case "team":
				this.createNewTeam();
				break;
			case "task":
				this.createNewTask();
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
		let newTeam = this.currentDocument
		newTeam.owner = userId;
		newTeam.members = [userId];

		firebase.firestore().collection("teams").add(newTeam)
		.catch(function(error) {
			console.error("Error adding a new team: ", error);
		});


	}


	createNewTask(){

		let userId = getUserId();
		let collectionLocation = this.collectionTarget + "/tasks/"
		let newTask = this.currentDocument
		newTask.owner = userId;
		newTask.status = taskStatus.Active;
		newTask.team = this.collectionTarget;

		firebase.firestore().collection(collectionLocation).add(newTask)
			.catch(function(error) {
				console.error("Error adding a new task: ", error);
			});
	}

}


class ChangeDocumentForm extends DocumentForm{
	constructor() {
		super();
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
				}

			})
		}
	}

	isValid() {
		return super.isValid();
	}

	submitForm(){
		this.populateDocumentFromForm();
		let change = this.documentReference.update (
			this.currentDocument
		);

		this.closeForm();
	}
	createFormFromExisting(type, document){
		this.clearFormDataFields();
		this.documentType = type;
		let formConfiguration = jQuery.extend(true, {}, newObjectLookup[type]);

		for(let documentField in document)
		{
			// check to see if we have a configuration to edit this type>field
			if(formConfiguration.hasOwnProperty(documentField)){
				formConfiguration[documentField].value = document[documentField];
			}

		}


		this.generateFormDisplay(formConfiguration);


		this.currentDocument = formConfiguration;
	}

}



class SelectAndValueField extends HTMLElement{
	constructor(){
		super();
	}

	connectedCallback(){
		let lookup = this.getAttribute('select-lookup');
		let selected = this.getAttribute('selected-value');
		let value = this.getAttribute('value');


		let removeRequiremntBtn = document.createElement("button");
		removeRequiremntBtn.innerHTML = "X";

		let newMapFields = document.createElement("div");

		let newSelectField = createSelectField(lookup, selected, newMapFields);

		let newNumberField = createNumberInput(lookup, value, newMapFields);
		newSelectField.setAttribute('map-value',"lookup");

		newMapFields.appendChild(removeRequiremntBtn);
		this.appendChild(newMapFields);




		removeRequiremntBtn.addEventListener('click', () =>{
			this.parentElement.removeChild(this);
		})

		newSelectField.addEventListener('change', () =>{
			let newSelectedValue = newSelectField.value;
			this.setAttribute('selected-value', newSelectedValue)
		})

		newNumberField.addEventListener('change', () =>{
			let newSelectedValue = newNumberField.value;
			this.setAttribute('value', newSelectedValue)
		})
	}

}



class StringCollectionField extends HTMLElement{
	constructor(){
		super();
	}

	connectedCallback(){
		let value = this.getAttribute('value');
		let key = this.getAttribute('key');

		let removeRowBtn = document.createElement("button");
		removeRowBtn.innerHTML = "X";

		let newMapFields = document.createElement("div");

		let newTextField = createTextInputField(key, value, newMapFields);
		newMapFields.appendChild(newTextField);
		newMapFields.appendChild(removeRowBtn);
		this.appendChild(newMapFields);




		removeRowBtn.addEventListener('click', () =>{
			this.parentElement.removeChild(this);
		})


		newTextField.addEventListener('change', () =>{
			let newSelectedValue = newTextField.value;
			this.setAttribute('value', newSelectedValue)
		})
	}

}






window.customElements.define('string-collection', StringCollectionField);
window.customElements.define('select-value-map', SelectAndValueField);

window.customElements.define('invite-form', InviteForm);
window.customElements.define('document-form', NewDocumentForm);
window.customElements.define('change-document-form', ChangeDocumentForm);