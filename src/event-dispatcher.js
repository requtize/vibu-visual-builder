vibu.eventDispatcher = function () {
    this.listeners = [];

    this.on = function(event, handler) {
        this.listeners.push({
            events: [ event ],
            handler: handler
        });
    }

    this.trigger = function(event, params) {
        for(let i = 0; i < this.listeners.length; i++)
        {
            if(this.listeners[i].events.indexOf(event) >= 0)
            {
                this.listeners[i].handler(params);
            }
        }
    }
};
