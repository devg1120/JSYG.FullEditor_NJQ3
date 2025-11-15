import strUtils from "jsyg-strutils";
import Matrix from "jsyg-matrix";
import Vect from "jsyg-vect";
import Point from "jsyg-point";
import { push } from "../jquery/src/var/push.js";
import { access } from "../jquery/src/core/access.js";
import { dataUser } from "../jquery/src/data/var/dataUser.js";
import { nodeName } from "../jquery/src/core/nodeName.js";

("use strict");

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    rmultiDash = /[A-Z]/g;

function getData(data) {
    if (data === "true") {
        return true;
    }

    if (data === "false") {
        return false;
    }

    if (data === "null") {
        return null;
    }

    if (data === +data + "") {
        return +data;
    }

    if (rbrace.test(data)) {
        return JSON.parse(data);
    }

    return data;
}

function dataAttr(elem, key, data) {
    var name;

    if (data === undefined && elem.nodeType === 1) {
        name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
        data = elem.getAttribute(name);

        if (typeof data === "string") {
            try {
                data = getData(data);
            } catch (e) {}

            dataUser.set(elem, key, data);
        } else {
            data = undefined;
        }
    }
    return data;
}

function merge(first, second) {
    var len = +second.length,
        j = 0,
        i = first.length;

    for (; j < len; j++) {
        first[i++] = second[j];
    }

    first.length = i;

    return first;
}

function merge2(first, second) {
    var i = first.length;

    first[i++] = second;
    first.length = i;

    return first;
}

function find(selector, context) {
    try {
        return document.querySelectorAll(selector);
    } catch (e) {
        console.log("------");
        return [];
    }
}

var NS = {
        html: "http://www.w3.org/1999/xhtml",
        svg: "http://www.w3.org/2000/svg",
        xlink: "http://www.w3.org/1999/xlink",
    },
    rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    rsvgLink = /^<(svg:a)\s*\/?>(?:<\/\1>|)$/,
    svg =
        window.document &&
        window.document.createElementNS &&
        window.document.createElementNS(NS.svg, "svg");

export default function JSYG(arg, context) {
    if (typeof arg === "function") {
        console.log("function");
        console.trace();
        throw new Error("Error function");
        return;
    }
    var NS = {
        html: "http://www.w3.org/1999/xhtml",
        svg: "http://www.w3.org/2000/svg",
        xlink: "http://www.w3.org/1999/xlink",
    };

    var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    var rsvgLink = /^<(svg:a)\s*\/?>(?:<\/\1>|)$/;
    var svg =
        window.document &&
        window.document.createElementNS &&
        window.document.createElementNS(NS.svg, "svg");
    var svgTags = [
        "altGlyph",
        "altGlyphDef",
        "altGlyphItem",
        "animate",
        "animateColor",
        "animateMotion",
        "animateTransform",
        "circle",
        "clipPath",
        "color-profile",
        "cursor",
        "definition-src",
        "defs",
        "desc",
        "ellipse",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feDistantLight",
        "feFlood",
        "feFuncA",
        "feFuncB",
        "feFuncG",
        "feFuncR",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feOffset",
        "fePointLight",
        "feSpecularLighting",
        "feSpotLight",
"feDropShadow",
        "feTile",
        "feTurbulence",
        "filter",
        "font",
        "font-face",
        "font-face-format",
        "font-face-name",
        "font-face-src",
        "font-face-uri",
        "foreignObject",
        "g",
        "glyph",
        "glyphRef",
        "hkern",
        "image",
        "line",
        "linearGradient",
        "marker",
        "mask",
        "metadata",
        "missing-glyph",
        "mpath",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "radialGradient",
        "rect",
        "set",
        "stop",
        "style",
        "svg",
        "switch",
        "symbol",
        "text",
        "textPath",
        "title",
        "tref",
        "tspan",
        "use",
        "view",
        "vkern",
    ];

    if (!(this instanceof JSYG)) return new JSYG(arg, context);
    else {
        for (var n in this) {
            if (this.hasOwnProperty(n)) return new JSYG(arg, context);
        }
    }

    var array = null,
        ret;

    this.length = 0;

    if (arg instanceof JSYG) array = arg;

    if (typeof arg === "string") {
        arg = arg.trim();

        if (arg.charAt(0) === "<" && arg.charAt(arg.length - 1) === ">" && arg.length >= 3) {
            if (rsvgLink.test(arg)) array = [document.createElementNS(NS.svg, "a")];
            else {
                ret = rsingleTag.exec(arg);
                if (ret && svgTags.indexOf(ret[1]) !== -1)
                    array = [document.createElementNS(NS.svg, ret[1])];
            }
        }
    }

    if (array) {
        merge(this, array);
    } else {
        merge(this, $(arg, context)); //GUSA
    }

    return this;
}

//JSYG.fn = JSYG.prototype = new $();

JSYG.prototype.constructor = JSYG;
//JSYG.prototype.plugin_dic = {};

JSYG.svgCssProperties = [
    "font",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "direction",
    "letter-spacing",
    "text-decoration",
    "unicode-bidi",
    "word-spacing",
    "clip",
    "color",
    "cursor",
    "display",
    "overflow",
    "visibility",
    "clip-path",
    "clip-rule",
    "mask",
    "opacity",
    "enable-background",
    "filter",
    "flood-color",
    "flood-opacity",
    "lighting-color",
    "stop-color",
    "stop-opacity",
    "pointer-events",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "fill",
    "fill-opacity",
    "fill-rule",
    "image-rendering",
    "marker",
    "marker-end",
    "marker-mid",
    "marker-start",
    "shape-rendering",
    "stroke",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-width",
    "text-rendering",
    "alignment-baseline",
    "baseline-shift",
    "dominant-baseline",
    "glyph-orientation-horizontal",
    "glyph-orientation-vertical",
    "kerning",
    "text-anchor",
    "writing-mode",
];

JSYG.svgTags = [
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animate",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "color-profile",
    "cursor",
    "definition-src",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
	"feDropShadow",  //GUSA
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignObject",
    "g",
    "glyph",
    "glyphRef",
    "hkern",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "missing-glyph",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "stop",
    "style",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tref",
    "tspan",
    "use",
    "view",
    "vkern",
];

JSYG.svgViewBoxTags = ["svg", "symbol", "image", "marker", "pattern", "view"];

JSYG.svgShapes = ["circle", "ellipse", "line", "polygon", "polyline", "path", "rect"];

JSYG.svgContainers = [
    "a",
    "defs",
    "glyphs",
    "g",
    "marker",
    "mask",
    "missing-glyph",
    "pattern",
    "svg",
    "switch",
    "symbol",
];

JSYG.svgGraphics = [
    "circle",
    "ellipse",
    "line",
    "polygon",
    "polyline",
    "path",
    "rect",
    "use",
    "image",
    "text",
];

JSYG.svgTexts = ["altGlyph", "textPath", "text", "tref", "tspan"];

JSYG.ns = NS;

function isSVG(elmt) {
    return !!elmt && elmt.namespaceURI === NS.svg;
}

JSYG.prototype.appendTo_ = function (parent) {
    let parent_node = new JSYG(parent);
    parent_node[0].appendChild(this[0]);
    return this;
};
JSYG.prototype.appendTo__ = function (para) {
    throw new Error("error");
};

JSYG.prototype.append_ = function (elems) {
    for (let i = 0; i < elems.length; i++) {
        this[0].appendChild(elems[i]);
    }
    return this;
};

JSYG.prototype.prepend_ = function (elem) {
    this[0].insertBefore(elem, this[0].firstElementChild);
    return this;
};
JSYG.prototype.prepend___ = function (elems) {
    for (let i = 0; i < elems.length; i++) {
        this[0].parentNode.insertBefore(elems[i], this[0].parentNode.firstElementChild);
    }
    return this;
};

JSYG.prototype.isSVG = function () {
    return isSVG(this[0]);
};

JSYG.prototype.isSVGroot = function () {
    if (this[0].tagName != "svg") return false;
    var parent = JSYG(JSYG(this[0])[0].parentElement); //GUSA

    return !!parent.length && !parent.isSVG();
};

JSYG.prototype.getTag = function () {
    return this[0] && this[0].tagName && this[0].tagName.toLowerCase();
};

function xlinkHref(val) {
    if (val == null) {
        if (this.isSVG()) {
            return this[0].getAttribute("href") || this[0].getAttributeNS(NS.xlink, "href") || "";
        } else {
            return this[0].href || "";
        }
    }

    this.each(function () {
        if (isSVG(this)) {
            this.removeAttributeNS(NS.xlink, "href"); //sinon ajoute un nouvel attribut
            this.setAttribute("href", val);
        } else this.href = val;
    });

    return this;
}

function xlinkHrefRemove() {
    this.each(function () {
        if (isSVG(this)) this.removeAttributeNS(NS.xlink, "href");
        this.removeAttribute("href");
    });

    return this;
}

JSYG.prototype.data_ = function (key, value) {
    var i,
        name,
        data,
        elem = this[0],
        attrs = elem && elem.attributes;

    if (key === undefined) {
        if (this.length) {
            data = dataUser.get(elem);

            if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                i = attrs.length;
                while (i--) {
                    if (attrs[i]) {
                        name = attrs[i].name;
                        if (name.indexOf("data-") === 0) {
                            name = camelCase(name.slice(5));
                            dataAttr(elem, name, data[name]);
                        }
                    }
                }
                dataPriv.set(elem, "hasDataAttrs", true);
            }
        }

        return data;
    }

    if (typeof key === "object") {
        return this.each(function () {
            dataUser.set(this, key);
        });
    }

    return access(
        this,
        function (value) {
            var data;

            if (elem && value === undefined) {
                data = dataUser.get(elem, key);
                if (data !== undefined) {
                    return data;
                }

                data = dataAttr(elem, key);
                if (data !== undefined) {
                    return data;
                }

                return;
            }

            this.each(function () {
                dataUser.set(this, key, value);
            });
        },
        null,
        value,
        arguments.length > 1,
        null,
        true,
    );
};

JSYG.prototype.removeData_ = function (key) {
    return this.each(function () {
        dataUser.remove(this, key);
    });
};

