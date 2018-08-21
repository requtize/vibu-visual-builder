vibu.selectablePreview = function (editor) {
    this.editor = editor;

    this.selectedElementId = null;
    this.hoveredElementId  = null;
    this.selectedLayer = null;
    this.hoveredLayer  = null;

    this.init = function () {
        let self = this;

        this.selectedLayer = this.editor.getNode().find('.vibu-element-boundaries-active');
        this.hoveredLayer  = this.editor.getNode().find('.vibu-element-boundaries-hover');

        this.editor.messenger.receive('selectable.hovered.on', function (data) {
            self.hoveredElementId = data.elementId;
            self.hoveredLayer
                .removeClass('vibu-hidden')
                .attr('vibu-element-id', data.elementId)
                .css({
                    width : data.boundaries.width,
                    height: data.boundaries.height,
                    left  : data.boundaries.left,
                    top   : data.boundaries.top - data.boundaries.scrollTop
                });
        });

        this.editor.messenger.receive('selectable.hovered.update-boundaries', function (data) {
            self.hoveredLayer
                .css({
                    width : data.boundaries.width,
                    height: data.boundaries.height,
                    left  : data.boundaries.left,
                    top   : data.boundaries.top - data.boundaries.scrollTop
                });
        });

        this.editor.messenger.receive('selectable.hovered.out', function (data) {
            self.hoveredElementId = null;
            self.hoveredLayer
                .addClass('vibu-hidden')
                .attr('vibu-element-id', null);
        });



        this.editor.messenger.receive('selectable.selected.new', function (data) {
            self.selectedElementId = data.elementId;
            self.selectedLayer.removeClass('vibu-hidden');

            self.selectedLayer.css({
                width : data.boundaries.width,
                height: data.boundaries.height,
                left  : data.boundaries.left,
                top   : data.boundaries.top - data.boundaries.scrollTop
            });

            self.selectedLayer.find('.vibu-node-name').text(data.tagName);
        });

        this.editor.messenger.receive('selectable.selected.update-boundaries', function (data) {
            self.selectedLayer.css({
                width : data.boundaries.width,
                height: data.boundaries.height,
                left  : data.boundaries.left,
                top   : data.boundaries.top - data.boundaries.scrollTop
            });
        });

        this.editor.messenger.receive('selectable.selected.none', function (data) {
            self.selectedElementId = null;
            self.selectedLayer
                .addClass('vibu-hidden')
                .attr('vibu-element-id', null);
        });
    };
};
