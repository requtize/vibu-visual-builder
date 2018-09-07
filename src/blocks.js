vibu.blocks = function (editor) {
    this.editor = editor;
    this.blocks = [];
    this.groups = [];
    this.addable = null;
    this.movable = null;

    this.init = function () {
        let self = this;
        let body = null;

        this.editor.on('blocks.block', function (data) {
            self.parseBlock(data);
        }, -1000);

        this.editor.on('method.add-block', function (data) {
            let block = self.getBlock(data.name);

            if(block)
                self.addable.appendBlock(block);
        }, -1000);

        this.editor.on('canvas.set-content', function () {
            body.find('[vibu-block]').each(function () {
                let block = self.getBlock($(this).attr('vibu-block'));

                let eventName = null;

                if(block)
                    eventName = 'blocks.block';
                else
                    eventName = 'blocks.undefined-block';

                self.editor.trigger(eventName, {
                    block: block,
                    node : $(this)
                });
            });

            self.bindBlocksPlacement();
            self.bindBlocksMovable();
        }, -1000);

        this.editor.on('blocks.movable-start', function () {
            body.addClass('vibu-movable-active');
        });

        this.editor.on('blocks.movable-end', function () {
            body.removeClass('vibu-movable-active');
        });

        this.editor.on('element.action.remove', function (data) {
            if(confirm('Jesteś pewny, że chcesz to usunąć?'))
            {
                data.element.remove();
                self.editor.selectable.clearSelectedElement();
            }
        });

        this.editor.on('selectable.selected.update-boundaries', function (data) {
            let actions = self.editor.getNode().find('.vibu-element-actions');

            actions.css({
                left: data.boundaries.left + data.boundaries.width - actions.width(),
                top:  data.boundaries.top - data.boundaries.scrollTop
            });
        });

        this.editor.on('selectable.selected.new', function (data) {
            let actions = self.editor.getNode().find('.vibu-element-actions');

            // Here anyone can modify actions buttons visibility.
            self.editor.trigger('element.actionsbox.show', {
                actionsbox: actions,
                element   : data.element
            });

            actions.removeClass('vibu-hidden');
            actions.css({
                left: data.boundaries.left + data.boundaries.width - actions.width(),
                top:  data.boundaries.top - data.boundaries.scrollTop
            });
        });

        this.editor.on('selectable.selected.none', function (data) {
            self.editor.getNode().find('.vibu-element-actions').addClass('vibu-hidden');
        });

        this.editor.onCreated(function () {
            let actions = self.editor.getNode().find('.vibu-element-actions');

            actions.on('click mousedown mouseup', function (e) {
                e.stopPropagation();
            });

            actions.append('\
                <div vibu-element-action="move">M</div>\
                <div vibu-element-action="duplicate">D</div>\
                <div vibu-element-action="edit">E</div>\
                <div vibu-element-action="remove">R</div>\
            ');

            // Here anyone can add and modify any actions buttons.
            self.editor.trigger('element.actionsbox.create', {
                actionsbox: actions
            });

            actions.on('click', '[vibu-element-action]', function () {
                self.editor.trigger('element.action', {
                    element: self.editor.selectable.selectedElement,
                    action : $(this).attr('vibu-element-action')
                });

                self.editor.trigger('element.action.' + $(this).attr('vibu-element-action'), {
                    element: self.editor.selectable.selectedElement
                });
            });
        });

        this.editor.on('element.actionsbox.show', function (data) {
            if(data.element.attr('vibu-block'))
            {
                data.actionsbox.find('[vibu-element-action="move"]').show();
                data.actionsbox.find('[vibu-element-action="remove"]').show();
                data.actionsbox.find('[vibu-element-action="duplicate"]').show();
            }
            else
            {
                data.actionsbox.find('[vibu-element-action="move"]').hide();
                data.actionsbox.find('[vibu-element-action="remove"]').hide();
                data.actionsbox.find('[vibu-element-action="duplicate"]').hide();
            }
        });

        this.editor.on('element.action.duplicate', function (data) {
            let cloned = data.element.clone(false, false).off();

            cloned.insertAfter(data.element);

            self.editor.trigger('blocks.block', {
                block: self.getBlock(cloned.attr('vibu-block')),
                node : cloned
            });
        });

        this.editor.onReady(function () {
            // Body canvas setter must be in this line!!!
            body = self.editor.canvas.getBody();

            for(let i = 0; i < self.groups.length; i++)
                self.createBlocksGroup(self.groups[i]);

            for(let i = 0; i < self.blocks.length; i++)
                self.addBlockIcon(self.blocks[i]);

            self.hideEmptyGroups();
        });

        for(let i = 0; i < vibu.blocks.blocks.length; i++)
            this.registerBlock(vibu.blocks.blocks[i].name, vibu.blocks.blocks[i].factory);

        for(let i = 0; i < vibu.blocks.groups.length; i++)
            this.registerGroup(vibu.blocks.groups[i].name, vibu.blocks.groups[i].factory);
    };

    this.load = function (onLoad) {};

    this.parseBlock = function (data) {
        let self   = this;
        let styles = this.editor.styles;

        data.node
            // Make all block selectable.
            .attr('vibu-selectable', true)
            // Make all block editable under special 'block'field name.
            // Attribute value must be tes to unify all editables managing
            // in belowed the .each() method.
            .attr('vibu-field', 'block');

        let editables = data.node.find('[vibu-field]');

        // Add whole block to editable elements.
        editables = editables.add(data.node);

        editables.each(function () {
            let element = $(this);
            let field   = element.attr('vibu-field');
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
        let url = this.editor.getBasepath();
        let frameworks = this.editor.options.frameworks;

        let block = factory(url, this.editor);
        block = $.extend({}, vibu.blocks.block.defaults, block);
        block.name  = name;
        block.label = block.label ? block.label : block.name;

        // Every block must contains html or template property.
        if(! block.html)
            return;

        // If block does not contain any frameworks, that we add it for everyone.
        // This is caused to make developers less writing while creating dedicated blocks.
        if(block.frameworks.length == 0)
        {
            let supports = false;

            for(let i = 0; i < frameworks.length; i++)
            {
                if(block.frameworks.indexOf(frameworks[i]) >= 0)
                {
                    supports = true;
                }
            }

            if(! supports)
                return;
        }

        this.blocks.push(block);
    };

    this.registerGroup = function (name, factory) {
        let url = this.editor.getBasepath();

        let group = factory(url, this.editor);
        group = $.extend({}, vibu.blocks.group.defaults, group);
        group.name = name;

        this.groups.push(group);
    };

    this.addBlockIcon = function (block) {
        this.editor.doc.getBlocks().find('.vibu-accordion-item[vibu-accordion=' + block.group + '] .vibu-accordion-content').append('<div class="vibu-block-selection" vibu-block-name="' + block.label + '" vibu-block="' + block.name + '"><img src="' + block.icon + '" /></div>');
    };

    this.createBlocksGroup = function (group) {
        this.editor.doc.getBlocks().find('.vibu-accordion').append('<div class="vibu-accordion-item" vibu-accordion="' + group.name + '"><div class="vibu-accordion-label">' + group.label + '</div><div class="vibu-accordion-content"></div></div>');
    };

    this.bindBlocksPlacement = function () {
        this.addable = new vibu.blocks._addable(this.editor);
        this.addable.init();
    };

    this.bindBlocksMovable = function () {
        this.movable = new vibu.blocks._movable(this.editor);
        this.movable.init();
    };

    this.getElementEditables = function (element) {
        let blockNode = element.closest('[vibu-block]');

        if(blockNode.length == 0)
            return [];

        let block = this.getBlock(blockNode.attr('vibu-block'));

        if(! block)
            return [];

        let editables = block.getFieldEditables(element.attr('vibu-field'));

        if(! editables)
            return [];

        return editables;
    };

    this.hideEmptyGroups = function () {
        let blocks = this.editor.doc.getBlocks();

        blocks.find('.vibu-accordion-item').each(function () {
            if($(this).find('.vibu-accordion-content').html() == '')
            {
                $(this).remove();
            }
        });

        blocks.find('.vibu-accordion-item').first().addClass('vibu-accordion-opened');
    };
};


















vibu.blocks._addable = function (editor) {
    this.editor = editor;
    this.active = false;
    this.placement = null;
    this.placeholder = null;
    this.lastPlaceholderPosition = null;
    this.canvasHovered = false;
    this.block = null;

    this.init = function () {
        let self   = this;
        let root   = this.editor.getNode();
        let canvas = this.editor.doc.getCanvasContent();

        this.bubbleIframeMouseMove(this.editor.doc.getCanvas().get(0));

        root.find('.vibu-visual-builder').append('<div class="vibu-placement-tooltip">Wstaw blok: <span></span></div>');
        canvas.find('body').append('<div class="vibu-placement-placeholder vibu-dynamic-element" style="display:none;padding:20px;text-align:center;font-size:14px;background-color:#ddd;">Wstaw tutaj</div>');

        this.placement   = root.find('.vibu-placement-tooltip');
        this.placeholder = canvas.find('.vibu-placement-placeholder');

        let blocks = this.editor.doc.getBlocks();

        blocks.on('mousedown', '.vibu-block-selection', function (e) {
            e.preventDefault();

            self.block = self.editor.blocks.getBlock($(this).attr('vibu-block'));

            if(! self.block)
                return false;

            self.startPlacement();
            self.updatePlacement(e);
            self.updateText($(this).attr('vibu-block-name'));

            return false;
        });

        $('body').on('mouseup', function () {
            self.endPlacement();
        }).on('mousemove', function (e) {
            self.updatePlacement(e);
        });

        canvas.find('body').on('mousemove', '[vibu-block]', function (e) {
            if(self.active === false)
                return;

            let block = $(this);
            let name  = block.attr('vibu-block');

            let position = self.detectBlockHoverHalf(block, e);

            if(self.lastPlaceholderPosition != position + name)
            {
                if(position == 'top')
                {
                    self.lastPlaceholderPosition = position + name;
                    self.placeholder.insertBefore(block);
                }
                else
                {
                    self.lastPlaceholderPosition = position + name;
                    self.placeholder.insertAfter(block);
                }

                self.editor.selectable.updateActiveElement();
                self.editor.selectable.updateHoveredElement();
            }
        });

        this.editor.doc.getCanvas().on('mouseenter', function () {
            if(self.active)
            {
                self.placeholder.show();
                self.editor.selectable.updateActiveElement();
                self.editor.selectable.updateHoveredElement();
            }

            self.canvasHovered = true;
        }).on('mouseout', function () {
            if(self.active)
            {
                self.placeholder.hide();
                self.editor.selectable.updateActiveElement();
                self.editor.selectable.updateHoveredElement();
            }

            self.canvasHovered = false;
        });
    };

    this.startPlacement = function () {
        if(this.active)
            return;

        this.active = true;
        this.placement.show();

        this.editor.selectable.disable();
    };

    this.endPlacement = function () {
        if(this.active === false)
            return;

        this.active = false;
        this.placement.hide();

        if(this.canvasHovered)
            this.appendBlockAtCurrentPosition(this.block);

        // Reset placeholder position to the top of canvas.
        this.placeholder.insertBefore(this.editor.doc.getCanvasContent().find('[vibu-block]').first());
        this.placeholder.hide();

        this.editor.selectable.updateActiveElement();
        this.editor.selectable.updateHoveredElement();

        this.block = null;

        this.editor.selectable.enable();
    };

    this.updatePlacement = function (mouseEvent) {
        if(this.active === false)
            return;

        this.placement.css({
            left: mouseEvent.pageX,
            top : mouseEvent.pageY
        });
    };

    this.updateText = function (text) {
        this.placement.find('span').text(text);
    };

    this.detectBlockHoverHalf = function (block, event) {
        let height = block.outerHeight();
        let half   = height / 2;

        if(event.offsetY >= 0 && event.offsetY <= half)
            return 'top';
        else
            return 'bottom';
    };

    this.bubbleIframeMouseMove = function (iframe) {
        let eventBubbler = function (iframe, name) {
            // Save any previous onmousemove handler
            var existingOnMouseMove = iframe.contentWindow[name];

            // Attach a new onmousemove listener
            iframe.contentWindow[name] = function(e) {
                // Fire any existing onmousemove listener 
                if(existingOnMouseMove)
                    existingOnMouseMove(e);

                // Create a new event for the this window
                var evt = document.createEvent('MouseEvents');

                // We'll need this to offset the mouse move appropriately
                var boundingClientRect = iframe.getBoundingClientRect();

                // Initialize the event, copying exiting event values
                // for the most part
                evt.initMouseEvent(
                    name.substring(2, name.length),
                    true, // bubbles
                    false, // not cancelable
                    window,
                    e.detail,
                    e.screenX,
                    e.screenY,
                    e.clientX + boundingClientRect.left,
                    e.clientY + boundingClientRect.top,
                    e.ctrlKey, 
                    e.altKey,
                    e.shiftKey,
                    e.metaKey,
                    e.button,
                    null // no related element
                );

                // Dispatch the mousemove event on the iframe element
                iframe.dispatchEvent(evt);
            };
        };

        eventBubbler(iframe, 'onmousemove');
        eventBubbler(iframe, 'onmousedown');
        eventBubbler(iframe, 'onmouseup');
    }

    this.appendBlockAtCurrentPosition = function (block) {
        let node = $(block.html);

        this.placeholder.before(node);

        this.editor.trigger('blocks.block', {
            block: block,
            node : node
        });
    };

    this.appendBlock = function (block) {
        let node = $(block.html);

        this.editor.doc.getCanvasContent().find('body').append(node);

        this.editor.trigger('blocks.block', {
            block: block,
            node : node
        });
    };
};












vibu.blocks._movable = function (editor) {
    this.editor = editor;
    this.started = false;
    this.movable = false;
    this.placeholder = null;
    this.lastPlaceholderPosition = null;
    this.cursorStartPosition = null;
    this.blockPositionStart = null;
    this.block = null;
    this.treshold = 5;

    this.init = function () {
        let self   = this;
        let canvas = this.editor.doc.getCanvasContent();

        canvas.find('body').append('<div class="vibu-movable-placeholder vibu-dynamic-element" style="display:none;background-color:#ddd;"></div>');

        this.placeholder = canvas.find('.vibu-movable-placeholder');

        canvas.find('body').on('mousedown', '[vibu-block]', function (e) {
            if(self.started === true)
                return true;
            // Prevent on editable element.
            if($(e.target).attr('contenteditable'))
                return true;
            // Prevent on any child of editable element.
            if($(e.target).closest('[contenteditable]').length)
                return true;

            self.started = true;
            self.block   = $(this);

            self.cursorStartPosition = e.clientY;

            self.preventTextSelection(e);
        }).on('mousemove', '[vibu-block]', function (e) {
            if(self.active === false)
                return true;

            let block = $(this);
            let name  = block.attr('vibu-block');

            let position = self.detectBlockHoverHalf(block, e);

            if(self.lastPlaceholderPosition != position + name)
            {
                if(position == 'top')
                {
                    self.lastPlaceholderPosition = position + name;
                    self.placeholder.insertBefore(block);
                }
                else
                {
                    self.lastPlaceholderPosition = position + name;
                    self.placeholder.insertAfter(block);
                }
            }
        });

        $('body').on('mouseup', function () {
            if(self.started === false)
                return;

            self.endMovable();

            self.started = false;
            self.block   = null;

            self.cursorStartPosition = null;
        });

        $('body').on('mousemove', function (e) {
            if(self.started === true && self.movable === false)
            {
                self.detectMovable(e.offsetY);
            }
            else if(self.started === true && self.movable === true)
            {
                self.moveBlock(e.offsetY);
                e.preventDefault();
            }
        });
    };

    this.detectMovable = function (clientY) {
        let delta = Math.abs(clientY - this.cursorStartPosition);

        if(delta >= this.treshold)
        {
            this.startMovable();
        }
    };

    this.startMovable = function () {
        if(this.movable === true)
            return;

        this.movable = true;

        this.editor.selectable.disable();
        this.blockPositionStart = this.block.offset().top;
        this.block.addClass('vibu-block-movable');

        this.placeholder.show().css({
            height: this.block.outerHeight(),
        });

        this.placeholder.insertBefore(this.block);

        this.block.css({
            top: this.blockPositionStart
        });

        this.editor.trigger('blocks.movable-start', { block: this.block });
    };

    this.moveBlock = function (clientY) {
        if(this.movable === false)
            return;

        this.block.css({
            top: this.blockPositionStart + clientY - this.cursorStartPosition
        });
    };

    this.endMovable = function () {
        if(this.movable === false)
            return;

        this.editor.trigger('blocks.movable-end', { block: this.block });

        this.block.css({
            top: 'auto'
        });

        this.block.removeClass('vibu-block-movable');
        this.placeholder.hide();

        this.block.insertBefore(this.placeholder);

        this.movable = false;
        this.blockPositionStart = null;

        this.editor.selectable.enable();
    };

    this.detectBlockHoverHalf = function (block, event) {
        let height = block.height();
        let half   = height / 2;

        if(event.offsetY >= 0 && event.offsetY <= half)
            return 'top';
        else
            return 'bottom';
    };

    this.preventTextSelection = function (e) {
        e.preventDefault();
    };
};












vibu.blocks.blocks = [];
vibu.blocks.groups = [];

vibu.blocks.block = function (name, factory) {
    for(let i = 0; i < vibu.blocks.blocks.length; i++)
    {
        // If block is already registered, we skip it.
        if(vibu.blocks.blocks[i].name == name)
        {
            return;
        }
    }

    vibu.blocks.blocks.push({
        name   : name,
        factory: factory
    });
};

vibu.blocks.group = function (name, factory) {
    for(let i = 0; i < vibu.blocks.groups.length; i++)
    {
        // If block is already registered, we skip it.
        if(vibu.blocks.groups[i].name == name)
        {
            return;
        }
    }

    vibu.blocks.groups.push({
        name   : name,
        factory: factory
    });
};

vibu.blocks.block.defaults = {
    name    : null,
    label   : '',
    icon    : null,
    group   : 'default',
    /**
     * 'block' field is a special field name, that tells
     * what editables should be binded to whole block container.
     */
    fields  : {},
    getters : {},
    setters : {},
    template: null,
    html    : null,
    frameworks: [],
    fieldExists: function (name) {
        return this.fields[name] ? true : false;
    },
    getFieldEditables: function (name) {
        return this.fields[name] ? this.fields[name] : null;
    },
    getFieldsByEditable: function (editable) {
        let fields = {};

        for(let i in this.fields)
        {
            if(this.fields[i].indexOf(editable) >= 0)
            {
                fields[i] = this.fields[i];
            }
        }

        return fields;
    }
};

vibu.blocks.group.defaults = {
    name: null,
    label: null
};




/*vibu.blocks.block('custom/block1', function (url, editor) {
    return {
        label: 'Corimp - Kontakt',
        //icon: url + '/block-icon.png',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/text-no1.jpg',
        html: '<div></div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            phone1link : [ 'link' ],
            phone1icon : [ 'image' ],
            phone1text : [ 'text' ],
            headline   : [ 'text' ],
            text1      : [ 'text' ],
            text2      : [ 'text' ]
        }
    };
});*/



vibu.blocks.group('default', function (url, editor) {
    return { label: 'Ogólne' };
});
vibu.blocks.group('text', function (url, editor) {
    return { label: 'Tekst' };
});
vibu.blocks.group('headline', function (url, editor) {
    return { label: 'Nagłówki' };
});
vibu.blocks.group('features', function (url, editor) {
    return { label: 'Cechy' };
});
vibu.blocks.group('images', function (url, editor) {
    return { label: 'Zdjęcia' };
});
vibu.blocks.group('galleries', function (url, editor) {
    return { label: 'Galerie zdjęć' };
});
vibu.blocks.group('text-and-images', function (url, editor) {
    return { label: 'Text + Zdjęcia' };
});
vibu.blocks.group('video', function (url, editor) {
    return { label: 'Video' };
});
/**
 * UL, OL, kilka styli danej listy.
 */
vibu.blocks.group('list', function (url, editor) {
    return { label: 'Listy' };
});
vibu.blocks.group('faqs', function (url, editor) {
    return { label: 'FAQ' };
});
vibu.blocks.group('boxes', function (url, editor) {
    return { label: 'Boksy' };
});


vibu.blocks.block('core/text', function (url, editor) {
    return {
        group: 'text',
        label: 'Tekst - 1 kolumna',
        icon : 'http://localhost/vibu-visual-builder/dist/test-block-images/grid-12.jpg',
        html : '<div class="vibu-block" vibu-block="core/text">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col">\
                        <p vibu-field="text">Lorem ipsum...</p>\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            text: [ 'text', 'margin' ]
        }
    };
});

vibu.blocks.block('core/text/col-6-6', function (url, editor) {
    return {
        group: 'text',
        label: 'Tekst - 2 kolumny',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/grid-6-6.jpg',
        html: '<div class="vibu-block" vibu-block="core/text/col-6-6">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col-12 col-xl-6 col-lg-6 col-md-6 col-sm-6">\
                        <p vibu-field="text1">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-6 col-lg-6 col-md-6 col-sm-6">\
                        <p vibu-field="text2">Lorem ipsum...</p>\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            text1: [ 'text', 'margin' ],
            text2: [ 'text', 'margin' ],
        }
    };
});

