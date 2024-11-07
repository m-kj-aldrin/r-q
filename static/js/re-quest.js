export class ReQuestEvent extends Event {
    /**
     * @param {Document} fragment
     */
    constructor(fragment) {
        super("re-quest", { bubbles: true });
        this.#fragment = fragment;
    }

    /**@type {Document | null} */
    #fragment = null;

    get fragment() {
        return this.#fragment;
    }
}

export class ReQuest extends HTMLElement {
    constructor() {
        super();
    }

    get method() {
        return this.getAttribute("method");
    }

    get path() {
        return this.getAttribute("path");
    }

    #isInit = false;
    #init() {
        if (this.#isInit) return;
        this.#isInit = true;

        this.#attachListeners();
    }

    #attachListeners() {
        this.addEventListener("submit", async (e) => {
            if (!(e.target instanceof HTMLFormElement)) return;
            e.preventDefault();

            let headers = new Headers({
                accept: "text/html",
            });

            let formData = new FormData(e.target);

            let request = new Request(this.path, {
                method: this.method,
                headers,
                body: formData,
            });

            let response = await fetch(request);
            if (!response.ok) {
                return;
            }

            let text = await response.text();
            if (!text) return;

            let document = new DOMParser().parseFromString(text, "text/html");

            this.dispatchEvent(new ReQuestEvent(document));
        });
    }

    connectedCallback() {
        this.#init();
    }

    disconnectedCallback() {}
}

customElements.define("re-quest", ReQuest);
