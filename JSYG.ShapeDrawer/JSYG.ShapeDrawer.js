import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";

export class ShapeDrawer extends StdConstruct {
    constructor(opt) {
        super();
        if (opt) this.set(opt);
    }

    drawLine(line, e) {
        line = new JSYG(line);

        const pos = line.getCursorPos(e);
        const that = this;

        line.attr({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });

        function mousemoveFct(e) {
            const pos = line.getCursorPos(e);

            line.attr({ x2: pos.x, y2: pos.y });

            that.trigger("draw", line[0], e, line[0]);
        }

        function mouseupFct(e) {
            new JSYG(document)[0].removeEventListener("mousemove", mousemoveFct);
            new JSYG(document)[0].removeEventListener("mouseup", mouseupFct);

            const dim = line.getDim();

            if (that.minArea != null && dim.width * dim.height < that.minArea) line.remove();

            that.trigger("end", line[0], e, line[0]);

            that.inProgress = false;
        }
        new JSYG(document)[0].addEventListener("mousemove", mousemoveFct);
        new JSYG(document)[0].addEventListener("mouseup", mouseupFct);

        this.inProgress = true;

        return this;
    }

    drawShape(shape, e) {
        shape = new JSYG(shape);

        const pos = shape.getCursorPos(e);
        const tag = shape.getTag();
        const resizer = new JSYG.Resizable(shape);
        const that = this;

        shape.setDim({
            x: pos.x - 1,
            y: pos.y - 1,
            width: 1,
            height: 1,
        });

        resizer.set({
            originX: tag == "rect" ? "left" : "center",

            originY: tag == "rect" ? "top" : "center",

            keepRatio: tag == "circle" ? true : false,

            cursor: false,

            inverse: true,

            ondrag(e) {
                that.trigger("draw", shape[0], e, shape[0]);
            },
        });

        if (this.options) resizer.set(this.options);

        resizer.on("end", e => {
            const dim = shape.getDim();

            if (that.minArea != null && dim.width * dim.height < that.minArea) shape.remove();

            that.trigger("end", shape[0], e, shape[0]);

            that.inProgress = false;
        });

        this.inProgress = true;

        resizer.start(e);

        return this;
    }

    draw(shape, e) {
        shape = new JSYG(shape);

        const tag = shape.getTag();

        return tag == "line" ? this.drawLine(shape, e) : this.drawShape(shape, e);
    }
}

ShapeDrawer.prototype.ondraw = false;

ShapeDrawer.prototype.onend = false;

ShapeDrawer.prototype.minArea = 2;

ShapeDrawer.prototype.options = null;

ShapeDrawer.prototype.inProgress = false;
