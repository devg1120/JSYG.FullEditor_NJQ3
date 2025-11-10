import JSYG from "./JSYG-wrapper/JSYG-wrapper.js";
import { TextEditor } from "./JSYG.TextEditor/JSYG.TextEditor7.js";
import { BoundingBox } from "./JSYG.BoundingBox/JSYG.BoundingBox.js";
import { Color } from "./JSYG.Color/JSYG.Color.js";
import { Editor } from "./JSYG.Editor/JSYG.Editor.js";
import Events from "./JSYG.Events/JSYG.Events.js";
import { PathDrawer } from "./JSYG.PathDrawer/JSYG.PathDrawer.js";
import { PolylineDrawer } from "./JSYG.PolylineDrawer/JSYG.PolylineDrawer.js";
import { ShapeDrawer } from "./JSYG.ShapeDrawer/JSYG.ShapeDrawer.js";
import StdConstruct from "./JSYG.StdConstruct/JSYG.StdConstruct.js";
import { UndoRedo } from "./JSYG.UndoRedo/JSYG.UndoRedo.js";
import { ZoomAndPan } from "./JSYG.ZoomAndPan/JSYG.ZoomAndPan.js";

const slice = Array.prototype.slice;

export default class FullEditor extends JSYG {
    constructor(node, opt) {
        super(node, opt);
        this._bindFunctions();

        this._init();

        this._keyShortCuts = {};

        if (node) this.setNode(node);

        if (opt) this.enable(opt);

        //this.testCall();
    }

    _initPlugins() {
        FullEditor._plugins.forEach(this._createPlugin.bind(this));

        this._applyMethodPlugins("init");

        return this;
    }

    _init() {
        this._initUndoRedo();

        this._initShapeEditor();

        this._initZoomAndPan();

        this._initTextEditor();

        this._initShapeDrawer();

        this._initPlugins();

        return this;
    }

    _bindFunctions() {
        for (const n in this) {
            if (typeof this[n] == "function" && n.charAt(0) != "_") this[n] = this[n].bind(this);
        }

        return this;
    }

    registerKeyShortCut(key_dict) {
        if (this.enabled) {
            new JSYG(document)[0].addEventListener("keydown", function (e) {
                if (e.ctrlKey && e.key != "Control") {
                    let key_id = "ctrl+" + e.key;
                    if (key_id in key_dict) {
                        console.log("Key pressed: " + key_id);
                        key_dict[key_id]();
                    }
                }
            });
        }
    }
    registerKeyShortCut_(key, fct) {
        console.trace();

        //if (JSYG.isPlainObject(key)) {

        if ($.isPlainObject(key)) {
            for (const n in key) this.registerKeyShortCut(n, key[n]);
            return this;
        }

        if (this._keyShortCuts[key]) this._disableKeyShortCut(key);

        this._keyShortCuts[key] = fct;

        if (this.enabled) this._enableKeyShortCut(key, fct);
        return this;
    }

    unregisterKeyShortCut(key) {
        const that = this;

        if (Array.isArray(key) || (arguments.length > 1 && (key = [].slice.call(arguments)))) {
            key.forEach(that.unregisterKeyShortCut);
            return this;
        }

        this._disableKeyShortCut(key, this._keyShortCuts[key]);

        delete this._keyShortCuts[key];

        return this;
    }

    selectAll() {
        this.disableEdition();
        this.enableSelection();
        this.shapeEditor.selection.selectAll();

        return this;
    }

    deselectAll() {
        const isEnabled = this.shapeEditor.enabled;

        if (!isEnabled) this.shapeEditor.enable();

        this.shapeEditor.selection.deselectAll();

        if (!isEnabled) this.shapeEditor.disable();

        return this;
    }

    _enableKeyShortCut(key, fct) {
        if (typeof fct != "function") throw new Error(`${typeof fct} instead of function expected`);

        new JSYG(document).on("keydown", null, key, fct);
        return this;
    }

    _disableKeyShortCut(key, fct) {
        if (typeof fct != "function") throw new Error(`${typeof fct} instead of function expected`);

        new JSYG(document).off("keydown", fct);

        return this;
    }

    enableKeyShortCuts() {
        const keys = this._keyShortCuts;

        for (const n in keys) this._enableKeyShortCut(n, keys[n]); //GUSA
        return this;
    }

    disableKeyShortCuts() {
        const keys = this._keyShortCuts;

        for (const n in keys) this._disableKeyShortCut(n, keys[n]);

        return this;
    }

    get editText() {
        return this._editText;
    }

    set editText(value) {
        this._editText = !!value;
        if (!value) this.textEditor.hide();
    }

    get editPosition() {
        return this.shapeEditor.ctrlsDrag.enabled;
    }

    set editPosition(value) {
        this.shapeEditor.ctrlsDrag[`${value ? "en" : "dis"}able`]();
    }

    get editSize() {
        return this.shapeEditor.ctrlsResize.enabled;
    }

    set editSize(value) {
        this.shapeEditor.ctrlsResize[`${value ? "en" : "dis"}able`]();
    }

    get editRotation() {
        return this.shapeEditor.ctrlsRotate.enabled;
    }

    set editRotation(value) {
        this.shapeEditor.ctrlsRotate[`${value ? "en" : "dis"}able`]();
    }

    get editPathMainPoints() {
        return this.shapeEditor.ctrlsMainPoints.enabled;
    }

    set editPathMainPoints(value) {
        this.shapeEditor.ctrlsMainPoints[`${value ? "en" : "dis"}able`]();
    }

    get editPathCtrlPoints() {
        return this.shapeEditor.ctrlsCtrlPoints.enabled;
    }

