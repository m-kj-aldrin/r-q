import { ReQuestEvent } from "./re-quest.js";

class ReQuestShell extends HTMLElement {
    constructor() {
        super();
    }

    #isInit = false;
    #init() {
        if (this.#isInit) return;
        this.#isInit = true;

        this.#attachListeners();
    }

    #attachListeners() {
        this.addEventListener(
            "re-quest",
            /**@param {ReQuestEvent} e*/ (e) => {
                this.#updateTargets(e.fragment);
            }
        );
    }

    /**@param {Document} doc */
    #updateTargets(doc) {
        doc.querySelectorAll("[target]").forEach((t) => {
            let name = t.getAttribute("target");

            let n = this.querySelector(`re-target[name='${name}']`);

            if (n) {
                n.replaceChildren(t);
            }
        });
    }

    connectedCallback() {
        this.#init();
    }
    disconnectedCallback() {}
}

customElements.define("re-quest-shell", ReQuestShell);
