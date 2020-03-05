


class DocCard extends HTMLElement{
	constructor(){
		super();
	}

	set document(val){
		this.doc = val;
		let docData = this.doc.data();
		this.displayDocumentValues(docData);
	}

	set documentLocation(val){
		this.setAttribute("doc-location", val);
		this.docLocation = val;
	};

	get documentLocation(){
		return this.docLocation;
	}

	displayDocumentValues(val){

	}

}


class EditableDocCard extends DocCard{
	constructor(){
		super();
	}

	set canEdit(val){
		if(val === true || val === false){
			this.showEdit = val;
			this.setAttribute("is-editable", val);
		}
	}


	showHideEditButton(){
		let editBtn = this.editBtn;
		if(this.showEdit){
			if(editBtn){

			}
			else{
				this.editBtn = this.createEditButton();
			}
		}
		else{
			if(editBtn){
				editBtn.parentNode.removeChild(editBtn)
			}
			else{
			}
		}
	}

	createEditButton(){
		return false;
	}

}


// Base query listener, acts on query data retured	 by getQueryReferenece()
// override snapshot listners called to modify the DOM
// override getQueryRefernece to change the data set
class StaticQueryListElement extends HTMLElement {
	constructor() {
		super();
		this.initQueryListElement();
	}

	initQueryListElement(){
		// local variable of dom elements order is defined when documents are added as part of the query
		this.cardElemsArray = [];
		// get the current user from the authentication object
		this.currentUserID = getUserId();
		this.setupSnapshot();
	}

	setupSnapshot() {
		// create a query reference of dataset
		const queryRef = this.getQueryReference();
		// attach listeners to the reference to apply com updates
		queryRef.get().then((snapshot) => {

			snapshot.forEach((childSnapshot) => {
				this.createNewCard(childSnapshot.doc);
			});

		}).catch(function(error) {
			console.log("Error query list getting collection:", error);
		});

	}

	// create a new card from the doc passed in and add to the card array
	createNewCard(doc){

		//let docData = doc.data();

		// allow implementations to define their on creation logic
		let newCard = this.createCardDOMElement(docData);

		// generate the document reference to store in the dom attribute
		let queryString = this.collectionRef + doc.id;
		newCard.documentLocation = queryString;
		newCard.document = doc;
		// just add this to our parent anyway
		this.appendChild(newCard);
	//	this.setAttributesFromDoc(newCard, docData);

		this.cardElemsArray.add(newCard);

	}


	// virtual - override returning a query reference
	getQueryReference() {
	}


	setAttributesFromDoc(elem, docData) {
	}

	createCardDOMElement(docData){
	}

}





// Base query listener, acts on query data retured	 by getQueryReferenece()
// override snapshot listners called to modify the DOM
// override getQueryRefernece to change the data set
class ActiveQueryListElement extends StaticQueryListElement{
	disconnectedCallback(){
		this.removeListeners();
	}
  // remove all listeners on this list
  removeListeners(){
		if(this.snapshotListener)
	  this.snapshotListener();
  }


	_onDocumentAdded(change) {
		this.createNewCard(change);
	}

	_onDocumentChanged(change) {
		this.applyChangesToCard(change);
	}

	_onDocumentRemoved(change) {
		this.removeCard(change)
	}


	// create a new card and add to cards list
	// position of card is decided by snapshot change postions
	createNewCard(change){

		let doc = change.doc;
		let docData = doc.data();
		let changeIndex = change.newIndex;


		// allow implementations to define their on creation logic
		let newCard = this.createCardDOMElement(docData);

		// generate the document reference to store in the dom attribute
		let queryString = this.collectionRef + doc.id;
		newCard.documentLocation = queryString;

		// get the data from the document and apply to card attributes
		// use the change position to find where the card should go
		this.insertBefore(newCard, this.childNodes[changeIndex]);
	newCard.document = doc;
		// splice into the array to maintain postional accuracy
		this.cardElemsArray.splice(changeIndex, 0, newCard);
		//return newCard;
	}

	applyChangesToCard(change){
		let docIndex = change.newIndex
		let doc = change.doc;

		// find the notification card from the query index
		let docCard = this.cardElemsArray[docIndex];

		// update the data to display
		docCard.document = doc;

	}


	// this scenario should only rarely happen, remove deleted document from the DOM
	removeCard(change){
		// use the change position to find which dom element should be removed
		let docIndex = change.oldIndex;

		let card = this.cardElemsArray[docIndex];

		this.removeChild(card);
		this.cardElemsArray.splice(docIndex,docIndex + 1);
	}


  setupSnapshot(){
		// create a query reference of dataset
		const queryRef = this.getQueryReference();
		// attach listeners to the reference to apply com updates
		this.snapshotListener = queryRef.onSnapshot((snapshot) => {
			snapshot.docChanges().forEach((change) =>{
				if (change.type === "added") {;
					this._onDocumentAdded(change);
				}
				else if(change.type === "modified"){
					this._onDocumentChanged(change);
				}
				else if(change.type ==="removed"){
					this._onDocumentRemoved(change);
				}
			});
		});
  }

}

// class to reform list when collection target property is changed.
// Should be a simple way of having a list that reloads.
class ChangeableActiveQueryList extends ActiveQueryListElement{

	initQueryListElement(){
		// local variable of dom elements order is defined when documents are added as part of the query
		this.cardElemsArray = [];
	}

	set collectionTarget(val){
		this.setAttribute('collection-target', val)
		this.targetCollection = val;
		this.removeAllCards();
		if(this.snapshotListener) this.removeListeners();
		this.setupSnapshot();
	};


	// bin this list contents
	removeAllCards(){
		this.removeListeners();

		let lastActiveCard = this.lastElementChild;

		while(lastActiveCard){
			this.removeChild(lastActiveCard);
			lastActiveCard = this.lastElementChild;
		}


		// remove any potential ghost elements
		this.cardElemsArray = [];
	}
}


// this cannot extend anchor due to issue with safari support of createElement("a", {is:"edit-button"})
class EditButton extends HTMLElement{
	constructor(){
		super();
		this._onClick = this._onClick.bind(this);

	}
	connectedCallback() {
		this.innerHTML = "<a href='#' class='ui-btn '>edit</a>";
		this.classList = "edit-wrapper";
		this.addEventListener("click", this._onClick);
	}

	set documentType(val){
		this.type = val;
		this.setAttribute("obj-type", val);
	}

	set documentLocation(val){
		this.location = val;
		this.setAttribute("doc-location", val);
	}

	_onClick(){
		const changeDocForm = document.getElementById("change-document-form");
		changeDocForm.setAttribute("obj-type", this.type);
		changeDocForm.setAttribute("document-target", this.location);
		changeDocForm.hidden = false;
	}

}

window.customElements.define('edit-button', EditButton);