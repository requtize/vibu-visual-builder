vibu.editorText = function (editor) {
    this.editor = editor;

    this.editors = [];

    this.init = function () {
        let self = this;

        this.editor.on('parser.tag', function (data) {
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
            self.editor.selectable.updateActiveElement();
            self.editor.selectable.updateHoveredElement();
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
        let elementDocument = this.element.get(0).ownerDocument;

        this.eventDispatcher = new vibu.eventDispatcher;

        this.element.attr('contenteditable', true).keypress(function(e) {
            if(e.which == 13)
            {
                elementDocument.execCommand('insertHTML', false, '<br />');
                e.preventDefault();
            }
        }).keydown(function (e) {
            // Prevent tab (keyCode = 9) key press
            // (skip to next editable element/editor).
            if(e.keyCode === 9)
                e.preventDefault();

            self.detectEmptyAndFixHeight();
        }).keyup(function () {
            self.detectEmptyAndFixHeight();
            self.eventDispatcher.trigger('element.update');
        });
    };

    this.detectEmptyAndFixHeight = function () {
        if($.trim(this.element.html()) == '')
            this.element.attr('vibu-editor-text-empty', true);
        else
            this.element.removeAttr('vibu-editor-text-empty');
    };
};
