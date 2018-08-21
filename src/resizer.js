vibu.resizer = function (editor) {
    this.editor = editor;

    this.init = function () {
        let node    = this.editor.getNode();
        let buttons = node.find('[data-vibu-resize]');

        buttons.click(function () {
            buttons.removeClass('vibu-btn-active');
            vibuJquery(this).addClass('vibu-btn-active');

            node.find('.vibu-canvas-device-faker').attr('data-device', vibuJquery(this).attr('data-vibu-resize'));
        });
    }
}