vibu.blocks.block('core/text/col-4-4-4', function (url, editor) {
    return {
        group: 'text',
        label: 'Tekst - 3 kolumny',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/grid-4-4-4.jpg',
        html: '<div class="vibu-block" vibu-block="core/text/col-4-4-4">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-12">\
                        <p vibu-field="text1">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-6">\
                        <p vibu-field="text2">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-6">\
                        <p vibu-field="text3">Lorem ipsum...</p>\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            text1: [ 'text', 'margin' ],
            text2: [ 'text', 'margin' ],
            text3: [ 'text', 'margin' ],
        }
    };
});

vibu.blocks.block('core/text/col-3-3-3-3', function (url, editor) {
    return {
        group: 'text',
        label: 'Tekst - 4 kolumny',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/grid-3-3-3-3.jpg',
        html: '<div class="vibu-block" vibu-block="core/text/col-3-3-3-3">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col-12 col-xl-3 col-lg-3 col-md-6 col-sm-6">\
                        <p vibu-field="text1">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-3 col-lg-3 col-md-6 col-sm-6">\
                        <p vibu-field="text2">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-3 col-lg-3 col-md-6 col-sm-6">\
                        <p vibu-field="text3">Lorem ipsum...</p>\
                    </div>\
                    <div class="col-12 col-xl-3 col-lg-3 col-md-6 col-sm-6">\
                        <p vibu-field="text4">Lorem ipsum...</p>\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            text1: [ 'text', 'margin' ],
            text2: [ 'text', 'margin' ],
            text3: [ 'text', 'margin' ],
            text4: [ 'text', 'margin' ],
        }
    };
});

