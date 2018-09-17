/*


// first load up the images
function loadImages(){
    let select = $('#selectImage')

    var callback = function(snap) {
        var data = snap.val();
        displayImage(snap.key, data.name, data.text, data.profilePicUrl, data.imageUrl);
    };
    firebase.database().ref('/images/').on('child_added', callback);
    firebase.database().ref('/images/').on('child_changed', callback);
}

displayImage(){
    var newOption;
    newOption = new Option(value['Name'], value['Name'], false, false);
    $(newOption).data('data-img-src', value['url']);
    select.append(newOption);
}


'<option data-img-src="url" value="image-name"> image-name</option>' ;






// HTML
<div id="selectImage">
    <img src="blabla" />
    <img src="blabla" />
...
</div>
<form ...>
<input id="image_from_list" name="image_from_list" type="hidden" value="" />
    <input id="image_from_file" name="image_from_file" type="file" />
    </form>
// JS
$('div#selectImage img').click(function(){
    // set the img-source as value of image_from_list
    $('input#image_from_list').val( $(this).attr("src") );
});


$(document).ready(function () {
    $("#selectImage").imagepicker({
        hide_select: true
    });

    var $container = $('.image_picker_selector');
    // initialize
    $container.imagesLoaded(function () {
        $container.masonry({
            columnWidth: 30,
            itemSelector: '.thumbnail'
        });
    });
});

*/