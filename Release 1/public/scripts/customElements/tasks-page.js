let currentlyViewTeamData;






// tile to display experience rewards to the user
class ExperienceRewardTile extends HTMLElement{
    constructor() {
        super();
    }

    connectedCallback() {

        let skillType = this.getAttribute("skill-type");
        let iconURI = LookupIconURI(skillType);
        const rewardTileTemplate = `<div class="reward-tile"><img class="skill-icon" src="${iconURI}"><div class="amount"></div></div>`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = rewardTileTemplate;
        this.amountElem = this.querySelector(".amount");
    }
    static get observedAttributes() {
        return ['amount']; // status and experience
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'amount'){
            this.amountElem.innerHTML = newValue;
        }

    }

}





class TaskCard extends HTMLElement{
    constructor() {
        super();
        this.currentRewardTiles = {};
        this.currentRequirementTiles = {};
        this._completeBtnClicked = this._completeBtnClicked.bind(this);
    }


    // setup elmenet when connected
    connectedCallback() {
        const userAccountTemplate = `			<div class="card-wrapper">
													<div class="name-header">
														 <div class="deadline-date-display"></div><h3 class="name"></h3>
													</div>
													<div class="description-wrapper">
													    <p class="description"></p>
													</div>
													<div class="control-group">
																
														<a class="complete-task-button control ui-btn" href="#">complete</a>					
													</div>
													<skill-card-list class="requirements-tile-list tile-group" list-title="requirements"></skill-card-list>
													<skill-card-list class="rewards-tile-list tile-group"  list-title="rewards"></skill-card-list>
												</div>
											`;
        // dont do it like this maybe? potential dom lag

        this.innerHTML = userAccountTemplate;
        this.controlGroup = this.querySelector(".control-group");
        this.nameEle = this.querySelector(".name");
        this.descrEle = this.querySelector(".description");
        this.deadlineDateDiv = this.querySelector(".deadline-date-display");

        this.requirementsTileList = this.querySelector(".requirements-tile-list");
        this.rewardsTileList = this.querySelector(".rewards-tile-list");

        this.querySelector(".complete-task-button").addEventListener("click", this._completeBtnClicked);
        this.createEditButton();
    }


    createEditButton(){
        if(this.getAttribute("show-edit") == "true"){
            let editButton = document.createElement("edit-button");
            editButton.setAttribute("doc-location", this.getAttribute("doc-location"));
            editButton.setAttribute("obj-type","task");
            this.controlGroup.appendChild(editButton);
        }
    }


    // observe the attribute changes so we can modify dispalyed data
    static get observedAttributes() {
        return ['name', 'description', 'rewards', 'requirements', 'deadline']; // status and experience
    }

    // set the display for these values onto the txt of the displays
    attributeChangedCallback(name, oldValue, newValue) {
        let taskName = this.getAttribute("name");
        let taskDescription = this.getAttribute("description");
        let deadline = this.getAttribute("deadline");

        this.nameEle.textContent = taskName;
        this.descrEle.textContent = taskDescription;
        this.deadlineDateDiv.textContent = deadline;
    }

    set rewards(val){
        this.rewardsTileList.skillCardData = val;
    }

    set requirements(val){
        this.requirementsTileList.skillCardData = val;
    }

    _completeBtnClicked(){
        let documentLocation = this.getAttribute("doc-location");

        let taskToComplete = firebase.firestore().doc(documentLocation);
        let taskRewards = {};

        // move this logic to a function
        taskToComplete.get().then((doc) => {

            let taskData = doc.data();
            taskRewards = taskData['experience-rewards']
            
            let userAccountRef = getCurrentUserDocRef();
            userAccountRef.get().then((doc) => {

                let userAccountData = doc.data();

                // this will error for new users
                let userAccountSkillLevels = userAccountData['skill-levels']

                for (let key in taskRewards) {

                    let userLevel = experiencePointsAsLevel(userAccountSkillLevels[key]);
                    let requiredLevel = taskData["requirements"][key]

                    if(!requiredLevel || requiredLevel <= userLevel){
                        let rewardXPValue = taskRewards[key] || 0;
                        let currentXPValue = userAccountSkillLevels[key] || 0;
                        userAccountSkillLevels[key] = rewardXPValue + currentXPValue;
                    }
                    else{
                        $(this).notify(`requires ${key} level ${requiredLevel}`);
                        //show something to the users!
                        return;
                    }
                }
                taskToComplete.set({
                    "status": taskStatus.Complete,
                }, {merge: true});


                userAccountRef.set({
                    "skill-levels": userAccountSkillLevels,
                }, {merge: true});


                let teamDocumentRef =  firebase.firestore().doc(taskData.team);
                teamDocumentRef.get().then((doc) => {
                    let teamData = doc.data();
                    let members = teamData.members;
                    console.log(members);
                    let notificationsCollectionRef =  firebase.firestore().collection("notifications");
                    for(var membersPos = 0;members.length > membersPos; membersPos++){
                        let memberRef = members[membersPos];
                        console.log(memberRef);
                        let newNotificationDocument = {
                            "for": memberRef,
                            "is-read": false,
                            "message": `the task ${taskData.name} has been completed by a team member!`
                        }
                        notificationsCollectionRef.add(newNotificationDocument);
                    }
                });


            }).catch(function (error) {
                console.error("Could not complete task: ", error);
            });



        }).catch(function(error) {
            console.error("Could not complete task: ", error);
        });

    }
}




