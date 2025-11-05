import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";
import { Path } from "../JSYG.Path/JSYG.Path.js";

export class PathDrawer extends StdConstruct {
    constructor(opt) {
        super();
        if (opt) this.set(opt);
    }

    drawPoint2Point(path, e) {
        path = new Path(path);

        if (!path[0].parentNode) throw new Error("Il faut attacher l'objet path à l'arbre DOM"); //GUSA

        const node = path[0];
        const jSvg = this.area ? new JSYG(this.area) : path.offsetParent("farthest");
        const autoSmooth = this.segment.toLowerCase() === "autosmooth";
        const segment = autoSmooth ? "L" : this.segment;
        const mtx = path.getMtx("screen").inverse();
        const xy = new JSYG.Vect(e.clientX, e.clientY).mtx(mtx);
        const that = this;

        function mousemove(e) {
            const mtx = path.getMtx("screen").inverse();
            const xy = new JSYG.Vect(e.clientX, e.clientY).mtx(mtx);
            const nbSegs = path.nbSegs();
            const seg = path.getSeg(nbSegs - 1);
            let pos;
            let first;
            let ref;

            if (that.strengthClosingMagnet != null) {
                first = path.getSeg(0);
                ref = new JSYG.Vect(first.x, first.y).mtx(mtx.inverse());
                pos = new JSYG.Vect(e.clientX, e.clientY);

                if (JSYG.distance(ref, pos) < that.strengthClosingMagnet) {
                    xy.x = first.x;
                    xy.y = first.y;
                }
            }

            seg.x = xy.x;
            seg.y = xy.y;

            path.replaceSeg(nbSegs - 1, seg);

            if (autoSmooth) path.autoSmooth(nbSegs - 1);

            that.trigger("draw", node, e);
        }

        function mousedown(e) {
            if (that.trigger("beforenewseg", node, e) === false) return;

            //si la courbe est fermée, un clic suffit pour terminer.
            if (path.nbSegs() > 3 && path.isClosed()) {
                if (that.trigger("beforeend", node, e) === false) return;
                return that.end();
            }

            if (e.detail === 2) return; //pas d'action au double-clic

            const mtx = path.getMtx("screen").inverse();
            const xy = new JSYG.Vect(e.clientX, e.clientY).mtx(mtx);

            path.addSeg(segment, xy.x, xy.y, xy.x, xy.y, xy.x, xy.y);

            if (autoSmooth) path.autoSmooth(path.nbSegs() - 1);

            that.trigger("newseg", node, e);
        }

        function dblclick(e, keepLastSeg) {
            path.removeSeg(path.nbSegs() - 1);

            if (that.trigger("beforeend", node, e) === false) return;

            //path.removeSeg(path.nbSegs()-1);

            that.end();
        }

        this.end = () => {
            let first;

            if (that.closePath && !path.isClosed()) {
                first = path.getSeg(0);
                path.addSeg(segment, first.x, first.y, first.x, first.y, first.x, first.y);
            }

            if (autoSmooth) path.autoSmooth(path.nbSegs() - 1);

            jSvg[0].removeEventListener("mousemove", mousemove);
            jSvg[0].removeEventListener("mousedown", mousedown);
            jSvg[0].removeEventListener("dblclick", dblclick);

            that.inProgress = false;

            const event = new CustomEvent("end", { detail: e });
            node.dispatchEvent(event);

            that.end = function () {
                return this;
            };
        };

        if (path.nbSegs() === 0) path.addSeg("M", xy.x, xy.y);

        that.inProgress = true;
        jSvg[0].addEventListener("mousemove", mousemove);
        jSvg[0].addEventListener("mousedown", mousedown);
        jSvg[0].addEventListener("dblclick", dblclick);

        mousedown(e);

        return this;
    }

    drawFreeHand(path, e) {
        path = new Path(path);

        if (!path[0].parentNode) throw new Error("Il faut attacher l'objet path à l'arbre DOM");

        const node = path[0];
        const autoSmooth = this.segment.toLowerCase() === "autosmooth";
        const segment = autoSmooth ? "L" : this.segment;
        const jSvg = this.area ? new JSYG(this.area) : path.offsetParent("farthest");
        const mtx = path.getMtx("screen").inverse();
        const xy = new JSYG.Vect(e.clientX, e.clientY).mtx(mtx);
        const that = this;

        function mousemove(e) {
            const xy = new JSYG.Vect(e.clientX, e.clientY).mtx(mtx);

            path.addSeg(segment, xy.x, xy.y, xy.x, xy.y, xy.x, xy.y);
            that.trigger("newseg", node, e);

            that.trigger("draw", node, e);
        }

        function mouseup(e) {
            that.end();
            that.trigger("end", node, e);
        }

        this.end = function () {
            const nbSegs = path.nbSegs();
            let last;
            let first;

            if (nbSegs == 1) path.remove();
            else {
                last = path.getLastSeg();
                first = path.getSeg(0);

                if (that.strengthClosingMagnet != null) {
                    if (JSYG.distance(first, last) < that.strengthClosingMagnet) {
                        last.x = first.x;
                        last.y = first.y;
                    }

                    path.replaceSeg(nbSegs - 1, last);
                }

                if (this.closePath && !path.isClosed()) {
                    path.addSeg(segment, first.x, first.y, first.x, first.y, first.x, first.y);
                }

                if (this.simplify) path.simplify(this.simplify);

                if (autoSmooth) path.autoSmooth();
            }

            that.inProgress = false;

            jSvg[0].removeEventListener("mousemove", mousemove);

            new JSYG(document)[0].removeEventListener("mouseup", mouseup);

            that.end = function () {
                return this;
            };
        };

        jSvg[0].addEventListener("mousemove", mousemove);

        new JSYG(document)[0].addEventListener("mouseup", mouseup);

        e.preventDefault();

        path.clear();
        path.addSeg("M", xy.x, xy.y);

        this.inProgress = true;

        return this;
    }

    draw(path, e) {
        if (this.type.toLowerCase() === "freehand") this.drawFreeHand(path, e);
        else this.drawPoint2Point(path, e);

        return this;
    }

    end() {
        return this;
    }
}

PathDrawer.prototype.area = null;
PathDrawer.prototype.segment = "autosmooth";
PathDrawer.prototype.type = "freehand";
PathDrawer.prototype.inProgress = false;
PathDrawer.prototype.simplify = 1;
PathDrawer.prototype.strengthClosingMagnet = 5;
PathDrawer.prototype.closePath = false;
PathDrawer.prototype.ondraw = false;
PathDrawer.prototype.onbeforeend = false;
PathDrawer.prototype.onend = false;
PathDrawer.prototype.onbeforenewseg = false;
PathDrawer.prototype.onnewseg = false;

