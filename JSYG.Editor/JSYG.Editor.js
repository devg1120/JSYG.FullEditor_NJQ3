import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";

import { BoundingBox } from "../JSYG.BoundingBox/JSYG.BoundingBox.js";

import { Alignment } from "../JSYG.Alignment/JSYG.Alignment.js";
import { Container } from "../JSYG.Container/JSYG.Container.js";
import { Selection } from "../JSYG.Selection/JSYG.Selection.js";
import { Draggable } from "../JSYG.Draggable/JSYG.Draggable.js";
import { Resizable } from "../JSYG.Resizable/JSYG.Resizable.js";
import { Rotatable } from "../JSYG.Rotatable/JSYG.Rotatable.js";

import { Path } from "../JSYG.Path/JSYG.Path.js";
import { ShapeInfo, Intersection} from "kld-intersections";
import { shape, intersect} from "svg-intersections";

const ctrls = ["Drag", "Resize", "Rotate", "CtrlPoints", "MainPoints"];
const plugins = ["box", "selection", "clipBoard"];

export class Editor extends StdConstruct {
    constructor(arg, opt) {
        super();
        this.ctrlsMainPoints = new MainPoints(this);
        this.ctrlsCtrlPoints = new CtrlPoints(this);
        this.ctrlsResize = new Resize(this);
        this.ctrlsRotate = new Rotate(this);
        this.ctrlsDrag = new Drag(this);

        this.selection = new Selection();
        this.selection.multiple = false;

        this.clipBoard = new ClipBoard(this);
        this.svgAttrUpdate = new SvgAttrUpdate(this);

        this.box = new BoundingBox();
        this.box.className = "fillBox";

        this.container = this.box.container;

        this.node = null;
        this.display = false;

        this._list = null;
        this._target = null;

        this._tempoContainer = new JSYG("<g>")[0];
        this._tempoContainer.classList.add("tempoContainer");

        if (arg) this.setNode(arg);
        if (opt) this.enable(opt);
    }

    set(options) {
        for (const n in options) {
            if (options.hasOwnProperty(n) && n in this) {
                if (ctrls.includes(n) || plugins.includes(n)) this[n].set(options[n]);
                else if (n == "target") this[n](options[n]);
                else this[n] = options[n];
            }
        }

        return this;
    }

    setNode(arg) {
        super.setNode(arg);
        this.selection.setNode(arg);

        return this;
    }

    target(arg, _preventEvent) {
        let target;
        let display;
        let container;

        if (arg == null) {
            if (!this._target) return null;
            target = new JSYG(this._target);
            return this.isMultiSelection() ? JSYG(target[0].children) : target; //GUSA
        }

        display = this.display;

        if (display) this.hide(null, true);

        target = new JSYG(arg);

        if (target.length > 1) {
            container = new Container(this._tempoContainer).freeItems();

            const parentElement = target[0].parentNode;
            if (parentElement) {
                parentElement.insertBefore(container[0], target[0]);
            }

            container.addItems(target);

            this._target = this._tempoContainer;
            this._oldTargets = container[0].children;
        } else {
            this._target = target[0];
            this._oldTargets = null;
        }

        this.box.setNode(this._target);

        if (display) this.show(null, true);

        if (!_preventEvent) this.trigger("changetarget", this.node, this._target);

        return this;
    }

    targetRemove(_preventEvent) {
        this._target = null;

        if (!_preventEvent) this.trigger("changetarget", this.node, null);
    }

    isMultiSelection() {
        return this._target == this._tempoContainer;
    }

    get list() {
        return this._list;
    }

    set list(list) {
        this._list = list;
        if (this.selection) {
            //ES6FIX
            this.selection.list = this._list;
        }
    }

    hide(e, _preventEvent) {
        if (!_preventEvent && this.trigger("beforehide", this.node, e, this._target) === false) return this;

        this.box.hide();

        let ctrl;
        let i;
        let N;
        let container;

        for (i = 0, N = ctrls.length; i < N; i++) {
            ctrl = this[`ctrls${ctrls[i]}`];
            if (ctrl && ctrl.enabled) ctrl.hide(_preventEvent);
        }

        if (this.isMultiSelection()) {
            container = new Container(this._tempoContainer);
            container.freeItems().remove();
        }

        this.display = false;

        if (!_preventEvent) this.trigger("hide", this.node, e, this._target);

        return this;
    }

    show(e, _preventEvent) {
        if (!_preventEvent && this.trigger("beforeshow", this.node, e, this._target) === false) return this;

        if (this.isMultiSelection()) this.target(this._oldTargets, _preventEvent);

        this.display = true;

        this.box.show();

        let ctrl;
        let i;
        let N;

        for (i = 0, N = ctrls.length; i < N; i++) {
            ctrl = this[`ctrls${ctrls[i]}`];
            if (ctrl && ctrl.enabled) ctrl.show(_preventEvent);
        }

        if (!_preventEvent) this.trigger("show", this.node, e, this._target);

        if (e && e.type == "mousedown" && this.ctrlsDrag.enabled) this.ctrlsDrag.start(e);

        return this;
    }

    update(e, _preventEvent) {
        if (!this.display) return this;

        this.box.update();

        let ctrl;
        let i;
        let N;

        for (i = 0, N = ctrls.length; i < N; i++) {
            ctrl = this[`ctrls${ctrls[i]}`];
            if (ctrl && ctrl.display) ctrl.update();
        }

        if (!_preventEvent) this.trigger("update", this.node, e, this._target);

        return this;
    }

    enableCtrls(...args) {
        const nbArgs = args.length;
        const arg1 = args[0];
        const that = this;
        let ctrlsToEnable = [];

        if (nbArgs === 0 || (nbArgs === 1 && arg1 == "all")) {
            ctrlsToEnable = ctrls;
        } else if (nbArgs === 1) {
            if (Array.isArray(arg1)) ctrlsToEnable = arg1;
            else if (typeof arg1 == "string") ctrlsToEnable = arg1.split(/\s*[,;\s]\s*/);
        } else {
            ctrlsToEnable = JSYG.makeArray(args);
        }

        ctrlsToEnable.forEach((ctrl) => {
            that[`ctrls${JSYG.ucfirst(ctrl)}`].enable();
        });

        return this;
    }

    disableCtrls(...args) {
        if (args.length === 0) {
            for (let i = 0, N = ctrls.length; i < N; i++) this[`ctrls${ctrls[i]}`].disable();
        } else {
            const that = this;

            JSYG.makeArray(args).forEach((arg) => {
                const ctrl = that[`ctrls${JSYG.ucfirst(arg)}`];
                if (ctrl) ctrl.disable();
            });
        }

        return this;
    }

    align(type) {
        if (!this.isMultiSelection()) return this;

        this.target().align(type);

        this.update();

        this.trigger("change", this.node, this._target);

        return this;
    }

    svgAttr() {
        const target = this.target();
        if (!target) return this;
        if (target.length == 0) return this;
        console.log("svgAttr", target.length);
        let jNode = new JSYG(target[0]);
        if (!jNode.isSVG()) return;
        const tag = jNode.getTag();
        console.log(tag);
        if (tag === "rect") {
            let c = target[0].getAttribute("class");
            let f = target[0].getAttribute("fill");
            let fo = target[0].getAttribute("fill-opacity");
            let s = target[0].getAttribute("stroke");
            let sw = target[0].getAttribute("stroke-width");

            console.log(c, f, fo, s, sw);
        }
    }

    svgAttrGet() {
        const target = this.target();
        if (!target) return this;
        if (target.length == 0) return this;
        console.log("svgAttrGet", target.length);
        let jNode = new JSYG(target[0]);
        if (!jNode.isSVG()) return;
        const tag = jNode.getTag();
        console.log(tag);
        if (tag === "rect") {
            let c = target[0].getAttribute("class");
            let f = target[0].getAttribute("fill");
            let fo = target[0].getAttribute("fill-opacity");
            let s = target[0].getAttribute("stroke");
            let sw = target[0].getAttribute("stroke-width");

            console.log(c, f, fo, s, sw);
        }
    }
    color() {
        const target = this.target();
        if (target.length == 0) return this;
        console.log("set color", target[0]);

        let jNode = new JSYG(target[0]);
        if (!jNode.isSVG()) return;

        const svg = jNode.offsetParent("farthest");
        const CTM = jNode.getMtx(svg);
        const tag = jNode.getTag();
        console.log(tag);
        if (tag === "rect") {
            // perso
            //
            console.log(target[0].getAttribute("class")); // org-class perso
            target[0].setAttribute("class", ""); // org-class perso
            target[0].setAttribute("fill", "red");
            target[0].setAttribute("fill-opacity", "1");
            target[0].setAttribute("stroke", "blue");
            target[0].setAttribute("stroke-width", "3");
        }

        this.update();
        this.trigger("change", this.node, this._target);
        return this;
    }

    findConnectShape(svg, cid) {
          document.querySelector("input:checked");
    }

    initSVG(svg) {
        //console.log("initSVG",svg);
	let lines = svg.querySelectorAll("line");
        console.log("lines",lines.length);
        for (let i = 0; i < lines.length ; i++) {
             let f_id = lines[i].getAttributeNS(null, 'from-id' )
             let t_id = lines[i].getAttributeNS(null, 'to-id' )
             
             if ( f_id == null && t_id == null ) return;
             console.log("conector", f_id, t_id)

             //let from = svg.querySelector('[cid="24033307-7uczljr"]');
             //let to   = svg.querySelector('[cid="24033307-fu1ot9q"]');

             let from = svg.querySelector('[cid="' + f_id + '"]');
             let to   = svg.querySelector('[cid="' + t_id + '"]');
             //console.log("from to ",from, to);
	
             const connector = new Connector(this, svg );
             connector.connectLoadset(lines[i], from, to);
             //from.connector = connector;
             //to.connector = connector;
             if (! from.connectors) {
                 from.connectors = [];
	     }
             from.connectors.push(connector) ;
             if (! to.connectors) {
                 to.connectors = [];
	     }
             to.connectors.push(connector) ;


	}
    }
    connector(svg) {
        const target = this.target();
        if (!target) return this;
        if (target.length != 2) return this;
        console.log("set connector", svg);
        //const connector = new Connector(this, svg, target[0], target[1]);
        const connector = new Connector(this, svg );
        connector.connectCreate(target[0], target[1]);
        //target[0].connector = connector;
        //target[1].connector = connector;
             if (! target[0].connectors) {
                 target[0].connectors = [];
	     }
             target[0].connectors.push(connector) ;
             if (! target[1].connectors) {
                 target[1].connectors = [];
	     }
             target[1].connectors.push(connector) ;

        //let line = connector.getLine();
        //const svg = document.querySelector("#containerDoc > svg");
        //svg.appendChild(line);

        //this.update();
        //this.trigger("change", this.node, this._target);
    }

