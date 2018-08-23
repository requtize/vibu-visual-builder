vibu.styles = function (editor) {
    this.editor = editor;

    this.controls = [];

    this.init = function () {
        let self = this;

        for(let i = 0; i < vibu.styles.controls.length; i++)
        {
            this.addControlToSidebar(vibu.styles.controls[i].name, vibu.styles.controls[i].factory);
        }

        this.editor.on('selectable.selected.new', function (data) {
            self.decideControlsShow(data.element);
            self.callOnSelectElement(data.element);
        });

        this.editor.on('selectable.selected.none', function (data) {

        });
    };

    this.addControlToSidebar = function (name, factory) {
        let self = this;
        let url = 'http://localhost/vibu-visual-builder/src';

        let control = factory(url, this.editor);
        control = $.extend({}, vibu.styles.control.defaults, control);

        let sidebar = this.editor.doc.getStyles();

        this.loadControlHtml(control.template, function (html) {
            let node = $(html);
            let onChange = function (value) {
                self.callOnChangeControl(control, value);
            };

            control.node = node;

            if(control.load)
                control.load(node, onChange, self.editor);
            else
                self.bindControlEvents(node, onChange);

            sidebar.find('.vibu-controls-group').append(node);

            self.controls.push({
                name   : name,
                control: control,
                node   : node
            });
        });
    };

    this.loadControlHtml = function (url, callback) {
        if(! url)
            return;

        $.ajax({
            url: url,
            success: callback
        });
    };

    this.bindControlEvents = function (node, onChange) {
        node.find('[vibu-control]').on('change keyup', function () {
            onChange($(this).val());
        });
    };

    this.callOnChangeControl = function (control, value) {
        this.editor.trigger('styles.control.change', {
            name : control.name,
            value: value
        });

        control.set(control.node, this.getSelectedElement());
    };

    this.callOnSelectElement = function (element) {
        for(let i = 0; i < this.controls.length; i++)
        {
            let control = this.controls[i].control;

            control.get(control.node, element);
        }
    };

    this.decideControlsShow = function (element) {
        for(let i = 0; i < this.controls.length; i++)
        {
            let control = this.controls[i].control;

            if(this.hasAttribute(element, 'vibu-editable-' + control.parserTag))
                control.node.show();
            else
                control.node.hide();
        }
    };

    this.hasAttribute = function (element, attribute) {
        let attr = element.attr(attribute);

        return typeof attr !== typeof undefined && attr !== false;
    }

    this.getSelectedElement = function () {
        return this.editor.selectable.selectedElement;
    };
};

vibu.styles.controls = [];
vibu.styles.groups = [];

vibu.styles.control = function (name, factory) {
    vibu.styles.controls.push({
        name   : name,
        factory: factory
    });
};
vibu.styles.control.defaults = {
    parserTag: '',
    template: null,
    group   : 'general',
    order   : 0,
    node    : null,
    load    : function (control, editor) {},
    //set: 'expr:this.attr(class)',
    set     : function (control, element) {},
    //get: 'expr:this.attr(class)',
    get     : function (control, element) {}
}

vibu.styles.group = function (id, name) {
    vibu.styles.groups.push({
        id  : id,
        name: name
    });
};




vibu.styles.group('element', 'element');
vibu.styles.group('general', 'Ogólne');
vibu.styles.group('typography', 'Typografia');
vibu.styles.group('size', 'Rozmiary');
vibu.styles.group('display', 'Wyświetlanie');

vibu.styles.control('core/image', function (url, editor) {
    return {
        template: url + '/controls/image.html',
        parserTag: 'image',
        set: function (control, element) {
            element.attr('src', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('src'));
        }
    };
});

vibu.styles.control('core/background-image', function (url, editor) {
    return {
        template: url + '/controls/background-image.html',
        parserTag: 'background-image',
        set: function (control, element) {
            element.attr('src', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('src'));
        }
    };
});

vibu.styles.control('core/html-class', function (url, editor) {
    return {
        template: url + '/controls/html-class.html',
        parserTag: 'htmlclass',
        set: function (control, element) {
            element.attr('class', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('class'));
        }
    };
});

vibu.styles.control('core/html-id', function (url, editor) {
    return {
        template: url + '/controls/html-id.html',
        parserTag: 'htmlid',
    };
});

vibu.styles.control('core/node-tag', function (url, editor) {
    return {
        template: url + '/controls/node-tag.html',
        parserTag: 'nodetag',
    };
});

vibu.styles.control('core/link', function (url, editor) {
    return {
        template: url + '/controls/link.html',
        parserTag: 'link',
        set: function (control, element) {
            element.attr('href', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('href'));
        }
    };
});
