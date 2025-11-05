import StdConstruct from "../JSYG.StdConstruct/JSYG.StdConstruct.js";

export class UndoRedo extends StdConstruct {
    constructor(arg, opt) {
       super();
       this.stack = [];

       this.undo = this.undo.bind(this);
       this.redo = this.redo.bind(this);

       if (arg) this.setNode(arg);

       if (opt) this.enable(opt);
   }

    change(indice) {
        if (this.stack[indice] == null) return;

        const clone = $(this.stack[indice].node).clone();

        clone.replaceAll(this.node);

        this.node = clone[0];

        this.current = indice;

        if (this.fieldUndo) {
            if (this.stack.length > 1 && this.current < this.stack.length - 1)
                $(this.fieldUndo).removeClass(this.classInactive);
            else $(this.fieldUndo).addClass(this.classInactive);
        }

        if (this.fieldRedo) {
            if (this.stack.length > 1 && this.current > 0)
                $(this.fieldRedo).removeClass(this.classInactive);
            else $(this.fieldRedo).addClass(this.classInactive);
        }

        this.trigger("change", this.node);

        return this;
    }

    saveState(label, _preventEvent) {
        //on vide le début du tableau si on avait annulé quelque chose
        while (this.current > 0) {
            this.stack.shift();
            this.current--;
        }

        const clone = $(this.node).clone();

        if (!clone.length) return this;

        this.stack.unshift({ label, node: clone[0] });

        if (this.stack.length > this.depth) this.stack.pop();

        if (this.fieldRedo) $(this.fieldRedo).addClass(this.classInactive);
        if (this.fieldUndo) $(this.fieldUndo).removeClass(this.classInactive);

        if (!_preventEvent) this.trigger("save", this.node);

        return this;
    }

    hasUndo() {
        return this.current < this.stack.length - 1;
    }

    hasRedo() {
        return this.current >= 1;
    }

    undo() {
        if (!this.hasUndo()) return;

        this.change(++this.current);

        this.trigger("undo", this.node);

        return this;
    }

    redo() {
        if (!this.hasRedo()) return;

        this.change(--this.current);

        this.trigger("redo", this.node);

        return this;
    }

    clear(_preventEvent) {
        this.current = 0;

        this.stack.splice(0, this.stack.length);

        this.fieldRedo && $(this.fieldRedo).addClass(this.classInactive);

        this.saveState(null, _preventEvent);

        this.fieldUndo && $(this.fieldUndo).addClass(this.classInactive);

        return this;
    }

    enableFields() {
        if (!this.enabled) return this;

        if (this.fieldUndo)
            new JSYG(this.fieldUndo).on("click", this.undo).addClass(this.classInactive);

        if (this.fieldRedo)
            new JSYG(this.fieldRedo).on("click", this.redo).addClass(this.classInactive);

        return this;
    }

    disableFields() {
        if (!this.enabled) return this;

        if (this.fieldUndo)
            new JSYG(this.fieldUndo).off("click", this.undo).removeClass(this.classInactive);

        if (this.fieldRedo)
            new JSYG(this.fieldRedo).off("click", this.redo).removeClass(this.classInactive);

        return this;
    }

    enableKeyShortCuts() {
        if (!this.enabled) return this;

        const $doc = $(document);

        if (this.keyShortCutUndo) $doc.on("keydown", null, this.keyShortCutUndo, this.undo);
        if (this.keyShortCutRedo) $doc.on("keydown", null, this.keyShortCutRedo, this.redo);

        return this;
    }

    disableKeyShortCuts() {
        if (!this.enabled) return this;

        const $doc = $(document);

        if (this.keyShortCutUndo) $doc.off("keydown", this.undo);
        if (this.keyShortCutRedo) $doc.off("keydown", this.redo);

        return this;
    }

    enable(opt) {
        this.disable();

        if (opt) this.set(opt);

        this.saveState(null, true);

        this.enabled = true;

        if (this.autoEnableFields) this.enableFields();

        if (this.autoEnableKeyShortCuts) this.enableKeyShortCuts();

        return this;
    }

    disable() {
        this.clear(true);

        this.stack.splice(0, this.stack.length);

        this.disableFields();

        this.disableKeyShortCuts();

        this.enabled = false;

        return this;
    }
}

UndoRedo.prototype.autoEnableKeyShortCuts = false;

UndoRedo.prototype.keyShortCutUndo = "ctrl+z";

UndoRedo.prototype.keyShortCutRedo = "ctrl+y";

UndoRedo.prototype.autoEnableFields = false;

UndoRedo.prototype.fieldUndo = null;

UndoRedo.prototype.fieldRedo = null;

UndoRedo.prototype.classInactive = "disabled";

UndoRedo.prototype.depth = 10;

UndoRedo.prototype.current = 0;

UndoRedo.prototype.onundo = null;

UndoRedo.prototype.onredo = null;

UndoRedo.prototype.onchange = null;

UndoRedo.prototype.onsave = null;

UndoRedo.prototype.enabled = null;

