vibu.loader = function () {
    this.loads = [];

    this.add = function (name, callback) {
        this.loads.push({
            name    : name,
            callback: callback,
            loaded  : false
        });

        return this;
    };

    this.load = function (callback) {
        let self = this;

        let onLoadedFactory = function (name) {
            return function () {
                self.markLoaded(name);

                if(self.loadedAll())
                {
                    callback();
                }
            };
        };

        for(let i = 0; i < this.loads.length; i++)
        {
            this.loads[i].callback(onLoadedFactory(this.loads[i].name));
        }
    };

    this.markLoaded = function (name) {
        for(let i = 0; i < this.loads.length; i++)
        {
            if(this.loads[i].name == name)
            {
                this.loads[i].loaded = true;
                break;
            }
        }
    };

    this.loadedAll = function () {
        let loaded = 0;

        for(let i = 0; i < this.loads.length; i++)
        {
            if(this.loads[i].loaded)
            {
                loaded++;
            }
        }

        return this.loads.length === loaded;
    };
};