JSYG.prototype.add = function (args) {
    push.apply(this, args);
    return this;
};

JSYG.prototype.attr = function (name, value) {
    if (!name) return this;

    if (typeof name == "object") {
        for (var n in name) this.attr(n, name[n]);
        return this;
    } else if (typeof value === "function") {
        return this.each(function (j) {
            var $this = new JSYG(this);
            $this.attr(name, value.call(this, j, $this.attr("href")));
        });
    } else if (name == "href") return xlinkHref.call(this, value);
    else {
        if (value === undefined) {
            if (isSVG(this[0])) return this[0].getAttribute(name);
            else return $.fn.attr.apply(this, arguments);
        }

        return this.each(function () {
            if (isSVG(this)) this.setAttribute(name, value);
            else this.setAttribute(name, value);
        });
    }
};

JSYG.prototype.removeAttr = function (name) {
    if (name == "href") return xlinkHrefRemove.call(this);
    else
        return this.each(function () {
            if (isSVG(this)) this.removeAttribute(name);
            else this.removeAttribute(name);
        });
};

JSYG.prototype.empty = function () {
    this[0].innerHTML = "";
    return this;
};

JSYG.prototype.remove = function () {
    if (this[0]) {
        let p = this[0].parentNode;
        if (p) {
            p.removeChild(this[0]);
        }
    }
    return this;
};

import { isArrayLike } from "../jquery/src/core/isArrayLike.js";

JSYG.prototype.each = function (callback) {
    let obj = this;
    var length,
        i = 0;

    if (isArrayLike(obj)) {
        length = obj.length;
        for (; i < length; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    } else {
        for (i in obj) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    }

    return obj;
};

JSYG.makeArray2 = function (arr, results) {
    var ret = results || [];

    if (arr != null) {
        if (isArrayLike(Object(arr))) {
            //jQuery.merge( ret,
            merge(ret, typeof arr === "string" ? [arr] : arr);
        } else {
            push.call(ret, arr);
        }
    }

    return ret;
};

JSYG.makeArray = function (list) {
    if (typeof list == "object" && typeof list.numberOfItems == "number") {
        //SVGList

        var tab = [];

        for (var i = 0, N = list.numberOfItems; i < N; i++) tab.push(list.getItem(i));

        return tab;
    } else return JSYG.makeArray2(list);
};

function getFarthestViewportElement(elmt) {
    var viewport = elmt.viewportElement;

    while (viewport && viewport.viewportElement) viewport = viewport.viewportElement;

    return viewport;
}

function getOffsetParent(element) {
    let offsetParent = element.offsetParent;
    while (offsetParent && offsetParent.offsetParent) {
        offsetParent = offsetParent.offsetParent;
    }
    return offsetParent;
}
JSYG.prototype.offsetParent = function (arg) {
    var tab = [];

    this.each(function () {
        var elmt,
            farthest = null,
            $this = new JSYG(this);

        if ($this.isSVG()) {
            if (!$this.isSVGroot()) {
                if (arg === "farthest") elmt = getFarthestViewportElement(this);
                else elmt = this.viewportElement;

                if (!elmt) {
                    elmt = this.parentNode;

                    while (
                        elmt &&
                        (arg == "farthest" || JSYG.svgViewBoxTags.indexOf(elmt.tagName) == -1)
                    ) {
                        elmt = elmt.parentNode;
                        if (elmt.tagName == "svg") farthest = elmt;
                    }

                    if (farthest) elmt = farthest;
                }
            } else {
                elmt = this.parentNode;
                if (elmt.nodeName != "html" && new JSYG(elmt).css("position") == "static") {
                    elmt = getOffsetParent($this[0]); //GUSA
                }
            }
        } else {
            if (arg === "farthest") elmt = document.body;
            else elmt = getOffsetParent($this[0]); //GUSA
        }

        if (elmt) tab.push(elmt);
    });

    return new JSYG(tab);
};

var rCamelCase = /[A-Z]/g,
    rDash = /-([a-z])/gi,
    rNumNunit = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))([a-z%]{0,8})$/i,
    rNumNonPx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i;

function dasherize(str) {
    return str.replace(rCamelCase, function (str) {
        return "-" + str.toLowerCase();
    });
}

function camelize(str) {
    return str.replace(rDash, function (p, p1) {
        return p1.toUpperCase();
    });
}

function testVal(val) {
    return val != null && val != "" && val != "auto" && !rNumNonPx.test(val);
}

JSYG.prototype.css = function (prop, val) {
    var n = null,
        obj,
        cssProp,
        jsProp,
        style;

    if ($.isPlainObject(prop)) {
        for (n in prop) this.css(n, prop[n]);
        return this;
    } else if (Array.isArray(prop)) {
        obj = {};
        for (n = 0; n < prop.length; n++) obj[prop[n]] = this.css(prop[n]);
        return obj;
    } else if ($.isFunction(val)) {
        return this.each(function (i) {
            var $this = new JSYG(this);
            $this.css(val.call(this, i, $this.css(prop)));
        });
    }

    cssProp = dasherize(prop);
    jsProp = camelize(prop);

    if (val == null) {
        if (this.isSVG()) {
            if (this[0].style) {
                style = this[0].style;

                val = style[jsProp];

                if (!testVal(val) && this[0].getAttribute) {
                    val = this[0].getAttribute(cssProp);

                    if (!testVal(val)) {
                        val = $.fn.css.call(this, prop);

                        if (
                            !testVal(val) &&
                            ["width", "height", "x", "y"].indexOf(cssProp) != -1 &&
                            this[0].getBBox
                        ) {
                            val = this[0].getBBox();
                            val = val[cssProp] + "px";
                        }
                    }
                }
            }
        } else val = $.fn.css.call(this, prop);

        return val;
    }

    return this.each(function () {
        var $this = new JSYG(this);

        if ($this.isSVG() && JSYG.svgCssProperties.indexOf(cssProp) != -1)
            this.setAttribute(cssProp, val);

        $.fn.css.call($this, prop, val);
    });
};

JSYG.support = {
    svg: svg,

    classList: {
        html: (function () {
            var el = document.createElement("div");
            return el.classList && typeof el.classList.add === "function";
        })(),

        svg: (function () {
            var el = new JSYG("<ellipse>")[0];
            if (!el || !el.classList || !el.classList.add) return false;
            el.classList.add("toto");
            return el.getAttribute("class") === "toto";
        })(),
    },
};

JSYG.prototype.position = function () {
    if (!this.isSVG() || this.isSVGroot()) return $.fn.position.call(this);

    var tag = this[0].tagName,
        box = this[0].getBBox(),
        dim = {
            //box est en lecture seule
            left: box.x,
            top: box.y,
        };

    if (tag === "use" && !JSYG.support.svgUseBBox) {
        dim.left += parseFloat(this.css("x")) || 0;
        dim.top += parseFloat(this.css("y")) || 0;
    }

    return dim;
};

JSYG.prototype.offset = function () {
    var x, y, box, mtx, point, offset;

    if (!this.isSVG()) return $.fn.offset.call(this);

    if (arguments[0]) throw new Error("Sorry, this is not implemented");

    if (this[0].tagName == "svg") {
        if (this.isSVGroot()) {
            x = 0;
            y = 0;
        } else {
            x = parseFloat(this.css("x")) || 0;
            y = parseFloat(this.css("y")) || 0;
        }

        box = this.attr("viewBox");
        if (box) this.removeAttr("viewBox");

        mtx = this[0].getScreenCTM();

        if (box) this.attr("viewBox", box);

        point = svg.createSVGPoint();
        point.x = x;
        point.y = y;
        point = point.matrixTransform(mtx);

        offset = {
            left: point.x,
            top: point.y,
        };
    } else offset = this[0].getBoundingClientRect();

    offset = {
        left: Math.round(offset.left + window.pageXOffset - document.documentElement.clientLeft),
        top: Math.round(offset.top + window.pageYOffset - document.documentElement.clientTop),
    };

    return offset;
};

JSYG.prototype.pushStack = function (elems) {
    var ret = $.merge(new JSYG(), elems);
    ret.prevObject = this;
    ret.context = this.context;
    return ret;
};

JSYG.prototype.end = function () {
    return this.prevObject || new JSYG(null);
};

JSYG.round = function (number, precision) {
    return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
};

var svg = JSYG.support.svg;

function isWindow(obj) {
    return obj != null && obj === obj.window;
}

JSYG.prototype.attrNS = function (ns, attr, val) {
    if (ns == null || attr == null) return this;

    if (typeof attr == "object") {
        for (var n in attr) this.attrNS(ns, n, attr[n]);
        return this;
    }

    if (val == null) return this[0].getAttributeNS(ns, attr);
    else {
        this.each(function () {
            this.setAttributeNS(ns, attr, val);
        });
    }
    return this;
};

JSYG.prototype.removeAttrNS = function (ns, attr) {
    var a = arguments,
        i,
        N = a.length;

    this.each(function () {
        for (i = 1; i < N; i++) this.removeAttributeNS(ns, a[i]);
    });

    return this;
};

JSYG.prototype.href = function (val) {
    var srcTags = ["img", "iframe", "video", "audio"],
        tag = this.getTag(),
        attr = !this.isSVG() && srcTags.indexOf(tag) != -1 ? "src" : "href";

    return arguments.length >= 1 ? this.attr(attr, val) : this.attr(attr);
};

JSYG.distance = function (pt1, pt2) {
    return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
};

JSYG.clip = function (nb, min, max) {
    return nb < min ? min : nb > max ? max : nb;
};

JSYG.walkTheDom = function (fct, node) {
    if (fct.call(node) === false) return false;

    node = node.firstChild;

    while (node) {
        if (node.nodeType == 1) {
            if (JSYG.walkTheDom(fct, node) === false) return false;
        }
        node = node.nextSibling;
    }
};

JSYG.prototype.walkTheDom = function (fct) {
    this.each(function () {
        return JSYG.walkTheDom(fct, this);
    });
    return this;
};

JSYG.prototype.isChildOf = function (arg) {
    var node = new JSYG(arg)[0],
        parent = this[0].parentNode;

    while (parent) {
        if (parent === node) return true;
        parent = parent.parentNode;
    }
    return false;
};