    up() {
        this.update();
        this.trigger("change", this.node, this._target);
    }

    group() {
        const target = this.target();
        let g;
        let parent;

        if (target.length == 1) return this;

        console.log("target length", target.length);
        g = new JSYG("<g>");

        parent = JSYG(target[0].parentNode);

        let p = g.appendTo_(parent);
        p.append_(target);
        this.target(p).update();

        const event = new CustomEvent("change", { detail: this._target });
        this.node.dispatchEvent(event);

        return this;
    }

    ungroup() {
        const g = this.target();

        if (!this.isGroup()) return this;

        new Container(g).freeItems();

        this.hide();

        const event = new CustomEvent("change", { detail: this._target });
        this.node.dispatchEvent(event);

        return this;
    }

    isGroup() {
        const g = this.target();

        return g.getTag() == "g" && g.length == 1;
    }

    enable(opt) {
        let selectFcts;
        let n;
        const that = this;

        this.disable();

        if (opt) this.set(opt);

        if (!this._list) this.list = "*";

        selectFcts = {
            "beforedeselect beforedrag": function ({ target }) {
                if (target == that.container || new JSYG(target).isChildOf(that.container)) return false;
            },

            selectover(e, elmt) {
                new JSYG(elmt).boundingBox("show");
            },

            selectout(e, elmt) {
                new JSYG(elmt).boundingBox("hide");
            },

            selectedlist(e, list) {
                new JSYG(list).boundingBox("hide");

                that.target(list).show(e);
            },

            deselectedlist(e) {
                that.hide(e);
                that.targetRemove();
            },
        };

        this.enabled = true;

        if (opt) {
            for (n in opt) {
                if (ctrls.includes(n) || n == "clipBoard") this[n].enable();
                else if (n == "ctrls") this.enableCtrls(opt[n]);
            }
        }

        this.selection.on(selectFcts).enable();

        this.disable = function () {
            this.hide();

            this.targetRemove();

            this.selection.off(selectFcts).disable();

            this.enabled = false;

            return this;
        };

        return this;
    }

    disable() {
        this.hide();

        this.targetRemove();

        this.enabled = false;

        return this;
    }
}

Editor.prototype.onchangetarget = null;
Editor.prototype.onbeforeshow = null;
Editor.prototype.onshow = null;
Editor.prototype.onbeforehide = null;
Editor.prototype.onhide = null;
Editor.prototype.onupdate = null;
Editor.prototype.onstart = null;
Editor.prototype.ondragstart = null;
Editor.prototype.ondrag = null;
Editor.prototype.ondragend = null;
Editor.prototype.onend = null;

Editor.prototype.onchange = null;

Editor.prototype.list = null;

if (Object.defineProperty) {
    try {
    } catch (e) {}
}

function guid() {
  const timestamp = new Date().getTime().toString().substr(5,20)
  const randomString = Math.random().toString(36).substr(2, 7); // ランダムな文字列
  return timestamp + "-" + randomString;
}

class Connector extends StdConstruct {
    constructor(editor, svg ) {
        super();
        this.editor = editor;
        this.svg = svg;
    }

    connectCreate( from, to) {
        this.node1 = from;
        this.node2 = to;
        console.log("connector init: ", from.tagName, to.tagName);

        /*
 <line fill="#ffffff" stroke="#000000" stroke-width="1" x1="178.80528259277344" y1="238.88331604003906" x2="238.55137634277344" y2="255.4794464111328"></line>

 <polyline points="0,100 50,25 50,75 100,0" />

 */
        const svgNamespace = "http://www.w3.org/2000/svg";
        this.line = document.createElementNS(svgNamespace, "line");
        this.updateConnection();

        this.line.setAttributeNS(null, "stroke", "black");
        this.line.setAttributeNS(null, "strok-width", "3");

        this.svg.appendChild(this.line);
        //const id1= guid();
        //const id2= guid();

        let id1, id2;
        id1 = this.node1.getAttributeNS(null, 'cid');
        if (!id1) id1= guid();
        id2 = this.node2.getAttributeNS(null, 'cid');
        if (!id2) id2= guid();

        this.node1.setAttributeNS(null, 'cid', id1);
        this.node2.setAttributeNS(null, 'cid', id2);
        this.line.setAttributeNS(null, 'from-id', id1);
        this.line.setAttributeNS(null, 'to-id', id2);
    }

    connectLoadset( line, from, to) {
        console.log("connector loadset : ", line.tagName, from.tagName, to.tagName);
        this.line = line;
        this.node1 = from;
        this.node2 = to;
        //let fid = this.line.setAttributeNS(null, 'from-id', );
        //let tid = this.line.setAttributeNS(null, 'to-id', );
        //console.log("connector load: ", fid, tid );

        this.updateConnection();

    }
    getLine() {
        return this.line;
    }

    updateConnection_() {
      //console.trace();
      if (this.node1.tagName == 'rect'    && this.node2.tagName == 'rect'    )  this.connect_rect_rect();
      if (this.node1.tagName == 'circle'  && this.node2.tagName == 'circle'  )  this.connect_circle_circle();
      if (this.node1.tagName == 'ellipse' && this.node2.tagName == 'polygon' )  this.connect_ellipse_polygon();
    }

    updateConnection_() {

    }
    updateConnection() {


        let n1 = this.get_center_point(this.node1) 
        let n2 = this.get_center_point(this.node2) 
        //console.log(n1);
        //console.log(n2);
        const line = ShapeInfo.line(n1[1], n2[1]);
        const isc1 = Intersection.intersect(n1[0], line);
        const isc2 = Intersection.intersect(n2[0], line);

        //console.log(n1[2])
        //console.log(n2[2])

        this.line.setAttributeNS(null, "x1", isc1.points[0].x);
        this.line.setAttributeNS(null, "y1", isc1.points[0].y);
        this.line.setAttributeNS(null, "x2", isc2.points[0].x);
        this.line.setAttributeNS(null, "y2", isc2.points[0].y);

    }
    get_center_point(node) {
        if (node.tagName == 'rect') {
            var x = parseFloat(node.getAttributeNS(null, "x"));
            var y = parseFloat(node.getAttributeNS(null, "y"));
            var w = parseFloat(node.getAttributeNS(null, "width"));
            var h = parseFloat(node.getAttributeNS(null, "height")) ;
            var t = node.getAttributeNS(null, "transform") ;
            var cx = x + parseFloat(w / 2);
            var cy = y + parseFloat(h / 2);
            const rect = ShapeInfo.rectangle([x,y],[w,h]);
            return [rect, [cx, cy], t]
	} else if (node.tagName == 'circle') {
            var cx = parseFloat(node.getAttributeNS(null, "cx"));
            var cy = parseFloat(node.getAttributeNS(null, "cy"));
            var r  = parseFloat(node.getAttributeNS(null, "r"));
            var t = node.getAttributeNS(null, "transform") ;
            const circle = ShapeInfo.circle(cx,cy,r);
            return [circle, [cx, cy], t]
	} else if (node.tagName == 'ellipse') {
            var cx = parseFloat(node.getAttributeNS(null, "cx"));
            var cy = parseFloat(node.getAttributeNS(null, "cy"));
            var rx = parseFloat(node.getAttributeNS(null, "rx"));
            var ry = parseFloat(node.getAttributeNS(null, "ry"));
            var t = node.getAttributeNS(null, "transform") ;
            const ellipse = ShapeInfo.ellipse([cx,cy],rx, ry);
            return [ellipse, [cx, cy], t]
	} else if (node.tagName == 'polygon') {
            var points_str = node.getAttributeNS(null, "points");
            var t = node.getAttributeNS(null, "transform") ;
            var list = points_str.split(' ');
            let points_array = [];
            for (let i = 0; i < list.length ;i =  i+2) {
                      let point = [parseFloat(list[i]), parseFloat(list[i+1])]
	    	  points_array.push(point);
	    }
            let center = this.polygon_center(points_array);
            const polygon = ShapeInfo.polygon(points_array);
            return [polygon, center, t]
	} else  {
            throw("connection node type", node.tagName)
        }
    }
/*
    get_intersect_point(node, c1, c2) {
        const line = ShapeInfo.line(c1, c2);

        const isc = Intersection.intersect(node, line);
        return isc
    }
*/
    connect_rect_rect_old() {
        // Top left coordinates
        var x1 = parseFloat(this.node1.getAttributeNS(null, "x"));
        var y1 = parseFloat(this.node1.getAttributeNS(null, "y"));
        var x2 = parseFloat(this.node2.getAttributeNS(null, "x"));
        var y2 = parseFloat(this.node2.getAttributeNS(null, "y"));
        
        // Half widths and half heights
        var w1 = parseFloat(this.node1.getAttributeNS(null, "width")) / 2;
        var h1 = parseFloat(this.node1.getAttributeNS(null, "height")) / 2;
        var w2 = parseFloat(this.node2.getAttributeNS(null, "width")) / 2;
        var h2 = parseFloat(this.node2.getAttributeNS(null, "height")) / 2;

        // Center coordinates
        var cx1 = x1 + w1;
        var cy1 = y1 + h1;
        var cx2 = x2 + w2;
        var cy2 = y2 + h2;

        // Distance between centers
        var dx = cx2 - cx1;
        var dy = cy2 - cy1;

        var p1 = this.getIntersection_rect(dx, dy, cx1, cy1, w1, h1);
        var p2 = this.getIntersection_rect(-dx, -dy, cx2, cy2, w2, h2);

        this.line.setAttributeNS(null, "x1", p1[0]);
        this.line.setAttributeNS(null, "y1", p1[1]);
        this.line.setAttributeNS(null, "x2", p2[0]);
        this.line.setAttributeNS(null, "y2", p2[1]);
    }

