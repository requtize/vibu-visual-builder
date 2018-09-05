vibu.eventDispatcher = function () {
    this.listeners = [];

    /**
     * [on description]
     * @param  {string}   event
     * @param  {callable} handler
     * @param  {integer}  priority Lower value - higher priority.
     */
    this.on = function(event, handler, priority) {
        this.listeners.push({
            priority: priority ? priority : 100,
            events  : [ event ],
            handler : handler
        });

        this.listeners.sort(function (a, b) {
            return b.priority - a.priority;
        });
    }

    this.trigger = function(event, params) {
        for(let i = this.listeners.length - 1; i >= 0; i--)
        {
            if(this.listeners[i].events.indexOf(event) >= 0)
            {
                this.listeners[i].handler(params);
            }
        }
    }
};
