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





class TaskCard extends EditableDocCard{
    constructor() {
        super();
        this._completeBtnClicked = this._completeBtnClicked.bind(this);
    }


    // setup elmenet when connected
    connectedCallback() {
        const template = document.getElementById('task-card-template');
        let content = document.importNode(template.content, true);
        this.appendChild(content);

        this.controlGroup = this.querySelector(".control-group");
        this.nameEle = this.querySelector(".name");
        this.descrEle = this.querySelector(".description");
        this.deadlineDateDiv = this.querySelector(".deadline-date-display");

        this.requirementsTileList = this.querySelector(".requirements-tile-list");
        this.rewardsTileList = this.querySelector(".rewards-tile-list");

        this.querySelector(".complete-task-button").addEventListener("click", this._completeBtnClicked);
        this.showHideEditButton();
    }


    createEditButton(){
        let editButton = document.createElement("edit-button");
        editButton.documentLocation = this.documentLocation;
        editButton.documentType = "task";
        this.controlGroup.appendChild(editButton);
        return editButton;
    }

    displayDocumentValues(docData) {
        this.name = safeGetProperty(docData,"name");
        this.description = safeGetProperty(docData,"name");
        this.deadline = safeGetProperty(docData,"deadline");
        this.rewards = safeGetProperty(docData,"experience-rewards");
        this.requirements = safeGetProperty(docData,"requirements");
    }

    set name(val){
        this.nameEle.textContent = val;
    }

    set description(val){
        this.descrEle.textContent = val;
    }

    set deadline(val){
        let htmlSafeDate = convertToHTMLDate(val.toDate());
        this.deadlineDateDiv.textContent = htmlSafeDate;
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
//completed by

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
        const template = document.getElementById('task-page-template');
        let content = document.importNode(template.content, true);
        this.appendChild(content);
        this.taskListElem = document.createElement("tasks-list");

        this.header = this.querySelector(".name-header");
        this.appendChild(this.taskListElem);
        // add this dynamically
        document.getElementById("new-task-btn").addEventListener("click", this._onNewTaskBtnClick);
    }


    set teamTarget(val){
        this.setAttribute("collection-target", val);
        this.teamLocation = val;
        this.getTeamInformation().then( () =>{
            this.taskListElem.collectionTarget = val;
        });
    }

    getTeamInformation(){
        let teamDocRef = firebase.firestore().doc(this.teamLocation);
        let promise = teamDocRef.get().then(doc => {
            currentlyViewTeamData = doc.data();
            this.name = safeGetProperty(currentlyViewTeamData, "name");
        });
        return promise;
    }

    set name(val){
        this.setAttribute("name", val);
        this.header.textContent = val;
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
        let targetDocument = this.targetCollection;
        this.collectionRef =  targetDocument + "/tasks/";
        // find all tasks underneith refering to the current team
        return firebase.firestore().collection(this.collectionRef).where("status", "==", taskStatus.Active);
    }

    createCardDOMElement(docData) {
        let taskCard = document.createElement("task-card");
        taskCard.canEdit = this.shouldShowEditButton(docData);
        return taskCard;
    }

    // this can probably move onto tlcas
    shouldShowEditButton(docData){
        let teamType = currentlyViewTeamData["team-type"];
        let taskOwnerID = docData.owner;
        let teamOwnerID = currentlyViewTeamData.owner;
        let currentUserID = getUserId();

        // is the team type verticle? is the current user not the owner of the team
        if(teamType == 1 && teamOwnerID != currentUserID) {
            // is the current user not the owner of the task
            // if (taskOwnerID != currentUserID) {
            //     // dont show edit button
            //     return false;
            // }
            return false
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
