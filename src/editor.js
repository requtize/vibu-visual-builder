vibu.editor = function (selector, options) {
    this.node      = null;
    this.id        = null;
    this.eventDispatcher = null;
    this.options   = options;
    this.renderer  = null;
    this.messenger = null;
    this.messengerRoot = null;
    this.resizer = null;
    this.selectable = null;

    this.init = function () {
        let self = this;

        this.id = vibu.generateId();
        this.options = vibuJquery.extend({}, vibu.editor.defaults, this.options);
        this.node = vibuJquery(selector);
        this.eventDispatcher = new vibu.eventDispatcher;

        this.renderer = new vibu.editorRenderer();

        this.messenger = new vibu.messenger('root', this.getId(), this.eventDispatcher);

        this.resizer = new vibu.resizer(this);

        this.selectable = new vibu.selectablePreview(this);

        this.messenger.receive('canvas-height-change', function (data) {
            self.eventDispatcher.trigger('canvas-height-change', data);
        });

        this.messenger.receive('canvas.ready', function () {
            self.messenger.send('canvas', 'editor.options', {
                viewMode     : self.options.viewMode,
                inplaceHeight: self.options.inplaceHeight,
                blocksActive : self.options.blocksActive,
                stylesActive : self.options.stylesActive,
                responsive   : self.options.responsive,
                contents     : self.options.contents,
                contentCss   : self.options.contentCss,
                contentJs    : self.options.contentJs,
                blocks       : self.options.blocks,
                plugins      : self.options.plugins
            });
        });

        this.messenger.init();
        this.renderer.render(this);
        this.selectable.init();
        this.resizer.init();

        this.messenger.registerMessagesWindow('canvas', this.node.find('.vibu-canvas iframe'));
        this.messenger.registerMessagesWindow('styles', this.node.find('.vibu-sidebar-styles iframe'));
        this.messenger.registerMessagesWindow('blocks', this.node.find('.vibu-sidebar-blocks iframe'));

        this.options.setup(this);

        this.trigger('editor.created');

        /*window.onbeforeunload = function(e) {
            var dialogText = 'Dialog text here';
            e.returnValue = dialogText;
            return dialogText;
        };*/
    };

    this.getNode = function () {
        return this.node;
    };

    this.getId = function () {
        return this.id;
    };

    this.on = function (event, handler) {
        this.eventDispatcher.on(event, handler);
    };

    this.trigger = function (event, params) {
        this.eventDispatcher.trigger(event, params);
    };
}

vibu.editor.defaults = {
    /**
     * View mode defines how editor window should be rendered.
     * - fullscreen - Hovers all body in website.
     * - inplace    - Is places in place of calling, ie. in some DIV.
     */
    viewMode: 'fullscreen',
    /**
     * Height of the editor in pixels, or 'auto' to update
     * dynamically due to canvas content's height.
     */
    inplaceHeight: 'auto',
    /**
     * Tells if blocks sidebar has to be active,
     * and if blocks must be able to move it's positions.
     */
    blocksActive: true,
    /**
     * Tells if styles sidebar should be active.
     */
    stylesActive: true,
    /**
     * Tells if responsive options (buttons) sholud be visible.
     */
    responsive: true,
    /**
     * Store contents to edit.
     */
    contents: '',
    contentCss: [],
    contentJs: [],
    /**
     * List of available blocks that user can place into canvas.
     * Empty array means none. 'null' means all registered.
     */
    blocks: null,
    /**
     * List of available pluigns attached to this editor instance.
     * Empty array means none. 'null' means all registered.
     */
    plugins: null,
    /**
     * Setup function called after finishing editor setup.
     */
    setup: function (editor) {}
};
