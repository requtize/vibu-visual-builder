vibu.styles = function (editor) {
    this.editor = editor;

    this.controls = [];
    this.loader   = null;

    this.init = function () {
        let self = this;

        this.loader = new vibu.loader();

        this.editor.on('selectable.selected.new', function (data) {
            self.decideControlsShow(data.element);
            self.callOnSelectElement(data.element);
        });

        this.editor.on('selectable.selected.none', function (data) {
            self.hideControls();
        });

        this.editor.onReady(function () {
            self.appendControlsToDocument();
        });
    };

    this.load = function (loader) {
        let self = this;

        loader.add('styles', function (onLoad) {
            for(let i = 0; i < vibu.styles.controls.length; i++)
            {
                self.loader.add('control.' + vibu.styles.controls[i].name, function (onControlLoad) {
                    self.loadControl(vibu.styles.controls[i].name, vibu.styles.controls[i].factory, onControlLoad);
                });
            }

            self.loader.load(function () {
                onLoad();
            });
        });
    };

    this.loadControl = function (name, factory, onLoad) {
        let self = this;
        let url = 'http://localhost/vibu-visual-builder/src';

        let control = factory(url, this.editor);
        control = $.extend({}, vibu.styles.control.defaults, control);

        let sidebar = this.editor.doc.getStyles();

        this.loadControlHtml(control.template, function (html) {
            control.name = name;
            control.html = self.createControlsNode(html);

            self.controls.push(control);

            onLoad();
        });
    };

    this.appendControlsToDocument = function () {
        let self    = this;
        let sidebar = this.editor.doc.getStyles();

        for(let i = 0; i < this.controls.length; i++)
        {
            let control = this.controls[i];

            let node = control.html;
            let onChange = function (value) {
                self.callOnChangeControl(control, value);
            };

            control.node = node;

            if(control.load)
                control.load.apply(self, [ node, onChange, this.editor ]);
            else
                this.bindControlEvents(node, onChange);

            sidebar.find('.vibu-controls-group').append(node);
        }
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

        this.editor.selectable.updateActiveElement();
        this.editor.selectable.updateHoveredElement();
    };

    this.callOnSelectElement = function (element) {
        for(let i = 0; i < this.controls.length; i++)
        {
            let control = this.controls[i];

            control.get(control.node, element);
        }
    };

    this.decideControlsShow = function (element) {
        let editables = this.editor.blocks.getElementEditables(element);

        for(let i = 0; i < this.controls.length; i++)
        {
            let control = this.controls[i];

            if(editables.indexOf(control.name) >= 0 && control.valid(element) === true)
                control.node.removeClass('vibu-hidden');
            else
                control.node.addClass('vibu-hidden');
        }
    };

    this.hideControls = function () {
        for(let i = 0; i < this.controls.length; i++)
        {
            this.controls[i].node.addClass('vibu-hidden');
        }
    };

    this.getSelectedElement = function () {
        return this.editor.selectable.selectedElement;
    };

    this.controlExists = function (name) {
        for(let i = 0; i < this.controls.length; i++)
        {
            if(this.controls[i].name === name)
            {
                return true;
            }
        }

        return false;
    };

    this.createControlsNode = function (html) {
        return $('<div class="vibu-hidden">' + html + '</div>');
    };
};

vibu.styles.controls = [];
vibu.styles.groups = [];

vibu.styles.control = function (name, factory) {
    for(let i = 0; i < vibu.styles.controls.length; i++)
    {
        // If Style is already registered, we skip it.
        if(vibu.styles.controls[i].name == name)
        {
            return;
        }
    }

    vibu.styles.controls.push({
        name   : name,
        factory: factory
    });
};
vibu.styles.control.defaults = {
    template: null,
    group : 'general',
    order : 0,
    node  : null,
    name  : null,
    html  : null,
    /**
     * Binds events to control. This function is a custom function and it's using is optional.
     * If this will be ommited, system try to find element with 'vibu-control' attribute,
     * and try to attach events to this control.
     * Arguments:
     *     - node        - Node of control
     *     - onChange    - Function that should be called when vibu-control changes its value.
     *     - this.editor - Editor instance
     */
    load: null,
    /**
     * Detects if an element is a valid element that can be modified by this control.
     * Ie. if is a link control, valid() should check if element is an A node.
     * Returns true if element is valid.
     */
    valid: function (element) {return true;},
    //set: 'expr:this.attr(class)',
    set: function (control, element) {},
    //get: 'expr:this.attr(class)',
    get: function (control, element) {}
};

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

vibu.styles.control('image', function (url, editor) {
    return {
        template: url + '/controls/image.html',
        valid: function (element) {
            return element.get(0).tagName == 'IMG';
        },
        set: function (control, element) {
            element.attr('src', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('src'));
        }
    };
});

vibu.styles.control('background-image', function (url, editor) {
    return {
        template: url + '/controls/background-image.html',
        set: function (control, element) {
            element.attr('src', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('src'));
        }
    };
});

vibu.styles.control('html-class', function (url, editor) {
    return {
        template: url + '/controls/html-class.html',
        set: function (control, element) {
            element.attr('class', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('class'));
        }
    };
});

vibu.styles.control('html-id', function (url, editor) {
    return {
        template: url + '/controls/html-id.html',
    };
});

/*vibu.styles.control('alt', function (url, editor) {
    return {
        template: url + '/controls/alt.html',
    };
});

vibu.styles.control('title', function (url, editor) {
    return {
        template: url + '/controls/title.html',
    };
});*/

vibu.styles.control('node-tag', function (url, editor) {
    return {
        template: url + '/controls/node-tag.html',
    };
});

vibu.styles.control('link', function (url, editor) {
    return {
        template: url + '/controls/link.html',
        valid: function (element) {
            return element.get(0).tagName == 'A';
        },
        set: function (control, element) {
            element.attr('href', control.find('[vibu-control]').val());
        },
        get: function (control, element) {
            control.find('[vibu-control]').val(element.attr('href'));
        }
    };
});

vibu.styles.control('margin', function (url, editor) {
    let collectMarginClasses = function (node, spec) {
        let result = [];
        let source = node.prop('classList');
        
        for(let i = 0; i < source.length; ++i)
        {
            if(source[i].substring(0, 3) == 'm' + spec + '-')
            {
                result.push(source[i]);
            }
        }

        return result;
    };

    let removeAllMarginClasses = function (node, spec) {
        let list = collectMarginClasses(node, spec);

        for(let i = 0; i < list.length; i++)
        {
            node.removeClass(list[i]);
        }
    };

    let getMarginClass = function (node, spec) {
        let list = collectMarginClasses(node, spec);

        return list[0] ? list[0] : null;
    };

    return {
        group: 'size',
        template: url + '/controls/margin.html',
        load: function (node, onChange, editor) {
            this.bindControlEvents(node, onChange);

            node.find('[data-spec]').each(function () {
                let group = $(this);

                group.find('.vibu-dropdown-item').click(function (e) {
                    e.preventDefault();
                    group.find('[vibu-control]').val($(this).attr('data-margin'));

                    onChange();
                });
            });
        },
        set: function (control, element) {
            control.find('[data-spec]').each(function () {
                let spec = $(this).attr('data-spec');

                removeAllMarginClasses(element, spec);

                let val = $(this).find('[vibu-control]').val();

                if(val)
                    element.addClass(val);
            });
        },
        get: function (control, element) {
            control.find('[data-spec]').each(function () {
                let spec = $(this).attr('data-spec');

                $(this).find('[vibu-control]').val(getMarginClass(element, spec));
            });
        }
    };
});
