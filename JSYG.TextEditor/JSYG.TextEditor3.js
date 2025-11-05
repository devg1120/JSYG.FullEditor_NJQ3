
(factory => {
    
    if (typeof module == "object" && typeof module.exports == "object") {
      
      module.exports = factory( require("jsyg"), require("jsyg-color"), require("jsyg-boundingbox") )
    }
    else if (typeof define != "undefined" && define.amd) {
      
      define("jsyg-texteditor",["jsyg","jsyg-color","jsyg-boundingbox"],factory);
    }
    else if (typeof JSYG != "undefined") {
      
        if (JSYG.BoundingBox && JSYG.Color) factory(JSYG,JSYG.Color,JSYG.BoundingBox);
        else throw new Error("Dependency is missing");
    }
    else throw new Error("JSYG is needed");
    
})((JSYG, Color, BoundingBox) => {
    class TextEditor extends JSYG.StdConstruct {
        constructor(arg, opt) {
            super(arg, opt);
            this.box = new BoundingBox();
            this.box.className = 'textBox';
            //this.box.inputmode = 'text';
            //this.box.className  += ' ime-on';
            //this.box.container.style.imeMode = "active";
            //this.box.container.inputmode = 'text';
/*
            this.box.container.addEventListener("compositionstart", (event) => {
		    console.log("***ime");
	    });
            this.box.container.addEventListener("keydown", (event) => {
		    console.log("***keydown");
	    });
*/
            
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
            
            if (target.tagName != 'text') throw new Error("La cible n'est pas un élément texte");
            
            const display = this.display;
            
            if (display) this.hide(true);
            
            this._target = target;
            this.box.setNode(target);
            
            if (display) this.show(true);
            
            this.trigger('changetarget',this.node,target);
            
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

        targetRemove() {
            
            this._target = null;
        }

        insertChars(chars, indChar) {
            
            if (indChar < 0 || indChar > this._target.getNumberOfChars()) return false;
            
            chars = chars.replace(/ /g,'\u00a0');
            
            const content = this._target.textContent;
            
            this._target.textContent = content.substr(0,indChar) + chars + content.substr(indChar);
            
            this.box.update();
            
            this.trigger('insertchars',this.node,this._target);
            this.trigger('change',this.node,this._target);
            
            return this;
        }

        deleteChars(indChar, nbChars = 1) {
            if (indChar < 0 || indChar > this._target.getNumberOfChars()) return false;

            const content = this._target.textContent;

            this._target.textContent = content.substr(0,indChar) + content.substr(indChar+nbChars);

            this.box.update();

            this.trigger('deletechars',this.node,this._target);
            this.trigger('change',this.node,this._target);

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
            
            this.cursor.enable().show( this._target.getNumberOfChars() );
            
            this.display = true;
            
            this._content = this._target.textContent;
            
            if (!_preventEvent) this.trigger('show',this.node,this._target);
            
            return this;
        }

        hide(_preventEvent) {
            
            if (!this.display) return this;
            
            this.selection.disable();
            this.cursor.disable();
            this.keyboard.disable();
            
            new JSYG(this.container)
                .removeClass(this.className)
                .resetTransf().detach();
            
            this.display = false;
            
            if (this._target.textContent != this._content) this.trigger('validate',this.node,this._target);
            
            if (!_preventEvent) this.trigger('hide',this.node,this._target);
            
            return this;
        }

        update() {
            
            if (!this.display) return this;
            
            this.box.update();
            
            if (this.selection.display) this.selection.select(this.selection.from,this.selection.to);
            if (this.cursor.display) this.cursor.show(this.cursor.currentChar);
            
            this.trigger('update',this.node,this._target);
            
            return this;
        }
    }

    TextEditor.prototype._target = null;

    /**
     * Fonctions à exécuter quand on définit une autre cible
     */
    TextEditor.prototype.onchangetarget = null;
    /**
     * Fonctions à exécuter à l'affichage de la boîte d'édition
     */
    TextEditor.prototype.onshow=null;
    /**
     * Fonctions à exécuter à la suppression de la boîte d'édition
     */
    TextEditor.prototype.onhide=null;
    /**
     * Fonctions à exécuter à la suppression de caractères
     */
    TextEditor.prototype.ondeletechars=null;
    /**
     * Fonctions à exécuter à l'ajout de caractères
     */
    TextEditor.prototype.oninsertchars=null;
    /**
     * Fonctions à exécuter à la mise à jour de la boîte d'édition
     */
    TextEditor.prototype.onupdate=null;
    /**
     * Fonctions à exécuter à l'ajout ou suppression de caractères
     */
    TextEditor.prototype.onchange=null;
    /**
     * Fonctions à exécuter à la validation de la boîte d'édition (seulement si le texte a changé)
     */
    TextEditor.prototype.onvalidate=null;

    TextEditor.prototype.className = "textEditor";

    TextEditor.prototype._content = null;

    TextEditor.prototype.enabled = false;

    class Selection extends JSYG.StdConstruct {
        constructor(textObject) {
	    super(textObject);
            /**
             * référence vers l'objet TextEditor parent
             */
            this.textEditor = textObject;
            /**
             * Conteneur des controles
             */
            this.container = new JSYG('<rect>')[0];
        }

        hide() {
            
            this.from = null;
            this.to = null;
            
            new JSYG(this.container).detach();
            
            this.display = false;
            
            return this;
        }

        deleteChars() {
        
            if (this.from === this.to) { return; }
            
            this.textEditor.deleteChars(this.from,this.to-this.from);
            
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

            from = JSYG.clip(from,0,nbchars);
            to = JSYG.clip(to,0,nbchars);

            const jCont = new JSYG(this.container).addClass(this.className);
            const jNode = new JSYG(node);

            if (!this.container.parentNode) jCont.appendTo(this.textEditor.container);

            jCont.fill( new Color( jNode.css("fill") ).complementary().toString() );

            jCont.setMtx( jNode.getMtx(this.textEditor.container) );

            const fontsize = getFontSize(node);
            let start;
            let end;

            if (from === nbchars) { //positionnement tout à la fin
                start = node.getEndPositionOfChar(from-1);
            }
            else { start = node.getStartPositionOfChar(from); }

            if (to === nbchars) { //positionnement tout à la fin
                end = node.getEndPositionOfChar(to-1);
            }
            else { end = node.getStartPositionOfChar(to); }

            jCont.setDim({
                x: start.x < end.x ? start.x : end.x,
                y:start.y-fontsize+3,
                width:Math.abs(end.x-start.x),
                height:fontsize
            });

            this.from = Math.min(from,to);
            this.to = Math.max(from,to);

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

                that.select(from,to);
            }

            function remove() {
                new JSYG(that.textEditor.container).off({
                    "mousemove":mousemove,
                    "mouseup":remove
                });
            }

            new JSYG(this.textEditor.container).on({
                "mousemove":mousemove,
                "mouseup":remove
            });

            return this;
        }

        selectWord(ind) {
        
            this.textEditor.cursor.goTo(ind);
            const word = this.textEditor.cursor.getCurrentWord();
            this.select(word.start,word.end);
        }

        dblclick(e) {
        
            const node = this.textEditor._target;
            if (!node || node.tagName != 'text') return this.hide();
            
            e.preventDefault();
            
            const ind = this.textEditor.getCharFromPos(e);
            
            this.selectWord(ind);
        }

        enable(opt) {
            
            this.disable();
            
            if (opt) { this.set(opt); }
            
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
            
            new JSYG(this.textEditor.container).on("mousedown",start);
            new JSYG(this.textEditor.container).on("dblclick",dblclick);
            
            this.disable = function() {
                this.hide();
                new JSYG(this.textEditor.container).off("mousedown",start);
                new JSYG(this.textEditor.container).off("dblclick",dblclick);
                this.enabled = false;
                return this;
            };
            
            this.enabled = true;
            
            return this;
        }

        disable() { return this; }
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
        else throw new Error(`${size} : valeur incorrecte`);
    }

    class Cursor extends JSYG.StdConstruct {
        constructor(textObject) {
            super(textObject);
            /**
             * référence vers l'objet TextEditor parent
             */
            this.textEditor = textObject;
            
            this.container = new JSYG('<line>')[0];
        }

        goTo(indice) {
            return this.show(indice); 
        }

        setFromPos(e) {
            return this.show( this.textEditor.getCharFromPos(e) ); 
        }

        firstChar() {
            return this.goTo(0);
        }

        lastChar() {
            return this.goTo( this.textEditor._target.getNumberOfChars() );
        }

        nextChar() {
            return this.goTo(this.currentChar + 1);
        }

        prevChar() {
            return this.goTo(this.currentChar - 1);
        }

        insertChar(letter) {
            this.textEditor.insertChars(letter,this.currentChar);
            this.nextChar();
        }

        deleteChar() {
            this.textEditor.deleteChars(this.currentChar);
            this.goTo(this.currentChar);
        }

        getCurrentWord() {
            if (this.currentChar === -1) { return; }

            const str = this.textEditor._target.textContent;
            const start = str.substr(0,this.currentChar).replace(/\w+$/,'').length;
            const match = str.substr(this.currentChar).match(/^\w+/) || [[]];
            const end = match[0].length + this.currentChar;

            return { start, end, content : str.substring(start,end) };
        }

        show(indice) {
            const node = this.textEditor._target;

            if (indice < 0 || indice > node.getNumberOfChars()) { return false; }

            let pt;
            const jNode = new JSYG(node);
            const nbchars = node.getNumberOfChars();
            const fontsize = getFontSize(node);
            let color = jNode.fill();
            const jCont = new JSYG(this.container);

            if (color == "none") color = "black";

            if (nbchars === 0) {
                pt = new JSYG.Vect(jNode.attr("x"),jNode.attr("y"));
            }
            else if (indice === nbchars) { //positionnement tout à la fin
                pt = node.getEndPositionOfChar(indice-1);
            }
            else pt = node.getStartPositionOfChar(indice);

            this.hide();

            jCont.attr({
                x1:pt.x , y1: pt.y + 3,
                x2:pt.x , y2: pt.y + 3 - fontsize
            })
                .css('visibility','visible')
                .css('stroke',color)
                .addClass(this.className)
                .setMtx( jNode.getMtx(this.textEditor.container) )
                .appendTo(this.textEditor.container);

            this.interval = window.setInterval(() => {
                jCont.css( 'visibility', jCont.css('visibility') === 'visible' ? 'hidden' : 'visible' ); 
            },600);

            this.currentChar = indice;
            this.textEditor.selection.from = indice;
            this.textEditor.selection.to = indice;

            this.display = true;

            return this;
        }

        hide() {
        
            window.clearInterval(this.interval);
            
            new JSYG(this.container).detach();
            
            this.display =  false;
            
            return this;
        }

        _mousedown(e) {
            if (e.which != 1) return this;

            const node = this.textEditor._target;
            const pt = new JSYG(node).getCursorPos(e);
            let ind = this.textEditor.getCharFromPos(e);
            let pt1;
            let pt2;

            if (ind===-1) return this;

            pt1 = node.getStartPositionOfChar(ind);
            pt2 = node.getEndPositionOfChar(ind);

            if (pt2.x - pt.x < pt.x - pt1.x) ind++;

            this.goTo(ind);

            return this;
        }

        enable(opt) {
        
            this.disable();
            
            if (opt) { this.set(opt); }
            
            const mousedown = this._mousedown.bind(this);
            
            new JSYG(this.textEditor.container).on("mousedown",mousedown);
            
            this.disable = function() {
                this.hide();
                new JSYG(this.textEditor.container).off('mousedown',mousedown);
                this.enabled = false;
                return this;
            };
        
            this.enabled = true;
            return this;
        }

        disable() { return this; }
    }

    Cursor.prototype.enabled = false;

    Cursor.prototype.display = false;

    Cursor.prototype.currentChar = -1;

    Cursor.prototype.className = 'cursor';

    Cursor.prototype._interval = false;


    function Keyboard(textObject) {
        /**
         * référence vers l'objet TextEditor parent
         */
        this.textEditor = textObject;
    }

    Keyboard.prototype = {
	
        enabled : false,
        
        keys : ['ArrowLeft','ArrowRight','Home','End','Backspace','Delete','Escape','Return','Enter', 'Tab', 'Hiragana','NonConvert'],
        
        _firstPos : null,
        
        _getKey({key, keyCode}) {
          
          if (key) return key;

          switch (keyCode) {
            case 8 : return "Backspace";
            case 13 : return "Return";
            case 27 : return "Escape";
            case 35 : return "End";
            case 36 : return "Home";
            case 37 : return "ArrowLeft";
            case 39 : return "ArrowRight";
            case 46 : return "Delete";
            case 9 : return "Tab";
            default : return String.fromCharCode(keyCode);
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
            
            if (!/^[\w\W]$/.test(key) || e.ctrlKey || (this.textEditor.cursor.display === false && this.textEditor.display === false)) return;
            
            e.preventDefault();
            
            this.textEditor.selection.deleteChars();
            this.textEditor.cursor.insertChar(key);
        },
        
        _keydown(e) {

           if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
               // IME入力中
          	  console.log("ime on");
            } else {
               // IME入力中でない
          	  console.log("ime off");
            }

            if (this.textEditor.cursor.display === false  && this.textEditor.selection.from === false) return;

            const key = this._getKey(e);
            if (!this.keys.includes(key) ) return;

            e.preventDefault();

            const cursor = this.textEditor.cursor;
            const select = this.textEditor.selection;
            const target = this.textEditor._target;

            let //nbchars = target.getNumberOfChars(),
            inverse;

            //début d'une sélection au clavier
            if (e.shiftKey && key != 'Home' && key != 'End' && select.from === select.to) {
                this._firstPos = cursor.currentChar;
            }

            inverse = this._firstPos >= cursor.currentChar;

            console.log("key2", key);
            switch (key) {
                
                case "ArrowLeft" :
                    if (e.shiftKey) {
                        if (select.display) {
                            if (inverse) select.select(select.from-1,select.to);
                            else select.select(select.from,select.to-1);  
                        }
                        else select.select(cursor.currentChar-1,cursor.currentChar);
                    }
                    else { select.hide(); cursor.prevChar(); }
                    break; 
                
                case "ArrowRight" :
                    if (e.shiftKey) {
                        if (select.display) {
                            if (inverse) select.select(select.from+1,select.to);
                            else select.select(select.from,select.to+1);
                        }
                        else select.select(cursor.currentChar,cursor.currentChar+1);
                    }
                    else { select.hide(); cursor.nextChar(); }
                    break;
                
                case "Home" :
                    if (e.shiftKey) select.select(0,select.from);
                    else { select.hide(); cursor.firstChar(); }
                    break; 
                
                case "End" :
                    if (e.shiftKey) select.select(select.from,target.getNumberOfChars());
                    else { select.hide(); cursor.lastChar(); }
                    break; 
                
                case "Backspace" :
                    if (select.display) select.deleteChars();
                    else if (cursor.currentChar > 0) { cursor.prevChar(); cursor.deleteChar(); }
                    break; 
                
                case "Delete" :
                    if (select.display) select.deleteChars();
                    else if (cursor.currentChar >= 0) cursor.deleteChar();
                    break;
                
                //case "Hiragana" :
                case "Tab" :
		    console.log("on Hiragana!!");
                    let text = this.textEditor.getText();
                    console.log(text);

                    this.dialog = document.getElementById('myDialog');
                    //this.openButton = document.getElementById('openDialog');
                    this.closeButton = document.getElementById('closeDialog');
                    this.cancelButton = document.getElementById('cancelDialog');
                    this.textarea = document.getElementById('myTextarea');
                    this.textarea.value = text ;
                    this.textEditor.hide();
                    this.textarea.focus();

                    //this.openButton.addEventListener('click', () => {
                    //  that.dialog.showModal(); 
                    //});

                    this.closeButton.addEventListener('click', () => {
                        console.log("closeButton");
			let text =  this.textarea.value;
                        console.log(text);
                        this.textEditor.setText(text);
                        this.dialog.close(); 
                    });

                    this.cancelButton.addEventListener('click', () => {
                        console.log("cancelButton");
                        this.dialog.close(); 
                    });
/*
                    this.dialog.addEventListener('click', (event) => {
                      if (event.target === this.dialog) {
                        this.dialog.close();
                      }});
*/
                    this.dialog.showModal(); 
                    break;

                case "NonConvert" :
			    console.log("on NonConvert!!");
                    break;

                case "Escape" :
                case "Return" :
                case "Enter" :
                    this.textEditor.hide();
                    break;
            }
        },
        
        enable() {
            
            this.disable();
            
            const fcts = {
                "keydown" : this._keydown.bind(this),
                "keypress" : this._keypress.bind(this),
                "compositionstart" : this._compositionstart.bind(this),    //GUSA
                "compositionupdate" : this._compositionupdate.bind(this),
                "compositionend" : this._compositionend.bind(this)
            };
            
            new JSYG(document).on(fcts);
            
            this.disable = function() {
                new JSYG(document).off(fcts);
                this.enabled = false;
                return this;
            };
            
            this.enabled = true;
            
            return this;
            
        },
        
        disable() { return this; }
        
    };

    JSYG.TextEditor = TextEditor;

    return TextEditor;
});
