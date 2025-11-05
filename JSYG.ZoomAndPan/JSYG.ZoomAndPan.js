import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";
import { Resizable } from "../JSYG.Resizable/JSYG.Resizable.js";

/*   "use strict";*/

const plugins = ["mouseWheelZoom", "marqueeZoom", "resizable", "mousePan"];

export class ZoomAndPan extends StdConstruct {
    constructor(arg, opt) {
        super();
        this.mouseWheelZoom = new MouseWheelZoom(this);
        this.marqueeZoom = new MarqueeZoom(this);
        this.resizable = new ZapResizable(this);
        this.mousePan = new MousePan(this);
        this.cookie = new Cookie(this);
        this.innerFrame = new JSYG("<g>")[0];
        this.outerFrame = new JSYG("<div>")[0];

        if (arg) this.setNode(arg);
        if (opt) this.enable(opt);
    }

    set(options) {
        for (const n in options) {
            if (options.hasOwnProperty(n) && n in this) {
                if (plugins.includes(n)) {
                    this[n].set(options[n]);
                } else {
                    this[n] = options[n];
                }
            }
        }

        return this;
    }

    setNode(arg) {
        const enabled = this.enabled;
        const jNode = new JSYG(arg);

        if (enabled) this.disable();

        if (this.node) new JSYG(this.node).removeData("zoomandpan");

        this.node = jNode[0];

        //jNode.data('zoomandpan',{});
        jNode[0].dataset.ZoomAndPan = {};

        if (enabled) this.enable();
    }

    _getBounds(ctm) {
        const initDim = new JSYG(this.innerFrame).getDim();

        const bounds = {
            left: this.minLeft == null ? initDim.x - this.bounds : this.minLeft,
            right: this.maxRight == null ? initDim.x + initDim.width + this.bounds : this.maxRight,
            top: this.minTop == null ? initDim.y - this.bounds : this.minTop,
            bottom: this.maxBottom == null ? initDim.y + initDim.height + this.bounds : this.maxBottom,
        };

        if (ctm) {
            const mtx = new JSYG(this.innerFrame).getMtx();
            const hg = new JSYG.Vect(bounds.left, bounds.top).mtx(mtx);
            const bd = new JSYG.Vect(bounds.right, bounds.bottom).mtx(mtx);

            bounds.left = hg.x;
            bounds.top = hg.y;
            bounds.right = bd.x;
            bounds.bottom = bd.y;
        }

        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;

        return bounds;
    }

