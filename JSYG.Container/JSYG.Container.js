import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";

export class Container extends JSYG {
    constructor(arg) {
        super();
        if (!(this instanceof Container)) return new Container(arg);

        if (!arg) arg = "<g>";

        super(arg);

        if (this.getTag() != "g") throw new Error("L'argument ne fait pas référence à un conteneur g.");
    }

    addItems(elmt) {
        const that = this;
        const mtx = this.getMtx().inverse();

        JSYG.makeArray(arguments).forEach(elmt => {
            new JSYG(elmt).each(function () {
                const $this = new JSYG(this);

                try {
                    $this.addMtx(mtx);
                } catch (e) {
                    //éléments non tracés
                }

                $this.appendTo_(that[0]);

                const event = new CustomEvent("additem", { detail: this });
                that[0].dispatchEvent(event);

                that[0].dispatchEvent(new Event("change"));
            });
        });

        return this;
    }

    applyTransform() {
        const mtx = this.getMtx();
        const that = this;

        this.children().each(function () {
            const $this = new JSYG(this);
            $this.setMtx(mtx.multiply($this.getMtx(that)));
        });

        this.resetTransf();

        return this;
    }

    freeItems(elmt) {
        const parent = this[0].parentNode;
        const mtx = this.getMtx();
        const that = this;
        const args = JSYG.makeArray(arguments.length === 0 ? new JSYG(this[0].children) : arguments);

        args.reverse().forEach(elmt => {
            new JSYG(elmt).each(function () {
                const $this = new JSYG(this);

                if (!$this.isChildOf(that)) return;

                try {
                    $this.setMtx(mtx.multiply($this.getMtx(that)));
                } catch (e) {}

                const parentElement = that[0].parentNode;
                if (parentElement) {
                    let nextSibling = that[0].nextSibling;
                    parentElement.insertBefore($this[0], nextSibling);
                }

                const event = new CustomEvent("freeitem", { detail: this });
                that[0].dispatchEvent(event);

                that[0].dispatchEvent(new Event("change"));
            });
        });

        return this;
    }
}

Container.prototype.onadditem = null;
Container.prototype.onfreeitem = null;
Container.prototype.onchange = null;