    getIntersection_rect(dx, dy, cx, cy, w, h) {
        if (Math.abs(dy / dx) < h / w) {
            // Hit vertical edge of box1
            return [cx + (dx > 0 ? w : -w), cy + (dy * w) / Math.abs(dx)];
        } else {
            // Hit horizontal edge of box1
            return [cx + (dx * h) / Math.abs(dy), cy + (dy > 0 ? h : -h)];
        }
    }

    polygon_center_( points_array ) {
           console.log("------", points_array );
               let x_min = parseFloat(points_array[0][0])
               let x_max = parseFloat(points_array[0][0])
               let y_min = parseFloat(points_array[0][1])
               let y_max = parseFloat(points_array[0][1])

       for (let i =1; i< points_array.length; i++) {
           console.log("--")

               if (x_min > parseFloat(points_array[i][0])) x_min = parseFloat(points_array[i][0])
               if (x_max < parseFloat(points_array[i][0])) x_max = parseFloat(points_array[i][0])
               if (y_min > parseFloat(points_array[i][1])) y_min = parseFloat(points_array[i][1])
               if (y_max < parseFloat(points_array[i][1])) y_max = parseFloat(points_array[i][1])
       }
      //let center_x = x_min + parseFloat(( x_max - x_min)/2);
      //let center_y = y_min + parseFloat(( y_max - y_min)/2);
      let center_x = x_min + ( x_max - x_min)/2;
      let center_y = y_min + ( y_max - y_min)/2;
      return [ center_x, center_y ]

    }


    polygon_center2( points_array ) {
       let x_min = points_array[0][0]
       let x_max = points_array[0][0]
       let y_min = points_array[0][1]
       let y_max = points_array[0][1]

       for (let i =1; i< points_array.length; i++) {
               if (x_min > points_array[i][0]) x_min = points_array[i][0]
               if (x_max < points_array[i][0]) x_max = points_array[i][0]
               if (y_min > points_array[i][1]) y_min = points_array[i][1]
               if (y_max < points_array[i][1]) y_max = points_array[i][1]
       }
      let center_x = x_min + ( x_max - x_min)/2;
      let center_y = y_min + ( y_max - y_min)/2;
      return [ center_x, center_y ]

    }

 polygon_center(arr)
{
    var minX, maxX, minY, maxY;
    for (var i = 0; i < arr.length; i++)
    {
        minX = (arr[i][0] < minX || minX == null) ? arr[i][0] : minX;
        maxX = (arr[i][0] > maxX || maxX == null) ? arr[i][0] : maxX;
        minY = (arr[i][1] < minY || minY == null) ? arr[i][1] : minY;
        maxY = (arr[i][1] > maxY || maxY == null) ? arr[i][1] : maxY;
    }
    return [(minX + maxX) / 2, (minY + maxY) / 2];
}
    connect_ellipse_polygon() {
	    //console.log("connect_ellipse_polygon");
        var cx1 = parseFloat(this.node1.getAttributeNS(null, "cx"));
        var cy1 = parseFloat(this.node1.getAttributeNS(null, "cy"));
        var rx1 = parseFloat(this.node1.getAttributeNS(null, "rx"));
        var ry1 = parseFloat(this.node1.getAttributeNS(null, "ry"));

        const ellipse1 = ShapeInfo.ellipse([cx1,cy1],rx1, ry1);

        var points_str = this.node2.getAttributeNS(null, "points");
        //console.log("points_str", points_str);
        var list = points_str.split(' ');
        let points_array = [];
        for (let i = 0; i < list.length ;i =  i+2) {
                  let point = [parseFloat(list[i]), parseFloat(list[i+1])]
		  points_array.push(point);
	}
        let center = this.polygon_center(points_array);
        const polygon2 = ShapeInfo.polygon(points_array);

	    
        const line = ShapeInfo.line([cx1, cy1], center);

        const isc1 = Intersection.intersect(ellipse1, line);
        const isc2 = Intersection.intersect(polygon2, line);
        console.log("isc1", isc1)
        console.log("isc2", isc2)
        this.line.setAttributeNS(null, "x1", isc1.points[0].x);
        this.line.setAttributeNS(null, "y1", isc1.points[0].y);
        if (isc2.points.length == 2)  {
          this.line.setAttributeNS(null, "x2", isc2.points[1].x);
          this.line.setAttributeNS(null, "y2", isc2.points[1].y);
	} else {
          this.line.setAttributeNS(null, "x2", isc2.points[0].x);
          this.line.setAttributeNS(null, "y2", isc2.points[0].y);

	}
    }

    connect_rect_rect() {
        // Top left coordinates
        var x1 = parseFloat(this.node1.getAttributeNS(null, "x"));
        var y1 = parseFloat(this.node1.getAttributeNS(null, "y"));
        var x2 = parseFloat(this.node2.getAttributeNS(null, "x"));
        var y2 = parseFloat(this.node2.getAttributeNS(null, "y"));
        
        // Half widths and half heights
        var w1 = parseFloat(this.node1.getAttributeNS(null, "width"));
        var h1 = parseFloat(this.node1.getAttributeNS(null, "height")) ;
        var w2 = parseFloat(this.node2.getAttributeNS(null, "width")) ;
        var h2 = parseFloat(this.node2.getAttributeNS(null, "height")) ;

        // Center coordinates
        var cx1 = x1 + parseFloat(w1 / 2);
        var cy1 = y1 + parseFloat(h1 / 2);
        var cx2 = x2 + parseFloat(w2 / 2);
        var cy2 = y2 + parseFloat(h2 / 2);

	// github.com/thelonious/kld-intersections/blob/development/lib/ShapeInfo.js
        const rect1 = ShapeInfo.rectangle([x1,y1],[w1,h1]);
        const rect2 = ShapeInfo.rectangle([x2,y2],[w2,h2]);
        const line = ShapeInfo.line([cx1, cy1], [cx2, cy2]);
        const isc1 = Intersection.intersect(rect1, line);
        const isc2 = Intersection.intersect(rect2, line);
        
        //console.log(isc1, isc2);

        this.line.setAttributeNS(null, "x1", isc1.points[0].x);
        this.line.setAttributeNS(null, "y1", isc1.points[0].y);
        this.line.setAttributeNS(null, "x2", isc2.points[0].x);
        this.line.setAttributeNS(null, "y2", isc2.points[0].y);

    }
    connect_circle_circle() {
        // Center coordinates
        var cx1 = parseFloat(this.node1.getAttributeNS(null, "cx"));
        var cy1 = parseFloat(this.node1.getAttributeNS(null, "cy"));
        var r1  = parseFloat(this.node1.getAttributeNS(null, "r"));
        var cx2 = parseFloat(this.node2.getAttributeNS(null, "cx"));
        var cy2 = parseFloat(this.node2.getAttributeNS(null, "cy"));
        var r2  = parseFloat(this.node2.getAttributeNS(null, "r"));
        

        const circle1 = ShapeInfo.circle(cx1,cy1,r1);
        const circle2 = ShapeInfo.circle(cx2,cy2,r2);
        const line = ShapeInfo.line([cx1, cy1], [cx2, cy2]);
        const isc1 = Intersection.intersect(circle1, line);
        const isc2 = Intersection.intersect(circle2, line);
        
        //console.log(isc1, isc2);

        this.line.setAttributeNS(null, "x1", isc1.points[0].x);
        this.line.setAttributeNS(null, "y1", isc1.points[0].y);
        this.line.setAttributeNS(null, "x2", isc2.points[0].x);
        this.line.setAttributeNS(null, "y2", isc2.points[0].y);
    }
}

class Connector_old extends StdConstruct {
    constructor(editor, svg, from, to) {
        super();
        this.editor = editor;
        this.svg = svg;
        this.node1 = from;
        this.node2 = to;
        console.log("connector init: ", from, to);

        /*
 <line fill="#ffffff" stroke="#000000" stroke-width="1" x1="178.80528259277344" y1="238.88331604003906" x2="238.55137634277344" y2="255.4794464111328"></line>

 <polyline points="0,100 50,25 50,75 100,0" />

 */
        const svgNamespace = "http://www.w3.org/2000/svg";
        this.line = document.createElementNS(svgNamespace, "line");
        this.updateConnection();
        /*
        this.line.setAttributeNS(null, 'x1', "178");
        this.line.setAttributeNS(null, 'y1', "238");
        this.line.setAttributeNS(null, 'x2', "238");
        this.line.setAttributeNS(null, 'y2', "255");
*/
        this.line.setAttributeNS(null, "stroke", "black");
        this.line.setAttributeNS(null, "strok-width", "3");

        this.svg.appendChild(this.line);
        const id1= guid();
        const id2= guid();
        this.node1.setAttributeNS(null, 'cid', id1);
        this.node2.setAttributeNS(null, 'cid', id2);
        this.line.setAttributeNS(null, 'from-id', id1);
        this.line.setAttributeNS(null, 'to-id', id2);
    }
    getLine() {
        return this.line;
    }

    updateConnection() {
        // Top left coordinates
        var x1 = parseFloat(this.node1.getAttributeNS(null, "x"));
        var y1 = parseFloat(this.node1.getAttributeNS(null, "y"));
        var x2 = parseFloat(this.node2.getAttributeNS(null, "x"));
        var y2 = parseFloat(this.node2.getAttributeNS(null, "y"));
        
        // Half widths and half heights
        var w1 = parseFloat(this.node1.getAttributeNS(null, "width")) / 2;
        var h1 = parseFloat(this.node1.getAttributeNS(null, "height")) / 2;
        var w2 = parseFloat(this.node2.getAttributeNS(null, "width")) / 2;
        var h2 = parseFloat(this.node2.getAttributeNS(null, "height")) / 2;

        // Center coordinates
        var cx1 = x1 + w1;
        var cy1 = y1 + h1;
        var cx2 = x2 + w2;
        var cy2 = y2 + h2;

        // Distance between centers
        var dx = cx2 - cx1;
        var dy = cy2 - cy1;

        var p1 = this.getIntersection(dx, dy, cx1, cy1, w1, h1);
        var p2 = this.getIntersection(-dx, -dy, cx2, cy2, w2, h2);

        this.line.setAttributeNS(null, "x1", p1[0]);
        this.line.setAttributeNS(null, "y1", p1[1]);
        this.line.setAttributeNS(null, "x2", p2[0]);
        this.line.setAttributeNS(null, "y2", p2[1]);
    }

