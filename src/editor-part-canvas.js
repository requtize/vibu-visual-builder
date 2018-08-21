vibu.editorPartCanvas = function (id) {
    this.id = id;
    this.eventDispatcher = null;
    this.messenger = null;
    this.selectable = null;
    this.doc = null;
    this.node = null;
    this.parser = null;
    this.heightWatcher = null;
    this.editorText = null;
    this.options = null;

    this.init = function () {
        let self = this;

        this.node = $('body');

        this.eventDispatcher = new vibu.eventDispatcher;

        this.messenger = new vibu.messenger('canvas', this.getId(), this.eventDispatcher);

        this.selectable = new vibu.selectableCanvas(this);

        this.doc = new vibu.doc(this);
        this.parser = new vibu.parser(this);
        this.editorText = new vibu.editorText(this);

        let body = $(editor.getNode().find('.vibu-canvas iframe').get(0).contentWindow.body)

        this.heightWatcher = new vibu.canvasHeightWatcher(body);
        this.heightWatcher.onChange(function (height) {
            self.messenger.send('root', 'canvas-height-change', {
                height: height
            });
        });

        this.messenger.init();

        this.editorText.init();

        this.messenger.receive('editor.options', function (options) {
            self.options = options;

            if(self.options.viewMode == 'inplace' && self.options.inplaceHeight == 'auto')
            {
                self.node.addClass('vibu-prevent-scroll');
            }

            let head = $('head');

            for(let i = 0; i < self.options.contentCss.length; i++)
                head.append('<link rel="stylesheet" type="text/css" href="' + self.options.contentCss[i] + '" />');
            for(let i = 0; i < self.options.contentJs.length; i++)
                head.append('<script src="' + self.options.contentJs[i] + '"></script>');

            self.node.html(self.options.contents);

            self.selectable.init();
            self.parser.parse(self.node);
        });

        self.messenger.send('root', 'canvas.ready');
    };

    this.getId = function () {
        return this.id;
    };

    this.getNode = function () {
        return this.node;
    };

    this.on = function (event, handler) {
        this.eventDispatcher.on(event, handler);
    };

    this.trigger = function (event, params) {
        this.eventDispatcher.trigger(event, params);
    };
};
