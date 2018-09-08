vibu.ui = function (editor) {
    this.editor = editor;

    this.init = function () {
        let self = this;

        this.editor.onReady(function () {
            self._dropdowns(self.editor.getNode());
            self._modals(self.editor.getNode());
            self._checkboxes(self.editor.getNode());
            self._accordions(self.editor.getNode());
            self._tooltips(self.editor.getNode());
        });
    };

    this.load = function (onLoad) {};

    this._dropdowns = function (node) {
        node.on('click', '.vibu-dropdown-toggle', function (e) {
            let parent = $(this).parent();

            parent.find('.vibu-dropdown-menu').toggleClass('vibu-show');
            e.stopPropagation();
        });

        node.find('.vibu-dropdown-menu').on('click', function (e) {
            if($(this).hasClass('vibu-dropdown-prevent-autoclose'))
            {
                e.stopPropagation();
            }
        });

        $('body').on('click', function () {
            node.find('.vibu-dropdown-menu.vibu-show').removeClass('vibu-show');
        });
    };

    this._modals = function (node) {

    };

    this._checkboxes = function (node) {

    };

    this._accordions = function (node) {
        node.on('click', '.vibu-accordion-label', function () {
            $(this)
                .closest('.vibu-accordion')
                .find('.vibu-accordion-item')
                .removeClass('vibu-accordion-opened');

            $(this)
                .closest('.vibu-accordion-item')
                .addClass('vibu-accordion-opened');
        });
    };

    this._tooltips = function (node) {
        let tooltip = $('<div class="vibu-tooltip vibu-hidden"></div>');

        node.find('.vibu-container').append(tooltip);

        node.on('mouseenter', '[vibu-tooltip]', function () {
            let offset = $(this).offset();

            tooltip.removeClass('vibu-hidden').css({
                left: offset.left + ($(this).outerWidth() / 2),
                top : offset.top
            }).text($(this).attr('title'));
        }).on('mouseleave', '[vibu-tooltip]', function () {
            tooltip.addClass('vibu-hidden');
        });
    };
};