    enable(opt) {
        this.disable();

        if (opt) this.set(opt);

        if (
            !["auto", "hidden"].includes(this.overflow) &&
            !this.overflow.includes("scroll")
        ) {
            throw new Error(`${this.overflow} : valeur incorrecte pour la propriété overflow`);
        }

        if (!this.node)
            throw new Error("Il faut d'abord définir la propriété node par la méthode setNode");
        const jSVG = new JSYG(this.node);
        //var backup = jSVG.data('zoomandpan') || {};  //GUSA
        const backup = jSVG[0].dataset.zoomandpan || {}; //GUSA
        const hidden = this.overflow == "hidden";
        const dim = jSVG.getDim();
        const width = jSVG.attr("width") || dim.width;
        const height = jSVG.attr("height") || dim.height;
        const that = this;
        let n;

        backup.dimInit = {
            width,
            height,
        };

        const viewBox = this.node.viewBox.baseVal;

        const exclude = {
            tags: ["switch", "defs"],
            list: [],
        };

        let child;
        const innerFrame = new JSYG(this.innerFrame).transfOrigin("left", "top");
        let mtx = new JSYG.Matrix();

        while (this.node.firstChild) {
            child = this.node.firstChild;
            if (exclude.tags.includes(child.tagName)) {
                this.node.removeChild(child);
                exclude.list.push(child);
            } else innerFrame.append(child);
        }

        jSVG[0].appendChild(innerFrame[0]); //GUSA

        if (viewBox && viewBox.width && viewBox.height) {
            mtx = mtx.scaleNonUniform(dim.width / viewBox.width, dim.height / viewBox.height);
        }

        if (hidden && viewBox) mtx = mtx.translate(-viewBox.x, -viewBox.y);

        jSVG.removeAttr("viewBox");
        backup.viewBoxInit = viewBox;

        innerFrame.setMtx(mtx);

        if (!hidden) {
            const outerFrame = new JSYG(this.outerFrame);
            const position = jSVG.css("position");
            const bounds = this._getBounds("ctm");
            let origin;
            const left = jSVG.css("left");
            const top = jSVG.css("top");
            const margin = jSVG.css("margin");

            outerFrame.css({
                width,
                height,
                overflow: this.overflow,
                padding: "0px",
                margin,
                display: "inline-block",
                left,
                top,
                visibility: jSVG.css("visibility"),
                position: position === "static" ? "relative" : position,
                border: jSVG.css("border"),
                backgroundColor: jSVG.css("backgroundColor"),
            });

            backup.cssInit = {
                left,
                top,
                margin,
                position,
            };

            jSVG.css({
                left: 0,
                top: 0,
                margin: 0,
                position: "absolute",
                width,
                height,
            });

            mtx = new JSYG.Matrix().translate(-bounds.left, -bounds.top).multiply(mtx);
            innerFrame.setMtx(mtx);

            origin = new JSYG.Vect((viewBox && viewBox.x) || 0, (viewBox && viewBox.y) || 0).mtx(mtx);

            let p = this.node.parentNode;
            p.removeChild(this.node);
            p.appendChild(outerFrame[0]); //GUSA
            outerFrame[0].appendChild(this.node);
            outerFrame[0].scrollLeft = origin.x;
            outerFrame[0].scrollTop = origin.y;
        }

        function majCanvas() {
            that.transform(that.transform());
        }

        if (/%/.test(width)) {
            JSYG(window)[0].addEventListener("resize", majCanvas); //GUSA
            backup.majCanvas = majCanvas;
            majCanvas();
        }

        this.enabled = true;

        if (backup.plugins) {
            for (n in backup.plugins) this[n].enable();
        }

        if (opt) {
            for (n in opt) {
                if (plugins.includes(n)) this[n].enable(opt[n]);
            }
        }

        jSVG[0].dataset.zoomandpan = backup;

        return this;
    }

    disable() {
        if (!this.enabled || !this.node) return this;

        const jSVG = new JSYG(this.node);
        const plugins = {};
        const backup = jSVG.data("zoomandpan") || {};
        const viewBox = backup.viewBoxInit;

        if (this.mouseWheelZoom.enabled) {
            plugins.mouseWheelZoom = true;
            this.mouseWheelZoom.disable();
        }
        if (this.marqueeZoom.enabled) {
            plugins.marqueeZoom = true;
            this.marqueeZoom.disable();
        }
        if (this.resizable.enabled) {
            plugins.resizable = true;
            this.resizable.disable();
        }
        if (this.mousePan.enabled) {
            plugins.mousePan = true;
            this.mousePan.disable();
        }

        backup.plugins = plugins;

        while (this.innerFrame.firstChild) jSVG.append(this.innerFrame.firstChild);
        new JSYG(this.innerFrame).remove();

        if (this.outerFrame.parentNode) {
            jSVG.replaceAll(this.outerFrame);
            new JSYG(this.outerFrame).remove();
        }

        if (viewBox && viewBox.width && viewBox.height) {
            jSVG.attr(
                "viewBox",
                `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`,
            );
        }

        delete backup.viewBoxInit;

        if (backup.cssInit) {
            jSVG.css(backup.cssInit);
            delete backup.cssInit;
        }

        if (backup.dimInit) {
            jSVG.css(backup.dimInit);
            delete backup.dimInit;
        }

        if (backup.majCanvas) {
            JSYG(window).off("resize", backup.majCanvas);
        }

        this.enabled = false;

        return this;
    }

    _getAdd() {
        return this.overflow == "hidden" ? 0 : this.overflow == "auto" ? 2 : 20;
    }

