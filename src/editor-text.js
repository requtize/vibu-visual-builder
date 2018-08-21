vibu.editorText = function (canvas) {
    this.canvas = canvas;

    this.editors = [];

    this.init = function () {
        let self = this;

        this.canvas.on('parser.tag', function (data) {
            if(data.tag.name == 'vibu-editable-text')
            {
                self.createEditor(data.element);
            }
        });
    };

    this.createEditor = function (element) {
        let self = this;

        let editor = new vibu.editorText.Editor(element);
        editor.create();

        editor.eventDispatcher.on('element.update', function () {
            self.canvas.selectable.updateActiveElement();
            self.canvas.selectable.updateHoveredElement();
        });

        this.editors.push(editor);
    };
};

vibu.editorText.Editor = function (element) {
    this.element = element;
    this.eventDispatcher = null;
    this.editor = null;

    this.create = function () {
        let self = this;

        this.eventDispatcher = new vibu.eventDispatcher;

        this.element.attr('contenteditable', true).keypress(function(e) {
            if(e.which == 13)
            {
                document.execCommand('insertHTML', false, '<br />');
                event.preventDefault();
            }
        }).keydown(function (e) {
            // Prevent tab (keyCode = 9) key press
            // (skip to next editable element/editor).
            if(event.keyCode === 9)
                event.preventDefault();

            self.detectEmptyAndFixHeight();
        }).keyup(function () {
            self.detectEmptyAndFixHeight();
            self.eventDispatcher.trigger('element.update');
        });
    };

    this.detectEmptyAndFixHeight = function () {
        if(vibuJquery.trim(this.element.html()) == '')
            this.element.attr('vibu-editor-text-empty', true);
        else
            this.element.removeAttr('vibu-editor-text-empty');
    };
};
