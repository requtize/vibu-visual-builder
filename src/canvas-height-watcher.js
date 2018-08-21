vibu.canvasHeightWatcher = function (node) {
    this.node = node;
    this.interval = null;
    this.lastHeight = 0;

    this.onChange = function (callback) {
        let self = this;

        this.interval = setInterval(function () {
            let height = self.node.outerHeight();

            if(self.lastHeight != height)
            {
                callback(height);
                self.lastHeight = height;
            }
        }, 200);
    }
}
