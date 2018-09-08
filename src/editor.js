vibu.editor = function (selector, options) {
    this.node      = null;
    this.id        = null;
    this.eventDispatcher = null;
    this.options   = options;

    this.loader        = null;
    this.renderer      = null;
    this.messengerRoot = null;
    this.resizer       = null;
    this.selectable    = null;
    this.heightWatcher = null;
    this.doc           = null;
    this.editorText    = null;
    this.ui            = null;
    this.styles        = null;
    this.blocks        = null;
    this.canvas        = null;

    this.init = function () {
        let self = this;

        this.id      = vibu.generateId();
        this.options = $.extend({}, vibu.editor.defaults, this.options);
        this.node    = $(selector);
        this.eventDispatcher = new vibu.eventDispatcher;

        this.renderer   = new vibu.editorRenderer(this);
        this.resizer    = new vibu.resizer(this);
        this.selectable = new vibu.selectable(this);
        this.doc        = new vibu.doc(this);
        this.editorText = new vibu.editorText(this);
        this.ui         = new vibu.ui(this);
        this.styles     = new vibu.styles(this);
        this.blocks     = new vibu.blocks(this);
        this.canvas     = new vibu.canvas(this);
        this.heightWatcher = new vibu.canvasHeightWatcher(this);

        this.loader = new vibu.loader();

        this.canvas.init();
        this.renderer.init();
        this.styles.init();
        this.selectable.init();
        this.resizer.init();
        this.ui.init();
        this.heightWatcher.init();
        this.blocks.init();
        this.editorText.init();

        this.trigger('editor.init');

        this.canvas.load(this.loader);
        this.renderer.load(this.loader);
        this.styles.load(this.loader);
        this.selectable.load(this.loader);
        this.resizer.load(this.loader);
        this.ui.load(this.loader);
        this.heightWatcher.load(this.loader);
        this.blocks.load(this.loader);
        this.editorText.load(this.loader);

        /*this.on('content-ready', function () {
            self.trigger('editor.created');

            self.setContent(self.options.contents);
        });*/

        this.loader.load(function () {
            self.trigger('editor.ready');
            self.options.setup(self);
            self.setContent(self.options.contents);
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

    this.setContent = function (content) {
        this.canvas.setContent(content);

        return this;
    };

    this.getContent = function () {
        return this.canvas.getContent();
    };

    this.on = function (event, handler, priority) {
        this.eventDispatcher.on(event, handler, priority);
    };

    this.onReady = function (handler, priority) {
        this.eventDispatcher.on('editor.ready', handler, priority);
    };

    this.onCreated = function (handler, priority) {
        this.eventDispatcher.on('editor.created', handler, priority);
    };

    this.trigger = function (event, params) {
        this.eventDispatcher.trigger(event, params);
    };

    this.getBasepath = function () {
        return 'http://localhost/vibu-visual-builder/src';
    };

    this.createAssetPath = function (path) {
        return 'http://localhost/vibu-visual-builder/src' + path;
    };

    this.addBlock = function (name) {
        this.trigger('entry-method.add-block', { name: name });
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
     * List of CSS frameworks that are included to the editor.
     * Blocks are included only if they supports any of these frameworks.
     * This should also include Icon Fonts!
     * Remember to add framework major number, ie.
     * - bootstrap-4, foundation-5, font-awesome-5
     */
    frameworks: [ 'bootstrap-4' ],
    /**
     * Setup function called after finishing editor setup.
     */
    setup: function (editor) {}
};