    size(width, height, keepViewBox) {
        const hidden = this.overflow == "hidden";
        const canvas = new JSYG(hidden ? this.node : this.outerFrame);
        const innerWidth = canvas[0].clientWidth;
        const innerHeight = canvas[0].clientHeight;
        let mtx;
        const that = this;
        const keepRatio = width == null || height == null;
        let widthTest;
        let heightTest;
        const animate = this.animate;
        let opt;
        let pt;

        if (width == null && height == null) return { width: innerWidth, height: innerHeight };

        if ($.isPlainObject(width)) {
            opt = width;
            keepViewBox = opt.keepViewBox || height;
            height = opt.height;
            width = opt.width;
        }

        if (width == null) width = (innerWidth * height) / innerHeight;
        else if (height == null) height = (innerHeight * width) / innerWidth;

        widthTest = JSYG.clip(width, this.minWidth, this.maxWidth);
        heightTest = JSYG.clip(height, this.minHeight, this.maxHeight);

        if (keepRatio && widthTest != width) return this.size(widthTest, null, keepViewBox);
        else width = widthTest;

        if (keepRatio && heightTest != height) return this.size(null, heightTest, keepViewBox);
        else height = heightTest;

        canvas.setDim({ width, height });

        mtx = this.transform();

        if (keepViewBox) {
            pt = new JSYG.Vect(0, 0).mtx(mtx.inverse());
            mtx = mtx.scaleNonUniform(width / innerWidth, height / innerHeight, pt.x, pt.y);
        }

        this.animate = false;

        this.transform(mtx, () => {
            that.trigger("resize");
            that.animate = animate;
        });

        return this;
    }

    transform(mtx, callback) {
        const innerFrame = new JSYG(this.innerFrame);
        const hidden = this.overflow == "hidden";
        const outerFrame = !hidden && new JSYG(this.outerFrame);
        const scrollLeft = outerFrame && outerFrame[0].scrollLeft;
        const scrollTop = outerFrame && outerFrame[0].scrollTop;

        if (mtx == null) {
            mtx = innerFrame.getMtx();
            return hidden ? mtx : new JSYG.Matrix().translate(-scrollLeft, -scrollTop).multiply(mtx);
        }

        let transf = mtx.decompose();
        const scaleX = transf.scaleX;
        const scaleY = transf.scaleY;
        const translX = transf.translateX;
        const translY = transf.translateY;
        let mtxInv = mtx.inverse();
        const bounds = this._getBounds();

        if (!hidden) {
            mtx = mtx.translate(scrollLeft, scrollTop).translate(-bounds.left, -bounds.top);
            mtxInv = mtx.inverse();
        }

        const options = Object.create(this.animateOptions);
        const that = this;
        const outerDim = this.size();
        const add = this._getAdd();
        const jSVG = new JSYG(this.node);
        const centerIn = innerFrame.getCenter();

        const centerOut = new JSYG.Vect((outerDim.width - add) / 2, (outerDim.height - add) / 2).mtx(
            mtxInv,
        );

        const hg = new JSYG.Vect(0, 0).mtx(mtxInv);
        const bd = new JSYG.Vect(outerDim.width - add, outerDim.height - add).mtx(mtxInv);

        //le contenu est moins large que le cadre, on centre le contenu
        if (bounds.width * scaleX + add < outerDim.width) {
            mtx = mtx.translateX(centerOut.x - centerIn.x);

            //on étend le canvas svg à la largeur exterieure
            if (!hidden) jSVG.css("width", outerDim.width - add);
        } else {
            if (!hidden) {
                jSVG.css("width", bounds.width * scaleX);
                mtx = mtx.translateX(hg.x - bounds.left);
            } else {
                //on empêche de sortir du cadre
                if (hg.x < bounds.left) mtx = mtx.translateX(hg.x - bounds.left);
                else if (bd.x > bounds.right) mtx = mtx.translateX(bd.x - bounds.right);
            }
        }

        //le contenu est moins haut que le cadre, on centre le contenu
        if (bounds.height * scaleY + add < outerDim.height) {
            mtx = mtx.translateY(centerOut.y - centerIn.y);

            //on étend le canvas svg à la hauteur exterieure
            if (!hidden) jSVG.css("height", outerDim.height - add);
        } else {
            if (!hidden) {
                jSVG.css("height", bounds.height * scaleY);
                mtx = mtx.translateY(hg.y - bounds.top);
            } else {
                //on empeche de sortir du cadre
                if (hg.y < bounds.top) mtx = mtx.translateY(hg.y - bounds.top);
                else if (bd.y > bounds.bottom) mtx = mtx.translateY(bd.y - bounds.bottom);
            }
        }

        if (!hidden) {
            transf = mtx.decompose();
            outerFrame[0].scrollLeft = Math.round(transf.translateX - translX);
            outerFrame[0].scrollTop = Math.round(transf.translateY - translY);
        }

        if (!this.animate || !hidden) {
            innerFrame.setMtx(mtx);
            this.trigger("change");
            if (callback) callback.call(this.node);
        } else {
            innerFrame.animate(
                JSYG.extend(options, {
                    to: { mtx },
                    onanimate() {
                        that.trigger("animate");
                    },
                    onend() {
                        that.trigger("change");
                        if (callback) callback.call(that.node);
                    },
                }),
            );
        }

        return this;
    }

