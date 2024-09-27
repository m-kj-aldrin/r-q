class HtmlEventElement extends HTMLElement {
    constructor() {
        super();
    }

    #has_init = false;
    #init() {
        if (this.#has_init) return;
        this.#has_init = true;

        let on = this.getAttribute("on");
        let [cmd, modifier] = on.split(" ");

        if (on == "load" && document.readyState) {
            this.#handler();
            return;
        }

        if (cmd && modifier) {
            switch (cmd) {
                case "repeat":
                    setInterval(() => {
                        this.#handler();
                    }, parseInt(modifier));
                    return;
            }
        }

        this.addEventListener(on, this.#handler);
    }

    #handler() {
        let fire = this.getAttribute("fire");
        let event = new Event(fire, { bubbles: true });

        this.dispatchEvent(event);
    }

    connectedCallback() {
        this.#init();
    }
    disconnectedCallback() {}
}

customElements.define("e-vent", HtmlEventElement);
