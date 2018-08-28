vibu.canvasHeightWatcher = function (editor) {
    this.editor = editor;
    this.interval = null;
    this.lastHeight = 0;

    this.init = function () {
        let self = this;

        this.editor.onReady(function () {
            self.onChange(function (height) {
                self.editor.trigger('canvas-height-change', {
                    height: height
                });
            });
        }, 1000);
    };

    this.load = function (onLoad) {};

    this.onChange = function (callback) {
        let self = this;

        let c = self.editor.canvas.getWindow();
        let d = c.document;

        this.interval = setInterval(function () {
            let height = $(d).outerHeight();

            if(self.lastHeight != height)
            {
                callback(height);
                self.lastHeight = height;
            }
        }, 200);
    }
}
