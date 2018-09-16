$(document).ready(function() {

    let select = $('#selectTargetLanguage')
    $.getJSON("scripts/languageCode.json", function (data) {
        $.each(data, function (key, value) {
            // Set the value, creating a new option if necessary
            /*if (select.find("option[value='" + value['Code'] + "']").length) {
                //select.val(value['Code']).trigger('change');
                //    select.append($('<option selected="selected">').attr('value', value['Code']).text(value['Country']));
            */
            var newOption;
            if(value['Code'] == 'en') { // English is the default language
                // Create a DOM Option and pre-select by default
                newOption = new Option(value['Country'], value['Code'], true, true);
            } else {
                newOption = new Option(value['Country'], value['Code'], false, false);
            }
            select.append(newOption)
        });
    });
    $('.select2-class').select2({
        dropdownParent: $('.language-selector'), placeholder: 'Select a language', dropdownAutoWidth : true, width: 'auto'
    });
    // does flash the placeholder text before finds english, but should have text just in case can't find it
});