    set editPathCtrlPoints(value) {
        this.shapeEditor.ctrlsCtrlPoints[`${value ? "en" : "dis"}able`]();
    }

    get canvasResizable() {
        return this.zoomAndPan.resizable.enabled;
    }

    set canvasResizable(value) {
        this.zoomAndPan.resizable[`${value ? "en" : "dis"}able`]();
    }

    get keepShapesRatio() {
        return this.shapeEditor.ctrlsResize.keepRatio;
    }

    set keepShapesRatio(value) {
        value = !!value;
        this.shapeEditor.ctrlsResize.keepRatio = value;
        this._keepShapesRatio = value;
        if (this.shapeEditor.display) this.shapeEditor.update();
    }

    get drawingPathMethod() {
        return this.pathDrawer.type;
    }

    set drawingPathMethod(value) {
        if (value != "freehand" && value != "point2point")
            throw new Error("Only 'freehand' and 'point2point' are allowed");

        this.pathDrawer.type = value;
    }

    get autoSmoothPaths() {
        return this.shapeEditor.ctrlsMainPoints.autoSmooth;
    }

    set autoSmoothPaths(value) {
        this.shapeEditor.ctrlsMainPoints.autoSmooth = value;
    }

    get useTransformAttr() {
        const dragType = this.shapeEditor.ctrlsDrag.type;
        const resizeType = this.shapeEditor.ctrlsResize.type;

        if (dragType != resizeType) throw new Error("dragType and resizeType are not the same");

        return dragType;
    }

    set useTransformAttr(value) {
        const oldValue = this.useTransformAttr;

        if (value != oldValue) {
            this.shapeEditor.ctrlsDrag.type = value ? "transform" : "attributes";
            if (this.shapeEditor.ctrlsDrag.enabled) this.shapeEditor.ctrlsDrag.disable().enable();

            this.shapeEditor.ctrlsResize.type = value ? "transform" : "attributes";
            if (this.shapeEditor.ctrlsResize.enabled)
                this.shapeEditor.ctrlsResize.disable().enable();
        }
    }

    get currentLayer() {
        return this._currentLayer;
    }

    set currentLayer(value) {
        let $node;

        if (value != null) {
            $node = new JSYG(`${this._getDocumentSelector()} #layer${value}`);

            if (!$node.length) throw new Error("Invalid value for currentLayer. No node found.");
        }

        this._currentLayer = value;

        this.hideEditors();

        this.editableShapes = this.editableShapes; //on force la valeur pour l'actualiser
    }

    getLayers() {
        return new JSYG(new JSYG(this._getDocumentSelector())[0].querySelectorAll(".layer"));
    }

    addLayer() {
        console.log("addLaayer");
        const nb = ++this._nbLayers;
        const id = `layer${nb}`;
        const g = new JSYG("<g>")
            .addClass("layer")
            .attr("id", id)
            .appendTo(this._getDocumentSelector());

        this.currentLayer = nb;

        this.triggerChange();

        return this;
    }

    removeLayer() {
        if (!this.currentLayer) throw new Error("No layer selected");

        new JSYG(this._getLayerSelector()).remove();

        this._actuLayers();

        this.currentLayer = null;

        this.triggerChange();

        return this;
    }

    _getLayerSelector() {
        return `${this._getDocumentSelector() + (this.currentLayer ? ` #layer${this.currentLayer}` : "")} `;
    }

    getDocument() {
        return document.querySelector(this._getDocumentSelector());
    }

    _initUndoRedo() {
        const that = this;

        this.undoRedo = new UndoRedo();
        this.undoRedo.saveState();

        this.undoRedo.on("change", () => {
		      console.log("undo", that.getDocument());
            //that.hideEditors();
            //that.trigger("change", that, that.getDocument()); //GUSA
            const event = new CustomEvent("change", { detail:  that.getDocument() });
            that[0].dispatchEvent(event);
        });
    }

    hideEditors() {
        this.shapeEditor.hide();
        this.textEditor.hide();

        return this;
    }

    enableSelection() {
        const target = this.shapeEditor.display && this.shapeEditor.target();

        this.disableEdition();
        this.shapeEditor.enable();

        if (target) this.shapeEditor.target(target).show();

        return this;
    }

    disableSelection() {
        this.hideEditors();

        if (this.shapeEditor.enabled) this.shapeEditor.disable();

        return this;
    }

    disableInsertion() {
        this.disableInsertElement();

        this.disableShapeDrawer();

        return this;
    }

    static registerPlugin(plugin) {
        if (!plugin.name) throw new Error("Plugin must have a name property");

        if (this._plugins.some(({ name }) => name == plugin.name))
            throw new Error(`${plugin.name} plugin already exists`);

        this._plugins.push(plugin);

        return this;
    }

    _createPlugin(plugin) {
        plugin = Object.create(plugin);

        plugin.set = StdConstruct.prototype.set;

        plugin.editor = this;

        this[plugin.name] = function (method) {
            let args = slice.call(arguments, 1);
            let returnValue;
            let prop;

            if (!method || JSYG.isPlainObject(method)) {
                args = [method];
                method = "enable";
            }

            if (method == "get") {
                prop = args[0];

                if (isPrivate(prop)) throw new Error(`property ${prop} is private`);

                return plugin[args[0]];
            }

            if (!plugin[method]) throw new Error(`method ${method} does not exist`);

            if (isPrivate(method)) throw new Error(`method ${method} is private`);

            returnValue = plugin[method](...args);

            return returnValue || this;
        };
    }

    _applyMethodPlugins(method) {
        const that = this;

        FullEditor._plugins.forEach(({ name }) => {
            try {
                that[name](method);
            } catch (e) {}
        });
    }