    scale(scale, originX, originY, callback) {
        let mtx = this.transform();
        const transf = mtx.decompose();

        if (scale == null) return transf.scaleX;

        const size = this.size();
        const bounds = this._getBounds();
        const add = this._getAdd();
        const scaleTest = mtx.scale(scale).scaleX();

        const scaleCanvas = Math.min(
            (size.width - add) / bounds.width,
            (size.height - add) / bounds.height,
        );

        const scaleMin = this.scaleMin == "canvas" ? scaleCanvas : this.scaleMin;
        const scaleMax = this.scaleMax == "canvas" ? scaleCanvas : this.scaleMax;
        let origin;
        const that = this;

        if (scaleMin && scaleTest < scaleMin) scale = scaleMin / transf.scaleX;
        if (scaleMax && scaleTest > scaleMax) scale = scaleMax / transf.scaleX;

        originX = originX != null ? originX : size.width / 2;
        originY = originY != null ? originY : size.height / 2;
        origin = new JSYG.Vect(originX, originY).mtx(mtx.inverse());

        mtx = mtx.scale(scale, origin.x, origin.y);

        this.transform(mtx, () => {
            that.trigger("scale");
            if (callback) callback.call(that.node);
        });

        return this;
    }

    translate(x, y, callback) {
        let mtx = this.transform();
        const that = this;

        if (x == null && y == null) return new JSYG.Vect(0, 0).mtx(mtx.inverse());

        x *= -1;
        y *= -1;

        mtx = mtx.translate(x, y);

        this.transform(mtx, () => {
            that.trigger("translate", that.node);
            if (callback) callback.call(that.node);
        });

        return this;
    }

    screenTranslate(x, y, callback) {
        const transf = this.transform().decompose();

        if (x == null && y == null) return new JSYG.Vect(transf.translateX, transf.translateY);

        this.translate(x / transf.scaleX, y / transf.scaleY, callback);

        return this;
    }

    scaleTo(scale, originX, originY, callback) {
        this.scale(scale / this.scale(), originX, originY, callback);

        return this;
    }

    fitToCanvas() {
        const bounds = this._getBounds("ctm");
        const outerDim = this.size();
        const add = this._getAdd();
        const rapX = (outerDim.width - add) / bounds.width;
        const rapY = (outerDim.height - add) / bounds.height;

        this.scale(Math.min(rapX, rapY));

        return this;
    }

    fitToWidth() {
        const bounds = this._getBounds("ctm");
        const outerDim = this.size();
        const add = this.overflow == "hidden" ? 0 : 20;
        const rapX = (outerDim.width - add) / bounds.width;

        this.scale(rapX);

        const transl = this.translate();
        this.translate(-transl.x, -transl.y);

        return this;
    }

    fitToHeight() {
        const bounds = this._getBounds("ctm");
        const outerDim = this.size();
        const add = this.overflow == "hidden" ? 0 : 20;
        const rapY = (outerDim.height - add) / bounds.height;

        this.scale(rapY);

        const transl = this.translate();
        this.translate(-transl.x, -transl.y);

        return this;
    }

    translateTo(x, y, callback) {
        const transl = this.translate();
        this.translate(x - transl.x, y - transl.y, callback);
        return this;
    }