vibu.blocks.block('core/image', function (url, editor) {
    return {
        group: 'images',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/images-single.jpg',
        html : '<div class="vibu-block" vibu-block="core/image">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col text-center">\
                        <img src="http://via.placeholder.com/1400x100&text=VIBU" vibu-field="image" />\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            image: [ 'image', 'margin', 'alt', 'title' ]
        }
    };
});

vibu.blocks.block('core/image/col-6-6', function (url, editor) {
    return {
        group: 'images',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/images-6-6.jpg',
        html : '<div class="vibu-block" vibu-block="core/image/col-6-6">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col-12 col-xl-6 col-lg-6 col-md-6 col-sm-6 text-center mb-2 mb-xl-0 mb-lg-0 mb-md-0 mb-sm-0">\
                        <img src="http://via.placeholder.com/660x100&text=VIBU" vibu-field="image1" />\
                    </div>\
                    <div class="col-12 col-xl-6 col-lg-6 col-md-6 col-sm-6 text-center">\
                        <img src="http://via.placeholder.com/660x100&text=VIBU" vibu-field="image2" />\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            image1: [ 'image', 'margin', 'alt', 'title' ],
            image2: [ 'image', 'margin', 'alt', 'title' ],
        }
    };
});

vibu.blocks.block('core/image/col-4-4-4', function (url, editor) {
    return {
        group: 'images',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/images-4-4-4.jpg',
        html : '<div class="vibu-block" vibu-block="core/image/col-4-4-4">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="row">\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-12 text-center mb-2 mb-xl-0 mb-lg-0 mb-md-0 mb-sm-2">\
                        <img src="http://via.placeholder.com/466x100&text=VIBU" vibu-field="image1" />\
                    </div>\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-6 text-center mb-2 mb-xl-0 mb-lg-0 mb-md-0 mb-sm-2">\
                        <img src="http://via.placeholder.com/466x100&text=VIBU" vibu-field="image2" />\
                    </div>\
                    <div class="col-12 col-xl-4 col-lg-4 col-md-4 col-sm-6 text-center">\
                        <img src="http://via.placeholder.com/466x100&text=VIBU" vibu-field="image3" />\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            image1: [ 'image', 'margin', 'alt', 'title' ],
            image2: [ 'image', 'margin', 'alt', 'title' ],
            image3: [ 'image', 'margin', 'alt', 'title' ],
        }
    };
});

