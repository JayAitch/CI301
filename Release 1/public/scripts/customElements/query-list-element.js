
// Base query listener, acts on query data retured	 by getQueryReferenece()
// override snapshot listners called to modify the DOM
// override getQueryRefernece to change the data set
class StaticQueryListElement extends HTMLElement {
	constructor() {
		super();

		// get the current user from the authentication object
		this.currentUserID = getUserId();//firebase.auth().currentUser.uid;
		this.setupSnapshot();


		// local variable of dom elements order is difined when documents are added as part of the query
		this.activeCards = [];
	}

	// set up the element on connection
	connectedCallback() {


	}

	// called by snapshotListener
	// override these to modify the DOM
	_onDocumentAdded(change) {
	}

	_onDocumentChanged(change) {
	}

	_onDocumentRemoved(change) {
	}


	// override this to give a list of queries
	getQueryReferenece() {
	}

	setupSnapshot() {
		// create a query reference of dataset
		const queryRef = this.getQueryReferenece();
		// attach listeners to the reference to apply com updates
		queryRef.get().then((snapshot) => {

			snapshot.forEach((childSnapshot) => {
				this._onDocumentAdded(childSnapshot);
			});

		});

	}

}


class CreateListeningQueryListElement extends StaticQueryListElement {
	constructor() {
		super();

	}
	// remove all listeners on this list
	removeListeners() {
		this.snapshotListener();
	}

	setupSnapshot() {
		// create a query reference of dataset
		const queryRef = this.getQueryReferenece();
		// attach listeners to the reference to apply com updates
		queryRef.get().then((snapshot) => {

			snapshot.forEach((childSnapshot) => {
				this._onDocumentAdded(childSnapshot);
			});

		});
		this.snapshotListener = queryRef.onCreate((snapshot,context) => {
			this._onDocumentAdded(childSnapshot);
		})


		this.snapshotListener = queryRef.onSnapshot((snapshot) => {
			snapshot.onCreate((snapshot,context) =>{
				console.log(context);
			});
		});




	}
}





// Base query listener, acts on query data retured	 by getQueryReferenece()
// override snapshot listners called to modify the DOM
// override getQueryRefernece to change the data set
class ActiveQueryListElement extends StaticQueryListElement{


  // set up the element on connection
  connectedCallback() {	
  

  }
  
  // called by snapshotListener
  // override these to modify the DOM
  _onDocumentAdded(change){
  }  
  
  _onDocumentChanged(change){
  }
  
  _onDocumentRemoved(change){
  } 
  
  // remove all listeners on this list
  removeListeners(){
	  this.snapshotListener();
  }
  setupSnapshot(){
		// create a query reference of dataset
		const queryRef = this.getQueryReferenece();
		// this maybe a bit ott with notifcations concider switching to https://firebase.google.com/docs/database/admin/retrieve-data
		// attach listeners to the reference to apply com updates
		this.snapshotListener = queryRef.onSnapshot((snapshot) => {
			snapshot.docChanges().forEach((change) =>{
				if (change.type === "added") {
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

  // override this to give a list of queries
  getQueryReferenece(){
  }
}

