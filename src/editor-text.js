vibu.editorText = function (editor) {
    this.editor = editor;

    this.editors = [];
    this.enabledEditor = null;

    this.init = function () {
        let self = this;

        this.editor.on('blocks.block', function (params) {
            let fields = params.block.getFieldsByEditable('text');

            for(let i in fields)
            {
                params.node.find('[vibu-field=' + i + ']').each(function () {
                    self.createEditor($(this));
                });
            }
        });

        this.editor.on('canvas.append-content', function () {
            //self.editor.doc.getCanvasContent().find('.')
        });

        this.editor.on('element.action.edit', function (data) {
            self.enableEditor(self.getAttachedEditor(data.element));
        });

        this.editor.on('element.actionsbox.show', function (data) {
            if(self.hasEditor(data.element))
                data.actionsbox.find('[vibu-element-action="edit"]').show();
            else
                data.actionsbox.find('[vibu-element-action="edit"]').hide();
        });

        this.editor.on('canvas.click', function (data) {
            if(self.enabledEditor === null)
                return;

            let editable = $(data.event.target).closest('[contenteditable]');

            if(editable.length === 0)
            {
                self.disableEditor();
            }
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

    this.enableEditor = function (editor) {
        editor.enable().focus();
        this.enabledEditor = editor;

        this.editor.trigger('text-editor.enabled', {
            editor: editor
        });
    };

    this.disableEditor = function () {
        this.enabledEditor
            .clearSelection()
            .disable();

        this.editor.trigger('text-editor.disabled', {
            editor: this.enabledEditor
        });

        this.enabledEditor = null;
    };

    this.hasEditor = function (element) {
        for(let i = 0; i < this.editors.length; i++)
        {
            if(this.editors[i].isAttachedTo(element))
            {
                return true;
            }
        }

        return false;
    };

    this.getAttachedEditor = function (element) {
        for(let i = 0; i < this.editors.length; i++)
        {
            if(this.editors[i].isAttachedTo(element))
            {
                return this.editors[i];
            }
        }

        return null;
    };
};

vibu.editorText.Editor = function (element, win) {
    this.element = element;
    this.window  = win;
    this.eventDispatcher = null;

    this.create = function () {
        let self = this;
        let elementDocument = this.element.get(0).ownerDocument;

        this.eventDispatcher = new vibu.eventDispatcher;

        this.element.keydown(function (e) {
            // Prevent tab (keyCode = 9) key press
            // (skip to next editable element/editor).
            if(e.keyCode === 9)
            {
                e.preventDefault();
            }

            // Prevent create new element (div, p) on enter.
            // Instead of add line breaker.
            if((e.keyCode || e.witch) == 13)
            {
                e.preventDefault();

                if(navigator.userAgent.indexOf("msie") > 0)
                {
                    insertHtml('<br />');
                }
                else
                {
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

    this.enable = function () {
        this.element.attr('contenteditable', true);

        return this;
    };

    this.disable = function () {
        this.element.removeAttr('contenteditable');

        return this;
    };

    this.focus = function () {
        this.element.trigger('focus');

        return this;
    };

    this.clearSelection = function () {
        this.window.getSelection().removeAllRanges();

        return this;
    };

    this.detectEmptyAndFixHeight = function () {
        let html = this.element.html().replace(/<br[^>]*>/gi, '');

        if($.trim(html) == '')
            this.element.attr('vibu-editor-text-empty', true);
        else
            this.element.removeAttr('vibu-editor-text-empty');
    };

    this.isAttachedTo = function (element) {
        return this.element.is(element);
    };
};