    getIntersection(dx, dy, cx, cy, w, h) {
        if (Math.abs(dy / dx) < h / w) {
            // Hit vertical edge of box1
            return [cx + (dx > 0 ? w : -w), cy + (dy * w) / Math.abs(dx)];
        } else {
            // Hit horizontal edge of box1
            return [cx + (dx * h) / Math.abs(dy), cy + (dy > 0 ? h : -h)];
        }
    }
}

class SvgAttrUpdate extends StdConstruct {
    constructor(editorObject) {
        super();
        this.editor = editorObject;
        this.svgAttrGet = document.querySelector("#svgAttrGet");
        this.svgAttrSet = document.querySelector("#svgAttrSet");
        this.svgAttrSet.addEventListener("click", this.set);
        this.svgAttrGet.addEventListener("click", this.get);

        this.input_fill = document.querySelector("#fill");
        this.input_fill.addEventListener("input", this.fill);

        this.input_fillColor = document.querySelector("#fill-color");
        this.input_fillColor.addEventListener("input", this.fillColor);

        this.input_fillOpacity = document.querySelector("#fill-opacity");
        this.input_fillOpacity.addEventListener("input", this.fillOpacity);

        this.input_fillFilter = document.querySelector("#fill-filter");
        this.input_fillFilter.addEventListener("change", this.fillFilter);

        this.input_stroke = document.querySelector("#stroke");
        this.input_stroke.addEventListener("input", this.stroke);

        this.input_strokeColor = document.querySelector("#stroke-color");
        this.input_strokeColor.addEventListener("input", this.strokeColor);

        this.input_strokeOpacity = document.querySelector("#stroke-opacity");
        this.input_strokeOpacity.addEventListener("input", this.strokeOpacity);

        this.input_strokeWidth = document.querySelector("#stroke-width");
        this.input_strokeWidth.addEventListener("input", this.strokeWidth);

        this.input_strokeDash = document.querySelector("#stroke-dash");
        this.input_strokeDash.addEventListener("input", this.strokeDash);
    }

    target() {
        const target = this.editor.target();
        if (!target) return null;
        return target[0];
    }
    update() {
        this.editor.up();
    }

    set() {
        console.log("set");
    }

    get() {
        console.log("get");
    }

    /** fill **/
    fill = (event) => {
        event.preventDefault();
        this.setAttr("fill", this.input_fill.value);
    };

    fillColor = (event) => {
        event.preventDefault();
        this.setAttr("fill", this.input_fillColor.value);
    };

    fillOpacity = (event) => {
        event.preventDefault();
        this.setAttr("fill-opacity", this.input_fillOpacity.value);
    };

    fillFilter = (event) => {
        event.preventDefault();
        const filter_ptn = this.input_fillFilter.value;
        let filter = "";
        if (filter_ptn == "shadow1") filter = "url(#shadow1)";
        if (filter_ptn == "shadow2") filter = "url(#shadow2)";
        if (filter_ptn == "shadow3") filter = "url(#shadow3)";

        this.setAttr("filter", filter);
    };

    /** stroke **/
    stroke = (event) => {
        event.preventDefault();
        this.setAttr("stroke", this.input_stroke.value);
    };

    strokeColor = (event) => {
        event.preventDefault();
        this.setAttr("stroke", this.input_strokeColor.value);
    };

    strokeOpacity = (event) => {
        event.preventDefault();
        this.setAttr("stroke-opacity", this.input_strokeOpacity.value);
    };

    strokeWidth = (event) => {
        event.preventDefault();
        this.setAttr("stroke-width", this.input_strokeWidth.value);
    };

    strokeDash = (event) => {
        event.preventDefault();
        const dash_ptn = this.input_strokeDash.value;
        let dasharray = "";
        if (dash_ptn == "ptn1") dasharray = "4";
        if (dash_ptn == "ptn2") dasharray = "4 1";
        if (dash_ptn == "ptn3") dasharray = "4 1 2";
        if (dash_ptn == "ptn4") dasharray = "4 1 2 3";

        this.setAttr("stroke-dasharray", dasharray);
    };

    setAttr(name, value) {
        console.log(name, value);
        const targets = this.editor.target();
        if (!targets) return null;
        for (let i = 0; i < targets.length; i++) {
            //targets[i].setAttribute("class", "");
            targets[i].setAttribute(name, value);
        }
        this.update();
    }
}

class ClipBoard extends StdConstruct {
    constructor(editorObject) {
        super();
        this.editor = editorObject;
    }

    copy() {
        console.log("--copy");
        const target = new JSYG(this.editor._target);

        this._multiSelection = this.editor.isMultiSelection();

        if (!target.length) return this;

        //this.buffer = target.clone()[0];
        //this._parent = target.parent()[0];
        this.buffer = target[0].cloneNode(true);
        this._parent = target[0].parentNode;

        this.trigger("copy", this.editor.node, target[0], this.buffer);
        return this;
    }

    cut() {
        const target = new JSYG(this.editor._target);

        this._multiSelection = this.editor.isMultiSelection();

        if (!target.length) return this;

        this.buffer = target.clone()[0];
        this._parent = target.parent()[0];

        this.editor.hide();
        this.editor.target().remove();
        this.editor.targetRemove();

        this.trigger("cut", this.editor.node, this.buffer);
        this.editor.trigger("change", this.editor.node, this.buffer);

        return this;
    }

    paste(parent) {
        console.log("--paste");

        if (!this.buffer) return this;

        const clone = new JSYG(this.buffer);
        let children;
        let dim;

        parent = new JSYG(parent || this._parent);

        //clone.appendTo(parent); //GUSA
        clone.appendTo_(parent);

        dim = clone.getDim(parent);

        clone.setDim({
            x: dim.x + this.pasteOffset,
            y: dim.y + this.pasteOffset,
            from: parent,
        });

        //this.buffer = clone.clone()[0]; //GUSA
        this.buffer = clone[0].cloneNode(true);

        if (this._multiSelection) {
            children = clone.children();
            new Container(clone).freeItems().remove();
            this.editor.target(children).show(true);
        } else this.editor.target(clone).show(true);

        this.trigger("paste", this.editor.node, clone[0]);
        this.editor.trigger("change", this.editor.node, clone[0]);

        return this;
    }

    enableKeyShortCuts(opt) {
        this.disable();

        if (opt) this.set(opt);

        const that = this;
        const $doc = new JSYG(document);

        function copy(e) {
            if (!that.editor.display) return;
            e.preventDefault();
            that.copy();
        }

        function cut(e) {
            if (!that.editor.display) return;
            e.preventDefault();
            that.cut();
        }

        function paste(e) {
            if (!that.buffer) return;
            e.preventDefault();
            that.paste();
        }

        if (this.keyShortCutCopy) $doc.on("keydown", null, this.keyShortCutCopy, copy);
        if (this.keyShortCutCut) $doc.on("keydown", null, this.keyShortCutCut, cut);
        if (this.keyShortCutPaste) $doc.on("keydown", null, this.keyShortCutPaste, paste);

        this.disableKeyShortCuts = function () {
            if (this.keyShortCutCopy) $doc.off("keydown", null, this.keyShortCutCopy, copy);
            if (this.keyShortCutCut) $doc.off("keydown", null, this.keyShortCutCut, cut);
            if (this.keyShortCutPaste) $doc.off("keydown", null, this.keyShortCutPaste, paste);

            this.enabled = false;

            return this;
        };

        this.enabled = true;
        return this;
    }

    disableKeyShortCuts() {
        return this;
    }
}

ClipBoard.prototype.pasteOffset = 10;

ClipBoard.prototype.oncopy = null;
ClipBoard.prototype.oncut = null;
ClipBoard.prototype.onpaste = null;

ClipBoard.prototype.keyShortCutCopy = "ctrl+c";
ClipBoard.prototype.keyShortCutCut = "ctrl+x";
ClipBoard.prototype.keyShortCutPaste = "ctrl+v";

ClipBoard.prototype.enabled = false;

ClipBoard.prototype.buffer = null;

ClipBoard.prototype._parent = null;
ClipBoard.prototype._multiSelection = null;

function CtrlPoints(editorObject) {
    this.editor = editorObject;
    this.list = [];
    this.container = new JSYG("<g>")[0];
}