class TasksPage extends HTMLElement{
    constructor() {
        super();
        this._onNewTaskBtnClick = this._onNewTaskBtnClick.bind(this);
    }

    // set up the element on connection
    connectedCallback() {
        const teamTemplate = `				<h2 class="name-header">
													please select a team to view tasks
												</h2>
												<a class="ui-btn" id="new-task-btn" href="#">new task</a>
											`;

        // dont do it like this maybe? potential dom lag
        this.innerHTML = teamTemplate;
        this.taskListElem = document.createElement("tasks-list");
        this.header = this.querySelector(".name-header");
        this.appendChild(this.taskListElem);
         document.getElementById("new-task-btn").addEventListener("click", this._onNewTaskBtnClick);


    }
    static get observedAttributes(){
        return['teams-watched']
    }

    attributeChangedCallback(name, oldValue, newValue) {


        // we may want to change this to a filter so that a user can query multiple teams at once
        if(name == 'teams-watched' ){
            this.teamTarget = newValue;

            // assign the team we are viewing to a global variable, components of the app will use this for configuration
            firebase.firestore().doc(this.teamTarget).get().then((doc)=> {
                currentlyViewTeamData = doc.data();
                this.header.innerHTML = currentlyViewTeamData.name || 'error';
            });

            this.taskListElem.setAttribute("collection-target", this.teamTarget);
        }
    }

    _onNewTaskBtnClick(){
        const newDocumentForm = document.getElementById("new-document-form");
        let collectionTargetString = this.teamTarget;
        newDocumentForm.setAttribute("obj-type", "task");
        newDocumentForm.setAttribute("collection-target", collectionTargetString);
        newDocumentForm.hidden = false;
    }


}


class TasksList extends ChangeableActiveQueryList{
    constructor() {
        super();
        this.collectionRef = ""
    }

    getQueryReference(){
        // todo: check that this value is a document reference, we are going to want a global expr for this
        let targetDocument = this.getAttribute('collection-target');

        this.collectionRef =  targetDocument + "/tasks/";
        // find all tasks underneith refering to the current team
        return firebase.firestore().collection(this.collectionRef).where("status", "==", taskStatus.Active);
    }

    createCardDOMElement(docData) {
        let teamTemplate = document.createElement("task-card");
        this.setTaskCardCreationAttributes(teamTemplate, docData);
        return teamTemplate;
    }

    setTaskCardCreationAttributes(teamTemplate, docData){
        let showEdit = this.shouldShowEditButton(docData);
        teamTemplate.setAttribute("show-edit", showEdit);
    }


    setAttributesFromDoc(elem, docData) {
        let name = docData.name;
        let desc = docData.description;

        let rewards = docData["experience-rewards"];
        let requirements = docData["requirements"];
        let deadline = convertToHTMLDate(docData["deadline"].toDate());

        if(rewards){

            elem.rewards = rewards;
            elem.requirements = requirements;
                    }

        elem.setAttribute("deadline", deadline);
        elem.setAttribute("name", name);
        elem.setAttribute("description", desc);


    }

    shouldShowEditButton(docData){
        let teamType = currentlyViewTeamData["team-type"];
        let taskOwnerID = docData.owner;
        let teamOwnerID = currentlyViewTeamData.owner;
        let currentUserID = getUserId();

        // is the team type verticle? is the current user not the owner of the team
        if(teamType == 1 && teamOwnerID != currentUserID) {
            // is the current user not the owner of the task
            if (taskOwnerID != currentUserID) {
                // dont show edit button
                return false;
            }
        }
        return true
    }

}


class SkillCardList extends HTMLElement{
    constructor() {
        super();
    }

    connectedCallback() {
        let listTitle = this.getAttribute("list-title");
        this.innerHTML = `<div class="tile-list-title">${listTitle}</div><div class="tile-list"></div>`;
        this.tileListParent = this.querySelector(".tile-list")
    }

    set skillCardData(val){
        this.cardData = val;
        this.removeTiles();
        this.createTileList();
    }

    displayNone(){
        let noneElement = document.createElement("div");
        noneElement.textContent = "none";
        this.tileListParent.appendChild(noneElement);
    }


    removeTiles(){
        let lastChild = this.tileListParent.lastElementChild;
        while(lastChild){
            this.tileListParent.removeChild(lastChild);
            lastChild = this.tileListParent.lastElementChild;
        }
    }

    createTileList(){
        console.log("rebuilding tiles");
        if(!this.cardData|| this.cardData.size == 0){
            this.displayNone();
        } else {
            for(let key in this.cardData){
                let cardVal = this.cardData[key];
                this.createTile(key, cardVal);
            }
        }


    }
    createTile(type, amount){

        let newTile = document.createElement("reward-tile");
        newTile.setAttribute("skill-type", type);
        this.tileListParent.appendChild(newTile);
        newTile.setAttribute("amount", amount);

    }
}



window.customElements.define('skill-card-list', SkillCardList);
window.customElements.define('reward-tile', ExperienceRewardTile);
window.customElements.define('tasks-page', TasksPage);
window.customElements.define('tasks-list', TasksList);
window.customElements.define('task-card', TaskCard);