vibu.blocks.block('core/faq', function (url, editor) {
    return {
        group: 'faqs',
        label: 'FAQ',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/headline-no1.jpg',
        html: '<div class="vibu-block" vibu-block="core/faq">\
            <div class="vibu-container container-fluid" vibu-block-container>\
                <div class="accordion" id="accordionExample" vibu-repeatable>\
                    <div class="card">\
                        <div class="card-header py-1 px-1" id="headingOne">\
                            <h5 class="mb-0">\
                                <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne"  vibu-field="title">\
                                    Collapsible Group Item #1\
                                </button>\
                            </h5>\
                        </div>\
                        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">\
                            <div class="card-body">\
                                <p class="mb-0" vibu-field="content">Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven\'t heard of them accusamus labore sustainable VHS.</p>\
                            </div>\
                        </div>\
                    </div>\
                    <div class="card" vibu-repeatable-pattern>\
                        <div class="card-header py-1 px-1" id="headingOne">\
                            <h5 class="mb-0">\
                                <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne"  vibu-field="title">\
                                    Collapsible Group Item #1\
                                </button>\
                            </h5>\
                        </div>\
                        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">\
                            <div class="card-body">\
                                <p class="mb-0" vibu-field="content">Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven\'t heard of them accusamus labore sustainable VHS.</p>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>',
        frameworks: [ 'bootstrap-4' ],
        fields: {
            block: [ 'margin' ],
            title: [ 'text' ],
            content: [ 'text' ],
        }
    };
});












