import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";

export class BoundingBox extends StdConstruct {
    constructor(arg, opt) {
        super();
        if (arg) this.setNode(arg);
        else this._setType(this._type);

        if (opt) this.show(opt);
    }

    _updatesvg(opt) {
        if (opt) {
            this.set(opt);
        }

        const jNode = new JSYG(this.node);
        const ref = new JSYG(this.container).offsetParent();
        const CTM = jNode.getMtx(ref);
        let rect;
        let b;
        let d;
        let topleft;
        let topright;
        let bottomleft;
        let bottomright;

        if (this.keepRotation === false) {
            rect = jNode.getDim(ref);
            new JSYG(this.pathBox).attr(
                "d",
                `M${rect.x},${rect.y}L${rect.x + rect.width},${rect.y}L${rect.x + rect.width},${rect.y + rect.height}L${rect.x},${rect.y + rect.height}L${rect.x},${rect.y}`,
            );
        } else {
            b = jNode.getDim();
            topleft = new JSYG.Vect(b.x, b.y).mtx(CTM);
            topright = new JSYG.Vect(b.x + b.width, b.y).mtx(CTM);
            bottomleft = new JSYG.Vect(b.x, b.y + b.height).mtx(CTM);
            bottomright = new JSYG.Vect(b.x + b.width, b.y + b.height).mtx(CTM);

            new JSYG(this.pathBox).attr(
                "d",
                `M${topleft.x},${topleft.y}L${topright.x},${topright.y}L${bottomright.x},${bottomright.y}L${bottomleft.x},${bottomleft.y}L${topleft.x},${topleft.y}`,
            );
        }

        new JSYG(this.container)[0].classList.add(this.className);

        if (this.displayShadow) {
            d = jNode.clonePath({ normalize: true }).attr("d");

            if (!this.pathShadow)
                this.pathShadow = new JSYG("<path>")
                    .addClass(this.classNameShadow)
                    .appendTo(this.container)[0];

            new JSYG(this.pathShadow).attr("d", d).setMtx(CTM).mtx2attrs();
        } else if (this.pathShadow) {
            new JSYG(this.pathShadow).remove();
            this.pathShadow = null;
        }

        return this;
    }

    _updatehtml(opt) {
        if (opt) this.set(opt);

        const jNode = new JSYG(this.node);
        const rect = jNode.getDim("page");

        new JSYG(this.container).addClass(this.className).css("position", "absolute").setDim(rect);

        return this;
    }

    update(opt) {
        if (!this.node || !this.display) return this;
        this[`_update${this._type}`](opt);
        this.trigger("update");
        return this;
    }

    show(opt) {
        if (!this.node) return this;
        new JSYG(this.container).appendTo_(new JSYG(this.node).offsetParent("farthest")); //GUSA

        this.display = true;
        this.update(opt);
        this.trigger("show");
        return this;
    }

    hide() {
        detachElement(this.container);
        this.display = false;
        this.trigger("hide");
        return this;
    }

    toggle() {
        this[this.display ? "hide" : "show"]();
        return this;
    }

    _setType(type) {
        if (
            type === "svg" &&
            (this._type !== "svg" || !this.container || !this.hasOwnProperty("container"))
        ) {
            this.container = new JSYG("<g>")[0];
            this.pathBox = new JSYG("<path>")[0];
            this.container.appendChild(this.pathBox);
            this.pathShadow = null;
        } else if (
            type === "html" &&
            (this._type !== "html" || !this.container || !this.hasOwnProperty("container"))
        ) {
            this.container = new JSYG("<div>")[0];
            this.pathBox = null;
            this.pathShadow = null;
        }

        this._type = type;

        return this;
    }

    setNode(arg) {
        const display = this.display;

        if (display) this.hide();

        this.node = new JSYG(arg)[0];

        this._setType(new JSYG(this.node).isSVG() ? "svg" : "html");

        if (display) this.show();

        return this;
    }
}

BoundingBox.prototype.container = null;
BoundingBox.prototype.pathBox = null;
BoundingBox.prototype.pathShadow = null;
BoundingBox.prototype.className = "strokeBox";
BoundingBox.prototype.classNameShadow = "shadow";
BoundingBox.prototype.displayShadow = false;
BoundingBox.prototype.keepRotation = true;
BoundingBox.prototype.onshow = null;
BoundingBox.prototype.onhide = null;
BoundingBox.prototype.onupdate = null;
BoundingBox.prototype._type = "svg";
BoundingBox.prototype.display = false;

function detachElement(element) {
    const parentNode = element.parentNode;
    if (parentNode != null) {
        parentNode.removeChild(element);
    }
}

const boundingBox = JSYG.bindPlugin(BoundingBox);

JSYG.prototype.boundingBox = function(...args) {
    return boundingBox.apply(this, args);
};