    disableEdition() {
        this.disableInsertion();

        this.disableMousePan();

        this.disableSelection();

        const event = new CustomEvent("disableedition", { detail: this });
        this[0].dispatchEvent(event);

        return this;
    }

    duplicate() {
        const cb = this.shapeEditor.clipBoard;
        const buffer = cb.buffer;

        cb.copy();
        cb.paste();
        cb.buffer = buffer;

        return this;
    }

    dim(prop, value) {
        if ($.isPlainObject(prop) || value != null) return this._setDim(prop, value);
        else return this._getDim(prop, value);
    }

    _getDim(prop) {
        const target = this.shapeEditor.target();
        const doc = this.getDocument();
        let dim;

        if (!target || !target.length) return null;

        dim = target.getDim(doc);

        return prop == null ? dim : dim[prop];
    }

    _setDim(prop, value) {
        const target = this.shapeEditor.target();
        let change = false;
        const doc = this.getDocument();
        let n;
        let newDim;
        let oldDim;

        if (!target || !target.length) return this;

        if (JSYG.isPlainObject(prop)) newDim = JSYG.extend({}, prop);
        else {
            newDim = {};
            newDim[prop] = value;
        }

        oldDim = target.getDim(doc);

        for (n in newDim) {
            newDim[n] = parseValue(newDim[n], oldDim[n]);

            if (newDim[n] != oldDim[n]) change = true;
        }

        if (change) {
            newDim.from = doc;
            newDim.keepRatio = this.keepShapesRatio;

            target.setDim(newDim);
            this.shapeEditor.update();
            this.triggerChange();
        }

        return this;
    }

    rotate(value) {
        const target = this.target();
        const oldValue = target && target.rotate();

        if (!target) return value == null ? null : this;

        if (value == null) return oldValue;

        value = parseValue(value, oldValue) - oldValue;

        if (oldValue != value) {
            target.rotate(value);
            this.shapeEditor.update();
            this.triggerChange();
        }

        return this;
    }

    css(prop, value) {
        if (JSYG.isPlainObject(prop)) {
            for (const n in prop) this.css(n, prop[n]);
            return this;
        }

        const target = this.target();
        const oldValue = target && target.css(prop);

        if (!target) return value == null ? null : this;

        if (value == null) return oldValue;

        value = parseValue(value, oldValue);

        if (oldValue != value) {
            target.css(prop, value);
            this.shapeEditor.update();
            this.triggerChange();
        }

        return this;
    }

    triggerChange = () => {
        this.undoRedo.saveState();

        const event = new CustomEvent("change", { detail: this.getDocument() });
        this[0].dispatchEvent(event);

        return this;
    };

    _insertFrame() {
        const mainFrame = this.zoomAndPan.innerFrame;
        let elem = new JSYG("<rect>");
        elem.attr({ x: 2, y: 2 });
        elem[0].classList.add("jsyg-doc-shadow");
        mainFrame.appendChild(elem[0]);
        this._frameShadow = elem;
        elem = new JSYG("<rect>");
        elem.attr({ x: 0, y: 0 });
        elem[0].classList.add("jsyg-doc-frame");
        mainFrame.appendChild(elem[0]);
        this._frame = elem;

        elem = new JSYG("<g>");
        elem.attr("id", this.idContainer);
        mainFrame.appendChild(elem[0]);
        this.containerDoc = elem;

        this._adjustSize();

        return this;
    }

    _removeFrame() {
        return this;
    }

    _initShapeDrawer() {
        this.pathDrawer = this._initDrawer(new PathDrawer());
        this.polylineDrawer = this._initDrawer(new PolylineDrawer());
        this.shapeDrawer = this._initDrawer(new ShapeDrawer());

        return this;
    }

    _initDrawer(drawer) {
        const that = this;

        drawer.on({
            draw(e) {
                const event = new CustomEvent("draw", { detail: e });
                that[0].dispatchEvent(event);
            },

            end(e) {
                if (!this.parentNode) return;

                const event = new CustomEvent("insert", { detail: e });
                that[0].dispatchEvent(event);

                that.triggerChange();

                if (that.autoEnableSelection) that.shapeEditor.target(this).show();
            },
        });

        return drawer;
    }

    _setCursorDrawing() {
        if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = this.cursorDrawing;
    }

    _removeCursorDrawing() {
        if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = null;
    }

    get shapeDrawerModel() {
        return this._shapeDrawerModel;
    }

    set shapeDrawerModel(value) {
        const jNode = new JSYG(value);

        if (jNode.length != 1) throw new Error("Shape model incorrect");

        if (!JSYG.svgShapes.includes(jNode.getTag()))
            throw new Error(`${jNode.getTag()} is not a svg shape`);

        this._shapeDrawerModel = jNode[0];
    }

    drawShape(modele) {
        const that = this;

        return new Promise((resolve, reject) => {
            that.enableShapeDrawer(modele, () => {
                const target = that.target();

                that.disableShapeDrawer();

                if (target) resolve(target[0]);
                else reject(new Error("No shape was drawn"));
            });
        });
    }

