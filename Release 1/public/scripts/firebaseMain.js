const firebaseConfig = {
  apiKey: "AIzaSyC1LiymKHpZp6HRYwu-AYj9jw072Oqp0AU",
  authDomain: "testfire-60064.firebaseapp.com",
  databaseURL: "https://testfire-60064.firebaseio.com",
  projectId: "testfire-60064",
  storageBucket: "testfire-60064.appspot.com",
  messagingSenderId: "497572840612",
  appId: "1:497572840612:web:311417ad0a342883b7d231",
  measurementId: "G-D6D9ZR077L"
};


// Initialize Firebase

document.addEventListener("DOMContentLoaded", event =>{
	const app = firebase.initializeApp(firebaseConfig);
	//const database = firebase.firestore();
	
	
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			console.log(user)
			//loadHomePage();
		} else {
			const authenticator = new firebase.auth.GoogleAuthProvider();
			firebase.auth().signInWithRedirect(authenticator)
			//console.log("nouser")	// No user is signed in.;
		}
	});
});

	function logOut(){
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			
		}, function(error) {
			// An error happened.
		});
	}