CtrlPoints.prototype = {
    constructor: CtrlPoints,

    container: null,
    className: "ctrlPoints",
    shape: "circle",
    xlink: null,
    width: 10,
    height: 10,
    linked: true,
    draggableOptions: null,
    onshow: null,
    onhide: null,
    onstart: null,
    ondragstart: null,
    ondrag: null,
    ondragend: null,
    onend: null,
    enabled: false,
    display: false,

    set: StdConstruct.prototype.set,
    on: StdConstruct.prototype.on,
    off: StdConstruct.prototype.off,
    trigger: StdConstruct.prototype.trigger,

    _remove(i) {
        if (!this.list[i]) return;

        const elmts = ["pt1", "path1", "pt2", "path2"];
        const that = this;

        elmts.forEach((elmt) => {
            if (that.list[i][elmt]) new JSYG(that.list[i][elmt]).remove();
        });

        this.list.splice(i, 1);

        return this;
    },

    enable(opt) {
        this.hide(true);

        if (opt) this.set(opt);

        const container = this.editor.box.container;

        if (container && container.parentNode) this.show();

        this.enabled = true;

        return this;
    },

    disable() {
        this.hide();
        this.enabled = false;
        return this;
    },

    show(opt, _preventEvent) {
        if (opt) this.set(opt);

        const node = this.editor._target;

        if (!node) return this.hide();

        this.node = node;

        const jNode = new JSYG(node);

        if (!jNode.isSVG()) return this;

        const svg = jNode.offsetParent("farthest");
        const CTM = jNode.getMtx(svg);
        const tag = jNode.getTag();

        const // JSYG.support.needReplaceSeg, ne fonctionne pas avec le polyfill pathseg, je ne comprends pas pourquoi
            needReplace = true;

        let list = [];
        let N;
        const that = this;

        const start = (e) => {
            new JSYG(that.container).appendTo(that.editor.box.container);
            that.editor.trigger("start", node, e);
            that.trigger("start", node, e);
        };

        const dragstart = (e) => {
            that.editor.trigger("dragstart", node, e);
            that.trigger("dragstart", node, e);
        };

        const dragend = (e) => {
            that.editor.update();
            that.editor.trigger("dragend", node, e);
            that.editor.trigger("change", node, e);
            that.trigger("dragend", node, e);
        };

        const end = (e) => {
            that.editor.trigger("end", node, e);
            that.trigger("end", node, e);
        };

        if (!this.container.parentNode) {
            new JSYG(this.container).appendTo(this.editor.box.container).addClass(this.className);
        }

        if (tag === "path") {
            const jPath = new Path(node);

            jPath.rel2abs();

            list = jPath.getSegList().map((seg) => ({
                seg,
            }));

            list.forEach((item, i) => {
                if (!that.list[i]) {
                    that.list[i] = {};
                }

                let pt1;
                let pt2;
                let jShape;
                let path;
                let drag;
                const seg = item.seg;
                const test1 = seg.x1 != null && seg.y1 != null;
                const test2 = seg.x2 != null && seg.y2 != null;

                if (test1 || test2) {
                    if (test1) {
                        pt1 = new JSYG.Vect(seg.x1, seg.y1).mtx(CTM);
                        pt2 = jPath.getCurPt(i).mtx(CTM);

                        if (that.list[i].path1) path = new Path(that.list[i].path1);
                        else {
                            path = new Path();
                            path.appendTo(that.container);
                        }

                        path.clear().moveTo(pt1.x, pt1.y).lineTo(pt2.x, pt2.y);

                        that.list[i].path1 = path[0];

                        drag = function (e) {
                            const path1 = new Path(that.list[i].path1);
                            const CTM = jPath.getMtx(svg);
                            const jShape = new JSYG(this);
                            const center = jShape.getCenter();
                            let pt = new JSYG.Vect(center.x, center.y).mtx(jShape.getMtx(svg));

                            path1.replaceSeg(0, "M", pt.x, pt.y);
                            pt = pt.mtx(CTM.inverse());

                            seg.x1 = pt.x;
                            seg.y1 = pt.y;

                            if (i > 0 && that.linked) {
                                const prevSeg = list[i - 1].seg;

                                if (prevSeg.x2 != null && prevSeg.y2 != null) {
                                    const angle = Math.atan2(seg.y1 - prevSeg.y, seg.x1 - prevSeg.x) + Math.PI;

                                    const path2 = new Path(that.list[i - 1].path2);

                                    const dist = Math.sqrt((prevSeg.x2 - prevSeg.x) ** 2 + (prevSeg.y2 - prevSeg.y) ** 2);

                                    const x2 = prevSeg.x2;
                                    prevSeg.x2 = prevSeg.x + dist * Math.cos(angle);
                                    prevSeg.y2 = prevSeg.y + dist * Math.sin(angle);

                                    pt = new JSYG.Vect(prevSeg.x2, prevSeg.y2).mtx(CTM);
                                    new JSYG(that.list[i - 1].pt2).setCenter(pt.x, pt.y);
                                    path2.replaceSeg(0, "M", pt.x, pt.y);

                                    if (needReplace) jPath.replaceSeg(i - 1, prevSeg);
                                }
                            }

                            if (needReplace) jPath.replaceSeg(i, seg);

                            that.editor.trigger("drag", node, e);
                            that.trigger("drag", node, e);
                        };

                        if (that.list[i].pt1) {
                            jShape = new JSYG(that.list[i].pt1);
                            jShape.draggable("set", {
                                event: "mousedown",
                                eventWhich: 1,
                                onstart: start,
                                ondragstart: dragstart,
                                ondrag: drag,
                                ondragend: dragend,
                                onend: end,
                            });
                        } else {
                            jShape = new JSYG(`<${that.shape}>`).appendTo(that.container);

                            if (that.xlink) jShape.xlink = that.xlink;

                            jShape.setDim({ x: 0, y: 0, width: that.width, height: that.height });

                            jShape.draggable("set", {
                                event: "mousedown",
                                eventWhich: 1,
                                onstart: start,
                                ondragstart: dragstart,
                                ondrag: drag,
                                ondragend: dragend,
                                onend: end,
                            });

                            if (that.draggableOptions) jShape.draggable("set", that.draggableOptions);

                            jShape.draggable("enable");

                            that.list[i].pt1 = jShape[0];
                        }

                        jShape.setCenter(pt1.x, pt1.y);
                    } else {
                        if (that.list[i].pt1) {
                            new JSYG(that.list[i].pt1).remove();
                            that.list[i].pt1 = null;
                        }
                        if (that.list[i].path1) {
                            new JSYG(that.list[i].path1).remove();
                            that.list[i].path1 = null;
                        }
                    }

                    if (test2) {
                        pt1 = new JSYG.Vect(seg.x2, seg.y2).mtx(CTM);
                        pt2 = new JSYG.Vect(seg.x, seg.y).mtx(CTM);

                        if (that.list[i].path2) path = new Path(that.list[i].path2);
                        else {
                            path = new Path();
                            path.appendTo(that.container);
                        }

                        path.clear().moveTo(pt1.x, pt1.y).lineTo(pt2.x, pt2.y);

                        that.list[i].path2 = path[0];

                        drag = function (e) {
                            const path2 = new Path(that.list[i].path2);
                            const CTM = jPath.getMtx(svg);
                            const jShape = new JSYG(this);

                            const //oldX = seg.x2,
                                //oldY = seg.y2,
                                center = jShape.getCenter();

                            let pt = new JSYG.Vect(center.x, center.y).mtx(jShape.getMtx(svg));

                            path2.replaceSeg(0, "M", pt.x, pt.y);

                            pt = pt.mtx(CTM.inverse());
                            seg.x2 = pt.x;
                            seg.y2 = pt.y;

                            if (i + 1 < list.length && that.linked) {
                                const nextSeg = list[i + 1].seg;

                                if (nextSeg.x1 != null && nextSeg.y1 != null) {
                                    const angle = Math.atan2(seg.y2 - seg.y, seg.x2 - seg.x) + Math.PI;

                                    const path1 = new Path(that.list[i + 1].path1);

                                    const dist = Math.sqrt((nextSeg.x1 - seg.x) ** 2 + (nextSeg.y1 - seg.y) ** 2);

                                    nextSeg.x1 = seg.x + dist * Math.cos(angle);
                                    nextSeg.y1 = seg.y + dist * Math.sin(angle);

                                    pt = new JSYG.Vect(nextSeg.x1, nextSeg.y1).mtx(CTM);
                                    new JSYG(that.list[i + 1].pt1).setCenter(pt.x, pt.y);
                                    path1.replaceSeg(0, "M", pt.x, pt.y);

                                    if (needReplace) jPath.replaceSeg(i + 1, nextSeg);
                                }
                            }

                            if (needReplace) jPath.replaceSeg(i, seg);

                            that.editor.trigger("drag", node, e);
                            that.trigger("drag", node, e);
                        };

                        if (that.list[i].pt2) {
                            jShape = new JSYG(that.list[i].pt2);
                            jShape.draggable("set", {
                                event: "mousedown",
                                eventWhich: 1,
                                onstart: start,
                                ondragstart: dragstart,
                                ondrag: drag,
                                ondragend: dragend,
                                onend: end,
                            });
                        } else {
                            jShape = new JSYG(`<${that.shape}>`).appendTo(that.container);
                            if (that.xlink) {
                                jShape.xlink = that.xlink;
                            }
                            jShape.setDim({ x: 0, y: 0, width: that.width, height: that.height });

                            jShape.draggable("set", {
                                event: "mousedown",
                                eventWhich: 1,
                                onstart: start,
                                ondragstart: dragstart,
                                ondrag: drag,
                                ondragend: dragend,
                                onend: end,
                            });
                            if (that.draggableOptions) {
                                jShape.draggable("set", that.draggableOptions);
                            }
                            jShape.draggable("enable");
                            that.list[i].pt2 = jShape[0];
                        }

                        jShape.setCenter(pt1.x, pt1.y);
                    } else {
                        if (that.list[i].pt2) {
                            new JSYG(that.list[i].pt2).remove();
                            that.list[i].pt2 = null;
                        }
                        if (that.list[i].path2) {
                            new JSYG(that.list[i].path2).remove();
                            that.list[i].path2 = null;
                        }
                    }
                } else {
                    that._remove(i);
                    that.list.splice(i, 0, null);
                }
            });
        }

        N = list.length;
        while (this.list.length > N) this._remove(this.list.length - 1);

        this.display = true;

        if (!_preventEvent) this.trigger("show", node);

        return this;
    },

    hide(_preventEvent) {
        new JSYG(this.container).empty().remove();
        this.list.splice(0, this.list.length);
        this.display = false;
        if (!_preventEvent) this.trigger("hide", this.node);
        return this;
    },
    update() {
        return this.display ? this.show() : this;
    },
};

function MainPoints(editorObject) {
    this.editor = editorObject;
    this.list = [];
    this.container = new JSYG("<g>")[0];
}