    enableShapeDrawer(modele, _callback) {
        const frame = new JSYG(this.zoomAndPan.innerFrame);
        const that = this;

        this.disableEdition();

        if (modele) this.shapeDrawerModel = modele;

        function onmousedown(e) {
            if (
                that.pathDrawer.inProgress ||
                that.polylineDrawer.inProgress ||
                that.shapeDrawer.inProgress ||
                e.which != 1
            )
                return;

            e.preventDefault();

            const modele = that.shapeDrawerModel;
            if (!modele) throw new Error("You must define a model");

            const shape = new JSYG(new JSYG(modele)[0].cloneNode());
            console.log(that._getLayerSelector());
            let target = document.querySelectorAll(that._getLayerSelector());
            target[0].appendChild(shape[0]);
            const tag = shape.getTag();
            let drawer;

            switch (tag) {
                case "polyline":
                case "polygon":
                    drawer = that.polylineDrawer;
                    break;

                case "path":
                    drawer = that.pathDrawer;
                    break;

                default:
                    drawer = that.shapeDrawer;
                    break;
            }

            drawer.area = frame;
            drawer.draw(shape, e);

            if (_callback) drawer.one("end", _callback);
        }

        frame[0].addEventListener("mousedown", onmousedown, false);
        frame[0].dataset.enableDrawingShape = onmousedown;
        this._func_enableDrawingShape = onmousedown;

        this._setCursorDrawing();

        return this;
    }

    disableShapeDrawer() {
        const frame = new JSYG(this.zoomAndPan.innerFrame);

        const fct = frame[0].dataset.enableDrawingShape;

        if (!fct) return this;

        frame[0].removeEventListener("mousedown", this._func_enableDrawingShape, false);

        this._removeCursorDrawing();

        return this;
    }

    get insertElementModel() {
        return this._insertElementModel;
    }

    set insertElementModel(value) {
        const jNode = new JSYG(value);

        if (jNode.length != 1) throw new Error("element model incorrect");

        if (!JSYG.svgGraphics.includes(jNode.getTag()))
            throw new Error(`${jNode.getTag()} is not a svg graphic element`);

        this._insertElementModel = jNode[0];
    }

    is(type, _elmt = this.target()) {
        const list = `svg${JSYG.ucfirst(type)}s`;
        const types = ["container", "graphic", "shape", "text"];

        if (!types.includes(type)) throw new Error(`${type} : type incorrect (${types} required)`);

        return JSYG[list].includes(JSYG(_elmt).getTag());
    }

    mouseInsertElement(modele) {
        const that = this;

        return new Promise((resolve) => {
            that.enableInsertElement(modele, () => {
                const target = that.target();

                that.disableInsertElement();

                if (target) resolve(target[0]);
                else reject(new Error("No element inserted"));
            });
        });
    }

    enableInsertElement(modele, _callback) {
        const frame = new JSYG(this.zoomAndPan.innerFrame);
        const that = this;

        this.disableEdition();

        if (modele) this.insertElementModel = modele;

        function onmousedown(e) {
            if (e.which != 1) return;

            e.preventDefault();

            const modele = that.insertElementModel;
            if (!modele) throw new Error("You must define a model");

            const shape = JSYG(modele.cloneNode(true));
            const isText = JSYG.svgTexts.includes(shape.getTag());

            that.insertElement(shape, e, isText);

            if (that.autoEnableSelection) {
                //GUSA
                let handler = () => {
                    new JSYG(that.node)[0].removeEventListener("mouseup", handler);

                    that.shapeEditor.target(shape);

                    if (that.editText && isText) {
                        that.textEditor.target(shape).show();
                        that.textEditor.one("validate", _callback);
                    } else {
                        that.shapeEditor.show();
                        if (_callback) _callback();
                    }
                };
                new JSYG(that.node)[0].addEventListener("mouseup", handler);
            }
        }

        frame[0].addEventListener("mousedown", onmousedown, false);
        frame[0].dataset.enableInsertElement = onmousedown;
        this._func_enableInsertElement = onmousedown;

        this._setCursorDrawing();

        return this;
    }

    disableInsertElement() {
        const frame = new JSYG(this.zoomAndPan.innerFrame);
        const fct = frame[0].dataset.enableInsertElement;

        if (!fct) return this;

        frame[0].removeEventListener("mousedown", this._func_enableInsertElement, false);

        this._removeCursorDrawing();

        return this;
    }

    marqueeZoom(opt) {
        const that = this;

        return new Promise((resolve) => {
            that.enableMarqueeZoom(opt, () => {
                that.disableMarqueeZoom();
                resolve();
            });
        });
    }

    disableMarqueeZoom() {
        this.zoomAndPan.marqueeZoom.disable();

        return this;
    }

    enableMarqueeZoom(opt, _callback) {
        if (this.zoomAndPan.marqueeZoom.enabled && !opt) return this;

        this.disableEdition();

        this.zoomAndPan.marqueeZoom.enable(opt);

        if (_callback) this.zoomAndPan.marqueeZoom.one("end", _callback);

        return this;
    }

    zoom(percent) {
        this.zoomAndPan.scale(1 + percent / 100);

        //this.trigger("zoom", this, this.getDocument());
            const event = new CustomEvent("zoom", { detail:  this.getDocument() });
            this[0].dispatchEvent(event);

        return this;
    }

    zoomTo(percentage) {
        if (percentage == "canvas") this.zoomAndPan.fitToCanvas().scale(0.95);
        else if ($.isNumeric(percentage)) this.zoomAndPan.scaleTo(percentage / 100);
        else throw new Error("argument must be numeric or 'canvas' string");

        const event = new CustomEvent("zoom", { detail: this.getDocument() });
        this[0].dispatchEvent(event);

        return this;
    }

    fitToDoc() {
        const dim = new JSYG(this.getDocument()).getDim("screen");
        const overflow = this.zoomAndPan.overflow;

        this.zoomAndPan.size({
            width: dim.width + (overflow != "hidden" ? 10 : 0),
            height: dim.height + (overflow != "hidden" ? 10 : 0),
        });

        return this;
    }

