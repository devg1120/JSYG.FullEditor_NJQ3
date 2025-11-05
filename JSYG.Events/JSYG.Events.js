const slice = Array.prototype.slice;

function isPlainObject(obj) {
    if (typeof obj !== "object" || obj.nodeType || (obj != null && obj === obj.window))
        return false;
    if (obj.constructor && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) return false;
    return true;
}
export default function Events() {}

Events.prototype = {
    constructor: Events,
    on(events, fct) {
        let p;
        let i;
        let n;
        let N;

        if (isPlainObject(events) && fct == null) {
            for (n in events) this.on(n, events[n]);
            return this;
        }

        if (typeof fct !== "function") return this;

        events = events.split(/\s+/);

        for (i = 0, N = events.length; i < N; i++) {
            p = this[`on${events[i]}`];

            if (p === undefined) throw new Error(`${events[i]} n'est pas un événement connu`);
            else if (p === false || p === null) p = [fct];
            else if (typeof p == "function") {
                if (p !== fct) p = [p, fct];
            } else if (Array.isArray(p)) {
                if (!p.includes(fct)) p.push(fct);
            } else throw new Error(`${typeof p}Type incorrect pour la propriété on${events[i]}`);

            this[`on${events[i]}`] = p;
        }

        return this;
    },

    off(events, fct) {
        let p;
        let i;
        let n;
        let N;

        if (isPlainObject(events) && fct == null) {
            for (n in events) this.off(n, events[n]);
            return this;
        }

        if (fct && typeof fct !== "function") return this;

        events = events.split(/\s+/);

        for (i = 0, N = events.length; i < N; i++) {
            p = this[`on${events[i]}`];

            if (fct == null) {
                this[`on${events[i]}`] = null;
                continue;
            }

            if (p === undefined) throw new Error(`${events[i]} n'est pas un événement connu`);
            else if (typeof p == "function" && p === fct) p = null;
            else if (Array.isArray(p)) p.splice(p.indexOf(fct), 1);
            else if (p !== null)
                throw new Error(`${typeof p}Type incorrect pour la propriété on${events[i]}`);
        }

        return this;
    },

    one(events, fct) {
        const that = this;

        function offFct() {
            that.off(events, fct);
            that.off(events, offFct);
        }

        this.on(events, fct);
        this.on(events, offFct);

        return this;
    },

    trigger(event, context) {
        context = context || this.node || this;

        const p = this[`on${event}`];
        let returnValue = true;
        let i;
        let N;

        if (!(`on${event}` in this)) throw new Error(`${event} is not a existing event`);
        else if (p instanceof Function) returnValue = p.apply(context, slice.call(arguments, 2));
        else if (Array.isArray(p)) {
            for (i = 0, N = p.length; i < N; i++) {
                if (p[i].apply(context, slice.call(arguments, 2)) === false) returnValue = false;
            }
        } else if (p !== null && p !== false)
            throw new Error(`${typeof p}Type incorrect pour la propriété on${event}`);

        return returnValue;
    },
};
