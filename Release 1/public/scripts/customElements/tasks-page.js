let currentlyViewTeamData;






// tile to display experience rewards to the user
class ExperienceRewardTile extends HTMLElement{
    constructor() {
        super();
    }

    connectedCallback() {

        let skillType = this.getAttribute("skill-type");
        let iconURI = LookupIconURI(skillType);
        const rewardTileTemplate = `<div class="reward-tile"><img alt="${skillType}" class="skill-icon" src="${iconURI}"><div class="amount"></div></div>`;

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
        this.toggleEditButton();
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
        this.description = safeGetProperty(docData,"description");
        this.deadline = safeGetProperty(docData,"deadline");
        this.rewards = safeGetProperty(docData,"experience-rewards");
        this.requirements = safeGetProperty(docData,"requirements");
    }

    set name(val){
        this.nameEle.textContent = val;
        this.setAttribute("name", val);
    }

    set description(val){
        this.descrEle.textContent = val;
        this.setAttribute("description", val);
    }

    set deadline(val){
        let htmlSafeDate = convertToHTMLDate(val.toDate());
        this.deadlineDateDiv.textContent = "due: " + htmlSafeDate;
        this.setAttribute("deadline", htmlSafeDate);
    }

    set rewards(val){
        this.rewardsTileList.skillCardData = val;
        // dont reflect this as parsing is a performance loss
    }

    set requirements(val){
        this.requirementsTileList.skillCardData = val;
        // dont reflect this as parsing is a performance loss
    }


    _completeBtnClicked(){
        CompleteTask(this.doc, this.requirementsTileList);
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
    }


    set teamTarget(val){
        this.setAttribute("collection-target", val);
        this.teamLocation = val;
        this.getTeamInformation().then( () =>{
            this.taskListElem.collectionTarget = val;
            this.toggleAddBtn();
        });
    }

    toggleAddBtn(){
        let canAddTask = safeGetProperty(currentlyViewTeamData, "allow-add-task");
        let teamOwner = safeGetProperty(currentlyViewTeamData, "owner");
        console.log(teamOwner);
        if(canAddTask || teamOwner === getUserId()){
            if(!this.addBtn){
                this.showAddButton();
            }
        }
        else{
            this.removeAddButton();
        }
    }

    showAddButton(){
        let addBtn = document.createElement("a");
        addBtn.addEventListener("click", this._onNewTaskBtnClick);
        addBtn.src = "#";
        addBtn.textContent = "add task"
        addBtn.classList = "ui-btn";
        this.insertBefore(addBtn, this.taskListElem)
        this.addBtn = addBtn;
    }

    removeAddButton(){
        if(this.addBtn){
            this.removeChild(this.addBtn);
            this.addBtn = null;
        }
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
        newDocumentForm.setAttribute("collection-target", this.teamLocation);
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
        return taskCard;
    }

    // called from child element
    shouldShowEditButton(docData){
        let canAddTask = safeGetProperty(currentlyViewTeamData, "allow-add-task");
        let taskOwnerID = docData.owner;
        let teamOwnerID = currentlyViewTeamData.owner;
        let currentUserID = getUserId();

        // always allow the team owner to edit tasks
        // allow the task owner to edit tasks if the permissions to add it are there
        if(canAddTask && taskOwnerID == currentUserID || teamOwnerID == currentUserID) {

            return true
        }
        return false
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
