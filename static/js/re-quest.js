class ReQuestEvent extends Event {
    constructor({ method, endpoint, accept, form }) {
        super("re-quest", { bubbles: true });
        this.method = method;
        this.endpoint = endpoint;
        this.accept = accept;
        this.form = form;
    }
}
/**
 * @param {ReQuestEvent} e
 */
async function reQuestHandler(e) {
    let { endpoint, method, accept, form } = e;
    let headers = new Headers({ Accept: accept, "X-Re-Quest": "true" });

    if (method == "GET" || method == "HEAD") form = null;

    let request = new Request(endpoint, {
        method,
        headers,
        body: form,
    });

    let response = await fetch(request);
    let contentType = response.headers.get("content-type").split(";")[0];

    let payload =
        contentType == "application/json"
            ? await response.json()
            : contentType == "text/html"
            ? await response.text()
            : undefined;

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

    #fire({ method, endpoint, accept, form }) {
        let event = new ReQuestEvent({ method, endpoint, accept, form });
        this.dispatchEvent(event);
    }

    /**@param {Event} e */
    #handler(e) {
        let type = e.type;
        let firePayload = {
            method: this.getAttribute("method") ?? "GET",
            endpoint: this.getAttribute("endpoint"),
            accept: this.getAttribute("accept") ?? "text/html",
            /**@type {HTMLFormElement} */
            form: null,
        };

        switch (type) {
            case "submit":
                e.preventDefault();

                /**@type {HTMLFormElement} */
                let form = e.target;

                form.method && (firePayload.method = form.method);
                form.action && (firePayload.endpoint = form.action);

                firePayload.form = form;
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

// /**
//  * @param {Event} e
//  * @returns {'GET' | 'DELETE' | undefined}
//  *  */
// function getMethodFromEventType(e) {
//     switch (e.type) {
//         case "re-get":
//             return "GET";
//         case "re-delete":
//             return "DELETE";
//     }
// }
// class ReQuest extends HTMLElement {
//     constructor() {
//         super();

//         this.addEventListener("re-get", this.#handler);
//         this.addEventListener("re-delete", this.#handler);
//         this.addEventListener("submit", (e) => {
//             e.preventDefault();
//             let form = new FormData(e.target);
//             this.#handler(e, form);
//         });
//     }

//     /**
//      * @param {Event} e
//      * @param {FormData} form
//      */
//     async #handler(e, form = undefined) {
//         let endpoint = this.getAttribute("endpoint");
//         if (!endpoint) return;

//         let method = getMethodFromEventType(e) ?? this.getAttribute("method");
//         if (method == undefined) return;

//         let accept = this.getAttribute("mime") ?? "*/*";

//         let payload = await this.#fetch({ endpoint, method, accept, form });
//         if (!payload) return;

//         if (typeof payload == "string") {
//             let event = new ReFlectEvent({ htmlString: payload });
//             this.dispatchEvent(event);
//         } else {
//             console.log(payload);
//         }
//     }

//     /**
//      *
//      * @param {{endpoint:string,method:string,accept:string,form:FormData}} param0
//      * @returns {Promise<string | Record<string,any> | undefined>}
//      */
//     async #fetch({ endpoint, method, accept, form }) {
//         let headers = new Headers({ Accept: accept, "X-Re-Quest": "true" });

//         if (method == "GET" || method == "HEAD") form = null;

//         let request = new Request(endpoint, {
//             method,
//             headers,
//             body: form,
//         });

//         let response = await fetch(request);
//         let contentType = response.headers.get("content-type").split(";")[0];

//         let payload =
//             contentType == "application/json"
//                 ? await response.json()
//                 : contentType == "text/html"
//                 ? await response.text()
//                 : undefined;

//         return payload;
//     }

//     /**@param {string} htmlString */
//     #target(htmlString) {
//         if (!htmlString) return;

//         let target = this.querySelector("re-target");
//         if (!target) return;

//         target.innerHTML = htmlString;
//     }

//     connectedCallback() {}
//     disconnectedCallback() {}
// }

// customElements.define("re-quest", ReQuest);

// class ReGet extends HTMLElement {
//     constructor() {
//         super();
//         this.addEventListener("click", this.#fire);
//     }

//     #fire() {
//         let event = new Event("re-get", { bubbles: true });
//         this.dispatchEvent(event);
//     }

//     connectedCallback() {
//         let fire = this.getAttribute("fire");
//         switch (fire) {
//             case "load":
//                 this.#fire();
//                 break;
//         }
//     }
//     disconnectedCallback() {}
// }

// customElements.define("re-get", ReGet);

// class ReDelete extends HTMLElement {
//     constructor() {
//         super();
//         this.addEventListener("click", this.#fire);
//     }

//     #fire() {
//         let event = new Event("re-delete", { bubbles: true });

//         this.dispatchEvent(event);
//     }

//     connectedCallback() {
//         let fire = this.getAttribute("fire");
//         switch (fire) {
//             case "load":
//                 this.#fire();
//                 break;
//         }
//     }
//     disconnectedCallback() {}
// }

// customElements.define("re-delete", ReDelete);

// class ReFlectEvent extends Event {
//     /**
//      * @param {{htmlString:string}} data
//      */
//     constructor(data) {
//         super("re-flect", { bubbles: true });
//         this.data = data;
//     }
// }

// class ReFlect extends HTMLElement {
//     constructor() {
//         super();
//         this.addEventListener("re-flect", this.#handler);
//     }

//     /**@param {ReFlectEvent} e */
//     #handler(e) {
//         let htmlString = e.data.htmlString;
//         let doc = new DOMParser().parseFromString(htmlString, "text/html");
//         doc.querySelectorAll("[target]").forEach((reflection) => {
//             let name = reflection.getAttribute("target");
//             let target = this.querySelector(`re-target[name='${name}']`);
//             if (target) {
//                 target.innerHTML = reflection.outerHTML;
//             }
//         });
//     }

//     connectedCallback() {}
//     disconnectedCallback() {}
// }

// customElements.define("re-flect", ReFlect);
