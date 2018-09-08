vibu.selectable = function (editor) {
    this.editor = editor;

    this.selectedElement = null;
    this.hoveredElement = null;

    this.selectedLayer = null;
    this.hoveredLayer  = null;

    this.disabled = false;
    this.blocked = false;

    this.init = function () {
        let self = this;

        this.editor.on('editor.ready', function () {
            self.initAfterEditorReady();
        }, 100);

        this.editor.on('blocks.block block.update-rerender', function (data) {
            let nodes = data.node.find('[vibu-selectable]');

            if(data.node.attr('vibu-selectable'))
                nodes = nodes.add(data.node);

            nodes.each(function () {
                if($(this).data('vibu.selectable.done'))
                    return;

                self.bindElementHoverEvents($(this));
                self.bindElementClickEvents($(this));

                $(this).data('vibu.selectable.done', true);
            });
        }, 100);

        self.editor.on('selectable.hovered.on', function (data) {
            self.hoveredElement = self.editor.doc.findSelectableElement(data.element);

            /**
             * We dont hover active element.
             */
            if(self.selectedElement && self.hoveredElement.is(self.selectedElement))
                return;

            self.hoveredLayer
                .removeClass('vibu-hidden')
                .css({
                    width : data.boundaries.width,
                    height: data.boundaries.height,
                    left  : data.boundaries.left,
                    top   : data.boundaries.top - data.boundaries.scrollTop
                });
        });

        self.editor.on('selectable.hovered.update-boundaries', function (data) {
            if(data.boundaries)
            {
                self.hoveredLayer
                    .css({
                        width : data.boundaries.width,
                        height: data.boundaries.height,
                        left  : data.boundaries.left,
                        top   : data.boundaries.top - data.boundaries.scrollTop
                    });
            }
        });

        self.editor.on('selectable.hovered.out', function () {
            self.hoveredLayer.addClass('vibu-hidden');
        });



        self.editor.on('selectable.selected.new', function (data) {
            self.selectedElement = self.editor.doc.findSelectableElement(data.element);

            self.selectedLayer.removeClass('vibu-hidden');
            self.selectedLayer.css({
                width : data.boundaries.width,
                height: data.boundaries.height,
                left  : data.boundaries.left,
                top   : data.boundaries.top - data.boundaries.scrollTop
            });

            self.selectedLayer.find('.vibu-node-name').text(self.selectedElement.get(0).tagName);
        });

        self.editor.on('selectable.selected.update-boundaries', function (data) {
            if(data.boundaries)
            {
                self.selectedLayer.css({
                    width : data.boundaries.width,
                    height: data.boundaries.height,
                    left  : data.boundaries.left,
                    top   : data.boundaries.top - data.boundaries.scrollTop
                });
            }
        });

        self.editor.on('selectable.selected.none', function () {
            self.selectedElement = null;
            self.selectedLayer.addClass('vibu-hidden');
        });
    };

    this.initAfterEditorReady = function () {
        let self   = this;

        this.selectedLayer = this.editor.getNode().find('.vibu-element-boundaries-active');
        this.hoveredLayer  = this.editor.getNode().find('.vibu-element-boundaries-hover');

        $(this.editor.doc.getCanvasWindow()).on('scroll resize', function () {
            if(self.selectedElement)
                self.editor.trigger('selectable.selected.update-boundaries', {
                    boundaries: self.editor.doc.getElementBoundaries(self.selectedElement)
                });

            if(self.hoveredElement)
                self.editor.trigger('selectable.hovered.update-boundaries', {
                    boundaries: self.editor.doc.getElementBoundaries(self.hoveredElement)
                });
        });

        this.editor.canvas.getBody().click(function () {
            if(self.disabled || self.blocked)
                return;

            self.editor.trigger('selectable.selected.none');
        });

        this.editor.doc.getCanvas().closest('.vibu-canvas').click(function () {
            if(self.disabled || self.blocked)
                return;

            self.editor.trigger('selectable.selected.none');
        });
    };

    this.load = function (onLoad) {};

    this.bindElementHoverEvents = function (element) {
        let self = this;

        element.hover(function () {
            if(self.disabled || self.blocked)
                return;

            self.hover(element);
        }, function () {
            self.editor.trigger('selectable.hovered.out');
        });
    };

    this.bindElementClickEvents = function (element) {
        let self = this;

        element.click(function (DOMEvent) {
            if(self.disabled || self.blocked)
                return;

            if(! self.selectedElement || self.selectedElement.is(element) === false)
            {
                self.select(element);
            }

            // Propagation is stopped, so we have to manually call event in editors dispatcher.
            self.editor.trigger('canvas.click', {
                event: DOMEvent
            });

            DOMEvent.preventDefault();
            DOMEvent.stopPropagation();
        });
    };

    this.select = function (element) {
        this.editor.trigger('selectable.selected.new', {
            element   : element,
            boundaries: this.editor.doc.getElementBoundaries(element)
        });

        return this;
    };

    this.hover = function (element) {
        this.editor.trigger('selectable.hovered.on', {
            element   : element,
            boundaries: this.editor.doc.getElementBoundaries(element)
        });

        return this;
    };

    this.updateActiveElement = function () {
        if(this.disabled)
            return;

        this.editor.trigger('selectable.selected.update-boundaries', {
            boundaries: this.editor.doc.getElementBoundaries(this.selectedElement)
        });

        return this;
    };

    this.updateHoveredElement = function () {
        if(this.disabled)
            return;

        this.editor.trigger('selectable.hovered.update-boundaries', {
            boundaries: this.editor.doc.getElementBoundaries(this.hoveredElement)
        });

        return this;
    };

    this.clearSelectedElement = function () {
        this.editor.trigger('selectable.selected.none');
        this.selectedElement = null;

        return this;
    };

    this.hideSelectedBoundaries = function () {

    };

    this.hideHoveredBoundaries = function () {

    };

    this.disable = function () {
        this.disabled = true;

        return this;
    };

    this.enable = function () {
        this.disabled = false;

        return this;
    };

    this.blockCurrentState = function () {
        this.blocked = true;

        return this;
    };

    this.unblockCurrentState = function () {
        this.blocked = false;

        return this;
    };
};