MainPoints.prototype = {
    constructor: MainPoints,
    className: "mainPoints",
    shape: "circle",
    width: 10,
    height: 10,
    classNameClosing: "closingPoint",
    strengthClosingMagnet: 10,
    autoSmooth: false,
    onshow: null,
    onhide: null,
    onstart: null,
    ondragstart: null,
    ondrag: null,
    ondragend: null,
    onend: null,

    draggableOptions: null,

    set: StdConstruct.prototype.set,
    on: StdConstruct.prototype.on,
    off: StdConstruct.prototype.off,
    trigger: StdConstruct.prototype.trigger,

    enabled: false,
    display: false,

    _remove(i) {
        if (!this.list[i]) return;
        new JSYG(this.list[i]).remove();
        this.list.splice(i, 1);
        return this;
    },

    enable(opt) {
        this.hide(true);

        if (opt) this.set(opt);

        const container = this.editor.box.container;

        if (container && container.parentNode) this.show();

        this.enabled = true;

        return this;
    },

    disable() {
        this.hide();

        this.enabled = false;

        return this;
    },

    show(opt, _preventEvent) {
        if (opt) this.set(opt);

        const node = this.editor._target;

        if (!node || (this.editor.isMultiSelection() && !this.multiple)) return this.hide();

        this.node = node;

        let jNode = new JSYG(node);

        if (!jNode.isSVG()) return;

        const svg = jNode.offsetParent("farthest");
        const CTM = jNode.getMtx(svg);
        const tag = jNode.getTag();
        let list = [];
        let N;
        const that = this;
        const needReplace = JSYG.support.needReplaceSeg;

        let start = (e) => {
            new JSYG(that.container).appendTo(that.editor.box.container);
            that.editor.trigger("start", node, e);
            that.trigger("start", node, e);
        };

        const dragstart = (e) => {
            that.editor.trigger("dragstart", node, e);
            that.trigger("dragstart", node, e);
        };

        const dragend = (e) => {
            that.editor.update();
            that.editor.trigger("dragend", node, e);
            that.editor.trigger("change", node, e);
            that.trigger("dragend", node, e);
        };

        const end = (e) => {
            that.editor.trigger("end", node, e);
            that.trigger("end", node, e);
        };

        if (!this.container.parentNode) {
            new JSYG(this.container).appendTo_(this.editor.box.container)[0].classList.add(this.className);
        }

        if (tag === "path") {
            jNode = new Path(node);

            jNode.rel2abs();

            list = jNode.getSegList();

            let isClosed = jNode.isClosed();
            let mtxScreen;
            const ctrlPoints = this.editor.ctrlsCtrlPoints.list;

            start = (e) => {
                new JSYG(that.container).appendTo(that.editor.box.container);
                isClosed = jNode.isClosed();
                mtxScreen = jNode.getMtx("screen");
                that.editor.trigger("start", node, e);
                that.trigger("start", node, e);
            };

            jNode.rel2abs();

            list.forEach(({ x, y }, i) => {
                if (x != null && y != null) {
                    const pt = new JSYG.Vect(x, y).mtx(CTM);
                    let shape;
                    let drag;

                    if (that.list[i]) shape = new JSYG(that.list[i]);
                    else {
                        drag = function (e) {
                            const //we must redefine seg if pathSegList has been modified
                                seg = jNode.getSeg(i);

                            const jPoint = new JSYG(this);
                            const selfCTM = jNode.getMtx(svg);
                            const center = jPoint.getCenter();

                            const //position dans le repère d'édition
                                posPt = new JSYG.Vect(center.x, center.y).mtx(jPoint.getMtx());

                            const //position dans le repère de l'élément édité
                                pt = posPt.mtx(selfCTM.inverse());

                            const decX = pt.x - seg.x;
                            const decY = pt.y - seg.y;
                            let item;
                            let pt1;
                            let pt2;
                            const firstSeg = jNode.getSeg(0);
                            const lastSeg = jNode.getLastSeg();

                            if (seg === lastSeg && isClosed) {
                                firstSeg.x = pt.x;
                                firstSeg.y = pt.y;
                                new JSYG(that.list[0]).setCenter(posPt.x, posPt.y);
                                if (needReplace) jNode.replaceSeg(0, jNode.getSeg(firstSeg));
                            }

                            if (that.strengthClosingMagnet != null && (seg === lastSeg || seg === firstSeg)) {
                                const segRef = seg === lastSeg ? firstSeg : lastSeg;
                                const ref = new JSYG.Vect(segRef.x, segRef.y).mtx(mtxScreen);

                                if (Math.sqrt((ref.x - e.clientX) ** 2 + (ref.y - e.clientY) ** 2) < that.strengthClosingMagnet) {
                                    pt.x = segRef.x;
                                    pt.y = segRef.y;
                                    const mtx = jNode.getMtx(jPoint);
                                    jPoint.setCenter(new JSYG.Vect(pt.x, pt.y).mtx(mtx));
                                }
                            }

                            seg.x = pt.x;
                            seg.y = pt.y;

                            if (that.autoSmooth && !that.editor.ctrlsCtrlPoints.enabled) jNode.autoSmooth(i);
                            else {
                                if (seg.x2 != null && seg.y2 != null) {
                                    seg.x2 += decX;
                                    seg.y2 += decY;
                                    pt1 = new JSYG.Vect(seg.x2, seg.y2).mtx(selfCTM);
                                    pt2 = new JSYG.Vect(seg.x, seg.y).mtx(selfCTM);

                                    if (that.editor.ctrlsCtrlPoints.enabled && (item = ctrlPoints[i])) {
                                        new Path(item.path2).replaceSeg(0, "M", pt1.x, pt1.y).replaceSeg(1, "L", pt2.x, pt2.y);

                                        new JSYG(item.pt2).setCenter(pt1.x, pt1.y);
                                    }
                                }

                                if (i < jNode.nbSegs() - 1) {
                                    const next = jNode.getSeg(i + 1);

                                    if (next.x1 != null && next.y1 != null) {
                                        next.x1 += decX;
                                        next.y1 += decY;
                                        pt1 = new JSYG.Vect(next.x1, next.y1).mtx(selfCTM);
                                        pt2 = new JSYG.Vect(seg.x, seg.y).mtx(selfCTM);

                                        if (that.editor.ctrlsCtrlPoints.enabled && (item = ctrlPoints[i + 1])) {
                                            new Path(item.path1).replaceSeg(0, "M", pt1.x, pt1.y).replaceSeg(1, "L", pt2.x, pt2.y);

                                            new JSYG(item.pt1).setCenter(pt1.x, pt1.y);
                                        }
                                    }
                                }

                                if (needReplace) jNode.replaceSeg(i, seg);
                            }

                            that.editor.trigger("drag", node, e);
                            that.trigger("drag", node, e);
                        };

                        shape = new JSYG(`<${that.shape}>`).appendTo_(that.container);

                        if (that.xlink) shape.xlink = that.xlink;

                        shape.setDim({ x: 0, y: 0, width: that.width, height: that.height });

                        shape.draggable("set", {
                            event: "mousedown",
                            eventWhich: 1,
                            onstart: start,
                            ondragstart: dragstart,
                            ondrag: drag,
                            ondragend: dragend,
                            onend: end,
                        });

                        if (that.draggableOptions) shape.draggable("set", that.draggableOptions);

                        shape.draggable("enable");

                        that.list[i] = shape[0];
                    }

                    shape.setCenter(pt.x, pt.y);
                } else if (that.list[i]) that._remove(i);
            });

            const first = new JSYG(that.list[0]);
            const last = new JSYG(that.list[that.list.length - 1]);
            let center = first.getCenter();

            first.setDim({
                width: that.width * (isClosed ? 1.2 : 1),
                height: that.height * (isClosed ? 1.2 : 1),
            });

            first.setCenter(center.x, center.y);

            center = last.getCenter();

            last.setDim({
                width: that.width * (isClosed ? 0.6 : 1),
                height: that.height * (isClosed ? 0.6 : 1),
            });

            last.setCenter(center.x, center.y);

            if (isClosed) {
                last[0].classList.add(this.classNameClosing);
            } else {
                last[0].classList.remove(this.classNameClosing);
            }
        } else if (tag === "polyline" || tag === "polygon") {
            list = JSYG.makeArray(node.points);

            list.forEach((point, i) => {
                point = new JSYG.Vect(point).mtx(CTM);
                let shape;
                let drag;

                if (that.list[i]) shape = new JSYG(that.list[i]);
                else {
                    drag = function (e) {
                        const //we must redefine point if points has been modified
                            point = node.points.getItem(i);

                        const jPoint = new JSYG(this);
                        const selfCTM = jNode.getMtx(svg);
                        const center = jPoint.getCenter();
                        let pt = new JSYG.Vect(center.x, center.y).mtx(jPoint.getMtx());
                        pt = pt.mtx(selfCTM.inverse());

                        point.x = pt.x;
                        point.y = pt.y;

                        that.editor.trigger("drag", node, e);
                        that.trigger("drag", node, e);
                    };

                    shape = new JSYG(`<${that.shape}>`).appendTo_(that.container);
                    shape.setDim({ x: 0, y: 0, width: that.width, height: that.height });
                    shape.draggable("set", {
                        event: "mousedown",
                        eventWhich: 1,
                        onstart: start,
                        ondragstart: dragstart,
                        ondrag: drag,
                        ondragend: dragend,
                        onend: end,
                    });

                    if (that.draggableOptions) shape.draggable("set", that.draggableOptions);

                    shape.draggable("enable");
                    that.list[i] = shape[0];
                }

                shape.setCenter(point.x, point.y);
            });
        } else if (tag === "line") {
            list = [1, 2];

            list.forEach((attr, i) => {
                const point = new JSYG.Vect(jNode.attr(`x${attr}`), jNode.attr(`y${attr}`)).mtx(CTM);
                let shape;
                let drag;

                if (that.list[i]) shape = new JSYG(that.list[i]);
                else {
                    drag = function (e) {
                        const jPoint = new JSYG(this);
                        const selfCTM = jNode.getMtx(svg);
                        const center = jPoint.getCenter();
                        let pt = new JSYG.Vect(center.x, center.y).mtx(jPoint.getMtx());
                        pt = pt.mtx(selfCTM.inverse());

                        jNode.attr(`x${attr}`, pt.x).attr(`y${attr}`, pt.y);

                        that.editor.trigger("drag", node, e);
                        that.trigger("drag", node, e);
                    };

                    shape = new JSYG(`<${that.shape}>`).appendTo_(that.container);
                    shape.setDim({ x: 0, y: 0, width: that.width, height: that.height });

                    shape.draggable("set", {
                        event: "mousedown",
                        eventWhich: 1,
                        onstart: start,
                        ondragstart: dragstart,
                        ondrag: drag,
                        ondragend: dragend,
                        onend: end,
                    });

                    if (that.draggableOptions) shape.draggable("set", that.draggableOptions);

                    shape.draggable("enable");
                    that.list[i] = shape[0];
                }

                shape.setCenter(point.x, point.y);
            });
        }

        N = list.length;
        while (this.list.length > N) this._remove(this.list.length - 1);

        this.display = true;

        if (_preventEvent) this.trigger("show", node);

        return this;
    },

    hide(_preventEvent) {
        if (this.container) new JSYG(this.container).empty().remove();
        this.list.splice(0, this.list.length);
        this.display = false;
        if (!_preventEvent) this.trigger("hide", this.node);
        return this;
    },

    update() {
        return this.display ? this.show() : this;
    },
};

