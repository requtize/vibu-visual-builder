vibu.messenger = function (name, editorId, eventDispatcher) {
    this.name = name;
    this.editorId = editorId;
    this.eventDispatcher = eventDispatcher;

    this.messsagesWindows = {};
    this.receivers = {};

    this.init = function () {
        let self = this;

        window.addEventListener('message', function (event) {
            if(event.data.editorId == self.editorId)
            {
                if(event.data.receiver == self.name)
                    self.callReceivers(event);
                else
                    self.forwardMessageToWindow(event);
            }
        }, false);
    };

    this.registerMessagesWindow = function (name, element) {
        if(element.length == 0)
            return this;

        let iframe = element.get(0);
        let win    = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;

        this.messsagesWindows[name] = win;

        return this;
    };

    this.getName = function () {
        return this.name;
    };

    this.callReceivers = function (event) {
        let type = event.data.type.substring(5, event.data.type.length);

        if(this.receivers[type])
        {
            for(let i = 0; i < this.receivers[type].length; i++)
            {
                this.receivers[type][i](event.data.data);
            }
        }
    };

    this.forwardMessageToWindow = function (event) {
        if(this.messsagesWindows[event.data.receiver])
        {
            this.sendToWindow(this.messsagesWindows[event.data.receiver], event.data.receiver, event.data.type, event.data.message);
        }
    };

    this.receive = function (type, callback) {
        if(! this.receivers[type])
            this.receivers[type] = [];

        this.receivers[type].push(callback);
    };

    this.send = function (receiver, type, message) {
        let win = parent;

        if(this.name == 'root')
        {
            if(receiver != 'root')
                win = this.messsagesWindows[receiver];
            else
                win = window;
        }

        win.postMessage({
            type    : 'vibu.' + type,
            editorId: this.editorId,
            receiver: receiver,
            data    : message
        }, '*');
    };
}