    _initZoomAndPan() {
        const that = this;

        this.zoomAndPan = new ZoomAndPan();
        this.zoomAndPan.overflow = "auto";
        this.zoomAndPan.scaleMin = 0;

        this.zoomAndPan.resizable.keepViewBox = false;
        this.zoomAndPan.resizable.keepRatio = false;

        this.zoomAndPan.mouseWheelZoom.key = "ctrl";

        this.zoomAndPan.on("change", () => {
            that._updateBoundingBoxes();
            that.shapeEditor.update();
            that.textEditor.update();
        });

        return this;
    }

    _initShapeEditor() {
        const editor = new Editor();
        const that = this;

        editor.selection.multiple = true;

        new JSYG(editor.container)[0].addEventListener("dblclick", (e) => {
            const target = editor.target();

            if (!that.editText || !JSYG.svgTexts.includes(target.getTag())) return;

            that.textEditor.target(target).show();
            that.textEditor.cursor.setFromPos(e);
        });

        editor.selection.on("beforedeselect beforedrag", ({ target }) => {
            if (
                target == that.textEditor.container ||
                new JSYG(target).isChildOf(that.textEditor.container)
            )
                return false;
        });

        editor.on({
            show() {
                that.textEditor.hide();
            },

            change: this.triggerChange,

            drag(e) {
                const event = new CustomEvent("drag", { detail: e });
                that[0].dispatchEvent(event);
            },

            changetarget() {
                const event = new CustomEvent("changetarget");
                that[0].dispatchEvent(event);
            },
        });

        this.shapeEditor = editor;

        return this;
    }

    _initTextEditor() {
        const that = this;

        this.textEditor = new TextEditor();

        this.textEditor.on({
            show() {
                that.shapeEditor.hide();
            },
            hide() {
                const target = that.textEditor.target();
                if (!target[0].textContent) {
                    let p = target[0].parentNode;
                    p.removeChild(target[0]);
                } else {
                    that.shapeEditor.target(target).show();
                }
            },
            validate() {
                that.triggerChange();
            },
        });

        return this;
    }

    setNode(...args) {
        StdConstruct.prototype.setNode.apply(this, args);

        this.zoomAndPan.setNode(this.node);

        this.shapeEditor.setNode(this.node);

        this.textEditor.setNode(this.node);

        return this;
    }

    _getDocumentSelector() {
        return `#${this.idContainer} > svg `;
    }

    get editableShapes() {
        return this._editableShapes;
    }

    set editableShapes(value) {
        this._editableShapes = value;
        this.shapeEditor.list = this._getLayerSelector() + value;
    }

    enableMousePan(opt) {
        if (!this.zoomAndPan.mousePan.enabled) {
            this.disableEdition();

            this.zoomAndPan.mousePan.enable(opt);
        }

        return this;
    }

    disableMousePan() {
        if (this.zoomAndPan.mousePan.enabled) {
            this.zoomAndPan.mousePan.disable();
        }

        return this;
    }

    enableMouseWheelZoom(opt) {
        if (!this.zoomAndPan.mouseWheelZoom.enabled) {
            this.zoomAndPan.mouseWheelZoom.enable(opt);
        }

        return this;
    }

    disableMouseWheelZoom() {
        if (this.zoomAndPan.mouseWheelZoom.enabled) {
            this.zoomAndPan.mouseWheelZoom.disable();
        }

        return this;
    }

    canMoveBackwards() {
        const shapes = new JSYG(this.shapeEditor.list);
        const target = this.shapeEditor.target();

        return shapes.index(target) > 0 && shapes.length > 1;
    }

    canMoveForwards() {
        const shapes = new JSYG(this.shapeEditor.list);
        const target = this.shapeEditor.target();

        return shapes.index(target) < shapes.length - 1 && shapes.length > 1;
    }

    isGroup() {
        return this.shapeEditor.isGroup();
    }

    get overflow() {
        return this.zoomAndPan.overflow;
    }

    set overflow(value) {
        const displayShapeEditor = this.shapeEditor.display;
        const displaytextEditor = this.textEditor.display;

        if (displayShapeEditor) this.shapeEditor.hide();
        if (displaytextEditor) this.textEditor.hide();

        this.zoomAndPan.overflow = value;

        if (displayShapeEditor) this.shapeEditor.show();
        if (displaytextEditor) this.textEditor.show();
    }

    enable(opt) {
        this.disable();

        if (opt) this.set(opt);

        if (!this.node) throw new Error("node is not defined");

        this.zoomAndPan.enable();

        this._insertFrame();

        if (this._editPathCtrlPoints) this._editPathCtrlPoints = true;
        if (this._resizable) this._resizable = true;
        this.editableShapes = this.editableShapes;

        this.shapeEditor.enableCtrls("drag", "resize", "rotate", "mainPoints");

        if (this.autoEnableSelection) this.shapeEditor.enable();

        //this.enableKeyShortCuts();

        this.enabled = true;

        return this;
    }

    disable() {
        this.disableEdition();

        this._removeFrame();

        this.zoomAndPan.disable();

        this.undoRedo.disable();

        this.disableKeyShortCuts();

        this.enabled = false;

        return this;
    }

    align(type) {
        this.shapeEditor.align(type);

        return this;
    }

   svgAttr(type) {
        this.shapeEditor.svgAttr();

        return this;
   }

   svgAttrGet(type) {
        this.shapeEditor.svgAttrGet();

        return this;
   }
   color(type) {
        this.shapeEditor.color();

        return this;
    }

    target(value) {
        if (value == null) {
            if (this.textEditor.display) return this.textEditor.target();
            else return this.shapeEditor.target();
        } else {
            this.shapeEditor.target(new JSYG(this.getDocument()).find(value)).show();
        }

        return this;
    }

