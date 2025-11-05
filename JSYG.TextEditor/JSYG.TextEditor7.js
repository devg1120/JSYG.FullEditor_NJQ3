import NameToCode from "./color_dict/color_dict.js";

import JSYG from "../JSYG-wrapper/JSYG-wrapper.js";

import { Color } from "../JSYG.Color/JSYG.Color.js";
import { BoundingBox } from "../JSYG.BoundingBox/JSYG.BoundingBox.js";
import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";

export class TextEditor extends StdConstruct {
    constructor(arg, opt) {
        super(arg, opt);
        this.box = new BoundingBox();
        this.box.className = "textBox";
        this.container = this.box.container;
        this.selection = new Selection(this);
        this.cursor = new Cursor(this);
        this.keyboard = new Keyboard(this);

        if (arg) this.setNode(arg);
        if (opt) this.enable(opt);
    }

    target(arg) {
        if (arg == null) return this._target ? new JSYG(this._target) : null;

        const target = new JSYG(arg)[0];

        if (target.tagName != "text") throw new Error("La cible n'est pas un élément texte");

        const display = this.display;

        if (display) this.hide(true);

        this._target = target;
        this.box.setNode(target);

        if (display) this.show(true);

        this.trigger("changetarget", this.node, target);

        return this;
    }

    getText() {
        var textNode = this._target.childNodes[0];
        return textNode.nodeValue;
    }
    setText(text) {
        var textNode = this._target.childNodes[0];
        textNode.nodeValue = text;
    }
    getColor() {
        return this._target.getAttribute("fill");
    }
    setColor(color) {
        //var textNode = this._target.childNodes[0];
        this._target.setAttribute("fill", color);
    }

    getFont_size() {
        return this._target.getAttribute("font-size");
    }
    setFont_size(size) {
        return this._target.setAttribute("font-size", size);
    }
    getFont_family() {
        return this._target.getAttribute("font-family");
    }
    setFont_family(name) {
        return this._target.setAttribute("font-family", name);
    }
    getFont_weight() {
        return this._target.getAttribute("font-weight");
    }
    setFont_weight(name) {
        return this._target.setAttribute("font-weight", name);
    }
    getFont_style() {
        return this._target.getAttribute("font-style");
    }
    setFont_style(name) {
        return this._target.setAttribute("font-style", name);
    }
    getText_decoration() {
        return this._target.getAttribute("text-decoration");
    }
    setText_decoration(params) {
        return this._target.setAttribute("text-decoration", params);
    }

    targetRemove() {
        this._target = null;
    }

    insertChars(chars, indChar) {
        if (indChar < 0 || indChar > this._target.getNumberOfChars()) return false;

        chars = chars.replace(/ /g, "\u00a0");

        const content = this._target.textContent;

        this._target.textContent = content.substr(0, indChar) + chars + content.substr(indChar);

        this.box.update();

        this.trigger("insertchars", this.node, this._target);
        this.trigger("change", this.node, this._target);

        return this;
    }

    deleteChars(indChar, nbChars = 1) {
        if (indChar < 0 || indChar > this._target.getNumberOfChars()) return false;

        const content = this._target.textContent;

        this._target.textContent = content.substr(0, indChar) + content.substr(indChar + nbChars);

        this.box.update();

        this.trigger("deletechars", this.node, this._target);
        this.trigger("change", this.node, this._target);

        return this;
    }

    getCharFromPos(e) {
        const pt = new JSYG(this._target).getCursorPos(e);
        return this._target.getCharNumAtPosition(pt.toSVGPoint());
    }

    show(_preventEvent) {
        if (!this._target) return this;

        if (this.display) return this.update();

        this.box.show();

        this.selection.enable();
        this.keyboard.enable();

        this.cursor.enable().show(this._target.getNumberOfChars());

        this.display = true;

        this._content = this._target.textContent;

        if (!_preventEvent) this.trigger("show", this.node, this._target);

        return this;
    }

