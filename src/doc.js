vibu.doc = function (editor) {
    this.editor = editor;

    this.findAllVibuElements = function () {
        return this.editor.node.find('[data-vibu]');
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
            scrollTop: $(window).scrollTop()
        };
    };

    this.getCanvas = function () {
        return this.editor.getNode().find('iframe');
    };

    this.getCanvasWindow = function () {
        let iframe = this.getCanvas().get(0);

        return iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument;
    };

    this.getCanvasContent = function () {
        return this.getCanvas().contents();
    };
}
