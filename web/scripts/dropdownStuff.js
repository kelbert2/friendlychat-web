$(document).ready(function() {
    $.getJSON("scripts/countryjson.json", function (data) {
        $.each(data, function (index, value) {
            $('#langOption').append($('<option>').text(value['Country']).attr('value', value['Code']));
        });
    });
    $('.languageOptions').select2();
});