var Drag = function (editorObject) {
    this.editor = editorObject;
};

Drag.prototype = {
    constructor: Drag,
    type: "attributes",
    bounds: null,
    options: null,
    multiple: true,
    onstart: null,
    ondragstart: null,
    ondrag: null,
    ondragend: null,
    onend: null,

    set: StdConstruct.prototype.set, //function(opt) { return JSYG.StdConstruct.prototype.set.apply(this,arguments); },
    on: StdConstruct.prototype.on,
    off: StdConstruct.prototype.off,
    trigger: StdConstruct.prototype.trigger,

    enabled: false,
    display: false,

    enable(opt) {
        this.hide();

        if (opt) this.set(opt);

        const container = this.editor.box.container;

        if (container && container.parentNode) this.show();

        this.enabled = true;

        return this;
    },
    disable() {
        this.hide();
        this.enabled = false;
        return this;
    },
    start(e) {
        if (!this.display) return this;
        new JSYG(this.node).draggable("start", e);
        return this;
    },
    show(opt) {
        this.hide();

        if (opt) this.set(opt);

        const node = this.editor._target;
        if (!node || (this.editor.isMultiSelection() && !this.multiple)) return;

        this.node = node;

        const jNode = new JSYG(node);
        const field = new JSYG(jNode.isSVG() ? this.editor.box.pathBox : this.editor.box.container);
        let backup;
        const displayShadow = this.editor.box.displayShadow;
        const that = this;

        jNode.draggable("set", {
            event: "mousedown",
            eventWhich: 1,
            onstart(e) {
                backup = {
                    ctrlsMainPoints: that.editor.ctrlsMainPoints.enabled,
                    ctrlsCtrlPoints: that.editor.ctrlsCtrlPoints.enabled,
                };
                that.editor.trigger("start", node, e);
                that.trigger("start", node, e);
            },
            ondragstart(e) {
                //console.log("ondrag start", jNode.getTag());
                for (const n in backup) {
                    if (!backup[n]) continue;
                    new JSYG(that.editor[n].container).hide();
                    that.editor[n].display = false;
                }
                that.editor.box.displayShadow = false;
                that.editor.trigger("dragstart", node, e);
                that.trigger("dragstart", node, e);
            },
            ondrag(e) {
                //console.log("ondrag", jNode.getTag(), node );
                that.editor.update();
                that.editor.trigger("drag", node, e);
                that.trigger("drag", node, e);
		    /*
                if (node.connector) {
                    //GUSA
                    node.connector.updateConnection(); //GUSA
                }
		*/
                if (node.connectors) {
                    for( let i = 0; i < node.connectors.length ; i++ ) {
                        node.connectors[i].updateConnection(); //GUSA
		    }
                }
            },
            ondragend(e) {
                if (that.editor.isMultiSelection()) new Container(that.editor._target).applyTransform();
                that.editor.displayShadow = displayShadow;
                for (const n in backup) {
                    if (!backup[n]) continue;
                    new JSYG(that.editor[n].container).show();
                    that.editor[n].display = true;
                }
                that.editor.update();
                that.editor.trigger("dragend", node, e);
                that.editor.trigger("change", node, e);
                that.trigger("dragend", node, e);
            },
            onend(e) {
                that.editor.trigger("end", node, e);
                that.trigger("end", node, e);
            },
            type: this.type,
            bounds: this.bounds,
            field,
            click: "left",
            keepRotation: true,
            key: false,
        });

        if (this.options) jNode.draggable("set", this.options);

        jNode.draggable("enable");

        field.css("cursor", "move");

        this.display = true;

        return this;
    },
    hide() {
        if (this.node) new JSYG(this.node).draggable("disable");
        this.display = false;
        return this;
    },
    update() {
        if (!this.display) return this;

        const node = this.editor._target;
        if (!node) return this.hide();

        this.node = node;

        return this;
    },
};

function Resize(editorObject) {
    this.editor = editorObject;
    this.list = [];
    this.stepsX = [];
    this.stepsY = [];
    this.container = new JSYG("<g>")[0];
}

function canHideMainPoints(node) {
    const tag = new JSYG(node).getTag();

    if (tag == "line") return false;
    else if ((tag == "polyline" || tag == "polygon") && node.points.length < 3) return false;
    else if (tag == "path" && node.pathSegList.numberOfItems < 3) return false;

    return true;
}

Resize.prototype = {
    constructor: Resize,

    container: null,

    className: "resize",
    shape: "circle",
    xlink: null,
    width: 10,
    height: 10,
    type: "attributes",
    multiple: false,
    onshow: null,
    onhide: null,
    onstart: null,
    ondragstart: null,
    ondrag: null,
    ondragend: null,
    onend: null,
    horizontal: true,
    vertical: true,
    keepRatio: false,
    bounds: null,
    options: null,

    set: StdConstruct.prototype.set,
    on: StdConstruct.prototype.on,
    off: StdConstruct.prototype.off,
    trigger: StdConstruct.prototype.trigger,
    enabled: false,
    display: false,
    enable(opt) {
        this.hide(true);
        if (opt) this.set(opt);
        const container = this.editor.box.container;
        if (container && container.parentNode) this.show();
        this.enabled = true;
        return this;
    },
    disable() {
        this.hide();
        this.enabled = false;
        return this;
    },
    show(opt, _preventEvent) {
        this.hide(true);

        if (opt) this.set(opt);

        const node = this.editor._target;
        if (!node || (this.editor.isMultiSelection() && !this.multiple)) return this.hide();
        this.node = node;

        const jNode = new JSYG(node);
        const isSVG = jNode.isSVG();
        const tag = jNode.getTag();
        const parent = isSVG ? this.editor.box.container : document.body;

        if (isSVG && this.container.tagName == "DIV") {
            this.container = new JSYG("<g>")[0];
            this.shape = "circle";
        } else if (!isSVG && this.container.tagName == "g") {
            this.container = new JSYG("<div>")[0];
            this.shape = "div";
        }

        let container = new JSYG(this.container);
        let node_ = new JSYG(parent);
        node_[0].appendChild(container[0]);
        node_[0].classList.add(this.className);

        const list = [];
        const that = this;
        const displayShadow = this.editor.box.displayShadow;
        let backup;

        const createShape = () => {
            const shape = new JSYG(`<${that.shape}>`).appendTo_(that.container);
            if (that.xlink) shape.href(that.xlink);
            shape.setDim({ x: 0, y: 0, width: that.width, height: that.height });
            return shape;
        };

        const start = (e) => {
            new JSYG(that.container).appendTo(isSVG ? that.editor.box.container : document.body);
            backup = {
                ctrlsMainPoints: that.editor.ctrlsMainPoints.enabled,
                ctrlsCtrlPoints: that.editor.ctrlsCtrlPoints.enabled,
            };
            that.editor.trigger("start", node, e);
            that.trigger("start", node, e);
        };

        const dragstart = (e) => {
            for (const n in backup) {
                if (!backup[n]) continue;
                new JSYG(that.editor[n].container).hide();
                that.editor[n].display = false;
            }
            that.editor.box.displayShadow = false;
            that.editor.trigger("dragstart", node, e);
            that.trigger("dragstart", node, e);
        };

        const drag = (e) => {
            that.editor.update();
            that.editor.trigger("drag", node, e);
            that.trigger("drag", node, e);
		/*
                if (node.connector) {
                    //GUSA
                    node.connector.updateConnection(); //GUSA
                }
		*/
                if (node.connectors) {
                    for( let i = 0; i < node.connectors.length ; i++ ) {
                        node.connectors[i].updateConnection(); //GUSA
		    }
                }
        };

        const dragend = (e) => {
            if (that.editor.isMultiSelection()) new Container(that.editor._target).applyTransform();
            that.editor.box.displayShadow = displayShadow;
            for (const n in backup) {
                if (!backup[n]) continue;
                new JSYG(that.editor[n].container).show();
                that.editor[n].display = true;
            }

            if (canHideMainPoints(node)) new JSYG(that.container).appendTo_(parent);
            else new JSYG(that.container).insertAfter(parent.querySelector("path"));

            that.editor.update();
            that.editor.trigger("dragend", node, e);
            that.editor.trigger("change", node, e);
            that.trigger("dragend", node, e);
        };

        const end = (e) => {
            that.editor.trigger("end", node, e);
            that.trigger("end", node, e);
        };

        jNode.resizable("set", {
            //default options
            event: "mousedown",
            eventWhich: 1,
            onstart: start,
            ondragstart: dragstart,
            ondrag: drag,
            ondragend: dragend,
            onend: end,
            keepRatio: this.keepRatio || false,
            keepRotation: true,
            type: this.type,
            bounds: this.bounds,
            inverse: false,
            method: isSVG ? "fixedPoint" : "normal",
            originX: "auto",
            originY: "auto",
        });

        if (this.stepsX) jNode.resizable("set", { stepsX: { list: this.stepsX } });
        if (this.stepsY) jNode.resizable("set", { stepsY: { list: this.stepsY } });

        if (this.options) jNode.resizable("set", this.options);

        if (this.horizontal && this.vertical) {
            const resizeFromCorner = function (e) {
                jNode.resizable("enable", {
                    horizontal: true,
                    vertical: true,
                    field: this,
                    evt: e,
                });
            };

            [0, 1, 2, 3].forEach((i) => {
                list[i] = createShape()[0].addEventListener("mousedown", resizeFromCorner);
            });
        }

        if (!this.keepRatio) {
            if (this.horizontal) {
                const horizontalResize = function (e) {
                    jNode.resizable("enable", {
                        horizontal: true,
                        vertical: false,
                        field: this,
                        evt: e,
                    });
                };

                [4, 5].forEach((i) => {
                    let shape = createShape();
                    shape[0].addEventListener("mousedown", horizontalResize);
                    list[i] = shape[0];
                });
            }

            if (this.vertical) {
                const verticalResize = function (e) {
                    jNode.resizable("enable", {
                        horizontal: false,
                        vertical: true,
                        field: this,
                        evt: e,
                    });
                };

                [6, 7].forEach((i) => {
                    let shape = createShape();
                    shape[0].addEventListener("mousedown", verticalResize);
                    list[i] = shape[0];
                });
            }

            const jDoc = new JSYG(document);

            const documentFct = {
                keydown({ keyCode }) {
                    if (keyCode === 17) {
                        jNode.resizable("set", { keepRatio: true });
                    }
                },
                keyup({ keyCode }) {
                    if (keyCode === 17) {
                        jNode.resizable("set", { keepRatio: false });
                    }
                },
            };

            jDoc.data_("svgeditor", documentFct);
            jDoc[0].addEventListener("keydown", documentFct["keydown"]);
            jDoc[0].addEventListener("keyup", documentFct["keyup"]);
        }

        this.list = list;

        this.display = true;

        this.update();

        if (!_preventEvent) this.trigger("show", node);

        return this;
    },
    hide(_preventEvent) {
        if (this.container) new JSYG(this.container).empty().remove();

        this.list.splice(0, this.list.length);

        const jDoc = new JSYG(document);
        if (this.node) new JSYG(this.node).resizable("destroy");

        this.display = false;

        return this;
    },
    update() {
        if (!this.display) return this;

        const node = this.editor._target;
        if (!node) return this.hide();

        if ((!this.keepRatio && !this.list[4]) || (this.keepRatio && this.list[4])) {
            return this.show();
        }

        const jNode = new JSYG(node);
        const isSVG = jNode.isSVG();
        const b = jNode.getDim();

        const CTM = (() => {
            if (isSVG) return jNode.getMtx(jNode.offsetParent("farthest"));
            else {
                const dimParent = jNode.offsetParent().getDim("page");
                return new JSYG.Matrix().translate(dimParent.x, dimParent.y).multiply(jNode.getMtx());
            }
        })();

        const topleft = new JSYG.Vect(b.x, b.y).mtx(CTM);
        const topright = new JSYG.Vect(b.x + b.width, b.y).mtx(CTM);
        const bottomleft = new JSYG.Vect(b.x, b.y + b.height).mtx(CTM);
        const bottomright = new JSYG.Vect(b.x + b.width, b.y + b.height).mtx(CTM);
        const angle = Math.atan2((topright.y - topleft.y) / 2, (topright.x - topleft.x) / 2);
        const angleTest = Math.abs(angle % Math.PI);
        const inverse = angleTest > Math.PI / 4 && angleTest < (Math.PI * 3) / 4;

        new JSYG(this.list[0]).setCenter(topleft.x, topleft.y).css("cursor", `${inverse ? "n" : "s"}e-resize`);
        new JSYG(this.list[1]).setCenter(topright.x, topright.y).css("cursor", `${inverse ? "s" : "n"}e-resize`);
        new JSYG(this.list[2]).setCenter(bottomleft.x, bottomleft.y).css("cursor", `${inverse ? "s" : "n"}e-resize`);
        new JSYG(this.list[3]).setCenter(bottomright.x, bottomright.y).css("cursor", `${inverse ? "n" : "s"}e-resize`);

        if (!this.keepRatio) {
            new JSYG(this.list[4]).setCenter((topright.x + bottomright.x) / 2, (topright.y + bottomright.y) / 2).css("cursor", `${inverse ? "n" : "e"}-resize`);
            new JSYG(this.list[5]).setCenter((topleft.x + bottomleft.x) / 2, (topleft.y + bottomleft.y) / 2).css("cursor", `${inverse ? "n" : "e"}-resize`);
            new JSYG(this.list[6]).setCenter((topleft.x + topright.x) / 2, (topleft.y + topright.y) / 2).css("cursor", `${inverse ? "e" : "n"}-resize`);
            new JSYG(this.list[7]).setCenter((bottomleft.x + bottomright.x) / 2, (bottomleft.y + bottomright.y) / 2).css("cursor", `${inverse ? "e" : "n"}-resize`);
        }

        return this;
    },
};