    editTextElmt(elmt) {
        if (elmt == null) elmt = this.target();

        this.textEditor.target(elmt).show();

        return this;
    }

    dimDocument(dim) {
        const doc = new JSYG(this.getDocument());
        const oldDim = doc.getDim();

        if (dim == null) return oldDim;

        if (
            (dim.width && dim.width != oldDim.width) ||
            (dim.height && dim.height != oldDim.height)
        ) {
            doc.setDim(dim);

            this.triggerChange();

            this._adjustSize();
        }

        return this;
    }

    isMultiSelection() {
        return this.shapeEditor.isMultiSelection();
    }

    _adjustSize() {
        const contenu = new JSYG(this.getDocument());
        const dim = (contenu.length && contenu.getDim()) || { width: 0, height: 0 };

        new JSYG(this._frameShadow).add(this._frame).attr({
            width: dim.width,
            height: dim.height,
        });

        if (dim.width && dim.height) this.zoomTo("canvas");

        if (!this.shapeEditor.ctrlsDrag.options) this.shapeEditor.ctrlsDrag.options = {};
        if (!this.shapeEditor.ctrlsResize.options) this.shapeEditor.ctrlsResize.options = {};

        this.shapeEditor.ctrlsDrag.options.guides = {
            list: [{ x: 0 }, { x: dim.width }, { y: 0 }, { y: dim.height }],
        };

        this.shapeEditor.ctrlsResize.options.stepsX = {
            list: [0, dim.width],
        };

        this.shapeEditor.ctrlsResize.options.stepsY = {
            list: [0, dim.height],
        };

        return this;
    }

