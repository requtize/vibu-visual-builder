vibu.editorRenderer = function () {
    this.render = function (editor) {
        let id   = editor.getId();
        let base = vibu.getVibuBase();
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

        /*container.find('iframe').each(function () {
            $(this).attr('src', base + '/' + $(this).attr('src'));
        });*/

        editor.getNode().append(container);

        /*let iframe = container.find('iframe');

        iframe.ready(function() {
            console.log(iframe.contents().find('body'));
            iframe.contents().find('body').html(editor.options.contents);
        });*/
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
                + '<div class="ui form">'
                    + '<div class="ui stacked segment">'
                        + '<div class="field" vibu-selectable-control="core/image">'
                            + '<label>Obrazek</label>'
                            + '<div class="fields">'
                                + '<div class="ui fluid action input">'
                                    + '<input type="text" placeholder="Obrazek...">'
                                    + '<button class="ui icon button">'
                                        + '<i class="folder open icon"></i>'
                                    + '</button>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                + '</div>'
            + '</div>'
        + '</div>'
    + '</div>'
+ '</div>';
