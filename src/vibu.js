const vibu = {
    activeEditor: null,
    editors: [],
    getEditor: function (id) {
        for(let i = 0; i < this.editors; i++)
        {
            if(this.editors[i].getId() == id)
            {
                this.editors[i];
            }
        }
    },
    create: function (selector, options) {
        let editor = new vibu.editor(selector, options);

        editor.init();

        return vibu.activeEditor = editor;
    },
    createPartCanvas: function () {
        let id = this.getQueryParameterByName('vibu-id');

        let canvas = new vibu.editorPartCanvas(id);
        canvas.init();

        return canvas;
    },
    createPartBlocks: function () {

    },
    createPartStyles: function () {

    },
    getQueryParameterByName: function(name, url) {
        if(! url)
            url = window.location.href;

        name = name.replace(/[\[\]]/g, '\\$&');

        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);

        if(! results)
            return null;

        if(! results[2])
            return '';

        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
    generateId: function () {
        return 'vibu-' + Math.random().toString(36).substr(2, 9);
    },
    /**
     * Functions taken from: https://stackoverflow.com/a/13382873/4583637
     */
    getScrollbarWidth: function () {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.msOverflowStyle = 'scrollbar';

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        outer.style.overflow = 'scroll';

        var inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);        

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    }
};
