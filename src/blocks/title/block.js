vibu.block('custom/block1', function (url) {
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
                get: function (element, value) {
                    return element.css('background-image');
                },
                set: function (element, value) {
                    element.css('background-image', 'url(' + value + ')');
                }
            }
        }
    };
});
