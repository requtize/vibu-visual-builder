vibu.canvas = function (editor) {
    this.editor = editor;
    this.iframe = null;
    this.body   = null;

    this.init = function () {
        let self = this;

        this.editor.onReady(function () {
            self.iframe = self.editor.getNode().find('iframe');
            self.body   = self.iframe.contents().find('body');
            self.window = self.iframe.contents().find('body');

            self.preventLinksClick();
        }, -1000);
    };

    this.load = function (loader) {};

    this.setContent = function (content) {
        let params = {
            content: content
        };

        this.editor.trigger('canvas.before-get-content', params);

        this.body.html(params.content);

        this.editor.trigger('canvas.set-content', params);
    };

    this.getContent = function () {
        let params = {
            content: ''
        };

        params.content = this.body.html();

        this.editor.trigger('canvas.get-content', params);

        return params.content;
    };

    this.appendBlock = function (html, after) {
        if(after)
            after.insertAfter(html);
        else
            this.body.append(html);

        this.editor.trigger('canvas.append-content');
    };

    this.getBody = function () {
        return this.body;
    };

    this.getWindow = function () {
        let iframe = this.iframe.get(0);

        return iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument;
    };

    this.preventLinksClick = function () {
        this.body.on('click mouseup', 'a', function (e) {
            let editable = null;

            editable = $(e.target).attr('contenteditable');

            if(! editable)
                e.preventDefault();

            editable = $(this).closest('[contenteditable]');

            if(! editable.length)
                e.preventDefault();
        });
    };
};