    createImage(src) {
        const image = new JSYG("<image>").attr("href", src);
        const that = this;

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function () {
                const dimDoc = JSYG(that.getDocument()).viewBox();
                let height = this.height;
                let width = this.width;

                if (width > dimDoc.width) {
                    height = (height * dimDoc.width) / width;
                    width = dimDoc.width;
                }

                if (height > dimDoc.height) {
                    width = (width * dimDoc.height) / height;
                    height = dimDoc.height;
                }

                image.attr({ width, height });

                resolve(image[0]);
            };

            img.onerror = reject;

            img.src = src;
        });
    }

    insertElement(elmt, pos, _preventEvent) {
        console.log("insertElement");

        let textNode;

        elmt = new JSYG(elmt);

        elmt.appendTo_(this._getLayerSelector()); //GUSA

        if (JSYG.svgTexts.includes(elmt.getTag()) && !elmt[0].textContent) {
            textNode = document.createTextNode("I");
            elmt.append_(JSYG(textNode));
        }

        elmt.setCenter(elmt.getCursorPos(pos));

        if (textNode) new JSYG(textNode).remove();

        if (!_preventEvent) {
            this.trigger("insert", this, this.getDocument(), elmt);
            this.triggerChange();
        }

        return this;
    }

    enableDropFiles() {
        const that = this;

        const fcts = {
            dragenter: stopEvents,
            dragover: stopEvents,

            drop(e) {
                console.log("drop file");
                console.dir(e);
                stopEvents(e);

                //const dt = e.originalEvent.dataTransfer;
                const dt = e.dataTransfer;
                let file;
                let str;

                if (!dt) return;

                if (dt.files && dt.files.length) {
                    file = dt.files[0];

                    if (/svg/i.test(file.type) && that.importSVGAs.toLowerCase() == "svg")
                        that.insertSVGFile(file, e);
                    else that.insertImageFile(file, e);
                } else {
                    str = dt.getData("text");

                    if (str) {
                        that.importImage(str)
                            .then((img) => {
                                that.insertElement(img, e);
                                that.target(img);
                            })
                            .catch(() => {});
                    }
                }
            },
        };

        JSYG(this.zoomAndPan.innerFrame)[0].addEventListener("dragenter", fcts["dragenter"]);
        JSYG(this.zoomAndPan.innerFrame)[0].addEventListener("dragover", fcts["dragover"]);
        JSYG(this.zoomAndPan.innerFrame)[0].addEventListener("drop", fcts["drop"]);

        this.disableDropFiles = function () {
            JSYG(this.zoomAndPan.innerFrame)[0].removeEventListener("dragenter", fcts["dragenter"]);
            JSYG(this.zoomAndPan.innerFrame)[0].removeEventListener("dragover", fcts["dragover"]);
            JSYG(this.zoomAndPan.innerFrame)[0].removeEventListener("drop", fcts["drop"]);
        };

        return this;
    }

    disableDropFiles() {
        return this;
    }

    insertImageFile(file, e) {
        const that = this;

        return this.importImage(file).then((img) => {
            that.insertElement(img, e);
            that.shapeEditor.target(img).show();
        });
    }

    insertSVGFile(file, e) {
        const that = this;
        return this.readFile(file, "text")
            .then(JSYG.parseSVG)
            .then((svg) => {
                that.insertElement(svg, e);
                that.shapeEditor.target(svg).show();
            });
    }

    importImage(arg) {
        let promise;

        if (arg instanceof File) {
            if (!arg.type.match(/image/))
                return Promise.reject(new TypeError(`${arg.name} is not an image file`));

            promise = this.readFile(arg, "dataURL");
        } else {
            if (arg.src)
                arg = arg.src; //DOMElement
            else if (arg instanceof jQuery) {
                arg = JSYG(arg);
                arg = arg.attr(arg.isSVG() ? "href" : "src");

                if (!arg) throw new TypeError("no src/href attribute found");
            } else if (typeof arg != "string") throw new TypeError("argument incorrect"); //URL or dataURL

            promise = Promise.resolve(arg);
        }

        return promise.then(this.createImage);
    }

    chooseFile() {
        const that = this;

        return new Promise((resolve, reject) => {
            JSYG("<input>")
                .attr("type", "file")
                .on("change", function () {
                    resolve(this.files[0]);
                })
                .trigger("click");
        });
    }

    chooseFile2() {
        const that = this;

        return new Promise((resolve, reject) => {
            let inp = JSYG("<input>").attr("type", "file");

            inp[0].addEventListener("change", function () {
                resolve(this.files[0]);
            });
            inp[0].click();
        });
    }

    loadImageAsDoc(arg) {
        const that = this;

        return this.importImage(arg).then((img) => {
            let dim;

            that.insertElement(img);

            dim = JSYG(img).getDim();

            that.newDocument(dim.width, dim.height);
            that.insertElement(img);
            that.addLayer();

            that.undoRedo.clear();

            return img;
        });
    }

    load(arg) {
        if (arg instanceof File) return this.loadFile(arg);
        else if (typeof arg == "string") {
            if (arg.indexOf("<?xml") == 0 || arg.indexOf("<svg") == 0)
                return Promise.resolve(this.loadString(arg));
            else return this.loadURL(arg);
        } else return Promise.resolve(this.loadXML(arg));
    }

    loadString(str) {
        return this.loadXML(JSYG.parseSVG(str));
    }

    readFile(file, readAs) {
        return new Promise((resolve, reject) => {
            if (!window.FileReader) throw new Error("your navigator doesn't implement FileReader");

            if (!(file instanceof File)) throw new Error("file argument incorrect");

            const reader = new FileReader();

            readAs = JSYG.ucfirst(readAs || "text");

            if (!["DataURL", "Text"].includes(readAs)) throw new Error("format incorrect");

            reader.onload = ({ target }) => {
                resolve(target.result);
            };

            reader.onerror = (e) => {
                reject(new Error("Impossible de charger le fichier"));
            };

            reader[`readAs${readAs}`](file);
        });
    }
    testCall() {
        console.log("testCall");
    }
    loadFile(file) {
        if (!file.type || !file.type.match(/svg/))
            throw new Error("file format incorrect. SVG file is required.");

        return this.readFile(file).then(this.loadString.bind(this));
    }
    loadURL(url) {
        return fetch(url)
            .then((response) => {
                if (!response.ok) throw new Error(response.statusText);

                return response.text();
            })
            .then(this.loadString.bind(this));
    }

    _actuLayers(svg) {
        const layers = this.getLayers();

        layers.each(function (i) {
            this.id = `layer${i + 1}`;
        });

        this._nbLayers = layers.length;
    }

    loadXML(svg) {
        let container;

        this.shapeEditor.hide();
        this.textEditor.hide();
        this._clearBoundingBoxes();

        container = new JSYG(`#${this.idContainer}`);

        container[0].innerHTML = "";
        container[0].appendChild(svg[0]);

        this._adjustSize();

        this.currentLayer = null;
        this._actuLayers();

        this.undoRedo.disable().setNode(svg).enable();

        const event = new CustomEvent("load", { detail: svg });
        this[0].dispatchEvent(event);

        return this;
    }

    newDocument(width, height) {
        let dim;

        if (!width || !height) {
            dim = this.dimDocument();

            if (dim) {
                if (!width) width = dim.width;
                if (!height) height = dim.height;
            } else throw new Error("You need to specify width and height");
        }

        const defs = new JSYG(`
   <defs>
    <filter id="shadow1">
      <feDropShadow dx="0.2" dy="0.4" stdDeviation="0.2" />
    </filter>
    <filter id="shadow2">
      <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="cyan" />
    </filter>
    <filter id="shadow3">
      <feDropShadow
        dx="-0.8"
        dy="-0.8"
        stdDeviation="0"
        flood-color="pink"
        flood-opacity="0.5" />
    </filter>
  </defs>`);

    const svg = new JSYG("<svg>").setDim({ width, height });
	    
        //const svg = new JSYG("<svg>").setDim({ width, height })
        //defs.appendTo_(svg);
        //svg.append_(defs);
         
        const svgNamespace = "http://www.w3.org/2000/svg";
        const defs_ = document.createElementNS(svgNamespace, "defs");

        let fe = document.createElementNS(svgNamespace, "feDropShadow");
        fe.setAttribute("dx","2");
        fe.setAttribute("dy","4");
        fe.setAttribute("stdDeviation","2");
        let filter = document.createElementNS(svgNamespace, "filter");
        filter.setAttribute("id","shadow1");
        filter.appendChild(fe);
        defs_.appendChild(filter);

        fe = document.createElementNS(svgNamespace, "feDropShadow");
        fe.setAttribute("dx","0");
        fe.setAttribute("dy","0");
        fe.setAttribute("stdDeviation","5");
        fe.setAttribute("flood-color","cyan");
        filter = document.createElementNS(svgNamespace, "filter");
        filter.setAttribute("id","shadow2");
        filter.appendChild(fe);
        defs_.appendChild(filter);

        fe = document.createElementNS(svgNamespace, "feDropShadow");
        fe.setAttribute("dx","-8");
        fe.setAttribute("dy","-8");
        fe.setAttribute("stdDeviation","0");
        fe.setAttribute("flood-color","pink");
        fe.setAttribute("flood-cpacity","5");
        filter = document.createElementNS(svgNamespace, "filter");
        filter.setAttribute("id","shadow3");
        filter.appendChild(fe);
        defs_.appendChild(filter);

        svg[0].appendChild(defs_);
        return this.loadXML(svg);
    }

    _updateBoundingBoxes() {
        new JSYG(this.shapeEditor.list).each(function () {
            const $this = new JSYG(this);
            if ($this.boundingBox("get", "display")) $this.boundingBox("update");
        });
    }

    _clearBoundingBoxes() {
        new JSYG(this.shapeEditor.list).boundingBox("hide");
    }

    toCanvas() {
        return new JSYG(this.getDocument()).toCanvas();
    }

    toSVGString(opt) {
        return new JSYG(this.getDocument()).toSVGString(opt && opt.standalone);
    }

    toSVGDataURL() {
        return new JSYG(this.getDocument()).toDataURL(true);
    }

    toPNGDataURL(format) {
        return this.toCanvas().then((canvas) => canvas.toDataURL());
    }

    _checkExportFormat(format) {
        const exportFormats = ["svg", "png"];

        if (!exportFormats.includes(format))
            throw new Error(
                `${format} : incorrect format (${exportFormats.join(" or ")} required)`,
            );
    }

    toDataURL(format) {
        if (!format) format = "svg";

        this._checkExportFormat(format);

        const method = `to${format.toUpperCase()}DataURL`;

        return this[method]();
    }

    print() {
        return this.toSVGDataURL().then(
            (url) =>
                new Promise((resolve) => {
                    const win = window.open(url);
                    win.onload = () => {
                        win.print();
                        resolve();
                    };
                }),
        );
    }

    downloadPNG() {
        return this.download("png");
    }

    downloadSVG() {
        return this.download("svg");
    }

    download(format) {
        if (!format) format = "svg";

        return this.toDataURL(format).then((url) => {
            const a = new JSYG("<a>")
                .attr({
                    href: url,
                    download: `file.${format}`,
                })
                .appendTo_("body"); //GUSA

            a[0].click();
            a.remove();
        });
    }

    remove() {
        if (!this.shapeEditor.display) return this;

        const target = this.shapeEditor.target();

        this.shapeEditor.hide();

        this._clearBoundingBoxes();

        target.remove();

        this.trigger("remove", this, this.getDocument(), target);

        this.triggerChange();

        return this;
    }

    group() {
        this.shapeEditor.group();

        this.triggerChange();

        return this;
    }

    ungroup() {
        this.shapeEditor.ungroup();

        this.triggerChange();

        return this;
    }

    center(orientation) {
        const doc = this.getDocument();
        const dimDoc = new JSYG(doc).getDim();
        const target = this.target();
        const dim = target.getDim(doc);
        const isVerti = orientation.toLowerCase().indexOf("verti") == 0;
        const newX = (dimDoc.width - dim.width) / 2;
        const newY = (dimDoc.height - dim.height) / 2;

        if (isVerti && dim.x != newX) target.setDim({ x: newX });
        else if (!isVerti && dim.y != newY) target.setDim({ y: newY });
        else return this;

        if (this.shapeEditor.display) this.shapeEditor.update();
        else if (this.textEditor.display) this.textEditor.update();

        this.triggerChange();

        return this;
    }

    centerVertically() {
        return this.center("vertically");
    }

    centerHorizontally() {
        return this.center("horizontally");
    }
}

