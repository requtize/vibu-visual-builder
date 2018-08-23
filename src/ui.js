vibu.ui = function (editor) {
    this.editor = editor;

    this.init = function () {
        this._dropdowns(this.editor.getNode());
    };

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
};