    center(x, y, callback) {
        if (x == null && y == null) {
            const size = this.size();
            const mtx = this.transform();

            return new JSYG.Vect(size.width / 2, size.height / 2).mtx(mtx.inverse());
        } else {
            const center = this.center();

            this.translate(x - center.x, y - center.y, callback);
            return this;
        }
    }

    get overflow() {
        return this._overflow || "hidden";
    }

    set overflow(val) {
        if (!["hidden", "auto", "scroll"].includes(val))
            throw new Error(`${val} : valeur incorrecte pour la propriété overflow`);

        if (val == this._overflow) return;

        const enabled = this.enabled;
        let scale;
        let translate;
        let size;

        if (enabled) {
            scale = this.scale();
            translate = this.translate();
            size = this.size();
            this.disable();
        }

        this._overflow = val;

        if (enabled) {
            this.enable()
                .scale(scale)
                .translateTo(translate.x, translate.y)
                .size(size.width, size.height);
        }
    }
}

ZoomAndPan.prototype.enabled = false;
ZoomAndPan.prototype.overflow = "hidden";
ZoomAndPan.prototype.innerFrame = null;
ZoomAndPan.prototype.outerFrame = null;
ZoomAndPan.prototype.animate = false;
ZoomAndPan.prototype.animateOptions = null;
ZoomAndPan.prototype.scaleMin = "canvas";
ZoomAndPan.prototype.scaleMax = null;
ZoomAndPan.prototype.minLeft = null;
ZoomAndPan.prototype.maxRight = null;
ZoomAndPan.prototype.minTop = null;
ZoomAndPan.prototype.maxBottom = null;
ZoomAndPan.prototype.bounds = null;
ZoomAndPan.prototype.minWidth = 5;
ZoomAndPan.prototype.minHeight = 5;
ZoomAndPan.prototype.maxWidth = 3000;
ZoomAndPan.prototype.maxHeight = 3000;
ZoomAndPan.prototype.onscale = null;
ZoomAndPan.prototype.ontranslate = null;
ZoomAndPan.prototype.onresize = null;
ZoomAndPan.prototype.onchange = null;
ZoomAndPan.prototype.onanimate = null;

class Cookie {
    constructor(zoomAndPanObject) {
        this.zap = zoomAndPanObject;
    }

    read() {
        const zap = this.zap;
        const node = zap.node;

        if (!node.id)
            throw new Error(
                "Il faut définir un id pour la balise SVG pour pouvoir utiliser les cookies",
            );

        let cookie = cookies.get(node.id);

        if (!cookie) return this;

        cookie = cookie.split(";");

        const css = { width: cookie[0], height: cookie[1] };
        const newmtx = cookie[2];
        const overflow = cookie[3];

        if (overflow != zap.overflow)
            throw new Error("Overflow property is different than in cookie value.");

        new JSYG(node).css(css);

        new JSYG(zap.innerFrame).css(css).attr("transform", newmtx);

        if (overflow != "hidden" && cookie[4] && cookie[5] && cookie[6] != null && cookie[7] != null) {
            new JSYG(zap.outerFrame)
                .css({ width: cookie[4], height: cookie[5] })
                .scrollLeft(cookie[6])
                .scrollTop(cookie[7]);
        }

        return this;
    }

    write() {
        const zap = this.zap;
        const node = zap.node;

        if (!node.id)
            throw new Error(
                "Il faut définir un id pour la balise SVG pour pouvoir utiliser les cookies",
            );

        const jSVG = new JSYG(node);
        let valcookie = "";
        let outerFrame;

        valcookie += `${parseFloat(jSVG.css("width"))};${parseFloat(jSVG.css("height"))};`;
        valcookie += new JSYG(zap.innerFrame).getMtx().toString();
        valcookie += `;${zap.overflow}`;

        if (zap.overflow !== "hidden") {
            outerFrame = new JSYG(zap.outerFrame);
            valcookie += `;${outerFrame.css("width")};${outerFrame.css("height")};`;
            valcookie += `${outerFrame.scrollLeft()};${outerFrame.scrollTop()}`;
        }

        cookies.set(node.id, valcookie, this.expires ? { expires: this.expires } : undefined);

        return this;
    }

    remove() {
        cookies.remove(this.zap.node.id);
        return this;
    }

