vibu.editorText = function (editor) {
    this.editor = editor;

    this.editors = [];

    this.init = function () {
        let self = this;

        this.editor.on('blocks.block', function (params) {
            let fields = params.block.getFieldsByEditable('text');

            for(let i in fields)
            {
                params.node.find('[vibu-editable=' + i + ']').attr('vibu-selectable', true).each(function () {
                    self.createEditor($(this));
                });
            }
        });

        this.editor.on('canvas.append-content', function () {
            //self.editor.doc.getCanvasContent().find('.')
        });
    };

    this.load = function (onLoad) {};

    this.createEditor = function (element) {
        let self = this;

        let editor = new vibu.editorText.Editor(element, this.editor.canvas.getWindow());
        editor.create();

        editor.eventDispatcher.on('element.update', function () {
            self.editor.selectable.updateActiveElement();
            self.editor.selectable.updateHoveredElement();
        });

        this.editors.push(editor);
    };
};

vibu.editorText.Editor = function (element, win) {
    this.element = element;
    this.window  = win;
    this.editor  = null;
    this.eventDispatcher = null;

    this.create = function () {
        let self = this;
        let elementDocument = this.element.get(0).ownerDocument;

        this.eventDispatcher = new vibu.eventDispatcher;

        this.element.attr('contenteditable', true).keydown(function (e) {
            // Prevent tab (keyCode = 9) key press
            // (skip to next editable element/editor).
            if(e.keyCode === 9)
            {
                e.preventDefault();
            }

            // Prevent create new element (div, p) on enter.
            // Instead of add line breaker.
            if( ( e.keyCode || e.witch ) == 13 ) {
                e.preventDefault();

                if( navigator.userAgent.indexOf("msie") > 0 ) {
                    insertHtml('<br />');
                }
                else {
                  var selection = self.window.getSelection(),
                  range = selection.getRangeAt(0),
                  br    = elementDocument.createElement('br');

                  range.deleteContents();
                  range.insertNode(br);
                  range.setStartAfter(br);
                  range.setEndAfter(br);
                  range.collapse(false);

                  selection.removeAllRanges();
                  selection.addRange(range);
                }
            }

            self.detectEmptyAndFixHeight();
        }).keyup(function (e) {
            self.detectEmptyAndFixHeight();
            self.eventDispatcher.trigger('element.update');
        });
    };

    this.detectEmptyAndFixHeight = function () {
        let html = this.element.html().replace(/<br[^>]*>/gi, '');

        if($.trim(html) == '')
            this.element.attr('vibu-editor-text-empty', true);
        else
            this.element.removeAttr('vibu-editor-text-empty');
    };
};
