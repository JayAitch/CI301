
// Base query listener, acts on query data retured	 by getQueryReferenece()
// override snapshot listners called to modify the DOM
// override getQueryRefernece to change the data set
class QueryListElement extends HTMLElement{
  constructor() { 
    super();
	
	// get the current user from the authentication object
	this.currentUserID = firebase.auth().currentUser.uid; 
	
	// create a query reference of dataset
	const queryRef = this.getQueryReferenece();
			console.log(queryRef);
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

	// local variable of dom elements order is difined when documents are added as part of the query
	this.activeCards = [];
  }

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
  
  // override this to give a list of queries
  getQueryReferenece(){
  }
}