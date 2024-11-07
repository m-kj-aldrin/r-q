class ReQuestEvent extends Event {
    /**
     * @param {{method:string,endpoint:string,accept:string,formData:FormData}} param0
     */
    constructor({ method, endpoint, accept, formData }) {
        super("re-quest", { bubbles: true });
        /**@type {string} */
        this.method = method;
        /**@type {string} */
        this.endpoint = endpoint;
        /**@type {string} */
        this.accept = accept;
        /**@type {FormData} */
        this.formData = formData;
    }
}
/**
 * @param {ReQuestEvent} e
 */
async function reQuestHandler(e) {
    let { endpoint, method, accept, formData } = e;
    let headers = new Headers({ Accept: accept, "X-Re-Quest": "true" });

    if (method == "GET" || method == "HEAD") formData = null;

    let request = new Request(endpoint, {
        method,
        headers,
        body: formData,
    });

    let response = await fetch(request);
    let contentType = response.headers.get("content-type").split(";")[0];

    let payload =
        contentType == "application/json"
            ? await response.json()
            : contentType == "text/html"
            ? await response.text()
            : undefined;

    // console.log(payload);

    if (typeof payload == "string") {
        reflectTarget.call(e.target, payload);
    }
}

/**
 * @param {string} htmlString
 * @this {ReQuestElement}
 */
function reflectTarget(htmlString) {
    let output = this.querySelector("output");
    if (output) {
        output.innerHTML = htmlString;
        return;
    }

    let doc = new DOMParser().parseFromString(htmlString, "text/html");

    doc.querySelectorAll("[target]").forEach((reflection) => {
        let name = reflection.getAttribute("target");
        let targets = document.querySelectorAll(`[re-target='${name}']`);

        targets.forEach((target) => {
            target.innerHTML = reflection.outerHTML;
        });
    });
}

document.body.addEventListener("re-quest", reQuestHandler);

class ReQuestElement extends HTMLElement {
    constructor() {
        super();
    }

    #fire({ method, endpoint, accept, formData }) {
        let event = new ReQuestEvent({ method, endpoint, accept, formData });
        this.dispatchEvent(event);
    }

    /**@param {Event} e */
    #handler(e) {
        let type = e.type;
        let firePayload = {
            method: this.getAttribute("method") ?? "GET",
            endpoint: this.getAttribute("endpoint"),
            accept: this.getAttribute("accept") ?? "text/html",
            /**@type {FormData} */
            formData: null,
        };

        switch (type) {
            case "submit":
                e.preventDefault();

                if (!(e.target instanceof HTMLFormElement)) return;
                let form = e.target;

                form.method && (firePayload.method = form.method);
                form.action && (firePayload.endpoint = form.action);

                firePayload.formData = new FormData(form);

                break;
            case "click":
                break;
        }

        this.#fire(firePayload);
    }

    #hasInit = false;
    #init() {
        if (this.#hasInit) return;
        this.#hasInit = true;

        let fireOn = this.getAttribute("fire-on") ?? "submit";
        this.addEventListener(fireOn, this.#handler);
    }

    connectedCallback() {
        this.#init();
    }
    disconnectedCallback() {}
}

customElements.define("re-quest", ReQuestElement);
