/**
 * @param {Event} e
 * @returns {'GET' | undefined}
 *  */
function getMethodFromEventType(e) {
    switch (e.type) {
        case "re-get":
            return "GET";
    }
}
class ReQuest extends HTMLElement {
    constructor() {
        super();

        this.addEventListener("re-get", this.#handler);
    }

    /**@param {Event} e */
    async #handler(e) {
        let endpoint = this.getAttribute("endpoint");
        if (!endpoint) return;

        let method = getMethodFromEventType(e);
        if (method == undefined) return;

        let accept = this.getAttribute("mime") ?? "*/*";

        let payload = await this.#fetch({ endpoint, method, accept });
        if (!payload) return;

        if (typeof payload == "string") {
            this.#target(payload);
        } else {
            console.log(payload);
        }
    }

    /**
     *
     * @param {*} param0
     * @returns {Promise<string | Record<string,any> | undefined>}
     */
    async #fetch({ endpoint, method, accept }) {
        let headers = new Headers({ Accept: accept });

        let request = new Request(endpoint, {
            method,
            headers,
        });

        let response = await fetch(request);
        let contentType = response.headers.get("content-type").split(";")[0];

        let payload =
            contentType == "application/json"
                ? await response.json()
                : contentType == "text/html"
                ? await response.text()
                : undefined;

        if (payload == undefined) return;

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
        this.addEventListener("click", (e) => {
            let event = new Event("re-get", { bubbles: true });
            this.dispatchEvent(event);
        });
    }

    connectedCallback() {}
    disconnectedCallback() {}
}

customElements.define("re-get", ReGet);
