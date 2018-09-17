/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// ELEMENTS ------------------------------------------------------------------
// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');
var languageSelectorElement = document.getElementById('selectTargetLanguage');
//var targetLanguageCode = languageSelectorElement.options[languageSelectorElement.selectedIndex].value;
// end ELEMENTS ---------------------------------------------------------------

// AUTH -----------------------------------------------------------------------
// Signs-in Friendly Chat.
function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}
// Signs-out of Friendly Chat.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}
// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}
// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}
// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}
// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}
// Requests permissions to show notifications.
function requestNotificationsPermissions() {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function() {
        // Notification permission granted.
        saveMessagingDeviceToken();
    }).catch(function(error) {
        console.error('Unable to get permission to notify.', error);
    });
}
// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
    if (user) { // User is signed in!
        // Get the signed-in user's profile pic and name.
        var profilePicUrl = getProfilePicUrl();
        var userName = getUserName();

        // Set the user's profile pic and name.
        userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
        userNameElement.textContent = userName;

        // Show user's profile and sign-out button.
        userNameElement.removeAttribute('hidden');
        userPicElement.removeAttribute('hidden');
        signOutButtonElement.removeAttribute('hidden');

        // Hide sign-in button.
        signInButtonElement.setAttribute('hidden', 'true');

        // We save the Firebase Messaging Device token and enable notifications.
        saveMessagingDeviceToken();
    } else { // User is signed out!
        // Hide user's profile and sign-out button.
        userNameElement.setAttribute('hidden', 'true');
        userPicElement.setAttribute('hidden', 'true');
        signOutButtonElement.setAttribute('hidden', 'true');

        // Show sign-in button.
        signInButtonElement.removeAttribute('hidden');
    }
}
// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
    // Return true if the user is signed in Firebase
    if (isUserSignedIn()) {
        return true;
    }
    // Display a message to the user using a Toast.
    var data = {
        message: 'You must sign-in first',
        timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return false;
}
// end AUTH -------------------------------------------------------------------------

// SETUP ----------------------------------------------------------------------------
// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions and make ' +
            'sure you are running the codelab using `firebase serve`');
    }
}
// end SETUP ------------------------------------------------------------------------

// SUBMITTING -----------------------------------------------------------------------
// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
    if (messageInputElement.value) {
        submitButtonElement.removeAttribute('disabled');
    } else {
        submitButtonElement.setAttribute('disabled', 'true');
    }
}
// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}
// Saves a new message on the Firebase DB.
function saveMessage(messageText) {
    // Add a new message entry to the Firebase database.
    return firebase.database().ref('/messages/').push({
        name: getUserName(),
        text: messageText,
        profilePicUrl: getProfilePicUrl()
    }).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
}
// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (messageInputElement.value && checkSignedInWithMessage()) {
        // let chosenLanguage = $("#selectTargetLanguage :selected").val();
        // postData(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${chosenLanguage}`, [{Text: messageInputElement.value}])
        //     .then(data => saveMessage(data[0].translations[0].text).then(function() {
        //         // Clear message text field and re-enable the SEND button.
        //         resetMaterialTextfield(messageInputElement);
        //         toggleButton();
        //     })) // JSON-string from `response.json()` call
        //     .catch(error => console.error(error));
        saveMessage(messageInputElement.value).then(function() {
            // Clear message text field and re-enable the SEND button.
            resetMaterialTextfield(messageInputElement);
            toggleButton();
        }).catch(error => console.error("Save message error: " + error));
    }
}
// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
    firebase.messaging().getToken().then(function(currentToken) {
        if (currentToken) {
            console.log('Got FCM device token:', currentToken);
            // Saving the Device Token to the datastore.
            firebase.database().ref('/fcmTokens').child(currentToken)
                .set(firebase.auth().currentUser.uid);
        } else {
            // Need to request permissions to show notifications.
            requestNotificationsPermissions();
        }
    }).catch(function(error){
        console.error('Unable to get messaging token.', error);
    });
}
// end SUBMITTING -----------------------------------------------------------------

// MESSAGES -----------------------------------------------------------------------
// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="spacing"><div class="pic"></div></div>' +
    '<div class="message"></div>' +
    '<div class="message-bottom"> ' +
    '<div class="name"></div>' +
    '<button class="error-button mdl-button mdl-js-button mdl-button--accent" title="Report Error" onClick="reportErrorClick()">' +
    '<i class="material-icons">error</i></button>' +
    '</div>' +
    '</div>';
