vibu.parser = function (editor) {
    this.editor = editor;

    this.tags = [
        /**
         * Image <img /> replacement
         */
        { name: 'vibu-editable-image' },
        /**
         * Background image replacement.
         */
        { name: 'vibu-editable-background-image' },
        /**
         * Editable text (simple, without WYSIWYG editor)
         */
        { name: 'vibu-editable-text' },
        /**
         * Editable text with WYSIWYG editor
         */
        { name: 'vibu-editable-wysiwyg' },
        /**
         * Links (A element) replacement
         */
        { name: 'vibu-editable-link' },
        /**
         * Custom editable options. Need custom plugin to display options in styles sidebar.
         */
        { name: 'vibu-editable-custom' }
    ];

    this.registerTag = function (tag) {
        this.tags.push(tag);

        return this;
    };

    this.parse = function (node) {
        let self = this;

        for(let i = 0; i < this.tags.length; i++)
        {
            node.find('[' + this.tags[i].name + ']').each(function () {
                self.editor.trigger('parser.tag', {
                    tag    : self.tags[i],
                    element: vibuJquery(this)
                });
            });
        }
    };
};