function Rotate(editorObject) {
    this.editor = editorObject;
    this.list = [];
    this.steps = [0, 90, 180, 270];
    this.container = new JSYG("<g>")[0];
}

Rotate.prototype = {
    constructor: Rotate,
    className: "rotate",
    shape: "circle",
    xlink: null,
    width: 10,
    height: 10,
    multiple: false,
    cursor: Rotatable.prototype.cursor,
    onshow: null,
    onhide: null,
    onstart: null,
    ondragstart: null,
    ondrag: null,
    ondragend: null,
    onend: null,
    options: null,

    set: StdConstruct.prototype.set,
    on: StdConstruct.prototype.on,
    off: StdConstruct.prototype.off,
    trigger: StdConstruct.prototype.trigger,
    enabled: false,
    display: false,
    enable(opt) {
        this.hide(true);
        if (opt) this.set(opt);
        const container = this.editor.box.container;
        if (container && container.parentNode) this.show();
        this.enabled = true;
    },
    disable() {
        this.hide();
        this.enabled = false;
    },
    show(opt, _preventEvent) {
        this.hide(true);

        if (opt) this.set(opt);

        const node = this.editor._target;

        if (!node || (this.editor.isMultiSelection() && !this.multiple)) return this.hide();

        this.node = node;

        const jNode = new JSYG(node);
        const isSVG = jNode.isSVG();
        const parent = isSVG ? this.editor.box.container : document.body;
        const that = this;

        if (!isSVG) return this;

        if (isSVG && this.container.tagName == "DIV") {
            this.container = new JSYG("<g>")[0];
            this.shape = "circle";
        } else if (!isSVG && this.container.tagName == "g") {
            this.container = new JSYG("<div>")[0];
            this.shape = "div";
        }

        new JSYG(this.container).appendTo_(parent)[0].classList.add(this.className);

        const shape = new JSYG(`<${this.shape}>`).appendTo_(this.container);

        if (this.xlink) shape.href(this.xlink);
        shape.setDim({ x: 0, y: 0, width: this.width, height: this.height });
        shape.css("cursor", this.cursor);

        this.list[0] = shape[0];

        const displayShadow = this.editor.box.displayShadow;

        let backup;

        const start = (e) => {
            backup = {
                ctrlsMainPoints: that.editor.ctrlsMainPoints.enabled,
                ctrlsCtrlPoints: that.editor.ctrlsCtrlPoints.enabled,
            };
            that.editor.trigger("start", node, e);
            that.trigger("start", node, e);
        };

        const dragstart = (e) => {
            for (const n in backup) {
                if (!backup[n]) continue;
                new JSYG(that.editor[n].container)[0].style.display = "none";
                that.editor[n].display = false;
            }
            that.editor.box.displayShadow = false;
            that.editor.trigger("dragstart", node, e);
            that.trigger("dragstart", node, e);
        };

        const drag = (e) => {
            that.editor.update();
            that.editor.trigger("drag", node, e);
            that.trigger("drag", node, e);
		/*
                if (node.connector) {
                    //GUSA
                    node.connector.updateConnection(); //GUSA
                }
		*/
                if (node.connectors) {
                    for( let i = 0; i < node.connectors.length ; i++ ) {
                        node.connectors[i].updateConnection(); //GUSA
		    }
                }
        };

        const dragend = (e) => {
            if (that.editor.isMultiSelection()) new Container(that.editor._target).applyTransform();
            that.editor.box.displayShadow = displayShadow;
            for (const n in backup) {
                if (!backup[n]) continue;
                new JSYG(that.editor[n].container)[0].style.display = "block";
                that.editor[n].display = true;
            }
            new JSYG(that.container).appendTo_(parent); //pour remettre les controles au 1er plan
            that.editor.update();
            that.editor.trigger("dragend", node, e);
            that.editor.trigger("change", node, e);
            that.trigger("dragend", node, e);
        };

        const end = (e) => {
            that.editor.trigger("end", node, e);
            that.trigger("end", node, e);
        };

        jNode.rotatable("set", {
            event: "mousedown",
            eventWhich: 1,
            field: this.list[0],
            onstart: start,
            ondragstart: dragstart,
            ondrag: drag,
            ondragend: dragend,
            onend: end,
            key: false,
            click: "left",
            cursor: this.cursor,
        });

        if (this.steps) jNode.rotatable("set", { steps: { list: this.steps } });
        if (this.options) jNode.rotatable("set", this.options);

        jNode.rotatable("enable");

        this.display = true;

        this.update();

        if (!_preventEvent) this.trigger("show", node);

        return this;
    },
    hide(_preventEvent) {
        if (this.container) new JSYG(this.container).empty().remove();
        if (this.node) new JSYG(this.node).rotatable("destroy");
        this.list.splice(0, this.list.length);
        this.display = false;
        if (!_preventEvent) this.trigger("hide", this.node);
        return this;
    },
    update() {
        if (!this.display) return this;

        const node = this.editor._target;

        if (!node) return this.hide();
        this.node = node;

        const jNode = new JSYG(node);
        const b = jNode.getDim();

        const CTM = (() => {
            if (jNode.isSVG()) return jNode.getMtx(jNode.offsetParent("farthest"));
            else {
                const dimParent = jNode.offsetParent().getDim("page");
                return new JSYG.Matrix().translate(dimParent.x, dimParent.y).multiply(jNode.getMtx());
            }
        })();

        const topleft = new JSYG.Vect(b.x, b.y).mtx(CTM);
        const topright = new JSYG.Vect(b.x + b.width, b.y).mtx(CTM);
        const angle = Math.atan2((topright.y - topleft.y) / 2, (topright.x - topleft.x) / 2);

        new JSYG(this.list[0]).setCenter((topleft.x + topright.x) / 2 + 15 * Math.sin(angle), (topleft.y + topright.y) / 2 - 15 * Math.cos(angle));

        return this;
    },
};
