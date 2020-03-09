class CookiePolicy extends HTMLElement {
    constructor() {
        super();
        this.onAccept = this.onAccept.bind(this);
    }
    connectedCallback() {
        const template = document.getElementById('cookie-policy-template');
        let content = document.importNode(template.content, true);
        this.appendChild(content);
        let cookieAcceptBtn = this.querySelector("#cookie-policy-accept");
        cookieAcceptBtn.addEventListener("click", this.onAccept);
    }
    onAccept(){
        this.parentElement.removeChild(this);
        setCookieAccepted();
    }
}

window.customElements.define('cookie-policy', CookiePolicy);