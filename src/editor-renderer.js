vibu.editorRenderer = function () {
    this.render = function (editor) {
        let id   = editor.getId();
        let options = editor.options;

        let container = $(vibu.editorRenderer.container);

        if(options.blocksActive === false)
            container.find('.vibu-sidebar-blocks').remove();
        else
            container.find('.vibu-visual-builder').addClass('vibu-has-sidebar-blocks');

        if(options.stylesActive === false)
            container.find('.vibu-sidebar-styles').remove();
        else
            container.find('.vibu-visual-builder').addClass('vibu-has-sidebar-styles');

        if(options.responsive === false)
            container.find('.vibu-topbar').remove();
        else
            container.find('.vibu-visual-builder').addClass('vibu-has-topbar');

        if(options.viewMode == 'fullscreen')
            container.addClass('vibu-container-fixed');
        else
            container.addClass('vibu-container-inplace');

        if(options.viewMode == 'inplace')
        {
            if(options.inplaceHeight == 'auto' || options.inplaceHeight == null)
            {
                editor.eventDispatcher.on('canvas-height-change', function (data) {
                    container.css('height', data.height + 'px');
                });
            }
            else
            {
                container.css('height', options.inplaceHeight + 'px');
            }
        }

        editor.getNode().append(container);

        let iframe = editor.getNode().find('iframe');

        iframe.ready(function() {
            let body = iframe.contents().find('body');
            let head = iframe.contents().find('head');

            for(let i = 0; i < editor.options.contentCss.length; i++)
                head.append('<link rel="stylesheet" type="text/css" href="' + editor.options.contentCss[i] + '" />');
            for(let i = 0; i < editor.options.contentJs.length; i++)
                head.append('<script src="' + editor.options.contentJs[i] + '"></script>');

            if(editor.options.viewMode == 'inplace' && editor.options.inplaceHeight == 'auto')
                body.addClass('vibu-prevent-scroll');

            head.append('<meta charset="utf-8">');
            head.append('<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">');
            head.append('<style>body:hover,\
            body *:hover {cursor:default !important;}\
            body *[vibu-selectable]:hover,\
            body *[vibu-selectable] *:hover {cursor:pointer !important;}\
            body *[vibu-editable-text]:hover,\
            body *[vibu-editable-text] *:hover {cursor:text !important;}\
            .vibu-prevent-scroll {overflow:hidden !important;}\
            [vibu-editor-text-empty] {min-height:12px;min-width:20px;max-width:100%;display:inline-block;}</style>');

            body.html(editor.options.contents);

            editor.trigger('content-ready');
        });
    };
};


vibu.editorRenderer.container = '<div class="vibu-container">'
    + '<div class="vibu-visual-builder">'
        + '<div class="vibu-topbar">'
            + '<div class="vibu-fake-device-selector">'
                + '<button type="button" class="vibu-btn vibu-btn-device vibu-btn-device-desktop vibu-btn-active" data-vibu-resize="desktop"></button>'
                + '<button type="button" class="vibu-btn vibu-btn-device vibu-btn-device-tablet-horizontal" data-vibu-resize="tablet-horizontal"></button>'
                + '<button type="button" class="vibu-btn vibu-btn-device vibu-btn-device-tablet-vertical" data-vibu-resize="tablet-vertical"></button>'
                + '<button type="button" class="vibu-btn vibu-btn-device vibu-btn-device-smartphone-horizontal" data-vibu-resize="smartphone-horizontal"></button>'
                + '<button type="button" class="vibu-btn vibu-btn-device vibu-btn-device-smartphone-vertical" data-vibu-resize="smartphone-vertical"></button>'
            + '</div>'
        + '</div>'
        + '<div class="vibu-sidebar vibu-sidebar-blocks">'
            + '<div class="vibu-sidebar-inner">'
                + 'Blocks'
            + '</div>'
        + '</div>'
        + '<div class="vibu-canvas">'
            + '<div class="vibu-canvas-device-faker" data-device="desktop">'
                + '<div class="vibu-element-boundaries vibu-element-boundaries-active vibu-hidden">'
                    + '<div class="vibu-node-name">h2</div>'
                + '</div>'
                + '<div class="vibu-element-boundaries vibu-element-boundaries-hover vibu-hidden"></div>'
                + '<iframe class="vibu-iframe"></iframe>'
            + '</div>'
        + '</div>'
        + '<div class="vibu-sidebar vibu-sidebar-styles">'
            + '<div class="vibu-sidebar-inner">'
                + '<div class="vibu-controls-group">'
                    /*+ '<div class="vibu-form-group">'
                        + '<button class="vibu-btn vibu-btn-icon-only" type="button"><i class="far fa-folder-open"></i> Jakaś akcja</button>'
                    + '</div>'
                    + '<div class="vibu-form-group">'
                        + '<label class="vibu-label">Label text</label>'
                        + '<div class="vibu-input-group">'
                            + '<input type="text" class="vibu-form-control" />'
                            + '<div class="vibu-input-group-append">'
                                + '<button class="vibu-btn vibu-dropdown-toggle" type="button">Dropdown</button>'
                                + '<div class="vibu-dropdown-menu">'
                                    + '<a class="vibu-dropdown-item" href="#">Action</a>'
                                    + '<a class="vibu-dropdown-item" href="#">Another action</a>'
                                    + '<a class="vibu-dropdown-item" href="#">Something else here</a>'
                                    + '<div role="separator" class="vibu-dropdown-divider"></div>'
                                    + '<a class="vibu-dropdown-item" href="#">Separated link</a>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>'*/
                + '</div>'
            + '</div>'
        + '</div>'
    + '</div>'
+ '</div>';
