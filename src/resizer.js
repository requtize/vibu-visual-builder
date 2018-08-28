vibu.resizer = function (editor) {
    this.editor = editor;

    this.init = function () {
        let self = this;

        this.editor.onReady(function () {
            let node    = self.editor.getNode();
            let buttons = node.find('[data-vibu-resize]');

            buttons.click(function () {
                buttons.removeClass('vibu-btn-active');
                $(this).addClass('vibu-btn-active');

                node.find('.vibu-canvas-device-faker').attr('data-device', $(this).attr('data-vibu-resize'));
            });
        });
    };

    this.load = function (loader) {};
}
