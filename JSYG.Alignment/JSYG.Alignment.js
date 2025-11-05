import JSYG                from "../JSYG-wrapper/JSYG-wrapper.js"
import StdConstruct        from "../JSYG.StdConstruct/JSYG.StdConstruct.js"

export class Alignment extends StdConstruct {
    constructor(arg) {
            super();     
            this.list = arg;
        }

    getGlobalDim() {
        
        const globalDim = {
            left:Infinity,
            top:Infinity,
            bottom:-Infinity,
            right:-Infinity
        };
        
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;
                
        list.each(function() {
            
            if (this.parentNode != parent) throw new Error("Les éléments de la collection doivent partager le même parent");
            
            const dim = new JSYG(this).getDim(parent);
            
            if (dim.x < globalDim.left) globalDim.left = dim.x;
            if (dim.y < globalDim.top) globalDim.top = dim.y;
            if (dim.x + dim.width > globalDim.right) globalDim.right = dim.x + dim.width;
            if (dim.y + dim.height > globalDim.bottom) globalDim.bottom = dim.y + dim.height;
            
        });
        
        return {
            x : globalDim.left,
            y : globalDim.top,
            width : globalDim.right - globalDim.left,
            height : globalDim.bottom - globalDim.top,
        };
    }

    getCenter() {
        
        const globalDim = this.getGlobalDim();
        return new JSYG.Vect( globalDim.x+globalDim.width/2, globalDim.y+globalDim.height/2 );
    }

    alignLeft() {
        const globalDim = this.getGlobalDim();
        const left = globalDim.x;
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.setDim({x:left,from:parent});

        this.trigger("align");
        this.trigger("alignleft",null,left);

        return this;
    }

    alignCenter() {
        const center = this.getCenter();
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.each(function() {
            const $this = new JSYG(this);
            const mtx = $this.getMtx().inverse();
            const dim = $this.getDim();
            const dimP = $this.getDim(parent);
            const pt1 = new JSYG.Vect(dimP.x+dimP.width/2,0).mtx(mtx);
            const pt2 = new JSYG.Vect(center.x,0).mtx(mtx);

            $this.setDim({
                x : dim.x + pt2.x - pt1.x,
                y : dim.y + pt2.y - pt1.y
            });
        });

        this.trigger("align");
        this.trigger("aligncenter",null,center.x);

        return this;
    }

    alignRight() {
        const globalDim = this.getGlobalDim();
        const right = globalDim.x + globalDim.width;
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.each(function() {
            const $this = new JSYG(this);
            const mtx = $this.getMtx().inverse();
            const dim = $this.getDim();
            const dimP = $this.getDim(parent);
            const pt1 = new JSYG.Vect(dimP.x,0).mtx(mtx);
            const pt2 = new JSYG.Vect(right - dimP.width,0).mtx(mtx);

            $this.setDim({
                x : dim.x + pt2.x - pt1.x,
                y : dim.y + pt2.y - pt1.y
            });
        });

        this.trigger("align");
        this.trigger("alignright",null,right);

        return this;
    }

    alignTop() {
        const top = this.getGlobalDim().y;
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.each(function() {
            const $this = new JSYG(this);
            const mtx = $this.getMtx().inverse();
            const dim = $this.getDim();
            const dimP = $this.getDim(parent);
            const pt1 = new JSYG.Vect(0,dimP.y).mtx(mtx);
            const pt2 = new JSYG.Vect(0,top).mtx(mtx);

            $this.setDim({
                x : dim.x + pt2.x - pt1.x,
                y : dim.y + pt2.y - pt1.y
            });
        });

        this.trigger("align");
        this.trigger("aligntop",null,top);

        return this;
    }

    alignMiddle() {
        const center = this.getCenter();
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.each(function() {
            const $this = new JSYG(this);
            const mtx = $this.getMtx().inverse();
            const dim = $this.getDim();
            const dimP = $this.getDim(parent);
            const pt1 = new JSYG.Vect(0,dimP.y+dimP.height/2).mtx(mtx);
            const pt2 = new JSYG.Vect(0,center.y).mtx(mtx);

            $this.setDim({
                x : dim.x + pt2.x - pt1.x,
                y : dim.y + pt2.y - pt1.y
            });
        });

        this.trigger("align");
        this.trigger("alignmiddle",null,center.y);

        return this;
    }

    alignBottom() {
        const dim = this.getGlobalDim();
        const bottom = dim.y + dim.height;
        const list = new JSYG(this.list);
        const parent = list[0].parentNode;

        list.each(function() {
            const $this = new JSYG(this);
            const mtx = $this.getMtx().inverse();
            const dim = $this.getDim();
            const dimP = $this.getDim(parent);
            const pt1 = new JSYG.Vect(0,dimP.y).mtx(mtx);
            const pt2 = new JSYG.Vect(0,bottom-dimP.height).mtx(mtx);

            $this.setDim({
                x : dim.x + pt2.x - pt1.x,
                y : dim.y + pt2.y - pt1.y
            });
        });

        this.trigger("align");
        this.trigger("alignbottom",null,bottom);

        return this;
    }
}

Alignment.prototype.onalign = null;

Alignment.prototype.onalignleft = null;
Alignment.prototype.onaligncenter = null;
Alignment.prototype.onalignright = null;

Alignment.prototype.onaligntop = null;
Alignment.prototype.onalignmiddle = null;
Alignment.prototype.onalignbottom = null;

Alignment.prototype.list = null;

const aligns = ['top','bottom','left','right','center','middle'];

JSYG.prototype.align = function(alignment) {
    
    if (!aligns.includes(alignment.toLowerCase())) throw new Error(`${alignment} : argument incorrect (${aligns.join()} requis)`);
    
    const method = `align${alignment.charAt(0).toUpperCase()}${alignment.substr(1)}`;
    
    new Alignment(this)[method]();
};