    hide(_preventEvent) {
        if (!this.display) return this;

        this.selection.disable();
        this.cursor.disable();
        this.keyboard.disable();

        new JSYG(this.container)[0].classList.remove(this.className);
        var parentNode = this.container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.container);
        }

        this.display = false;

        if (this._target.textContent != this._content)
            this.trigger("validate", this.node, this._target);

        if (!_preventEvent) this.trigger("hide", this.node, this._target);

        return this;
    }
    setEdittingRect(elem) {
        var svgns = "http://www.w3.org/2000/svg";
        var bounds = elem.getBBox();
        var bg = document.createElementNS(svgns, "rect");
        var style = getComputedStyle(elem);
        var padding_top = parseInt(style["padding-top"]);
        var padding_left = parseInt(style["padding-left"]);
        var padding_right = parseInt(style["padding-right"]);
        var padding_bottom = parseInt(style["padding-bottom"]);
        bg.setAttribute("x", bounds.x - parseInt(style["padding-left"]) - 4);
        bg.setAttribute("y", bounds.y - parseInt(style["padding-top"]));
        bg.setAttribute("width", bounds.width + padding_left + padding_right + 8);
        bg.setAttribute("height", bounds.height + padding_top + padding_bottom);
        //bg.setAttribute("fill", style["background-color"])
        //bg.setAttribute("fill", "lightgray");
        bg.setAttribute("fill", "#e6e6fa");
        bg.setAttribute("rx", style["border-radius"]);
        bg.setAttribute("stroke-width", style["border-top-width"]);
        bg.setAttribute("stroke", style["border-top-color"]);
        if (elem.hasAttribute("transform")) {
            bg.setAttribute("transform", elem.getAttribute("transform"));
        }
        elem.parentNode.insertBefore(bg, elem);
        this.editting_rect_svg = bg;
    }
    updateEdittingRect() {
        let elem = this._target;
        var bounds = elem.getBBox();
        var bg = this.editting_rect_svg;
        var style = getComputedStyle(elem);
        var padding_top = parseInt(style["padding-top"]);
        var padding_left = parseInt(style["padding-left"]);
        var padding_right = parseInt(style["padding-right"]);
        var padding_bottom = parseInt(style["padding-bottom"]);
        bg.setAttribute("x", bounds.x - parseInt(style["padding-left"]) - 4);
        bg.setAttribute("y", bounds.y - parseInt(style["padding-top"]));
        bg.setAttribute("width", bounds.width + padding_left + padding_right + 8);
        bg.setAttribute("height", bounds.height + padding_top + padding_bottom);
        //bg.setAttribute("fill", style["background-color"])
        //bg.setAttribute("fill", "lightgray");
        //bg.setAttribute("fill", "#f5f5f5");
        bg.setAttribute("fill", "#e6e6fa");
        bg.setAttribute("rx", style["border-radius"]);
        bg.setAttribute("stroke-width", style["border-top-width"]);
        bg.setAttribute("stroke", style["border-top-color"]);
        if (elem.hasAttribute("transform")) {
            bg.setAttribute("transform", elem.getAttribute("transform"));
        }
    }
    unsetEdittingRect(elem) {
        try {
            elem.parentNode.removeChild(this.editting_rect_svg);
            this.editting_rect_svg = null;
        } catch (error) {
            console.log("error");
        }
    }
    mark_dialog_edit() {
        this._target.classList.add("dialog_edit");
        this.setEdittingRect(this._target);
    }
    unmark_dialog_edit() {
        this._target.classList.remove("dialog_edit");
        this.unsetEdittingRect(this._target);
    }
    update() {
        if (!this.display) return this;

        this.box.update();

        if (this.selection.display) this.selection.select(this.selection.from, this.selection.to);
        if (this.cursor.display) this.cursor.show(this.cursor.currentChar);

        this.trigger("update", this.node, this._target);

        return this;
    }
}

TextEditor.prototype._target = null;