    enable() {
        const zap = this.zap;
        const node = zap.node;
        let unloadFct;

        if (!node.id)
            throw new Error(
                "Il faut définir un id pour la balise SVG pour pouvoir utiliser les cookies",
            );

        this.disable();

        unloadFct = this.write.bind(this);

        new JSYG(window).on("unload", unloadFct);

        this.disable = function () {
            new JSYG(window).off("unload", unloadFct);

            cookies.remove(node.id);

            this.enabled = false;

            return this;
        };

        //this.read();

        this.enabled = true;

        return this;
    }

    disable() {
        return this;
    }
}

Cookie.prototype.expires = null;

class MouseWheelZoom extends StdConstruct {
    constructor(zoomAndPanObject) {
        super(zoomAndPanObject);
        this.zap = zoomAndPanObject;
    }

    wheel(e) {
        if (!this.zap.mousePan.enabled) return;

        let _scale = 0;
        
        //if (e.originalEvent.deltaY < 0) {
        if (e.deltaY < 0) {
            _scale = 0.9;
        } else {
            _scale = 1.1;
        }
	
        const innerFrame = new JSYG(this.zap.innerFrame);

        const //scale = 1 + this.step * e.deltaY,
        //scale = 1 + this.step * e.originalEvent.deltaY,
        scale = _scale;

        const animate = this.zap.animate;
        let origin;

        if (animate === true && innerFrame.animate("get", "inProgress")) return;

        e.preventDefault();

        this.trigger("start", this.zap.node, e);

        origin =
            this.zap.overflow == "hidden"
                ? innerFrame.getCursorPos(e).mtx(innerFrame.getMtx("ctm"))
                : new JSYG(this.zap.outerFrame).getCursorPos(e);

        this.zap.animate = false;

        //this.zap.scale(scale,origin.x,origin.y);
        //this.zap.scale(0.9);
        //this.zap.scale(1.1);
        this.zap.scale(scale);

        this.zap.animate = animate;

        this.trigger("end", this.zap.node, e);
    }

    enable(opt) {
        const that = this;
        const cible = new JSYG(this.zap.overflow === "hidden" ? this.zap.node : this.zap.outerFrame);

        if (!this.zap.enabled) this.zap.enable();

        this.disable();

        if (opt) this.set(opt);

        this.disable(); //par précaution si plusieurs appels

        function mousewheelFct(e) {
            if (that.key && !e[that.key] && !e[`${that.key}Key`]) return;
            that.wheel(e);
        }

        //cible.on('mousewheel',mousewheelFct);  //GUSA
        cible[0].addEventListener("mousewheel", mousewheelFct);

        this.disable = function () {
            cible.off("mousewheel", mousewheelFct);
            this.enabled = false;
            return this;
        };

        this.enabled = true;

        return this;
    }

    disable() {
        return this;
    }
}

MouseWheelZoom.prototype.key = null;
MouseWheelZoom.prototype.step = 0.1;
MouseWheelZoom.prototype.onstart = null;
MouseWheelZoom.prototype.onend = null;
MouseWheelZoom.prototype.enabled = false;

class MarqueeZoom extends StdConstruct {
    constructor(zoomAndPanObject) {
        super(zoomAndPanObject);
        this.zap = zoomAndPanObject;

        this.container = new JSYG("<rect>")[0];
    }

