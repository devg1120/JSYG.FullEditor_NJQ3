import Events from "../JSYG.Events/JSYG.Events.js";

("use strict");

export default function StdConstruct() {}

StdConstruct.prototype = new Events();

StdConstruct.prototype.constructor = StdConstruct;

StdConstruct.prototype.set = function (opt, _cible) {
    var cible = _cible || this;

    if (!$.isPlainObject(opt)) return cible;

    for (var n in opt) {
        if (n in cible) {
            if ($.isPlainObject(opt[n]) && cible[n]) this.set(opt[n], cible[n]);
            else if (opt[n] !== undefined) cible[n] = opt[n];
        }
    }

    return cible;
};

StdConstruct.prototype.setNode = function (arg) {
    var node = $(arg)[0];
    if (!node)
        throw new Error(
            arg +
                " n'est pas un argument correct pour la méthode setNode : aucun élément DOM renvoyé.",
        );

    var enabled = this.enabled === true;
    if (enabled) this.disable();

    this.node = node;

    if (enabled) this.enable();

    return this;
};

StdConstruct.prototype.reset = function () {
    var ref = Object.getPrototypeOf
        ? Object.getPrototypeOf(this)
        : this.__proto__
          ? this.__proto__
          : this.constructor.prototype;

    for (var n in ref) {
        if (typeof ref[n] !== "function") this[n] = ref[n];
    }

    return this;
};

StdConstruct.prototype.enabled = false;

StdConstruct.prototype.enable = function () {
    this.enabled = true;

    return this;
};

StdConstruct.prototype.disable = function () {
    this.enabled = false;

    return this;
};

((StdConstruct.prototype.toggle = function (opt) {
    if (this.enabled) this.disable();
    else this.enable(opt);
    return this;
}),
    (StdConstruct.prototype.destroy = function () {
        this.disable();
        this.reset();
        return this;
    }));

