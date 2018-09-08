vibu.editorText = function (editor) {
    this.editor = editor;

    this.editors = [];
    this.enabledEditor = null;

    this.init = function () {
        let self = this;

        this.editor.on('blocks.block block.update-rerender', function (data) {
            self.createEditors(data, 'text');
            self.createEditors(data, 'text-inline');
            self.createEditors(data, 'wysiwyg');
        });

        this.editor.on('canvas.append-content', function () {
            //self.editor.doc.getCanvasContent().find('.')
        });

        this.editor.on('element.action.edit-text', function (data) {
            let editor = self.getAttachedEditor(data.element);

            if(editor)
                self.enableEditor(editor);
        });

        this.editor.on('element.actionsbox.show', function (data) {
            if(self.hasEditor(data.element))
                data.actionsbox.find('[vibu-element-action="edit-text"]').show();
            else
                data.actionsbox.find('[vibu-element-action="edit-text"]').hide();
        });
    };

    this.load = function (onLoad) {};

    this.createEditors = function (data, mode) {
        let self   = this;
        let fields = data.block.getFieldsByEditable(mode);

        for(let i in fields)
        {
            data.node.find('[vibu-field=' + i + ']').each(function () {
                self.createEditor($(this), mode);
            });
        }
    };

    this.createEditor = function (element, mode) {
        if(element.attr('vibu.texteditor.created'))
            return;

        let self = this;

        let editor = new vibu.editorText.Editor(this.editor, element, mode);
        editor.create();

        editor.eventDispatcher.on('element.update', function () {
            self.editor.selectable.updateActiveElement();
            self.editor.selectable.updateHoveredElement();
        });

        this.editors.push(editor);

        element.attr('vibu.texteditor.created', true);
    };

    this.enableEditor = function (editor) {
        this.editor.trigger('element.actionsbox.disable');
        this.editor.selectable.blockCurrentState();
        // @todo - Add disable/enable movable and droppable

        editor.enable().focus();
        this.enabledEditor = editor;

        this.editor.trigger('text-editor.enabled', {
            editor: editor
        });
    };

    this.disableEditor = function () {
        this.editor.trigger('element.actionsbox.enable');
        this.editor.selectable.unblockCurrentState();
        // @todo - Add disable/enable movable and droppable

        this.enabledEditor
            .clearSelection()
            .disable();

        this.editor.trigger('text-editor.disabled', {
            editor: this.enabledEditor
        });

        this.editor.selectable.select(this.enabledEditor.getElement());
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

vibu.editorText.Editor = function (editor, element, mode) {
    this.editor  = editor;
    this.element = element;
    this.mode    = mode;
    this.toolbar = null;
    this.window  = editor.canvas.getWindow();
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

        this.toolbar = $('<div class="vibu-texteditor-toolbar vibu-hidden">\
            <div class="vibu-texteditor-control vibu-texteditor-control-save" vibu-texteditor-action="save" vibu-tooltip title="Zakończ edycję tekstu"><i class="fas fa-check"></i></div>\
        </div>');

        if(this.mode != 'text')
        {
            this.toolbar.prepend('\
                <div vibu-texteditor-action="bold" vibu-tooltip title="Pogrubienie"><i class="fas fa-bold"></i></div>\
                <div vibu-texteditor-action="italic" vibu-tooltip title="Kursywa"><i class="fas fa-italic"></i></div>\
                <div vibu-texteditor-action="strike" vibu-tooltip title="Przekreślenie"><i class="fas fa-strikethrough"></i></div>\
                <div vibu-texteditor-action="underline" vibu-tooltip title="Podkreślenie"><i class="fas fa-underline"></i></div>\
                <div vibu-texteditor-action="link" vibu-tooltip title="Wstaw/edytuj link"><i class="fas fa-link"></i></div>\
                <div vibu-texteditor-action="unlink" vibu-tooltip title="Usuń link"><i class="fas fa-unlink"></i></div>\
            ');
        }

        this.toolbar.appendTo(this.editor.getNode().find('.vibu-canvas-device-faker'));
        this.toolbar.click(function (e) {
            e.stopPropagation();
        });

        this.toolbar.on('click', '[vibu-texteditor-action]', function () {
            switch($(this).attr('vibu-texteditor-action'))
            {
                case 'bold':
                    elementDocument.execCommand('bold', false, null);
                    break;
                case 'italic':
                    elementDocument.execCommand('italic', false, null);
                    break;
                case 'strike':
                    elementDocument.execCommand('strikeThrough', false, null);
                    break;
                case 'underline':
                    elementDocument.execCommand('underline', false, null);
                    break;
                case 'save':
                    self.editor.editorText.disableEditor();
                    break;
            }

            self.editor.canvas.getWindow().focus();
        });
    };

    this.getElement = function () {
        return this.element;
    };

    this.enable = function () {
        this.element.attr('contenteditable', true);
        this.toolbar.removeClass('vibu-hidden');

        let boundaries = this.editor.doc.getElementBoundaries(this.element);

        this.toolbar.css({
            left: boundaries.left,
            top:  boundaries.top - boundaries.scrollTop
        });

        return this;
    };

    this.disable = function () {
        this.element.removeAttr('contenteditable');
        this.toolbar.addClass('vibu-hidden');

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


/**
 * Empty text style control is required to allow elements to be edited by
 * text editor. Text editor check if element has editable 'text', but blocks
 * module removes all editables from field when attached controls
 * does not exists.
 */
// text - only text edition, without any edit options
vibu.styles.control('text', function () {
    return {};
});
// text-inline - text with only inline edit options, like bold, strike,
// but without formats, links etc.
vibu.styles.control('text-inline', function () {
    return {};
});
// wysiwyg - Full editor, with all possible edit options.
vibu.styles.control('wysiwyg', function () {
    return {};
});