FullEditor._plugins = [];

//events
[
    "onload",
    "ondrag",
    "ondraw",
    "oninsert",
    "onremove",
    "onchange",
    "onzoom",
    "onchangetarget",
    "ondisableedition",
].forEach((event) => {
    FullEditor.prototype[event] = null;
});

FullEditor.prototype.idContainer = "containerDoc";

FullEditor.prototype._editText = true;

FullEditor.prototype._nbLayers = 0;

FullEditor.prototype._currentLayer = null;

function isPrivate(name) {
    return name.charAt(0) == "_";
}

["copy", "cut", "paste"].forEach((action) => {
    FullEditor.prototype[action] = function () {
        if (action !== "paste" && !this.shapeEditor.display) return;

        this.shapeEditor.clipBoard[action]();

        return this;
    };
});

["undo", "redo"].forEach((action) => {
    FullEditor.prototype[action] = function () {
        this.hideEditors();

        this.undoRedo[action]();

        return this;
    };
});

["Front", "Backwards", "Forwards", "Back"].forEach((type) => {
    const methode = `move${type}`;

    FullEditor.prototype[methode] = function () {
        const target = this.shapeEditor._target;

        if (target) {
            new JSYG(target)[methode]();
            this.triggerChange();
        }

        return this;
    };
});

["Horiz", "Verti"].forEach((type) => {
    const methode = `move${type}`;

    FullEditor.prototype[methode] = function (value) {
        const target = this.shapeEditor.target();
        let dim;

        if (target && target.length) {
            dim = target.getDim();

            target.setDim(type == "Horiz" ? { x: dim.x + value } : { y: dim.y + value });
            this.shapeEditor.update();

            this.triggerChange();
        }

        return this;
    };
});

const regOperator = /^\s*(\+|-|\*|\/)=(\d+)\s*$/;

function parseValue(newValue, oldValue) {
    const matches = regOperator.exec(newValue);

    if (!matches) return newValue;

    switch (matches[1]) {
        case "+":
            return oldValue + Number(matches[2]);
        case "-":
            return oldValue - Number(matches[2]);
        case "*":
            return oldValue * Number(matches[2]);
        case "/":
            return oldValue / Number(matches[2]);
    }
}

FullEditor.prototype.cursorDrawing = "copy";

FullEditor.prototype.autoEnableSelection = true;

FullEditor.prototype._editableShapes = "*";

function stopEvents(e) {
    e.stopPropagation();
    e.preventDefault();
}

FullEditor.prototype.lang = "en";

FullEditor.prototype.importSVGAs = "image";

