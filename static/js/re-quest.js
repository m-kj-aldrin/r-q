/**
 * @param {Event} e
 * @returns {'GET' | 'DELETE' | undefined}
 *  */
function getMethodFromEventType(e) {
    switch (e.type) {
        case "re-get":
            return "GET";
        case "re-delete":
            return "DELETE";
    }
}
class ReQuest extends HTMLElement {
    constructor() {
        super();

        this.addEventListener("re-get", this.#handler);
        this.addEventListener("re-delete", this.#handler);
        this.addEventListener("submit", (e) => {
            e.preventDefault();
            let form = new FormData(e.target);
            this.#handler(e, form);
        });
    }

    /**
     * @param {Event} e
     * @param {FormData} form
     */
    async #handler(e, form = undefined) {
        let endpoint = this.getAttribute("endpoint");
        if (!endpoint) return;

        let method = getMethodFromEventType(e) ?? this.getAttribute("method");
        if (method == undefined) return;

        let accept = this.getAttribute("mime") ?? "*/*";

        let payload = await this.#fetch({ endpoint, method, accept, form });
        if (!payload) return;

        if (typeof payload == "string") {
            let event = new ReFlectEvent({ htmlString: payload });
            this.dispatchEvent(event);
        } else {
            console.log(payload);
        }
    }

    /**
     *
     * @param {{endpoint:string,method:string,accept:string,form:FormData}} param0
     * @returns {Promise<string | Record<string,any> | undefined>}
     */
    async #fetch({ endpoint, method, accept, form }) {
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

        return payload;
    }

    /**@param {string} htmlString */
    #target(htmlString) {
        if (!htmlString) return;

        let target = this.querySelector("re-target");
        if (!target) return;

        target.innerHTML = htmlString;
    }

    connectedCallback() {}
    disconnectedCallback() {}
}

customElements.define("re-quest", ReQuest);

class ReGet extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("click", this.#fire);
    }

    #fire() {
        let event = new Event("re-get", { bubbles: true });
        this.dispatchEvent(event);
    }

    connectedCallback() {
        let fire = this.getAttribute("fire");
        switch (fire) {
            case "load":
                this.#fire();
                break;
        }
    }
    disconnectedCallback() {}
}

customElements.define("re-get", ReGet);

class ReDelete extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("click", this.#fire);
    }

    #fire() {
        let event = new Event("re-delete", { bubbles: true });

        this.dispatchEvent(event);
    }

    connectedCallback() {
        let fire = this.getAttribute("fire");
        switch (fire) {
            case "load":
                this.#fire();
                break;
        }
    }
    disconnectedCallback() {}
}

customElements.define("re-delete", ReDelete);

class ReFlectEvent extends Event {
    /**
     * @param {{htmlString:string}} data
     */
    constructor(data) {
        super("re-flect", { bubbles: true });
        this.data = data;
    }
}

class ReFlect extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("re-flect", this.#handler);
    }

    /**@param {ReFlectEvent} e */
    #handler(e) {
        let htmlString = e.data.htmlString;
        let doc = new DOMParser().parseFromString(htmlString, "text/html");
        doc.querySelectorAll("[target]").forEach((reflection) => {
            let name = reflection.getAttribute("target");
            let target = this.querySelector(`re-target[name='${name}']`);
            if (target) {
                target.innerHTML = reflection.outerHTML;
            }
        });
    }

    connectedCallback() {}
    disconnectedCallback() {}
}

customElements.define("re-flect", ReFlect);
