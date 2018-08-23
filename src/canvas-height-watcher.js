vibu.canvasHeightWatcher = function (iframe) {
    this.iframe = iframe;
    this.interval = null;
    this.lastHeight = 0;

    this.onChange = function (callback) {
        let self = this;

        let iframe = self.iframe.get(0);
        let c = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument;
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
