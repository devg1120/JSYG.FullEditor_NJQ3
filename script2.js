import FullEditor from "./JSYG.FullEditor_es6.js";
import JSYG from "./JSYG-wrapper/JSYG-wrapper.js";

window.addEventListener("DOMContentLoaded", function () {
    window.svgEditor = new FullEditor("svg");

    svgEditor.editableShapes = "> *";

    svgEditor.enable();

    ["left", "center", "right", "top", "middle", "bottom"].forEach((type) => {
        let selector = `#align${JSYG.ucfirst(type)}`; //TODO
        let eventName = "click";

        let handler = () => {
            svgEditor.align(type);
        };
        document.querySelector(selector).addEventListener(eventName, handler, false);
    });

    ["Front", "Back", "Forwards", "Backwards"].forEach((type) => {
        let selector = `#move${type}`;
        let eventName = "click";

        let handler = () => {
            //svgEditor[`moveTarget${type}`]();
            svgEditor[`move${type}`]();
        };
        document.querySelector(selector).addEventListener(eventName, handler, false);
    });

    let selector = "#insertText";
    let eventName = "click";

    let handler = function () {
        const text = new JSYG("<text>").text("Bonjour le monde");
        svgEditor.enableInsertElement(text);
        new JSYG(this).trigger("blur");
    };
    let target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#newDocument";
    eventName = "click";
    handler = () => {
        //svgEditor.newDocument( $('#width').val(), $('#height').val() );
        let w = document.querySelector("#width").value;
        let h = document.querySelector("#height").value;
        svgEditor.newDocument(w, h);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#openDocument";
    eventName = "click";
    handler = () => {
        svgEditor
            .chooseFile2()
            .then((arg) => svgEditor.loadFile(arg))
            .catch(alert); // GUSA
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#openImage";
    eventName = "click";
    handler = () => {
        svgEditor.chooseFile().then(svgEditor.loadImageAsDoc).catch(alert);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#insertImage";
    eventName = "click";
    handler = () => {
        svgEditor.chooseFile().then(svgEditor.insertImageFile).catch(alert);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#downloadSVG";
    eventName = "click";
    handler = () => {
        svgEditor.download("svg");
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#downloadPNG";
    eventName = "click";
    handler = () => {
        svgEditor.download("png");
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#setColor";
    eventName = "click";
    handler = () => {
        svgEditor.color();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#setConnector";
    eventName = "click";
    handler = () => {
        svgEditor.connector();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }


    selector = "#svgAttrSet";
    eventName = "click";
    handler = () => {
        svgEditor.svgAttr();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#svgAttrGet";
    eventName = "click";
    handler = () => {
        svgEditor.svgAttrGet();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }


    /* TODO
    selector = '#openExample'
    eventName = 'click'
    handler = () => {
        $('#exampleChoice').modal();    //TODO
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
  */

    /* TODO
    selector = '#confirmExample'
    eventName = 'click'
    handler = () => {
        $('#exampleChoice').modal("hide");
        let target = document.querySelector('#exampleChoice')
        if (target) {
             target.modal("hide")
        }
        svgEditor.loadURL(`examples/${$('#examples').val()}.svg`);
    };

    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/

    selector = "#width";
    eventName = "change";
    handler = function () {
        svgEditor.dimDocument({ width: this.value });
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#height";
    eventName = "change";
    handler = function () {
        svgEditor.dimDocument({ height: this.value });
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#mousePan";
    eventName = "click";
    handler = function () {
        svgEditor.enableMousePan();
        if (!this.classList.contains("active")) {
            svgEditor.enableMousePan();
            this.classList.add("active");
        } else {
            svgEditor.disableMousePan(false);
            this.classList.remove("active");
        }
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#drawShapesOff";
    eventName = "click";
    handler = () => {
        svgEditor.disableShapeDrawer();
        svgEditor.disableInsertElement();
        svgEditor.enableSelection();
        let s = document.querySelector("#shape");
        s.value = "-";
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#shape";
    eventName = "change";
    handler = function () {
        let type = this.value;

        if (type == "-") {
            svgEditor.disableShapeDrawer();
            svgEditor.disableInsertElement();
            svgEditor.enableSelection();
            return;
        }

        if (type.includes("path")) {
            svgEditor.drawingPathMethod = type == "path" ? "point2point" : "freehand";
            type = "path";
        }

        const shape = new JSYG(`<${type}>`);
        //shape[0].classList.add("perso");  //GUSA
        shape[0].setAttribute("fill", "#ffffff");
        shape[0].setAttribute("stroke", "#000000");
        shape[0].setAttribute("stroke-width", "1");


        if (type == "text") svgEditor.enableInsertElement(shape);
        else svgEditor.enableShapeDrawer(shape);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    $("#marqueeZoom").on("click", () => {
        svgEditor.marqueeZoom();
    });

    selector = "#fitToCanvas";
    eventName = "click";
    handler = () => {
        svgEditor.zoomTo("canvas");
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#fitToDoc";
    eventName = "click";
    handler = () => {
        svgEditor.fitToDoc();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#realSize";
    eventName = "click";
    handler = () => {
        svgEditor.zoomTo(100);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#zoomIn";
    eventName = "click";
    handler = () => {
        svgEditor.zoom(+10);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    selector = "#zoomOut";
    eventName = "click";
    handler = () => {
        svgEditor.zoom(-10);
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    ["remove", "copy", "cut", "paste", "undo", "redo", "group", "ungroup"].forEach((action) => {
        selector = `#${action}`;
        eventName = "click";
        handler = (arg) => {
            svgEditor[action](arg);
        };
        target = document.querySelector(selector);
        if (target) {
            target.addEventListener(eventName, handler, false);
        }
    });

    [
        "canvasResizable",
        "editPathMainPoints",
        "editPathCtrlPoints",
        "keepShapesRatio",
        "autoSmoothPaths",
        "useTransformAttr",
        "editPosition",
        "editSize",
        "editRotation",
        "editText",
    ].forEach((property) => {
        selector = `#${property}`;
        eventName = "change";
        handler = function () {
            svgEditor[property] = this.checked;
            //new JSYG(this).blur();  //GUSA
        };
        target = document.querySelector(selector);
        if (target) {
            target.addEventListener(eventName, handler, false);
            const clickEvent = new Event("change");
            target.dispatchEvent(clickEvent);
        }
    });

    //$('#print').on("click",() => { svgEditor.print(); });

    selector = "#print";
    eventName = "click";
    handler = () => {
        svgEditor.print();
    };
    target = document.querySelector(selector);
    if (target) {
        target.addEventListener(eventName, handler, false);
    }

    svgEditor.registerKeyShortCut({
        "ctrl+c": svgEditor.copy,
        "ctrl+x": svgEditor.cut,
        "ctrl+v": svgEditor.paste,
        "ctrl+z": svgEditor.undo,
        "ctrl+y": svgEditor.redo,
        "ctrl+a": svgEditor.selectAll,
        del: svgEditor.remove,
        up: function (e) {
            e.preventDefault();
            svgEditor.dim("y", "-=1");
        },
        down: function (e) {
            e.preventDefault();
            svgEditor.dim("y", "+=1");
        },
        left: function (e) {
            e.preventDefault();
            svgEditor.dim("x", "-=1");
        },
        right: function (e) {
            e.preventDefault();
            svgEditor.dim("x", "+=1");
        },
    });

    svgEditor.newDocument(500, 500);

    svgEditor.enableDropFiles();

    svgEditor.enableMouseWheelZoom();
});
