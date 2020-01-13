
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

		});

	}

	// create a new card from the doc passed in and add to the card array
	createNewCard(doc){

		let docData = doc.data();

		// allow implementations to define their on creation logic
		let newCard = this.createCardDOMElement(docData);

		// generate the document reference to store in the dom attribute
		let queryString = this.collectionRef + doc.id;
		newCard.setAttribute("doc-location", queryString);

		// just add this to our parent anyway
		this.appendChild(newCard);
		this.setAttributesFromDoc(newCard, docData);

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
		newCard.setAttribute("doc-location", queryString);

		// get the data from the document and apply to card attributes
		// use the change position to find where the card should go
		this.insertBefore(newCard, this.childNodes[changeIndex]);
		this.setAttributesFromDoc(newCard, docData);

		// splice into the array to maintain postional accuracy
		this.cardElemsArray.splice(changeIndex, 0, newCard);
		//return newCard;
	}

	applyChangesToCard(change){
		let docIndex = change.newIndex
		let doc = change.doc;

		// find the notification card from the query index
		let notificationCard = this.cardElemsArray[docIndex];

		// update the data to display
		this.setAttributesFromDoc(notificationCard, doc.data());

	}


	// this scenario should only rarely happen, remove deleted document from the DOM
	removeCard(change){
		// use the change position to find which dom element should be removed
		let docIndex = change.oldIndex
		let card = this.cardElemsArray[docIndex];
		// may need to resize the array here
		this.removeChild(card);
	}


  setupSnapshot(){
		// create a query reference of dataset
		const queryRef = this.getQueryReference();
		// attach listeners to the reference to apply com updates
		this.snapshotListener = queryRef.onSnapshot((snapshot) => {
			console.log(snapshot);
			snapshot.docChanges().forEach((change) =>{
				if (change.type === "added") {
					console.log(change);
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


	static get observedAttributes(){
		return['collection-target']
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if(name == 'collection-target'){

			// remove the cards and re setup snapshot
			this.removeAllCards();
			// make sure the snapshot is not listening away in memory somewhere
			if(this.snapshotListener) this.removeListeners();
			this.setupSnapshot();
		}
	}


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



class EditButton extends HTMLAnchorElement{
	constructor(){
		super();
		this._onClick = this._onClick.bind(this);
		this.addEventListener("click", this._onClick);
	}



	_onClick(){
		let docLocation = this.parentElement.parentElement.parentElement.getAttribute("doc-location"); //this is bad

		let docType = this.getAttribute("obj-type");

		const changeDocForm = document.getElementById("change-document-form");
		changeDocForm.setAttribute("obj-type", docType);
		changeDocForm.setAttribute("document-target", docLocation);
		changeDocForm.hidden = false;
	}

}

window.customElements.define('edit-button', EditButton, {extends: 'a'});