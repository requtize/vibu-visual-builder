vibu.selectableCanvas = function (canvas) {
    this.canvas = canvas;

    this.selectedElement = null;
    this.hoveredElement = null;

    this.init = function () {
        let self = this;

        self.canvas.getNode().find('[vibu-selectable]').each(function () {
            self.addElementId(vibuJquery(this));
            self.bindElementHoverEvents(vibuJquery(this));
            self.bindElementClickEvents(vibuJquery(this));
        });

        vibuJquery(window).on('scroll resize', function () {
            if(self.selectedElement)
            {
                self.canvas.eventDispatcher.trigger('selectable.selected.update-boundaries', {
                    element: self.selectedElement
                });
            }
            if(self.hoveredElement)
            {
                self.canvas.eventDispatcher.trigger('selectable.hovered.update-boundaries', {
                    element: self.selectedElement
                });
            }
        });

        vibuJquery('body').click(function () {
            self.canvas.eventDispatcher.trigger('selectable.selected.none', {
                element: self.selectedElement
            });
        });





        self.canvas.eventDispatcher.on('selectable.hovered.on', function (data) {
            self.hoveredElement = self.canvas.doc.findSelectableElement(data.element);

            /**
             * We dont hover active element.
             */
            if(self.selectedElement && self.hoveredElement.is(self.selectedElement))
                return;

            self.canvas.messenger.send('root', 'selectable.hovered.on', {
                boundaries: self.canvas.doc.getElementBoundaries(self.hoveredElement),
                elementId : self.hoveredElement.attr('vibu-element-id')
            });
        });

        self.canvas.eventDispatcher.on('selectable.hovered.update-boundaries', function () {
            if(self.hoveredElement)
            {
                self.canvas.messenger.send('root', 'selectable.hovered.update-boundaries', {
                    boundaries: self.canvas.doc.getElementBoundaries(self.hoveredElement),
                    elementId : self.hoveredElement.attr('vibu-element-id')
                });
            }
        });

        self.canvas.eventDispatcher.on('selectable.hovered.out', function () {
            if(self.hoveredElement)
            {
                self.canvas.messenger.send('root', 'selectable.hovered.out', {
                    boundaries: self.canvas.doc.getElementBoundaries(self.hoveredElement),
                    elementId : self.hoveredElement.attr('vibu-element-id')
                });

                self.hoveredElement = null;
            }
        });



        self.canvas.eventDispatcher.on('selectable.selected.new', function (data) {
            self.selectedElement = self.canvas.doc.findSelectableElement(data.element);

            self.canvas.messenger.send('root', 'selectable.selected.new', {
                boundaries: self.canvas.doc.getElementBoundaries(self.selectedElement),
                elementId : self.selectedElement.attr('vibu-element-id'),
                tagName   : self.selectedElement.get(0).tagName
            });
        });

        self.canvas.eventDispatcher.on('selectable.selected.update-boundaries', function () {
            self.canvas.messenger.send('root', 'selectable.selected.update-boundaries', {
                boundaries: self.canvas.doc.getElementBoundaries(self.selectedElement),
                elementId : self.selectedElement.attr('vibu-element-id')
            });
        });

        self.canvas.eventDispatcher.on('selectable.selected.none', function () {
            self.canvas.messenger.send('root', 'selectable.selected.none');

            self.selectedElement = null;
        });
    };

    this.addElementId = function (element) {
        element.attr('vibu-element-id', vibu.generateId());
    };

    this.bindElementHoverEvents = function (element) {
        let self = this;

        element.hover(function () {
            self.canvas.eventDispatcher.trigger('selectable.hovered.on', {
                element: element
            });
        }, function () {
            self.canvas.eventDispatcher.trigger('selectable.hovered.out', {
                element: element
            });
        });
    };

    this.bindElementClickEvents = function (element) {
        let self = this;

        element.click(function (DOMEvent) {
            DOMEvent.preventDefault();
            DOMEvent.stopPropagation();

            self.canvas.eventDispatcher.trigger('selectable.selected.new', {
                element: element
            });
        });
    };

    this.updateActiveElement = function () {
        this.canvas.eventDispatcher.trigger('selectable.selected.update-boundaries');
    };

    this.updateHoveredElement = function () {
        this.canvas.eventDispatcher.trigger('selectable.hovered.update-boundaries');
    };
};