// Loads 12 from chat message history and listens for upcoming ones.
function loadMessages() {
  // Loads the last 12 messages and listen for new ones.
  var callback = function(snap) {
    var data = snap.val();
    displayMessage(snap.key, data.name, data.text, data.profilePicUrl, data.imageUrl);
  };
  firebase.database().ref('/messages/').limitToLast(12).on('child_added', callback);
  firebase.database().ref('/messages/').limitToLast(12).on('child_changed', callback);
}
// Displays a Message in the UI.
function displayMessage(key, name, text, picUrl, imageUrl) {
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = MESSAGE_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        messageListElement.appendChild(div);
    }
    if (picUrl) {
        div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    }
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    if (text) { // If the message is text.
        displayTextMessage(messageElement, text);
    } else if (imageUrl) { // If the message is an image.
        var image = document.createElement('img');
        image.addEventListener('load', function() {
            messageListElement.scrollTop = messageListElement.scrollHeight;
        });
        image.src = imageUrl + '&' + new Date().getTime();
        messageElement.innerHTML = '';
        messageElement.appendChild(image);
    }
    // Show the card fading-in and scroll to view the new message.
    setTimeout(function() {div.classList.add('visible')}, 1);
    messageListElement.scrollTop = messageListElement.scrollHeight;
    messageInputElement.focus();
}
// displays a message that's made up of text
function displayTextMessage(messageElement, text){
    messageElement.textContent = text.replace(/\n/g, '<br>');
    onLoadText(text, messageElement);
}
// end MESSAGES -----------------------------------------------------------------------

// IMAGES -----------------------------------------------------------------------------
// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(file) {
  // 1 - We add a message with a loading icon that will get updated with the shared image.
  firebase.database().ref('/messages/').push({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl()
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.key + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image’s URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}
// Triggered when a file is selected via the media picker.
// Used for choosing image files to upload
function onMediaFileSelected(event) {
    event.preventDefault();
    var file = event.target.files[0];

    // Clear the selection in the file picker input.
    imageFormElement.reset();

    // Check if the file is an image.
    if (!file.type.match('image.*')) {
        var data = {
            message: 'You can only share images',
            timeout: 2000
        };
        signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
        return;
    }
    // Check if the user is signed-in
    if (checkSignedInWithMessage()) {
        saveImageMessage(file);
    }
}
// end IMAGES -----------------------------------------------------------------------------

// TRANSLATION -----------------------------------------------------------------------------

function onLoadText(text, messageElement) {
    let chosenLanguage = $("#selectTargetLanguage :selected").val();
    postData(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${chosenLanguage}`, [{Text: text}])
        .then(data => updateText(data[0].translations[0].text, messageElement))
            .catch(error => console.error("Translating text error: " + error));
}

function updateText(text, messageElement){
  //document.getElementById(id).children[1].update(text);
    messageElement.textContent = text;
}
// end TRANSLATION ---------------------------------------------------------------------

// ERRORS ------------------------------------------------------------------------------
// Close error alerts
// Works for multiple error buttons
// Get all elements with class="closebtn"
var close = document.getElementsByClassName("closebtn");
var i;
// Loop through all close buttons
for (i = 0; i < close.length; i++) {
    // When someone clicks on a close button
    close[i].onclick = function(){
        // Get the parent of <span class="closebtn"> (<div class="neutral-alert">)
        var div = this.parentElement;
        // Set the opacity of div to 0 (transparent)
        div.style.opacity = "0";
        // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
        setTimeout(function(){ div.style.display = "none"; }, 600);
    }
}
// Error reporting and display an alert
function reportError(messageText, messageID){
  close[0].parentElement.style.display = 'block';

  console.log("there's an error: ");
    return firebase.database().ref('/errors/').push({
         messageID: messageID,
         errorMessage: messageText,
         targetLanguage: $("#selectTargetLanguage :selected").val()
    }).catch(function(error) {
        console.error('Error reporting error to Firebase Database', error);
    });
}
// click event
// TODO errors are never actually sent because the world is full of lies
function reportErrorClick(){
    //reportError($(this).querySelector('.message').text, $(this).attr("id"));
    reportError("hi, Zuko here", 6);
}

// end ERRORS --------------------------------------------------------------------------

// FUNCTIONS ---------------------------------------------------------------------------
// Checks that Firebase has been imported.
checkSetup();
// initialize Firebase
initFirebaseAuth();
// We load currently existing chat messages and listen to new ones.
loadMessages();
// load image view
function loadImages(){

}
// end FUNCTIONS ------------------------------------------------------------------------

// LISTENERS ----------------------------------------------------------------------------
// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

//  Signals change in language selector to retranslate text in existing messages
//languageSelectorElement.addEventListener('change', testLoadMessages);
$('#selectTargetLanguage').on("change", function() {
        console.log("noticed a change in language!");
        let msgs = document.getElementsByClassName("message");
        var iter;
// Loop through all close buttons
        for (iter = 0; iter < msgs.length; iter++) {
            onLoadText(msgs[iter].textContent, msgs[iter]);
        }
});
// Attach a delegated event handler with a more refined selector
/*
 $('.message-container').on( "click", ".error-button", function( event ) {
   // gets the message child's inner text
     //reportError($(this).children[1].text, $(this).attr("id"));
     //$(this).attr("id")
     console.log("bubble");
     reportError($(this).querySelector('.message').text, $(this).attr('id'));
 });
 */

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
    e.preventDefault();
    mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);
// end LISTENERS ---------------------------------------------------------------------
