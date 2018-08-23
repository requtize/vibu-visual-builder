vibu.editor = function (selector, options) {
    this.node      = null;
    this.id        = null;
    this.eventDispatcher = null;
    this.options   = options;
    this.renderer  = null;
    this.messengerRoot = null;
    this.resizer = null;
    this.selectable = null;
    this.heightWatcher = null;
    this.doc = null;
    this.parser = null;
    this.editorText = null;
    this.ui = null;
    this.styles = null;

    this.init = function () {
        let self = this;

        this.id = vibu.generateId();
        this.options = $.extend({}, vibu.editor.defaults, this.options);
        this.node = $(selector);
        this.eventDispatcher = new vibu.eventDispatcher;

        this.renderer   = new vibu.editorRenderer();
        this.resizer    = new vibu.resizer(this);
        this.selectable = new vibu.selectable(this);
        this.doc        = new vibu.doc(this);
        this.parser     = new vibu.parser(this);
        this.editorText = new vibu.editorText(this);
        this.ui         = new vibu.ui(this);
        this.styles     = new vibu.styles(this);

        this.editorText.init();
        this.renderer.render(this);

        this.heightWatcher = new vibu.canvasHeightWatcher(this.node.find('iframe'));
        this.heightWatcher.onChange(function (height) {
            self.eventDispatcher.trigger('canvas-height-change', {
                height: height
            });
        });

        this.options.setup(this);

        this.on('content-ready', function () {
            self.styles.init();
            self.selectable.init();
            self.resizer.init();
            self.ui.init();
            self.parser.parse(self.doc.getCanvasContent());
            self.trigger('editor.created');
        });

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