JSYG.prototype.getCenter = function (arg) {
    var rect = this.getDim(arg);
    return new Vect(rect.x + rect.width / 2, rect.y + rect.height / 2);
};

JSYG.prototype.setCenter = function (x, y) {
    if (x != null && typeof x === "object" && y == null) {
        y = x.y;
        x = x.x;
    }

    this.each(function () {
        var $this = new JSYG(this),
            rect = $this.getDim(),
            dim = {};

        if (x != null) dim.x = x - rect.width / 2;
        if (y != null) dim.y = y - rect.height / 2;

        $this.setDim(dim);
    });

    return this;
};

JSYG.prototype.viewBox = function (dim) {
    var viewBoxElmts = ["svg", "symbol", "image", "marker", "pattern", "view"],
        val;

    this.each(function () {
        if (viewBoxElmts.indexOf(this.tagName) == -1)
            throw new Error(this.tagName + " is not a valid element.");

        var viewBoxInit = this.viewBox.baseVal,
            viewBox = viewBoxInit || {},
            $this = new JSYG(this);

        if (dim == null) {
            val = {
                x: viewBox.x || 0,
                y: viewBox.y || 0,
                width: viewBox.width || parseFloat($this.css("width")),
                height: viewBox.height || parseFloat($this.css("height")),
            };

            return false;
        } else {
            for (var n in dim) {
                if (["x", "y", "width", "height"].indexOf(n) != -1) viewBox[n] = dim[n];
            }
        }

        if (!viewBoxInit)
            this.setAttribute(
                "viewBox",
                viewBox.x + " " + viewBox.y + " " + viewBox.width + " " + viewBox.height,
            );
    });

    return val ? val : this;
};

var defaultStyles = {};

JSYG.prototype.getDefaultStyle = function () {
    var tag = this.getTag(),
        elmt,
        style,
        i,
        N,
        prop;

    if (tag == "a" && this.isSVG()) tag = "svg:a";

    if (!defaultStyles[tag]) {
        defaultStyles[tag] = {};

        elmt = new JSYG("<" + tag + ">");
        style = getComputedStyle(elmt[0]);

        for (i = 0, N = style.length; i < N; i++) {
            prop = style.item(i);
            defaultStyles[tag][prop] = style.getPropertyValue(prop);
        }
    }

    return defaultStyles[tag];
};