    start(e) {
        const node = this.zap.node;
        const jSVG = new JSYG(node);
        const pos = jSVG.getCursorPos(e);
        const that = this;
        const resize = new Resizable(this.container);

        new JSYG(this.container)
            .addClass(this.className)
            .setDim({
                x: Math.round(pos.x) - 1,
                y: Math.round(pos.y) - 1,
                width: 1,
                height: 1,
            })
            .appendTo(node);

        resize.set({
            keepRatio: false,
            type: "attributes",
            originY: "top",
            originX: "left",
            cursor: false,
            inverse: true,
        });

        if (this.onstart) {
            resize.on("start", e => {
                that.trigger("start", node, e);
            });
        }
        if (this.ondrag) {
            resize.on("drag", e => {
                that.trigger("draw", node, e);
            });
        }

        resize.on("end", function (e) {
            const size = that.zap.size();
            const dim = new JSYG(this).getDim();
            const coef = Math.min(size.width / dim.width, size.height / dim.height);
            let mtx = new JSYG(that.zap.innerFrame).getMtx();
            let pt1 = new JSYG.Vect(dim.x, dim.y).mtx(mtx.inverse());
            let pt2;

            if (coef < 20) {
                mtx = mtx.scale(coef, pt1.x, pt1.y);
                pt1 = new JSYG.Vect(0, 0).mtx(mtx.inverse());
                pt2 = new JSYG.Vect(dim.x, dim.y).mtx(mtx.inverse());
                mtx = mtx.translate(pt1.x - pt2.x, pt1.y - pt2.y);

                that.zap.transform(mtx);
                that.trigger("end", node, e);
            }

            new JSYG(this).remove();
        });

        resize.start(e);
    }

    enable(opt) {
        this.disable(); //par précaution si plusieurs appels

        if (opt) this.set(opt);

        if (!this.zap.enabled) this.zap.enable();

        const that = this;

        function start(e) {
            if (that.eventWhich && e.which != that.eventWhich) return;
            that.start(e);
        }

        new JSYG(this.zap.node).on(this.event, start);

        this.disable = function () {
            new JSYG(this.zap.node).off(this.event, start);
            this.enabled = false;
            return this;
        };

        this.enabled = true;

        return this;
    }

    disable() {
        return this;
    }
}

MarqueeZoom.prototype.event = "mousedown";
MarqueeZoom.prototype.eventWhich = 1;
MarqueeZoom.prototype.onstart = null;
MarqueeZoom.prototype.ondrag = null;
MarqueeZoom.prototype.onend = null;
MarqueeZoom.prototype.className = "marqueeZoom";
MarqueeZoom.prototype.enabled = false;

class MousePan extends StdConstruct {
    constructor(zoomAndPanObject) {
	super(zoomAndPanObject);
        this.zap = zoomAndPanObject;
    }

    _canMove() {
        const bounds = this.zap._getBounds("ctm");
        const size = this.zap.size();

        return (
            (this.horizontal && Math.round(size.width) < Math.round(bounds.width)) ||
            (this.vertical && Math.round(size.height) < Math.round(bounds.height))
        );
    }

    start(e) {
        if (!this._canMove()) return;

        e.preventDefault();

        const jSVG = new JSYG(this.zap.node);
        let lastX = e.clientX;
        let lastY = e.clientY;
        const animate = this.zap.animate;
        const that = this;
        const jDoc = new JSYG(document);

        function mousemoveFct(e) {
            that.zap.screenTranslate(
                that.horizontal && lastX - e.clientX,
                that.vertical && lastY - e.clientY,
            );
            lastX = e.clientX;
            lastY = e.clientY;
            that.trigger("drag", that.zap.node, e);
        }

        function remove(e) {
            that.zap.animate = animate;
            jSVG.off("mousemove", mousemoveFct).removeClass(that.classDrag).addClass(that.className);
            jDoc.off("mouseup", remove);
            that.trigger("end", e);
        }

        this.zap.animate = false;

        jSVG.addClass(this.classDrag).removeClass(this.className);

        jSVG.on("mousemove", mousemoveFct);
        jDoc.on("mouseup", remove);

        this.trigger("start", this.zap.node, e);
    }

    enable(opt) {
        if (opt) this.set(opt);

        this.disable();

        if (!this.zap.enabled) this.zap.enable();

        const jSVG = new JSYG(this.zap.node);
        const that = this;

        function setClassName() {
            //if (that.className) jSVG[`${that._canMove() ? "add" : "remove"}Class`](that.className);
            if (that.className) {
		if (that._canMove() ) {
                   jSVG[0].classList.add(that.className);
		} else {
                   jSVG[0].classList.remove(that.className);
		}
	    }
        }

        function start(e) {
            if (that.eventWhich && e.which != that.eventWhich) return;
            that.start(e);
        }

        //jSVG.on(this.event, start);
        jSVG[0].addEventListener(this.event, start);

        this.zap.on("scale", setClassName);
        setClassName();

        this.disable = function () {
            jSVG.removeClass(this.className).off(this.event, start);
            this.zap.off("scale", setClassName);
            this.enabled = false;
            return this;
        };

        this.enabled = true;

        return this;
    }

