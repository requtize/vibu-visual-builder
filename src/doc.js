vibu.doc = function (canvas) {
    this.canvas = canvas;

    this.findAllVibuElements = function () {
        return this.canvas.node.find('[data-vibu]');
    };

    this.findSelectableElement = function (element) {
        return element.closest('[vibu-selectable]');
    };

    this.getElementBoundaries = function (element) {
        if(! element)
            return null;

        return {
            left: element.offset().left,
            top: element.offset().top,
            width: element.outerWidth(),
            height: element.outerHeight(),
            position: element.css('position'),
            scrollTop: vibuJquery(window).scrollTop()
        };
    };
}