JSYG.prototype.style2attr = function (recursive) {
    var href = window.location.href.replace("#" + window.location.hash, "");

    function fct() {
        var jThis = new JSYG(this),
            isSVG = jThis.isSVG();

        if (isSVG && JSYG.svgGraphics.indexOf(this.tagName) == -1) return;

        var style = getComputedStyle(this),
            defaultStyle = jThis.getDefaultStyle(),
            styleAttr = "",
            name,
            value,
            i = 0,
            N = style.length;

        for (; i < N; i++) {
            name = style.item(i);

            if (isSVG && JSYG.svgCssProperties.indexOf(name) === -1) continue;

            value = style.getPropertyValue(name);

            if (defaultStyle[name] != value) {
                //la fonction getPropertyValue renvoie url("http://monsite.fr/toto/#anchor") au lieu de url(#anchor)
                if (value.indexOf(href) != -1) value = value.replace(href, "").replace(/"|'/g, "");

                if (isSVG) this.setAttribute(name, value);
                else styleAttr += name + ":" + value + ";";
            }
        }

        if (!isSVG) this.setAttribute("style", styleAttr);
        else if (style.length) this.removeAttribute("style");
    }

    if (recursive) this.walkTheDom(fct);
    else fct.call(this[0]);

    return this;
};

JSYG.addStyle = function (str) {
    var head = document.getElementsByTagName("head").item(0),
        style = document.createElement("style"),
        rules = document.createTextNode(str);

    style.type = "text/css";

    if (style.styleSheet) style.styleSheet.cssText = rules.nodeValue;
    else style.appendChild(rules);

    head.appendChild(style);
};

JSYG.getStyleRules = function () {
    var css = "";

    function addStyle(rule) {
        css += rule.cssText;
    }

    JSYG.makeArray(document.styleSheets).forEach(function (styleSheet) {
        JSYG.makeArray(styleSheet.cssRules || styleSheet.rules).forEach(addStyle);
    });

    return css;
};

function getComputedStyle(node) {
    return (window.getComputedStyle && window.getComputedStyle(node)) || node.currentStyle;
}

JSYG.prototype.styleRemove = function () {
    this.each(function () {
        var $this = new JSYG(this);

        $this.removeAttr("style");

        if ($this.isSVG())
            JSYG.svgCssProperties.forEach(function (attr) {
                $this.removeAttr(attr);
            });
    });

    return this;
};

JSYG.prototype.styleSave = function (id) {
    var prop = "styleSaved";

    if (id) prop += id;

    this.each(function () {
        var $this = new JSYG(this),
            attrs = {},
            style;

        if ($this.isSVG()) {
            JSYG.svgCssProperties.forEach(function (attr) {
                var val = $this.attr(attr);
                if (val != null) attrs[attr] = val;
            });
        }

        style = $this.attr("style");

        if (typeof style == "object") style = JSON.stringify(style); //IE

        attrs.style = style;

        $this.data(prop, attrs);
    });

    return this;
};

JSYG.prototype.styleRestore = function (id) {
    var prop = "styleSaved";

    if (id) prop += id;

    this.each(function () {
        var $this = new JSYG(this),
            attrs = $this.data(prop),
            style;

        if (!attrs) return;

        $this.styleRemove();

        if ($this.isSVG()) $this.attr(attrs);
        else {
            try {
                style = JSON.parse(attrs.style);
                for (var n in style) {
                    if (style[n]) this.style[n] = style[n];
                }
            } catch (e) {
                $this.attr("style", attrs.style);
            }
        }

        $this.removeData(prop);
    });

    return this;
};

JSYG.prototype.styleClone = function (elmt) {
    elmt = new JSYG(elmt);

    var foreignStyle = getComputedStyle(elmt[0]),
        name,
        value,
        i = 0,
        N = foreignStyle.length;

    this.styleRemove();

    this.each(function () {
        var $this = new JSYG(this),
            ownStyle = getComputedStyle(this),
            isSVG = $this.isSVG();

        for (i = 0; i < N; i++) {
            name = foreignStyle.item(i);

            if (isSVG && JSYG.svgCssProperties.indexOf(name) === -1) continue;

            value = foreignStyle.getPropertyValue(name);
            //priority = foreignStyle.getPropertyPriority(name);

            if (ownStyle.getPropertyValue(name) !== value) {
                //ownStyle.setProperty(name,value,priority); //-> Modifications are not allowed for this document (?)
                $this.css(name, value);
            }
        }
    });

    return this;
};

function addTransform(rect, mtx) {
    if (!mtx.isIdentity()) {
        var hg = new Vect(0, 0).mtx(mtx),
            hd = new Vect(rect.width, 0).mtx(mtx),
            bg = new Vect(0, rect.height).mtx(mtx),
            bd = new Vect(rect.width, rect.height).mtx(mtx),
            xmin = Math.min(hg.x, hd.x, bg.x, bd.x),
            ymin = Math.min(hg.y, hd.y, bg.y, bd.y),
            xmax = Math.max(hg.x, hd.x, bg.x, bd.x),
            ymax = Math.max(hg.y, hd.y, bg.y, bd.y);

        return {
            x: Math.round(xmin + rect.x),
            y: Math.round(ymin + rect.y),
            width: Math.round(xmax - xmin),
            height: Math.round(ymax - ymin),
        };
    } else return rect;
}

function getPos(type, node, ref) {
    var cpt = 0,
        obj = node;
    do {
        cpt += obj["offset" + type];
    } while ((obj = obj.offsetParent) && obj !== ref);
    return cpt;
}

function swapDisplay(jNode, callback) {
    var returnValue;

    jNode.styleSave("swapDisplay");

    jNode.css({
        visibility: "hidden",
        position: "absolute",
        display: jNode.originalDisplay(),
    });

    try {
        returnValue = callback.call(jNode);
    } catch (e) {
        jNode.styleRestore("swapDisplay");
        throw new Error(e);
    }

    jNode.styleRestore("swapDisplay");

    return returnValue;
}

var elementDisplay = {};

function defaultDisplay(obj) {
    var element,
        display,
        nodeName = obj.getTag(),
        isSVG = obj.isSVG(),
        parent;

    if (!elementDisplay[nodeName]) {
        parent = isSVG ? new JSYG("<svg>").appendTo("body") : "body";

        element = new JSYG("<" + nodeName + ">").appendTo(parent);
        display = element.css("display");

        if (isSVG) parent.remove();
        else element.remove();

        if (display == "none") display = "block";

        elementDisplay[nodeName] = display;
    }

    return elementDisplay[nodeName];
}

JSYG.prototype.originalDisplay = function (_value) {
    var prop = "originalDisplay";

    if (_value == null) return this.data(prop) || defaultDisplay(this);
    else {
        this.data(prop, _value);
        return this;
    }
};

JSYG.prototype.getDim = function (type) {
    var node = this[0],
        dim = null,
        parent,
        box,
        boundingRect,
        hg,
        hd,
        bg,
        bd,
        x,
        y,
        width,
        height,
        viewBox,
        jWin,
        ref,
        dimRef,
        mtx,
        tag = this[0].tagName;

    if (node.nodeType == 1 && this.css("display") == "none") {
        return swapDisplay(this, function () {
            return this.getDim();
        });
    }

    if (isWindow(node)) {
        dim = {
            x: node.pageXOffset || document.documentElement.scrollLeft,
            y: node.pageYOffset || document.documentElement.scrollTop,
            width: node.document.documentElement.clientWidth,
            height: node.document.documentElement.clientHeight,
        };
    } else if (node.nodeType === 9) {
        dim = {
            x: 0,
            y: 0,
            width: Math.max(
                node.documentElement.scrollWidth,
                node.documentElement.clientWidth,
                (node.body && node.body.scrollWidth) || 0,
            ),
            height: Math.max(
                node.documentElement.scrollHeight,
                node.documentElement.clientHeight,
                (node.body && node.body.scrollHeight) || 0,
            ),
        };
    } else if (!node.parentNode)
        throw new Error(node + " : Il faut d'abord attacher l'élément au DOM.");
    else if (!type) {
        if (this.isSVG()) {
            if (tag == "svg") {
                parent = JSYG(this[0].parentElement);

                if (parent.isSVG()) {
                    dim = {
                        x: parseFloat(this.attr("x")) || 0,
                        y: parseFloat(this.attr("y")) || 0,
                        width: parseFloat(this.attr("width")),
                        height: parseFloat(this.attr("height")),
                    };
                } else {
                    if (parent.css("position") == "static") parent = parent.offsetParent();
                    dim = this.getDim(parent[0]);
                }
            } else {
                try {
                    box = this[0].getBBox();
                } catch (e) {
                    return null;
                }

                dim = {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                };

                if (tag === "use" && !JSYG.support.svgUseBBox) {
                    dim.x += parseFloat(this.attr("x")) || 0;
                    dim.y += parseFloat(this.attr("y")) || 0;
                }
            }
        } else {
            dim = this.getDim(this.offsetParent()); //GUSA
        }
    } else if (type === "page") {
        if (tag === "svg") {
            x = parseFloat(this.css("left") || this.attr("x")) || 0;
            y = parseFloat(this.css("top") || this.attr("y")) || 0;
            width = parseFloat(this.css("width"));
            height = parseFloat(this.css("height"));

            viewBox = this.attr("viewBox");
            if (viewBox) this.removeAttr("viewBox");

            mtx = this.getMtx("screen");

            if (viewBox) this.attr("viewBox", viewBox);

            hg = new Vect(x, y).mtx(mtx);
            bd = new Vect(x + width, y + height).mtx(mtx);

            boundingRect = {
                left: hg.x,
                top: hg.y,
                width: bd.x - hg.x,
                height: bd.y - hg.y,
            };
        } else {
            if (this.isSVG() && this.rotate() === 0) {
                mtx = this[0].getScreenCTM();

                box = this.getDim();

                hg = new Vect(box.x, box.y).mtx(mtx);
                bd = new Vect(box.x + box.width, box.y + box.height).mtx(mtx);

                boundingRect = { left: hg.x, right: bd.x, top: hg.y, bottom: bd.y };
            } else boundingRect = node.getBoundingClientRect();
        }

        jWin = new JSYG(window);

        x = boundingRect.left + jWin[0].scrollX - document.documentElement.clientLeft; //GUSA
        y = boundingRect.top + jWin[0].scrollY - document.documentElement.clientTop; //GUSA

        width =
            boundingRect.width != null
                ? boundingRect.width
                : boundingRect.right - boundingRect.left;
        height =
            boundingRect.height != null
                ? boundingRect.height
                : boundingRect.bottom - boundingRect.top;

        dim = {
            x: x,
            y: y,
            width: width,
            height: height,
        };

        if (!this.isSVG() && JSYG.support.addTransfForBoundingRect) {
            dim = addTransform(dim, this.getMtx());
        }
    } else if (type === "screen" || isWindow(type) || (type instanceof $ && isWindow(type[0]))) {
        jWin = new JSYG(window);
        dim = this.getDim("page");
        dim.x -= jWin[0].scrollX;
        dim.y -= jWin[0].scrollY;
    } else if (type.nodeType != null || typeof type == "object") {
        ref = type.nodeType != null ? type : type[0];

        if (this.isSVG()) {
            if (this.isSVGroot()) {
                dimRef = new JSYG(ref).getDim("page");
                dim = this.getDim("page");

                dim.x -= dimRef.x;
                dim.y -= dimRef.y;
            } else {
                box = this.getDim();
                mtx = this.getMtx(ref);

                if (!mtx.isIdentity()) {
                    hg = new Vect(box.x, box.y).mtx(mtx);
                    hd = new Vect(box.x + box.width, box.y).mtx(mtx);
                    bg = new Vect(box.x, box.y + box.height).mtx(mtx);
                    bd = new Vect(box.x + box.width, box.y + box.height).mtx(mtx);

                    x = Math.min(hg.x, hd.x, bg.x, bd.x);
                    y = Math.min(hg.y, hd.y, bg.y, bd.y);
                    width = Math.max(hg.x, hd.x, bg.x, bd.x) - x;
                    height = Math.max(hg.y, hd.y, bg.y, bd.y) - y;

                    dim = { x: x, y: y, width: width, height: height };
                } else {
                    dim = box;
                }
            }
        } else {
            width = node.offsetWidth;
            height = node.offsetHeight;

            if (!width && !height) {
                width =
                    parseFloat(this.css("border-left-width") || 0) +
                    parseFloat(this.css("border-right-width") || 0);
                height =
                    parseFloat(this.css("border-top-width") || 0) +
                    parseFloat(this.css("border-top-width") || 0);

                if (node.clientWidth || node.clientHeight) {
                    width += node.clientWidth;
                    height += node.clientHeight;
                } else if (node.width || node.height) {
                    width +=
                        parseFloat(this.css("padding-left") || 0) +
                        parseFloat(this.css("padding-right") || 0) +
                        node.width;
                    height +=
                        parseFloat(this.css("padding-top") || 0) +
                        parseFloat(this.css("padding-bottom") || 0) +
                        node.height;
                    height += node.clientHeight;
                }
            }

            dim = {
                x: getPos("Left", node, ref),
                y: getPos("Top", node, ref),
                width: width,
                height: height,
            };
        }
    } else {
        throw new Error(type + " : argument incorrect");
    }

    return dim;
};

function isSVGImage(elmt) {
    return elmt[0].tagName == "image" && /(image\/svg\+xml|\.svg$)/.test(elmt.href());
}

function parseDimArgs(args, opt) {
    ["x", "y", "width", "height"].forEach(function (prop, i) {
        if (args[i] != null) {
            opt[prop] = args[i];
        }
    });
}

function getPropNum(elmt, prop) {
    var val = elmt.css(prop);

    if (!val) return 0;
    else if (val != "auto") return parseFloat(val);
    else if (prop == "left" || prop == "top") return elmt.position()[prop];
    else return 0;
}

JSYG.prototype.setDim = function () {
    var opt = {},
        n = null,
        a = arguments,
        ref;

    switch (typeof a[0]) {
        case "string":
            opt[a[0]] = a[1];
            break;

        case "number":
            parseDimArgs(a, opt);
            break;

        case "object":
            if (a[0] == null) parseDimArgs(a, opt);
            else {
                for (n in a[0]) opt[n] = a[0][n];
            }

            break;

        default:
            throw new Error("argument(s) incorrect(s) pour la méthode setDim");
    }

    ref = opt.from && new JSYG(opt.from);

    this.each(function () {
        var tag,
            dim,
            mtx,
            box,
            dec,
            decx,
            decy,
            position,
            $this = new JSYG(this),
            node = this;

        if (opt.keepRatio && ("width" in opt || "height" in opt)) {
            dim = $this.getDim();
            if (!("width" in opt)) opt.width = (dim.width * opt.height) / dim.height;
            else if (!("height" in opt)) opt.height = (dim.height * opt.width) / dim.width;
        }

        if (isWindow(node) || node.nodeType === 9) {
            $this.getWindow().resizeTo(parseFloat(opt.width) || 0, parseFloat(opt.height) || 0);
            return;
        }

        tag = this.tagName;

        if ("from" in opt) {
            mtx = $this.getMtx(ref).inverse();
            dim = $this.getDim();

            var dimRef = $this.getDim(ref),
                x = opt.x == null ? 0 : opt.x,
                y = opt.y == null ? 0 : opt.y,
                xRef = opt.x == null ? 0 : dimRef.x,
                yRef = opt.y == null ? 0 : dimRef.y,
                width = opt.width == null ? 0 : opt.width,
                height = opt.height == null ? 0 : opt.height,
                widthRef = opt.width == null ? 0 : dimRef.width,
                heightRef = opt.height == null ? 0 : dimRef.height,
                pt1 = new Vect(xRef, yRef).mtx(mtx),
                pt2 = new Vect(x, y).mtx(mtx),
                pt3 = new Vect(widthRef, heightRef).mtx(mtx),
                pt4 = new Vect(width, height).mtx(mtx),
                newDim = {};

            if (tag == "g") mtx = $this.getMtx();

            if (opt.x != null || opt.y != null) {
                newDim.x = dim.x + pt2.x - pt1.x;
                newDim.y = dim.y + pt2.y - pt1.y;
            }

            if (opt.width != null || opt.height != null) {
                newDim.width = dim.width + pt4.x - pt3.x;
                newDim.height = dim.height + pt4.y - pt3.y;
            }

            $this.setDim(newDim);

            if (tag == "g") $this.setMtx(mtx.multiply($this.getMtx()));

            return;
        }

        switch (tag) {
            case "circle":
                if ("width" in opt) {
                    node.setAttribute(
                        "cx",
                        (node.getAttribute("cx") || 0) -
                            (node.getAttribute("r") || 0) +
                            opt.width / 2,
                    );
                    node.setAttribute("r", opt.width / 2);
                }
                if ("height" in opt) {
                    node.setAttribute(
                        "cy",
                        (node.getAttribute("cy") || 0) -
                            (node.getAttribute("r") || 0) +
                            opt.height / 2,
                    );
                    node.setAttribute("r", opt.height / 2);
                }
                if ("x" in opt)
                    node.setAttribute("cx", opt.x + parseFloat(node.getAttribute("r") || 0));
                if ("y" in opt)
                    node.setAttribute("cy", opt.y + parseFloat(node.getAttribute("r") || 0));

                break;

            case "ellipse":
                if ("width" in opt) {
                    node.setAttribute(
                        "cx",
                        (node.getAttribute("cx") || 0) -
                            (node.getAttribute("rx") || 0) +
                            opt.width / 2,
                    );
                    node.setAttribute("rx", opt.width / 2);
                }
                if ("height" in opt) {
                    node.setAttribute(
                        "cy",
                        (node.getAttribute("cy") || 0) -
                            (node.getAttribute("ry") || 0) +
                            opt.height / 2,
                    );
                    node.setAttribute("ry", opt.height / 2);
                }
                if ("x" in opt)
                    node.setAttribute("cx", opt.x + parseFloat(node.getAttribute("rx") || 0));
                if ("y" in opt)
                    node.setAttribute("cy", opt.y + parseFloat(node.getAttribute("ry") || 0));

                break;

            case "line":
            case "polyline":
            case "polygon":
            case "path":
                if (!node.parentNode)
                    throw new Error(
                        "Pour fixer les dimensions d'un élément \"" +
                            tag +
                            "\", il faut d'abord l'attacher à l'arbre DOM",
                    );

                mtx = new Matrix();
                box = node.getBBox();

                if ("x" in opt) mtx = mtx.translate(opt.x - box.x, 0);
                if ("y" in opt) mtx = mtx.translate(0, opt.y - box.y);
                if ("width" in opt && box.width != 0)
                    mtx = mtx.scaleX(opt.width / box.width, box.x, box.y);
                if ("height" in opt && box.height != 0)
                    mtx = mtx.scaleY(opt.height / box.height, box.x, box.y);

                $this.mtx2attrs({ mtx: mtx });

                break;

            case "text":
            case "use": //on peut répercuter x et y mais pas width ni height
                if (("x" in opt || "y" in opt) && !this.parentNode)
                    throw new Error(
                        "Pour fixer la position d'un élément \"" +
                            tag +
                            "\", il faut d'abord l'attacher à l'arbre DOM",
                    );

                dim = node.getBBox();
                mtx = $this.getMtx();

                if ("x" in opt) {
                    if (tag == "text") dec = (parseFloat($this.attr("x")) || 0) - dim.x;
                    else {
                        dec = -dim.x;
                        if (JSYG.support.svgUseBBox) dec += parseFloat($this.attr("x")) || 0;
                    }

                    $this.attr("x", opt.x + dec);
                }

                if ("y" in opt) {
                    if (tag == "text") dec = (parseFloat($this.attr("y")) || 0) - dim.y;
                    else {
                        dec = -dim.y;
                        if (JSYG.support.svgUseBBox) dec += parseFloat($this.attr("y")) || 0;
                    }

                    $this.attr("y", opt.y + dec);
                }

                if (("width" in opt && dim.width != 0) || ("height" in opt && dim.height != 0)) {
                    mtx = new Matrix();

                    if ("width" in opt && dim.width != 0) {
                        mtx = mtx.scaleNonUniform(opt.width / dim.width, 1, dim.x, dim.y);
                    }

                    if ("height" in opt && dim.height != 0) {
                        mtx = mtx.scaleNonUniform(1, opt.height / dim.height, dim.x, dim.y);
                    }

                    $this.mtx2attrs({ mtx: mtx });
                }

                break;

            case "g": //on ne peut rien répercuter
                if (!node.parentNode)
                    throw new Error(
                        "Pour fixer les dimensions d'un élément \"" +
                            tag +
                            "\", il faut d'abord l'attacher à l'arbre DOM",
                    );

                dim = $this.getDim();
                mtx = $this.getMtx();

                var dimP = $this.getDim(node.parentNode);

                if ("x" in opt) mtx = new Matrix().translateX(opt.x - dimP.x).multiply(mtx);
                if ("y" in opt) mtx = new Matrix().translateY(opt.y - dimP.y).multiply(mtx);
                if ("width" in opt) mtx = mtx.scaleX(opt.width / dimP.width, dim.x, dim.y);
                if ("height" in opt) mtx = mtx.scaleY(opt.height / dimP.height, dim.x, dim.y);

                $this.setMtx(mtx);

                break;

            case "iframe":
            case "canvas":
                if ("x" in opt) $this.css("left", opt.x + "px");
                if ("y" in opt) $this.css("top", opt.y + "px");
                if ("width" in opt) $this.attr("width", opt.width);
                if ("height" in opt) $this.attr("height", opt.height);

                break;

            default:
                if ($this.isSVG() && !$this.isSVGroot()) {
                    if (isSVGImage($this)) {
                        if ("x" in opt) $this.attr("x", opt.x);
                        if ("y" in opt) $this.attr("y", opt.y);

                        if ("width" in opt || "height" in opt) {
                            if (!node.parentNode)
                                throw new Error(
                                    "Pour fixer la position d'une image svg, il faut d'abord l'attacher à l'arbre DOM",
                                );

                            dim = node.getBBox();

                            mtx = new Matrix();

                            if ("width" in opt && dim.width != 0)
                                mtx = mtx.scaleNonUniform(opt.width / dim.width, 1, dim.x, dim.y);

                            if ("height" in opt && dim.height != 0)
                                mtx = mtx.scaleNonUniform(1, opt.height / dim.height, dim.x, dim.y);

                            $this.mtx2attrs({ mtx: mtx });
                        }
                    } else $this.attr(opt);
                } else {
                    position = $this.css("position");

                    decx = getPropNum($this, "marginLeft");
                    decy = getPropNum($this, "marginTop");

                    if ("x" in opt || "y" in opt) {
                        if (!position || position === "static") {
                            if (node.parentNode) {
                                $this.css("position", "relative");
                                position = "relative";
                            } else $this.css("position", "absolute");
                        }

                        if (position == "relative") {
                            dim = $this.getDim();

                            if ("x" in opt) decx = dim.x - getPropNum($this, "left");
                            if ("y" in opt) decy = dim.y - getPropNum($this, "top");
                        }
                    }

                    if ("x" in opt) node.style.left = opt.x - decx + "px";
                    if ("y" in opt) node.style.top = opt.y - decy + "px";

                    if ("width" in opt) {
                        if (tag == "svg") $this.css("width", opt.width);
                        else {
                            node.style.width =
                                Math.max(
                                    0,
                                    opt.width -
                                        getPropNum($this, "border-left-width") -
                                        getPropNum($this, "padding-left") -
                                        getPropNum($this, "border-right-width") -
                                        getPropNum($this, "padding-right"),
                                ) + "px";
                        }
                    }

                    if ("height" in opt) {
                        if (tag == "svg") $this.css("height", opt.height);
                        else {
                            node.style.height =
                                Math.max(
                                    0,
                                    opt.height -
                                        getPropNum($this, "border-top-width") -
                                        getPropNum($this, "padding-top") -
                                        getPropNum($this, "border-bottom-width") -
                                        getPropNum($this, "padding-bottom"),
                                ) + "px";
                        }
                    }
                }

                break;
        }
    });

    return this;
};

JSYG.fit = function (dim, dimContainer) {
    var ratio = {
            x: dim.width / dimContainer.width,
            y: dim.height / dimContainer.height,
        },
        width,
        height;

    if (ratio.x > ratio.y) {
        height = (dim.height * dimContainer.width) / dim.width;
        width = dimContainer.width;
    } else {
        width = (dim.width * dimContainer.height) / dim.height;
        height = dimContainer.height;
    }

    return {
        width: width,
        height: height,
    };
};

JSYG.prototype.fit = function (dimContainer) {
    return this.each(function () {
        var $this = JSYG(this),
            dim;

        if (!dimContainer) dimContainer = $this.offsetParent().getDim();

        if (dimContainer.keepRatio === false) dim = dimContainer;
        else dim = JSYG.fit($this.getDim(), dimContainer);

        dim.x = 0;
        dim.y = 0;

        $this.setDim(dim);
    });
};

JSYG.prototype.getShift = function (pivotX, pivotY) {
    var transfOrigin = null;

    if (pivotX == null || pivotY == null) transfOrigin = this.transfOrigin().split(/ +/);

    pivotX = pivotX != null ? pivotX : transfOrigin[0];
    pivotY = pivotY != null ? pivotY : transfOrigin[1];

    if ($.isNumeric(pivotX) && $.isNumeric(pivotY))
        return new Vect(parseFloat(pivotX), parseFloat(pivotY));

    var box = this.getDim(), // dimensions réelles de l'élément (avant transformation(s))
        translX,
        translY,
        pourcent = /^([0-9]+)%$/,
        execX = pourcent.exec(pivotX),
        execY = pourcent.exec(pivotY);

    if (execX) translX = (box.width * execX[1]) / 100;
    else {
        switch (pivotX) {
            case "left":
                translX = 0;
                break;
            case "right":
                translX = box.width;
                break;
            default:
                translX = box.width / 2;
                break;
        }
    }

    if (execY) translY = (box.height * execY[1]) / 100;
    else {
        switch (pivotY) {
            case "top":
                translY = 0;
                break;
            case "bottom":
                translY = box.height;
                break;
            default:
                translY = box.height / 2;
                break;
        }
    }

    if (!this.isSVG()) return new Vect(translX, translY);
    else return new Vect(box.x + translX, box.y + translY);
};

JSYG.prototype.transfOrigin = function (x, y) {
    var value = null,
        a = arguments;

    this.each(function () {
        var $this = new JSYG(this),
            val,
            originX = "50%",
            originY = "50%";

        if (a[0] == null) {
            value = $this.data_("transfOrigin") || originX + " " + originY;
            return false;
        }

        if (a.length === 1) {
            val = a[0].split(/ +/);
        } else if (a.length === 2) {
            val = [a[0], a[1]];
        } else throw new Error("nombre d'arguments incorrect");

        if (
            ["top", "bottom"].indexOf(val[0]) !== -1 ||
            (val[1] != null && ["left", "right"].indexOf(val[1]) !== -1)
        ) {
            if (val[1] != null) {
                originX = val[1];
            }
            if (val[0] != null) {
                originY = val[0];
            }
        } else {
            if (val[1] != null) {
                originY = val[1];
            }
            if (val[0] != null) {
                originX = val[0];
            }
        }

        $this[0].dataset.transfOrigin = originX + " " + originY; //GUSA

        return null;
    });

    return a[0] == null ? value : this;
};

JSYG.prototype.resetTransf = function () {
    if (!svg) return this;

    this.each(function () {
        if (new JSYG(this).isSVG()) this.transform.baseVal.clear();
        else if (JSYG.support.twoDimTransf) this.style[JSYG.support.twoDimTransf] = "";
    });

    return this;
};

JSYG.prototype.scale = function (scale) {
    if (!svg) return scale == null ? null : this;

    if (scale == null) return this[0] && this.getMtx().scaleX();

    this.each(function () {
        var $this = new JSYG(this),
            dec = $this.getShift();

        $this.addMtx(new Matrix().scale(scale, dec.x, dec.y));
    });

    return this;
};

JSYG.prototype.scaleX = function (scale) {
    if (!svg) return scale == null ? null : this;
    if (scale == null) return this[0] && this.getMtx().scaleX();
    this.scaleNonUniform(scale, 1);
    return this;
};

JSYG.prototype.scaleY = function (scale) {
    if (!svg) return scale == null ? null : this;
    if (scale == null) return this[0] && this.getMtx().scaleY();
    this.scaleNonUniform(1, scale);
    return this;
};

JSYG.prototype.scaleNonUniform = function (scaleX, scaleY) {
    if (!svg) return scaleX == null && scaleY == null ? null : this;

    var mtx;

    if (scaleX == null && scaleY == null) {
        mtx = this.getMtx();
        return { scaleX: mtx.scaleX(), scaleY: mtx.scaleY() };
    }

    this.each(function () {
        var $this = new JSYG(this),
            dec = $this.getShift();

        $this.addMtx(new Matrix().scaleNonUniform(scaleX, scaleY, dec.x, dec.y));
    });

    return this;
};

JSYG.prototype.translate = function (x, y) {
    if (!svg) return x == null && y == null ? null : this;

    var mtx;

    if (x == null && y == null) {
        mtx = this.getMtx();
        return new Vect(mtx.translateX(), mtx.translateY());
    }

    this.addMtx(new Matrix().translate(x, y));

    return this;
};

JSYG.prototype.translateX = function (x) {
    if (!svg) return x == null ? null : this;

    if (x == null) return this.getMtx().translateX();

    this.translate(x, 0);

    return this;
};

JSYG.prototype.translateY = function (y) {
    if (!svg) return y == null ? null : this;

    if (y == null) return this.getMtx().translateY();

    this.translate(0, y);

    return this;
};

JSYG.prototype.rotate = function (angle) {
    if (!svg) return angle == null ? null : this;

    if (angle == null) return this.getMtx().rotate();

    this.each(function () {
        var $this = new JSYG(this),
            dec = $this.getShift(),
            mtx = $this.getMtx().decompose();

        $this.addMtx(
            new Matrix()
                .translate(dec.x, dec.y)
                .scaleNonUniform(1 / mtx.scaleX, 1 / mtx.scaleY)
                .rotate(angle)
                .scaleNonUniform(mtx.scaleX, mtx.scaleY)
                .translate(-dec.x, -dec.y),
        );
    });

    return this;
};

JSYG.prototype.getMtx = function (arg) {
    var mtx = null,
        transf,
        regexp,
        coefs;

    if (!this[0]) return null;

    if ($.isWindow(this[0]) || this[0].nodeType === 9) return new Matrix();

    if (this.isSVG()) {
        if (arg == null) {
            transf = this[0].transform && this[0].transform.baseVal.consolidate();
            mtx = (transf && transf.matrix) || svg.createSVGMatrix();
        } else if (JSYG.support.svgUseTransform && this.getTag() == "use") {
            return this.parent().getMtx(arg).multiply(this.getMtx());
        } else if (typeof arg === "string") {
            arg = arg.toLowerCase();

            if (arg === "ctm") mtx = this[0].getCTM();
            else if (arg === "screen") mtx = this[0].getScreenCTM();
            else if (arg === "page") {
                mtx = this[0].getScreenCTM();
                mtx = svg
                    .createSVGMatrix()
                    .translate(window.pageXOffset, window.pageYOffset)
                    .multiply(mtx);
            }
        } else if (arg.nodeType != null || arg instanceof JSYG) {
            if (arg instanceof JSYG) arg = arg[0];

            mtx = arg.getScreenCTM() || svg.createSVGMatrix();
            mtx = mtx.inverse().multiply(this[0].getScreenCTM());

            if (this.getTag() == "svg" && JSYG.support.transformToElementAddXY) {
                mtx = mtx.translate(-this.attr("x") || 0, -this.attr("y") || 0);
            }
        }
    } else {
        if (JSYG.support.twoDimTransf) {
            transf = this[0].style[JSYG.support.twoDimTransf];
            regexp =
                /matrix\((-?\d*\.?\d+) *, *(-?\d*\.?\d+) *, *(-?\d*\.?\d+) *, *(-?\d*\.?\d+) *, *(-?\d*\.?\d+) *, *(-?\d*\.?\d+) *\)/;
            coefs = regexp.exec(transf);
            mtx = svg.createSVGMatrix();

            if (coefs) {
                mtx.a = coefs[1];
                mtx.b = coefs[2];
                mtx.c = coefs[3];
                mtx.d = coefs[4];
                mtx.e = coefs[5];
                mtx.f = coefs[6];
            }
        }
    }

    return new Matrix(mtx);
};

JSYG.prototype.setMtx = function (mtx) {
    var attr = JSYG.support.twoDimTransf;

    if (mtx instanceof Matrix) mtx = mtx.mtx;

    this.each(function () {
        var $this = new JSYG(this),
            list;

        if ($this.isSVG()) {
            list = this.transform.baseVal;
            list.initialize(list.createSVGTransformFromMatrix(mtx));
        } else if (attr) {
            this.style[attr + "Origin"] = "0 0";
            this.style[attr] = new Matrix(mtx).toString();
        }
    });

    return this;
};

JSYG.prototype.addMtx = function (mtx) {
    if (mtx instanceof Matrix) mtx = mtx.mtx;

    var attr = JSYG.support.twoDimTransf;

    this.each(function () {
        var $this = new JSYG(this),
            list,
            newMtx;

        if ($this.isSVG()) {
            list = this.transform.baseVal;
            list.appendItem(list.createSVGTransformFromMatrix(mtx));
            list.consolidate();
        } else if (attr) {
            newMtx = $this.getMtx().multiply(mtx);
            $this.setMtx(newMtx);
        }
    });

    return this;
};

JSYG.prototype.mtx2attrs = function (opt) {
    if (opt instanceof Matrix) opt = { mtx: opt };
    else opt = $.extend({}, opt);

    this.each(function () {
        var $this = new JSYG(this),
            mtx = opt.mtx || $this.getMtx(),
            keepRotation = opt.keepRotation || false,
            shift = $this.getShift(),
            d = mtx.decompose(shift.x, shift.y),
            dim = $this.getDim(),
            tag = $this.getTag(),
            tagsChoixRotation = ["circle", "line", "polyline", "polygon", "path"],
            pt,
            pt1,
            pt2,
            hg,
            bg,
            bd,
            list,
            jPath,
            seg,
            letter,
            x,
            y,
            i,
            N;

        if (!dim) return;

        if (keepRotation && tagsChoixRotation.indexOf(tag) !== -1) {
            mtx = mtx.rotate(-d.rotate, shift.x, shift.y);
        }

        if (isSVGImage($this)) tag = "use";

        switch (tag) {
            case "circle":
                pt = new Vect($this.attr("cx"), $this.attr("cy")).mtx(mtx);

                $this.attr({
                    cx: pt.x,
                    cy: pt.y,
                    r: $this.attr("r") * d.scaleX,
                });

                if (!opt.mtx) $this.resetTransf();

                break;

            case "ellipse":
                pt = new Vect($this.attr("cx"), $this.attr("cy")).mtx(mtx);

                $this.attr({
                    cx: pt.x,
                    cy: pt.y,
                    rx: $this.attr("rx") * d.scaleX,
                    ry: $this.attr("ry") * d.scaleY,
                });

                if (!opt.mtx) $this.resetTransf();

                $this.setMtx($this.getMtx().rotate(d.rotate, pt.x, pt.y));

                break;

            case "line":
                ((pt1 = new Vect($this.attr("x1"), $this.attr("y1")).mtx(mtx)),
                    (pt2 = new Vect($this.attr("x2"), $this.attr("y2")).mtx(mtx)));

                $this.attr({ x1: pt1.x, y1: pt1.y, x2: pt2.x, y2: pt2.y });

                if (!opt.mtx) $this.resetTransf();

                break;

            case "polyline":
            case "polygon":
                list = $this[0].points;
                i = 0;
                N = list.numberOfItems;

                for (; i < N; i++) {
                    list.replaceItem(list.getItem(i).matrixTransform(mtx.mtx), i);
                }

                if (!opt.mtx) $this.resetTransf();

                if ($this[0].connector) {
                    //GUSA
                    $this[0].connector.updateConnection(); //GUSA
			console.log("polygon conector update");
                }

                break;

            case "path":
                if (!JSYG.Path) break; //GUSA

                jPath = new JSYG.Path(this).rel2abs();
                list = this.pathSegList;
                ((i = 0), (N = list.numberOfItems));

                for (; i < N; i++) {
                    seg = list.getItem(i);
                    letter = seg.pathSegTypeAsLetter;

                    ["", "1", "2"].forEach(function (ind) {
                        if (seg["x" + ind] == null && seg["y" + ind] == null) return;

                        if (seg["x" + ind] != null) x = seg["x" + ind];
                        if (seg["y" + ind] != null) y = seg["y" + ind];

                        if (x != null && y != null) {
                            var point = new Vect(x, y).mtx(mtx);
                            seg["x" + ind] = point.x;
                            seg["y" + ind] = point.y;
                        }
                    });

                    if (keepRotation && letter === "A") {
                        seg.r1 *= mtx.scaleX();
                        seg.r2 *= mtx.scaleY();
                    }

                    jPath.replaceSeg(i, seg);
                }

                if (!opt.mtx) $this.resetTransf();

                break;

            case "g":
                opt.mtx && $this.addMtx(mtx);
                break;

            case "use":
                hg = new Vect($this.attr("x") || 0, $this.attr("y") || 0).mtx(mtx);

                $this.attr({ x: hg.x, y: hg.y });

                if (!opt.mtx) $this.resetTransf();

                $this.setMtx(
                    $this
                        .getMtx()
                        .translate(hg.x, hg.y)
                        .scaleNonUniform(d.scaleX, d.scaleY)
                        .rotate(d.rotate)
                        .translate(-hg.x, -hg.y),
                );

                break;

            case "text":
                x = parseFloat($this.attr("x") || 0);
                y = parseFloat($this.attr("y")) || 0;

                pt = new Vect(x, y).mtx(mtx);

                $this.attr({ x: pt.x, y: pt.y });

                if (!opt.mtx) $this.resetTransf();

                $this.setMtx(
                    $this
                        .getMtx()
                        .translate(pt.x, pt.y)
                        .scaleNonUniform(d.scaleX, d.scaleY)
                        .rotate(d.rotate)
                        .translate(-pt.x, -pt.y),
                );

                break;

            case "rect":
                ((hg = new Vect(dim.x, dim.y).mtx(mtx)),
                    (bg = new Vect(dim.x, dim.y + dim.height).mtx(mtx)),
                    (bd = new Vect(dim.x + dim.width, dim.y + dim.height).mtx(mtx)));

                $this.attr({
                    x: hg.x,
                    y: hg.y,
                    width: JSYG.distance(bd, bg),
                    height: JSYG.distance(bg, hg),
                    rx: $this.attr("rx") * d.scaleX,
                    ry: $this.attr("ry") * d.scaleY,
                });

                if (!opt.mtx) $this.resetTransf();

                $this.setMtx($this.getMtx().rotate(d.rotate, hg.x, hg.y));

                break;

            default:
                if (!$this.isSVG()) {
                    ((hg = new Vect(0, 0).mtx(mtx)),
                        (bg = new Vect(0, dim.height).mtx(mtx)),
                        (bd = new Vect(dim.width, dim.height).mtx(mtx)));

                    $this.setDim({
                        x: dim.x + hg.x,
                        y: dim.y + hg.y,
                        width: JSYG.distance(bd, bg),
                        height: JSYG.distance(bg, hg),
                    });

                    if (!opt.mtx) $this.resetTransf();

                    $this.setMtx($this.getMtx().rotate(d.rotate));
                } else {
                    ((hg = new Vect(dim.x, dim.y).mtx(mtx)),
                        (bg = new Vect(dim.x, dim.y + dim.height).mtx(mtx)),
                        (bd = new Vect(dim.x + dim.width, dim.y + dim.height).mtx(mtx)));

                    $this.attr({
                        x: hg.x,
                        y: hg.y,
                        width: JSYG.distance(bd, bg),
                        height: JSYG.distance(bg, hg),
                    });

                    if (!opt.mtx) $this.resetTransf();

                    $this.setMtx($this.getMtx().rotate(d.rotate, hg.x, hg.y));
                }
        }

        if (keepRotation && tagsChoixRotation.indexOf(tag) !== -1) {
            shift = $this.getShift();

            $this.setMtx($this.getMtx().rotate(d.rotate, shift.x, shift.y));
        }
    });

    return this;
};

JSYG.prototype.getTransf = function () {
    var shift = this.getShift(),
        transf = this.getMtx().decompose(shift.x, shift.y);

    delete transf.skew;

    return transf;
};

JSYG.getCursorPos = function (evt, ref) {
    var mtx, rect;

    if (ref && !(ref instanceof JSYG)) ref = new JSYG(ref);

    if (ref.isSVG()) {
        mtx = ref.getMtx("screen").inverse();

        return new Point(evt.clientX, evt.clientY).mtx(mtx);
    } else {
        rect = (ref && ref.getDim("page")) || { x: 0, y: 0 };

        return new Point(evt.pageX - rect.x, evt.pageY - rect.y);
    }
};

JSYG.isOver = function (dim1, dim2, typeOver) {
    var test = { x: false, y: false };

    typeOver = typeOver || "full";

    if (typeOver === "full") {
        if (dim1.width < dim2.width) {
            test.x = dim1.x > dim2.x && dim1.x + dim1.width <= dim2.x + dim2.width;
        } else {
            test.x = dim1.x <= dim2.x && dim1.x + dim1.width >= dim2.x + dim2.width;
        }

        if (dim1.height < dim2.height) {
            test.y = dim1.y > dim2.y && dim1.y + dim1.height <= dim2.y + dim2.height;
        } else {
            test.y = dim1.y <= dim2.y && dim1.y + dim1.height >= dim2.y + dim2.height;
        }
    } else if (typeOver === "partial") {
        test.x =
            (dim1.x > dim2.x && dim1.x <= dim2.x + dim2.width) ||
            (dim1.x + dim1.width > dim2.x && dim1.x + dim1.width <= dim2.x + dim2.width);
        if (dim1.width > dim2.width && test.x === false) {
            test.x = dim1.x <= dim2.x && dim1.x + dim1.width >= dim2.x + dim2.width;
        }

        test.y =
            (dim1.y > dim2.y && dim1.y <= dim2.y + dim2.height) ||
            (dim1.y + dim1.height > dim2.y && dim1.y + dim1.height <= dim2.y + dim2.height);
        if (dim1.height > dim2.height && test.y === false) {
            test.y = dim1.y <= dim2.y && dim1.y + dim1.height >= dim2.y + dim2.height;
        }
    } else if (typeOver === "center") {
        var center = { x: dim2.x + dim2.width / 2, y: dim2.y + dim2.height / 2 };
        test.x = center.x > dim1.x && center.x < dim1.x + dim1.width;
        test.y = center.y > dim1.y && center.y < dim1.y + dim1.height;
    }

    return test.x && test.y;
};

JSYG.prototype.isOver = function (node, type) {
    var dim1 = this.getDim("screen"),
        dim2 = new JSYG(node).getDim("screen");

    return JSYG.isOver(dim1, dim2, type);
};

JSYG.prototype.getCursorPos = function (e) {
    return JSYG.getCursorPos(e, this);
};

JSYG.prototype.fill = function (color) {
    if (color == null) return this.css(this.isSVG() ? "fill" : "background-color");

    this.each(function () {
        var $this = new JSYG(this);

        if ($this.isSVG()) {
            $this.css("fill", color == "transparent" ? "none" : color);
        } else {
            $this.css("background-color", color == "none" ? "transparent" : color);
        }
    });

    return this;
};

JSYG.prototype.stroke = function (val) {
    var onlyColor = null;

    if (val == null) return this.css(this.isSVG() ? "stroke" : "border");

    try {
        new JSYG.Color(val);
        onlyColor = true;
    } catch (e) {}

    this.each(function () {
        var props,
            $this = new JSYG(this),
            px;

        if (!$this.isSVG()) {
            (onlyColor && $this.css("border-color", val)) || $this.css("border", val);
        } else {
            if (onlyColor) $this.css("stroke", val);
            else {
                props = val.split(/ +/);
                props[0] && $this.css("stroke-width", props[0]);
                px = parseInt(props[0], 10);

                switch (props[1]) {
                    case "dotted":
                        $this.css("stroke-dasharray", px + "," + px);
                        break;
                    case "dashed":
                        $this.css("stroke-dasharray", px * 4 + "," + px * 4);
                        break;
                    case "none":
                        $this.css("stroke", "none");
                        break;
                }

                props[2] && $this.css("stroke", props[2]);
            }
        }
    });

    return this;
};

function createFakeDragFunction($nodes) {
    return function (e) {
        var hasMoved = false,
            posInit = { x: e.clientX, y: e.clientY };

        function mousemoveFct(e) {
            if (hasMoved === false) {
                var pos = { x: e.clientX, y: e.clientY };

                if (JSYG.distance(posInit, pos) > 0) {
                    const event = new CustomEvent("drag:start", { detail: e });
                    $nodes[0].dispatchEvent(event);

                    hasMoved = true;
                }
            } else {
                const event = new CustomEvent("drag:drag", { detail: e });
                $nodes[0].dispatchEvent(event);
            }
        }

        function mouseupFct(e) {
            if (hasMoved === true) {
                const event = new CustomEvent("drag:end", { detail: e });
                $nodes[0].dispatchEvent(event);
            }

            $nodes[0].removeEventListener("mousemove", mousemoveFct);

            new JSYG(document)[0].removeEventListener("mouseup", mouseupFct);
        }

        e.preventDefault();

        $nodes[0].addEventListener("mousemove", mousemoveFct);

        new JSYG(document)[0].addEventListener("mouseup", mouseupFct);
    };
}

JSYG.prototype.dragEvents = function (method) {
    var fct = this[0].dataset.fakedrag;

    if (!fct && (!method || method == "enable")) {
        fct = createFakeDragFunction(this);

        this[0].addEventListener("mousedown", fct);
        this[0].dataset.fakedrag = fct;
    } else if (fct && (method == "destroy" || method == "disable")) {
        this.off("mousedown", fct).removeData("fakedrag", fct);
    }

    return this;
};

JSYG.rand = function (min, max) {
    if (Array.isArray(min)) return min[JSYG.rand(0, min.length - 1)];
    else if (typeof min === "string") return min.charAt(JSYG.rand(0, min.length - 1)); // min[ind] ne fonctionne pas avec IE7
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

JSYG.support.twoDimTransf = (function () {
    var node = document.createElement("div"),
        attr,
        attributs = ["", "Moz", "Webkit", "O", "ms"];

    for (var i = 0; i < attributs.length; i++) {
        attr = attributs[i] + "Transform";
        if (node.style && node.style[attr] != null) return attr;
    }
    return false;
})();

//http://jointjs.com/blog/get-transform-to-element-polyfill.html
SVGElement.prototype.getTransformToElement =
    SVGElement.prototype.getTransformToElement ||
    function (toElement) {
        return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());
    };

var cptPlugin = 0;

JSYG.bindPlugin = function (Construct) {
    var name = "dataPlugin" + cptPlugin,
        slice = Array.prototype.slice;

    cptPlugin++;

    return function (method) {
        var args = arguments,
            value;

        this.each(function () {
            let $this = new JSYG(this);
            let plugin = $this.data_(name); //GUSA

            if (!plugin) {
                plugin = new Construct(this);
                $this.data_(name, plugin); //GUSA
            }

            if (method == "get") {
                value = plugin[args[1]];
                if (typeof value == "function") value = plugin[args[1]]();
                return false;
            } else if (method === "destroy") {
                plugin.disable();
                $this.removeData_(name); //GUSA
            } else if (typeof method === "object" || !method) {
                if (plugin.enable) plugin.enable.apply(plugin, args);
                else {
                    throw new Error(
                        "Ce plugin n'a pas de méthode enable,'" +
                            "il faut donc préciser en premier argument la méthode désirée",
                    );
                }
            } else if (typeof method === "string" && plugin[method]) {
                if (method.substr(0, 1) === "_")
                    throw new Error("La méthode " + method + " est privée.");
                else plugin[method].apply(plugin, slice.call(args, 1));
            } else throw new Error("La méthode " + method + " n'existe pas ");

            return null;
        });

        return method == "get" ? value : this;
    };
};

function viewBox2mtx(svgElmt) {
    var viewBox = svgElmt.viewBox.baseVal,
        mtx = new Matrix(),
        scaleX,
        scaleY,
        ratio;

    if (!viewBox) return mtx;

    if (viewBox.width && viewBox.height) {
        scaleX = svgElmt.getAttribute("width") / viewBox.width;
        scaleY = svgElmt.getAttribute("height") / viewBox.height;
        ratio = svgElmt.getAttribute("preserveAspectRatio");

        if (ratio && ratio != "none")
            throw new Error(
                ratio +
                    " : désolé, la méthode ne fonctionne pas avec une valeur de preserveAspectRatio différente de 'none'.",
            );

        mtx = mtx.scaleNonUniform(scaleX, scaleY);
    }

    mtx = mtx.translate(-viewBox.x, -viewBox.y);

    return mtx;
}

JSYG.prototype.svg2g = function () {
    var list = [];

    this.each(function () {
        var $this = new JSYG(this);

        if ($this.getTag() != "svg")
            throw new Error($this.getTag() + " : la méthode ne concerne que les balises svg");

        var g = new JSYG("<g>"),
            mtx = new Matrix();

        while (this.firstChild) g.append(this.firstChild);

        mtx = mtx.translate($this.attr("x") || 0, $this.attr("y") || 0);

        mtx = mtx.multiply(viewBox2mtx(this));

        g.setMtx(mtx).replace(this);

        list.push(g[0]);
    });

    return new JSYG(list);
};

JSYG.parseSVG = function (svgString) {
    var parser = new DOMParser(),
        doc = parser.parseFromString(svgString, "image/svg+xml"),
        node = doc.documentElement;

    return new JSYG(node);
};

JSYG.serializeSVG = function (node, _dim) {
    var serializer = new XMLSerializer(),
        jNode = new JSYG(node),
        tag = jNode.getTag(),
        isSVG = jNode.isSVG(),
        str,
        entete;

    if (tag == "svg") jNode.attr("xmlns", "http://www.w3.org/2000/svg"); //chrome

    ((str = serializer.serializeToString(jNode[0])),
        (entete =
            '<?xml version="1.0" encoding="UTF-8"?>' +
            "\n" +
            '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
            "\n"));

    str = str.replace(/ \w+:href=/g, " xlink:href=");
    str = str.replace(/ xmlns:\w+="http:\/\/www\.w3\.org\/1999\/xlink"/g, "");

    if (tag === "svg") {
        if (!/xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/.test(str)) {
            str = str.replace(/^<svg /, '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
        }
        str = entete + str;
    } else {
        if (!_dim) _dim = jNode.getDim();

        entete +=
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
        if (_dim) entete += ' width="' + _dim.width + '" height="' + _dim.height + '"';
        entete += ">\n";

        if (!isSVG) {
            str = "<foreignObject width='100%' height='100%'>" + str + "</foreignObject>";
        }

        str = entete + str + "\n" + "</svg>";
    }

    return str;
};

JSYG.prototype.toSVGString = function (standalone, imagesQuality) {
    var jNode = JSYG(this[0].cloneNode(true)),
        dim = this.getTag() != "svg" && this.getDim(),
        promise;

    JSYG(jNode[0].getElementsByTagName("script")).remove();

    if (standalone && this.isSVG()) {
        jNode.walkTheDom(function () {
            var $this = new JSYG(this);
            $this.style2attr();
        });
    }

    if (standalone) promise = jNode.url2data(true, null, imagesQuality);
    else promise = Promise.resolve();

    return promise.then(function () {
        return JSYG.serializeSVG(jNode, dim);
    });
};

JSYG.prototype.toDataURL_old = function (standalone, imagesQuality) {
    return this.toSVGString(standalone, imagesQuality).then(function (svg) {
        return "data:image/svg+xml;base64," + strUtils.base64encode(svg);
    });
};



function formatXml(xml) { // tab = optional indent value, default is tab (\t)
    var formatted = '', indent= '';
    let tab = '  ';
    xml.split(/>\s*</).forEach(function(node) {
        if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
    });
    return formatted.substring(1, formatted.length-3);
}


JSYG.prototype.toDataURL = function (standalone, imagesQuality) {
    let data = this.toSVGString(standalone, imagesQuality).then(function (svg) {
	//console.log(svg);
        return "data:image/svg+xml;base64," + strUtils.base64encode(formatXml(svg));   //GUSA
    });
    return data;
};

JSYG.prototype.url2data = function (recursive, format, quality) {
    var regURL = /^url\("(.*?)"\)/,
        promises = [];

    format = format || "png";

    if (quality != null) quality /= 100;

    function url2data() {
        var node = this,
            jNode = new JSYG(this),
            tag = jNode.getTag(),
            isImage = ["image", "img"].indexOf(tag) != -1,
            matches = null,
            href;

        if (!isImage) {
            matches = jNode.css("background-image").match(regURL);
            href = matches && matches[1];
        } else href = jNode.href();

        if (!href || /^data:/.test(href)) return;

        promises.push(
            new Promise(function (resolve, reject) {
                var img = new Image(),
                    canvas = document.createElement("canvas"),
                    ctx = canvas.getContext("2d");

                img.crossOrigin = "";

                img.onload = function () {
                    var data;

                    canvas.width = this.width;
                    canvas.height = this.height;
                    ctx.drawImage(this, 0, 0);

                    try {
                        data = canvas.toDataURL("image/" + format, quality);

                        if (isImage) jNode.href(data);
                        else jNode.css("background-image", 'url("' + data + '")');

                        resolve(node);
                    } catch (e) {
                        /*security error for cross domain */
                        reject(e);
                    }
                };

                img.onerror = reject;

                img.src = href;
            }),
        );
    }

    if (recursive)
        this.each(function () {
            JSYG.walkTheDom(url2data, this);
        });
    else this.each(url2data);

    return Promise.all(promises);
};

JSYG.prototype.toCanvas = function () {
    var dim = this.getDim(this.offsetParent()),
        canvas = document.createElement("canvas"),
        node = this[0],
        ctx = canvas.getContext("2d"),
        tag = this.getTag(),
        promise;

    canvas.width = dim.width;
    canvas.height = dim.height;

    if (tag == "img" || tag == "image") promise = Promise.resolve(this.href());
    else promise = this.toDataURL(true);

    return promise.then(function (src) {
        return new Promise(function (resolve, reject) {
            function onload() {
                try {
                    ctx.drawImage(this, 0, 0, dim.width, dim.height);
                    resolve(canvas);
                } catch (e) {
                    reject(new Error("Impossible de dessiner le noeud " + tag));
                }
            }

            if (tag == "canvas") return onload.call(node);

            var img = new Image();
            img.onload = onload;
            img.onerror = function () {
                reject(new Error("Impossible de charger l'image " + src));
            };
            img.src = src;
        });
    });
};

JSYG.prototype.moveBackwards = function () {
    return this.each(function () {
        var $this = new JSYG(this);

        let target = $this[0].previousElementSibling;
        const parentElement = target.parentNode;
        if (parentElement) {
            parentElement.insertBefore($this[0], target);
        }
    });
};

JSYG.prototype.moveBack = function () {
    return this.each(function () {
        JSYG(this.parentNode).prepend_(this);
    });
};

JSYG.prototype.moveForwards = function () {
    return this.each(function () {
        var $this = new JSYG(this);

        let next = $this[0].nextElementSibling;
        const parentElement = next.parentNode;
        if (parentElement) {
            let nextSibling = next.nextSibling;
            parentElement.insertBefore($this[0], nextSibling);
        }
    });
};

JSYG.prototype.moveFront = function () {
    return this.each(function () {
        JSYG(this.parentNode).append_(JSYG(this));
    });
};

JSYG.prototype.getUniqueSelector = function () {
    var path;

    var $node = this;
    var uniqueTags = ["name", "id"];

    while ($node.length) {
        var realNode = $node[0],
            name = realNode.localName,
            parent,
            uniqueIdentifierFound,
            i,
            tag,
            tagValue,
            sameTagSiblings,
            allSiblings,
            index;

        if (!name) break;

        name = name.toLowerCase();
        parent = $node.parent();
        uniqueIdentifierFound = false;

        for (i = uniqueTags.length - 1; i >= 0; i--) {
            tag = uniqueTags[i];
            tagValue = $node.attr(tag);

            if (tagValue && tagValue.trim !== "") {
                name = "[" + tag + '=\"' + tagValue + '\"]';
                uniqueIdentifierFound = true;
                break;
            }
        }

        if (!uniqueIdentifierFound) {
            sameTagSiblings = parent.children(name);

            if (sameTagSiblings.length > 1) {
                allSiblings = parent.children();
                index = allSiblings.index(realNode) + 1;
                name += ":nth-child(" + index + ")";
            }

            path = name + (path ? ">" + path : "");
            $node = parent;
        } else {
            path = name + (path ? ">" + path : "");
            break; //exit while loop
        }
    }

    return path;
};

(function add2JSYG() {
    for (var n in strUtils) JSYG[n] = strUtils[n];

    JSYG.Matrix = Matrix;
    JSYG.Vect = Vect;
    JSYG.Point = Point;
})();