TextEditor.prototype.onchangetarget = null;
TextEditor.prototype.onshow = null;
TextEditor.prototype.onhide = null;
TextEditor.prototype.ondeletechars = null;
TextEditor.prototype.oninsertchars = null;
TextEditor.prototype.onupdate = null;
TextEditor.prototype.onchange = null;
TextEditor.prototype.onvalidate = null;

TextEditor.prototype.className = "textEditor";

TextEditor.prototype._content = null;

TextEditor.prototype.enabled = false;

class Selection extends StdConstruct {
    constructor(textObject) {
        super(textObject);
        this.textEditor = textObject;
        this.container = new JSYG("<rect>")[0];
    }

    hide() {
        this.from = null;
        this.to = null;

        var parentNode = this.container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.container);
        }

        this.display = false;

        return this;
    }

    deleteChars() {
        if (this.from === this.to) {
            return;
        }

        this.textEditor.deleteChars(this.from, this.to - this.from);

        this.to = this.from;

        this.textEditor.cursor.goTo(this.to);

        this.hide();

        return this;
    }

    select(from, to) {
        if (from === to) return this.hide();

        this.textEditor.cursor.hide();

        const node = this.textEditor._target;
        const nbchars = node.getNumberOfChars();

        from = JSYG.clip(from, 0, nbchars);
        to = JSYG.clip(to, 0, nbchars);

        const jCont = new JSYG(this.container).addClass(this.className);
        const jNode = new JSYG(node);

        if (!this.container.parentNode) jCont.appendTo(this.textEditor.container);

        jCont.fill(new Color(jNode.css("fill")).complementary().toString());

        jCont.setMtx(jNode.getMtx(this.textEditor.container));

        const fontsize = getFontSize(node);
        let start;
        let end;

        if (from === nbchars) {
            //positionnement tout à la fin
            start = node.getEndPositionOfChar(from - 1);
        } else {
            start = node.getStartPositionOfChar(from);
        }

        if (to === nbchars) {
            //positionnement tout à la fin
            end = node.getEndPositionOfChar(to - 1);
        } else {
            end = node.getStartPositionOfChar(to);
        }

        jCont.setDim({
            x: start.x < end.x ? start.x : end.x,
            y: start.y - fontsize + 3,
            width: Math.abs(end.x - start.x),
            height: fontsize,
        });

        this.from = Math.min(from, to);
        this.to = Math.max(from, to);

        this.textEditor.cursor.currentChar = this.to;

        this.display = true;

        return this;
    }

    start(e) {
        const node = this.textEditor._target;

        if (!node || node.tagName != "text") return this.hide();

        const jNode = new JSYG(node);
        const pt = jNode.getCursorPos(e);
        let ind = this.textEditor.getCharFromPos(e);
        let pt1;
        let pt2;
        const that = this;
        let from;
        let to;

        if (ind == -1) return this.textEditor.hide();

        this.hide();

        pt1 = node.getStartPositionOfChar(ind);
        pt2 = node.getEndPositionOfChar(ind);

        if (pt2.x - pt.x < pt.x - pt1.x) ind++;

        from = ind;
        to = ind;

        function mousemove(e) {
            const pt = jNode.getCursorPos(e);
            let ind = that.textEditor.getCharFromPos(e);
            let pt1;
            let pt2;

            if (ind === -1) return;

            pt1 = node.getStartPositionOfChar(ind);
            pt2 = node.getEndPositionOfChar(ind);

            if (pt2.x - pt.x < pt.x - pt1.x) ind++;

            to = ind;

            that.select(from, to);
        }

        function remove() {
            new JSYG(that.textEditor.container).off({
                mousemove: mousemove,
                mouseup: remove,
            });
        }

        new JSYG(this.textEditor.container).on({
            mousemove: mousemove,
            mouseup: remove,
        });

        return this;
    }

    selectWord(ind) {
        this.textEditor.cursor.goTo(ind);
        const word = this.textEditor.cursor.getCurrentWord();
        this.select(word.start, word.end);
    }

    dblclick(e) {
        const node = this.textEditor._target;
        if (!node || node.tagName != "text") return this.hide();

        e.preventDefault();

        const ind = this.textEditor.getCharFromPos(e);

        this.selectWord(ind);
    }

    enable(opt) {
        this.disable();

        if (opt) {
            this.set(opt);
        }

        const that = this;

        function start(e) {
            if (e.which != 1) return;

            e.preventDefault();

            that.start(e);
        }

        function dblclick(e) {
            if (e.which != 1) return;

            e.preventDefault();

            that.dblclick(e);
        }

        new JSYG(this.textEditor.container)[0].addEventListener("mousedown", start);
        new JSYG(this.textEditor.container)[0].addEventListener("dblclick", dblclick);

        this.disable = function () {
            this.hide();
            new JSYG(this.textEditor.container)[0].removeEventListener("mousedown", start);
            new JSYG(this.textEditor.container)[0].removeEventListener("dblclick", dblclick);
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

Selection.prototype.className = "textSelection";

Selection.prototype.display = false;

Selection.prototype.from = null;

Selection.prototype.to = null;

Selection.prototype.enabled = false;

function getFontSize(node) {
    const size = new JSYG(node).css("font-size");

    if (/px/.test(size)) return parseFloat(size);
    else if (/pt/.test(size)) return parseFloat(size) * 1.33;
    return parseFloat(size);
    //else throw new Error(`${size} : valeur incorrecte`);
}
class Preview {
    constructor(dialog, elem) {
        this._dialog = dialog;
        this._target = elem.childNodes[1];
        this._textNode = elem.childNodes[1].childNodes[0];
    }
    getText() {
        return this._textNode.nodeValue;
    }
    setText(text) {
        this._textNode.nodeValue = text;
        if (this._dialog.offsetWidth < this._target.clientWidth) {
            this._dialog.style.width = String(this._target.clientWidth) + "px";
        }
    }
    getColor() {
        return this._target.getAttribute("fill");
    }
    setColor(color) {
        this._target.setAttribute("fill", color);
    }

    getFont_size() {
        return this._target.getAttribute("font-size");
    }
    setFont_size(size) {
        this._target.setAttribute("font-size", size);
        if (this._dialog.offsetWidth < this._target.clientWidth) {
            this._dialog.style.width = String(this._target.clientWidth) + "px";
        }
    }
    getFont_family() {
        return this._target.getAttribute("font-family");
    }
    setFont_family(name) {
        return this._target.setAttribute("font-family", name);
    }
    getFont_weight() {
        return this._target.getAttribute("font-weight");
    }
    setFont_weight(name) {
        return this._target.setAttribute("font-weight", name);
    }
    getFont_style() {
        return this._target.getAttribute("font-style");
    }
    setFont_style(name) {
        return this._target.setAttribute("font-style", name);
    }
    getText_decoration() {
        return this._target.getAttribute("text-decoration");
    }
    setText_decoration(params) {
        return this._target.setAttribute("text-decoration", params);
    }
}

class Cursor extends StdConstruct {
    constructor(textObject) {
        super(textObject);
        this.textEditor = textObject;

        this.container = new JSYG("<line>")[0];
    }

    goTo(indice) {
        return this.show(indice);
    }

    setFromPos(e) {
        return this.show(this.textEditor.getCharFromPos(e));
    }

    firstChar() {
        return this.goTo(0);
    }

    lastChar() {
        return this.goTo(this.textEditor._target.getNumberOfChars());
    }

    nextChar() {
        return this.goTo(this.currentChar + 1);
    }

    prevChar() {
        return this.goTo(this.currentChar - 1);
    }

    insertChar(letter) {
        this.textEditor.insertChars(letter, this.currentChar);
        this.nextChar();
    }

    deleteChar() {
        this.textEditor.deleteChars(this.currentChar);
        this.goTo(this.currentChar);
    }

    getCurrentWord() {
        if (this.currentChar === -1) {
            return;
        }

        const str = this.textEditor._target.textContent;
        const start = str.substr(0, this.currentChar).replace(/\w+$/, "").length;
        const match = str.substr(this.currentChar).match(/^\w+/) || [[]];
        const end = match[0].length + this.currentChar;

        return { start, end, content: str.substring(start, end) };
    }

    show(indice) {
        const node = this.textEditor._target;

        if (indice < 0 || indice > node.getNumberOfChars()) {
            return false;
        }

        let pt;
        const jNode = new JSYG(node);
        const nbchars = node.getNumberOfChars();
        const fontsize = getFontSize(node);
        let color = jNode.fill();
        const jCont = new JSYG(this.container);

        if (color == "none") color = "black";

        if (nbchars === 0) {
            pt = new JSYG.Vect(jNode.attr("x"), jNode.attr("y"));
        } else if (indice === nbchars) {
            //positionnement tout à la fin
            pt = node.getEndPositionOfChar(indice - 1);
        } else pt = node.getStartPositionOfChar(indice);

        this.hide();

        jCont
            .attr({
                x1: pt.x,
                y1: pt.y + 3,
                x2: pt.x,
                y2: pt.y + 3 - fontsize,
            })
            .css("visibility", "visible")
            .css("stroke", color)
            .setMtx(jNode.getMtx(this.textEditor.container))
            .appendTo_(this.textEditor.container);

        jCont[0].classList.add(this.className); //GUSA

        this.interval = window.setInterval(() => {
            jCont.css("visibility", jCont.css("visibility") === "visible" ? "hidden" : "visible");
        }, 600);

        this.currentChar = indice;
        this.textEditor.selection.from = indice;
        this.textEditor.selection.to = indice;

        this.display = true;

        return this;
    }

    hide() {
        window.clearInterval(this.interval);

        var parentNode = this.container.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.container);
        }

        this.display = false;

        return this;
    }

    _mousedown(e) {
        if (e.which != 1) return this;

        const node = this.textEditor._target;
        const pt = new JSYG(node).getCursorPos(e);
        let ind = this.textEditor.getCharFromPos(e);
        let pt1;
        let pt2;

        if (ind === -1) return this;

        pt1 = node.getStartPositionOfChar(ind);
        pt2 = node.getEndPositionOfChar(ind);

        if (pt2.x - pt.x < pt.x - pt1.x) ind++;

        this.goTo(ind);

        return this;
    }

    enable(opt) {
        this.disable();

        if (opt) {
            this.set(opt);
        }

        const mousedown = this._mousedown.bind(this);

        new JSYG(this.textEditor.container)[0].addEventListener("mousedown", mousedown);

        this.disable = function () {
            this.hide();
            new JSYG(this.textEditor.container)[0].removeEventListener("mousedown", mousedown);
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

Cursor.prototype.enabled = false;

Cursor.prototype.display = false;

Cursor.prototype.currentChar = -1;

Cursor.prototype.className = "cursor";

Cursor.prototype._interval = false;

function Keyboard(textObject) {
    let mouse = {
        x: 0,
        y: 0,
    };
    let pos = {
        x: 0,
        y: 0,
    };

    this.textEditor = textObject;

    this.dialog = document.getElementById("myDialog");
    this.applyButton = document.getElementById("applyDialog");
    this.closeButton = document.getElementById("closeDialog");
    this.colorPicker = document.getElementById("colorPicker");
    this.fontSizer = document.getElementById("fontSizer");
    this.fontName = document.getElementById("fontName");
    this.fontWeight = document.getElementById("fontWeight");
    this.fontStyle = document.getElementById("fontStyle");

    this.underLineToggle = document.getElementById("underLineToggle");
    this.overLineToggle = document.getElementById("overLineToggle");
    this.striketHroughToggle = document.getElementById("striketHroughToggle");
    this.textarea = document.getElementById("myTextarea");
    this.preview = document.getElementById("preview");
    this.preview_inst = new Preview(this.dialog, this.preview);

    this.textarea.addEventListener("change", (evt) => {
        console.log("textarea change", evt.target.value);
        let text = evt.target.value;
        this.preview_inst.setText(text);
    });
    this.colorPicker.addEventListener("change", (evt) => {
        console.log("colorPicker change", evt.target.value);
        let color = evt.target.value;
        this.preview_inst.setColor(color);
    });
    this.fontSizer.addEventListener("change", (evt) => {
        console.log("fontSizer change", evt.target.value);
        let size = evt.target.value;
        this.preview_inst.setFont_size(size);
    });
    this.fontName.addEventListener("change", (evt) => {
        console.log("fontName change", evt.target.value);
        let name = evt.target.value;
        this.preview_inst.setFont_family(name);
    });
    this.fontWeight.addEventListener("change", (evt) => {
        console.log("fontWeight change", evt.target.value);
        let value = evt.target.value;
        this.preview_inst.setFont_weight(value);
    });
    this.fontStyle.addEventListener("change", (evt) => {
        console.log("fontStyle change", evt.target.value);
        let value = evt.target.value;
        this.preview_inst.setFont_style(value);
    });

    this.preview_update_text_decoration = () => {
        let new_param = "";
        if (this.text_decoration_underLine) {
            new_param = new_param.concat(" ", "underline");
        }
        if (this.text_decoration_overLine) {
            new_param = new_param.concat(" ", "overline");
        }
        if (this.text_decoration_striketHrough) {
            new_param = new_param.concat(" ", "line-through");
        }
        this.preview_inst.setText_decoration(new_param);
    };

    this.dialog.addEventListener("dragstart", (evt) => {
        mouse.y = evt.pageY;
        mouse.x = evt.pageX;
        if (!this.dialog.style.top) {
            this.dialog.style.top = "0px";
            this.dialog.style.left = "0px";
            pos.y = 0;
            pos.x = 0;
        } else {
            pos.y = parseInt(this.dialog.style.top.slice(0, -2), 10);
            pos.x = parseInt(this.dialog.style.left.slice(0, -2), 10);
        }
        evt.dataTransfer.setDragImage(document.createElement("div"), 0, 0);
    });
    this.dialog.addEventListener("drag", (evt) => {
        if (evt.x === 0 && evt.y === 0) return;
        const movey = (evt.pageY - mouse.y) * 2;
        const movex = (evt.pageX - mouse.x) * 2;
        this.dialog.style.top = pos.y + movey + "px";
        this.dialog.style.left = pos.x + movex + "px";
    });

    this.applyButton.addEventListener("click", () => {
        let text = this.textarea.value;
        let color = this.colorPicker.value;
        let font_size = this.fontSizer.value;
        let font_name = this.fontName.value;
        let font_weight = this.fontWeight.value;
        let font_style = this.fontStyle.value;
        this.textEditor.setText(text);
        this.textEditor.setColor(color);
        if (font_name != "") {
            this.textEditor.setFont_family(font_name);
        }
        if (font_weight != "") {
            this.textEditor.setFont_weight(font_weight);
        }
        if (font_style != "") {
            this.textEditor.setFont_style(font_style);
        }
        this.textEditor.setFont_size(font_size);

        this.textEditor.updateEdittingRect();

        let new_param = "";
        if (this.text_decoration_underLine) {
            new_param = new_param.concat(" ", "underline");
        }
        if (this.text_decoration_overLine) {
            new_param = new_param.concat(" ", "overline");
        }
        if (this.text_decoration_striketHrough) {
            new_param = new_param.concat(" ", "line-through");
        }
        this.textEditor.setText_decoration(new_param);
    });

    this.underLineToggle.addEventListener("click", (event) => {
        event.preventDefault();
        this.underLineToggle.classList.toggle("active");
        if (this.underLineToggle.classList.contains("active")) {
            this.text_decoration_underLine = true;
        } else {
            this.text_decoration_underLine = false;
        }
        this.preview_update_text_decoration();
    });
    this.overLineToggle.addEventListener("click", (event) => {
        event.preventDefault();
        this.overLineToggle.classList.toggle("active");
        if (this.overLineToggle.classList.contains("active")) {
            this.text_decoration_overLine = true;
        } else {
            this.text_decoration_overLine = false;
        }
        this.preview_update_text_decoration();
    });
    this.striketHroughToggle.addEventListener("click", (event) => {
        event.preventDefault();
        this.striketHroughToggle.classList.toggle("active");
        if (this.striketHroughToggle.classList.contains("active")) {
            this.text_decoration_striketHrough = true;
        } else {
            this.text_decoration_striketHrough = false;
        }
        this.preview_update_text_decoration();
    });

    this.closeButton.addEventListener("click", () => {
        this.dialog.close();
        this.textEditor.unmark_dialog_edit();
    });
}

Keyboard.prototype = {
    enabled: false,

    keys: [
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Backspace",
        "Delete",
        "Escape",
        "Return",
        "Enter",
        "Tab",
        "Hiragana",
        "NonConvert",
    ],

    _firstPos: null,

    _getKey({ key, keyCode }) {
        if (key) return key;

        switch (keyCode) {
            case 8:
                return "Backspace";
            case 13:
                return "Return";
            case 27:
                return "Escape";
            case 35:
                return "End";
            case 36:
                return "Home";
            case 37:
                return "ArrowLeft";
            case 39:
                return "ArrowRight";
            case 46:
                return "Delete";
            case 9:
                return "Tab";
            default:
                return String.fromCharCode(keyCode);
        }
    },
    _compositionstart(e) {
        console.log("_composition start");
    },
    _compositionupdate(e) {
        console.log("_composition update");
    },
    _compositionend(e) {
        console.log("_composition end");
    },

    _keypress(e) {
        const key = this._getKey(e);

        if (
            !/^[\w\W]$/.test(key) ||
            e.ctrlKey ||
            (this.textEditor.cursor.display === false && this.textEditor.display === false)
        )
            return;

        e.preventDefault();

        this.textEditor.selection.deleteChars();
        this.textEditor.cursor.insertChar(key);
    },

    _keydown(e) {
        if (this.textEditor.cursor.display === false && this.textEditor.selection.from === false)
            return;

        const key = this._getKey(e);
        if (!this.keys.includes(key)) return;

        e.preventDefault();

        const cursor = this.textEditor.cursor;
        const select = this.textEditor.selection;
        const target = this.textEditor._target;

        let //nbchars = target.getNumberOfChars(),
            inverse;

        if (e.shiftKey && key != "Home" && key != "End" && select.from === select.to) {
            this._firstPos = cursor.currentChar;
        }

        inverse = this._firstPos >= cursor.currentChar;

        switch (key) {
            case "ArrowLeft":
                if (e.shiftKey) {
                    if (select.display) {
                        if (inverse) select.select(select.from - 1, select.to);
                        else select.select(select.from, select.to - 1);
                    } else select.select(cursor.currentChar - 1, cursor.currentChar);
                } else {
                    select.hide();
                    cursor.prevChar();
                }
                break;

            case "ArrowRight":
                if (e.shiftKey) {
                    if (select.display) {
                        if (inverse) select.select(select.from + 1, select.to);
                        else select.select(select.from, select.to + 1);
                    } else select.select(cursor.currentChar, cursor.currentChar + 1);
                } else {
                    select.hide();
                    cursor.nextChar();
                }
                break;

            case "Home":
                if (e.shiftKey) select.select(0, select.from);
                else {
                    select.hide();
                    cursor.firstChar();
                }
                break;

            case "End":
                if (e.shiftKey) select.select(select.from, target.getNumberOfChars());
                else {
                    select.hide();
                    cursor.lastChar();
                }
                break;

            case "Backspace":
                if (select.display) select.deleteChars();
                else if (cursor.currentChar > 0) {
                    cursor.prevChar();
                    cursor.deleteChar();
                }
                break;

            case "Delete":
                if (select.display) select.deleteChars();
                else if (cursor.currentChar >= 0) cursor.deleteChar();
                break;

            case "Tab":
                let text = this.textEditor.getText();
                let color = this.textEditor.getColor();

                let fontSize = this.textEditor.getFont_size();
                let fontFamily = this.textEditor.getFont_family();
                let fontWeight = this.textEditor.getFont_weight();
                let fontStyle = this.textEditor.getFont_style();
                let text_decoration = this.textEditor.getText_decoration();

                this.preview_inst.setText(text);
                this.preview_inst.setColor(color);
                this.preview_inst.setFont_size(fontSize);
                this.preview_inst.setFont_family(fontFamily);
                this.preview_inst.setFont_weight(fontWeight);
                this.preview_inst.setFont_style(fontStyle);
                this.preview_inst.setText_decoration(text_decoration);

                if (color == null) {
                    color = "white";
                }
                if (fontSize == null) {
                    fontSize = 16;
                }
                if (fontFamily == null) {
                    fontFamily = "遊ゴシック";
                }
                if (fontWeight == null) {
                    fontWeight = "normal";
                }
                if (fontStyle == null) {
                    fontStyle = "normal";
                }
                if (text_decoration == null) {
                    text_decoration = "";
                }

                this.textarea.value = text;
                this.fontSizer.value = fontSize;
                this.fontName.value = fontFamily;
                this.fontWeight.value = fontWeight;
                this.fontStyle.value = fontStyle;

                if (text_decoration.includes("underline")) {
                    this.underLineToggle.classList.add("active");
                    this.text_decoration_underLine = true;
                } else {
                    this.underLineToggle.classList.remove("active");
                    this.text_decoration_underLine = false;
                }
                if (text_decoration.includes("overline")) {
                    this.overLineToggle.classList.add("active");
                    this.text_decoration_overLine = true;
                } else {
                    this.overLineToggle.classList.remove("active");
                    this.text_decoration_overLine = false;
                }
                if (text_decoration.includes("line-through")) {
                    this.striketHroughToggle.classList.add("active");
                    this.text_decoration_striketHrough = true;
                } else {
                    this.striketHroughToggle.classList.remove("active");
                    this.text_decoration_striketHrough = false;
                }
                if (!color.startsWith("#")) {
                    //console.log("color not#", color);
                    this.colorPicker.value = NameToCode(color);
                } else {
                    this.colorPicker.value = color;
                }
                this.textEditor.hide();

                this.textEditor.mark_dialog_edit();
                this.textarea.focus();

                this.dialog.showModal();
                break;

            case "NonConvert":
                console.log("on NonConvert!!");
                break;

            case "Escape":
            case "Return":
            case "Enter":
                this.textEditor.hide();
                break;
        }
    },

    enable() {
        this.disable();

        const fcts = {
            keydown: this._keydown.bind(this),
            keypress: this._keypress.bind(this),
            compositionstart: this._compositionstart.bind(this), //GUSA
            compositionupdate: this._compositionupdate.bind(this),
            compositionend: this._compositionend.bind(this),
        };

        new JSYG(document)[0].addEventListener("keydown", fcts["keydown"]);
        new JSYG(document)[0].addEventListener("keypress", fcts["keypress"]);
        new JSYG(document)[0].addEventListener("compositionstart", fcts["compositionstart"]);
        new JSYG(document)[0].addEventListener("compositionupdate", fcts["compositionupdate"]);
        new JSYG(document)[0].addEventListener("compositionend", fcts["compositionend"]);

        this.disable = function () {
            new JSYG(document)[0].removeEventListener("keydown", fcts["keydown"]);
            new JSYG(document)[0].removeEventListener("keypress", fcts["keypress"]);
            new JSYG(document)[0].removeEventListener("compositionstart", fcts["compositionstart"]);
            new JSYG(document)[0].removeEventListener(
                "compositionupdate",
                fcts["compositionupdate"],
            );
            new JSYG(document)[0].removeEventListener("compositionend", fcts["compositionend"]);
            this.enabled = false;
            return this;
        };

        this.enabled = true;

        return this;
    },

    disable() {
        return this;
    },
};