vibu.blocks.block('core/headline', function (url, editor) {
    return {
        group: 'headline',
        label: 'Nagłówek',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/headline-no1.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/headline/colored', function (url, editor) {
    return {
        group: 'headline',
        label: 'Nagłówek - z tekstem poniżej',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/headline-colored-no1.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/headline/colored2', function (url, editor) {
    return {
        group: 'headline',
        label: 'Nagłówek - z tekstem po prawej',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/headline-colored-no2.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/headline/colored-with-text', function (url, editor) {
    return {
        group: 'headline',
        label: 'Nagłówek - z dwoma tekstami',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/headline-followed-by-text-in-line-no1.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/features', function (url, editor) {
    return {
        group: 'features',
        label: 'Cechy',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/boxes-grouped-in-columns-no1.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/features2', function (url, editor) {
    return {
        group: 'features',
        label: 'Cechy - z ikonkami',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/boxes-grouped-in-columns-no2.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});

vibu.blocks.block('core/features3', function (url, editor) {
    return {
        group: 'features',
        label: 'Cechy - z ikonkami i wcięciem',
        icon: 'http://localhost/vibu-visual-builder/dist/test-block-images/boxes-grouped-in-columns-no3.jpg',
        frameworks: [ 'bootstrap-4' ],
    };
});