    disable() {
        return this;
    }
}

MousePan.prototype.event = "mousedown";
MousePan.prototype.eventWhich = 1;
MousePan.prototype.className = "MousePanOpenHand";
MousePan.prototype.classDrag = "MousePanClosedHand";
MousePan.prototype.horizontal = true;
MousePan.prototype.vertical = true;
MousePan.prototype.onstart = null;
MousePan.prototype.ondrag = null;
MousePan.prototype.onend = null;
MousePan.prototype.enabled = false;

class ZapResizable extends StdConstruct {
    constructor(zoomAndPanObject) {
        super(zoomAndPanObject);
        this.zap = zoomAndPanObject;
    }

    start(e) {
        e.preventDefault();

        const fields = this.field === "default" ? this._field : new JSYG(this.field);
        const that = this;
        let cursor = null;
        const xInit = e.clientX;
        const yInit = e.clientY;
        const size = this.zap.size();

        const fcts = {
            mousemove(e) {
                const width = size.width + (that.horizontal ? e.clientX - xInit : 0);
                let height = size.height + (that.vertical ? e.clientY - yInit : 0);

                if (that.keepRatio) height = null;

                that.zap.size(width, height, that.keepViewBox);
                that.trigger("resize", that.zap.node, e);
            },

            mouseup(e) {
                new JSYG(window).off(fcts);

                if (cursor) {
                    fields.each(function () {
                        const $this = new JSYG(this);
                        $this.css("cursor", $this.data("svgresizable"));
                    });
                }

                that.trigger("end", that.zap.node, e);
            },
        };

        new JSYG(window).on(fcts);

        if (this.cursor === "auto") {
            if (this.horizontal === false) cursor = "n";
            else if (this.vertical === false) cursor = "e";
            else cursor = "se";
            cursor += "-resize";
        } else if (this.cursor) cursor = that.cursor;

        if (cursor) {
            fields.each(function () {
                const $this = new JSYG(this);
                $this.data("svgresizable", $this.css("cursor")).css("cursor", cursor);
            });
        }

        this.trigger("start", this.zap.node, e);
    }

    enable(opt) {
        const start = this.start.bind(this);
        let fields;
        const that = this;

        this.disable();

        if (opt) {
            this.set(opt);
        }

        if (!this.zap.enabled) {
            this.zap.enable();
        }

        if (this.horizontal === false || this.vertical === false) this.keepRatio = false;

        if (this.field === "default") {
            //this._field = new JSYG('<div>').addClass('SVGResize')  //GUSA
            //    .insertAfter(this.zap.overflow == "hidden" ? this.zap.node : this.zap.outerFrame);  //GUSA

            this._field = new JSYG("<div>");
            if (this.zap.overflow == "hidden") {
                this.zap.node.insertAdjacentElement("afterend", this._field[0]);
            } else {
                this.zap.outerFrame.insertAdjacentElement("afterend", this._field[0]);
            }
            this._field[0].classList.add("SVGResize");

            fields = this._field;
        } else fields = new JSYG(this.field);

        //fields.each(function() { new JSYG(this).on(that.event,start); });  //GUSA
        fields.each(function () {
            new JSYG(this)[0].addEventListener(that.event, start);
        });

        this.disable = function () {
            fields.each(function () {
                new JSYG(this).off(that.event, start);
            });

            if (this.field === "default") this._field.remove();

            this.enabled = false;
            return this;
        };

        this.enabled = true;

        return this;
    }

    disable() {}
}

ZapResizable.prototype.event = "mousedown";
ZapResizable.prototype.field = "default";
ZapResizable.prototype.cursor = "auto";
ZapResizable.prototype.horizontal = true;
ZapResizable.prototype.vertical = true;
ZapResizable.prototype.keepRatio = true;
ZapResizable.prototype.keepViewBox = true;
ZapResizable.prototype.onstart = null;
ZapResizable.prototype.onresize = null;
ZapResizable.prototype.onend = null;
ZapResizable.prototype.enabled = false;

