vibu.blocks = function (editor) {
    this.editor = editor;
    this.blocks = [];

    this.init = function () {
        let self = this;

        this.editor.on('blocks.block', function (data) {
            self.parseBlock(data);
        });

        this.editor.on('canvas.after-content', function () {
            self.editor.canvas.getBody().find('[vibu-block]').each(function () {
                let name  = $(this).attr('vibu-block');
                let block = self.getBlock(name);
                console.log(block);

                let eventName = null;

                if(block)
                {
                    eventName = 'blocks.block';
                    $(this).attr('vibu-selectable', true);
                }
                else
                {
                    eventName = 'blocks.undefined-block';
                }

                self.editor.trigger(eventName, {
                    block: block,
                    node : $(this),
                    name : name
                });
            });
        }, -1000);

        for(let i = 0; i < vibu.blocks.blocks.length; i++)
        {
            this.registerBlock(vibu.blocks.blocks[i].name, vibu.blocks.blocks[i].factory);
        }
    };

    this.load = function (onLoad) {};

    this.parseBlock = function (data) {
        let self   = this;
        let styles = this.editor.styles;

        data.node.find('[vibu-editable]').each(function () {
            let element = $(this);
            let field   = element.attr('vibu-editable');
            let block   = data.block;

            let editables = block.getFieldEditables(field);

            if(! editables)
                return;

            let newEditables = [];

            for(let i = 0; i < editables.length; i++)
            {
                if(styles.controlExists(editables[i]))
                {
                    newEditables.push(editables[i])
                }
            }

            if(newEditables.length === 0)
                return;

            block[field] = newEditables;

            element.attr('vibu-selectable', true);
        });
    };

    this.getBlock = function (name) {
        for(let i = 0; i < this.blocks.length; i++)
        {
            if(this.blocks[i].name === name)
            {
                return this.blocks[i];
            }
        }

        return null;
    };

    this.registerBlock = function (name, factory) {
        let url = 'http://localhost/vibu-visual-builder/src';

        let block = factory(url, this.editor);
        block = $.extend({}, vibu.blocks.block.defaults, block);
        block.name = name;

        this.blocks.push(block);
    };

    this.getElementEditables = function (element) {
        let blockNode = element.closest('[vibu-block]');

        if(blockNode.length == 0)
            return [];

        let block = this.getBlock(blockNode.attr('vibu-block'));

        if(! block)
            return [];

        let editables = block.getFieldEditables(element.attr('vibu-editable'));

        if(! editables)
            return [];

        return editables;
    };
};

vibu.blocks.blocks = [];

vibu.blocks.block = function (name, factory) {
    vibu.blocks.blocks.push({
        name   : name,
        factory: factory
    });
};

vibu.blocks.block.defaults = {
    name  : null,
    icon  : null,
    fields: {},
    fieldExists: function (name) {
        return this.fields[name] ? true : false;
    },
    getFieldEditables: function (name) {
        return this.fields[name] ? this.fields[name] : null;
    }
};

/*vibu.blocks.block('core/title', function (url) {
    return {
        icon: url + '/block-icon.png',
        fields: {
            weAreAvailable: {
                editable: [ 'text' ]
            },
            phone1link: {
                editable: [ 'text' ]
            },
            phone1icon: {
                editable: [ 'image' ]
            },
            phone1text: {
                editable: [ 'text' ]
            }
        },
        formatters: {
            weAreAvailable: {
                get: function (element, control) {
                    return element.css('background-image');
                },
                set: function (element, control, value) {
                    element.css('background-image', 'url(' + value + ')');
                }
            }
        }
    };
});*/

vibu.blocks.block('custom/block1', function (url, editor) {
    return {
        icon: url + '/block-icon.png',
        fields: {
            phone1link: [ 'link' ],
            phone1icon: [ 'image' ],
            phone1text: [ 'text' ]
        }
    };
});
