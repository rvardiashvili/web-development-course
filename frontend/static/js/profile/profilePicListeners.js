// profilePicListeners.js - Handles profile picture upload and deletion for both settings modal and wizard

import { showMessage, clearMessageContainers } from './utils.js';
import { fetchAndRenderMainPageData } from './mainPageDisplay.js'; // Import to refresh main page after actions

// Get references to profile picture related elements (settings modal)
const currentProfilePicContainer = document.querySelector('.current-profile-pic-container'); // In settings modal
const profilePicChoicePopup = document.getElementById('profile-pic-choice-popup'); // In settings modal
const uploadNewPicButton = document.getElementById('upload-new-pic-button'); // In settings modal
let deletePicButton = document.getElementById('delete-pic-button'); // In settings modal, use let as it might be reassigned
const cancelChoiceButton = document.getElementById('cancel-choice-button'); // In settings modal
const uploadForm = document.getElementById('upload-profile-pic-form'); // In settings modal
const settingsProfilePicFileInput = uploadForm ? uploadForm.querySelector('input[type="file"]') : null; // File input in settings modal
const currentProfileImage = document.getElementById('current-profile-image'); // Image in settings modal
const profilePicMessageContainer = document.getElementById('profile-picture-messages'); // Messages in settings modal


// Get references to profile picture related elements (wizard)
const wizardProfilePictureSection = document.getElementById('wizard-profile-picture-section'); // In wizard modal
const wizardProfileImage = document.getElementById('wizard-profile-image'); // Image in wizard
const wizardUploadPicButton = document.getElementById('wizard-upload-pic-button'); // Button in wizard (from provided profileApp.js)
const wizardUploadProfilePicForm = document.getElementById('wizard-upload-profile-pic-form'); // Form in wizard (from provided profileApp.js)
const wizardProfilePicFileInput = wizardUploadProfilePicForm ? wizardUploadProfilePicForm.querySelector('input[type="file"]') : null; // File input in wizard (from provided profileApp.js)
const wizardProfilePictureMessagesContainer = document.getElementById('wizard-profile-picture-messages'); // Messages in wizard (from provided profileApp.js)
const wizardProfilePicClickableArea = document.querySelector('.wizard-profile-pic-clickable'); // Added clickable area for profile pic (from provided profileApp.js)


// Get user context (assuming these data attributes are on the body)
const viewedUserId = document.body.dataset.viewedUserId;
const currentUserId = document.body.dataset.currentUserId;


/**
 * Hides all profile picture related nested popups/forms in both settings and wizard.
 */
export function hideProfilePicActions() {
    if (settingsProfilePicChoicePopup) settingsProfilePicChoicePopup.style.display = 'none';
    if (uploadForm) uploadForm.style.display = 'none';
    if (wizardUploadProfilePicForm) wizardUploadProfilePicForm.style.display = 'none';
}

/**
 * Handles profile picture deletion.
 */
async function handleDeleteProfilePic() {
    hideProfilePicActions(); // Hide the choice popup

    // Determine which messages container to use (settings or wizard)
    // This function is called by the delete button, which is only in the settings modal currently.
    const messagesContainer = profilePicMessageContainer;


    // Confirmation dialog
    if (!confirm('Are you sure you want to delete your profile picture?')) {
        showMessage(messagesContainer, 'info', 'Profile picture deletion canceled.');
        return;
    }

    showMessage(messagesContainer, 'info', 'Deleting profile picture...');

    try {
        const response = await fetch('/api/profile/delete_profile_pic', {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.status === 'success') {
            showMessage(messagesContainer, 'success', data.message);
            // Update the image source to a default picture in both settings and main profile
            const defaultPicUrl = data.default_profile_picture_url; // Assuming backend provides this
            if (currentProfileImage) currentProfileImage.src = defaultPicUrl;
             if (viewedUserId === currentUserId) {
                const mainProfilePic = document.querySelector('.profile-pic img');
                if (mainProfilePic) mainProfilePic.src = defaultPicUrl;
             }
             // Hide the delete button in the settings modal after deletion
             if (deletePicButton) deletePicButton.style.display = 'none';

        } else {
            showMessage(messagesContainer, 'error', data.message || 'Deletion failed.');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showMessage(messagesContainer, 'error', 'An error occurred during deletion.');
    }
}

/**
 * Handles the profile picture upload process.
 * @param {File} file - The selected image file.
 * @param {HTMLElement} messagesContainer - The container to display messages.
 * @param {HTMLElement} imageElement - The image element to update with the new picture.
 * @param {HTMLElement | null} formElement - The form element associated with the file input (for clearing).
 */
async function handleProfilePicUpload(file, messagesContainer, imageElement, formElement = null) {
    if (!file) {
        showMessage(messagesContainer, 'info', 'Profile picture upload canceled.');
        return;
    }

    showMessage(messagesContainer, 'info', 'Uploading profile picture...');

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
        const response = await fetch('/api/profile/upload_profile_pic', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.status === 'success') {
            showMessage(messagesContainer, 'success', data.message);
            // Update the image source in the provided image element
            if (imageElement) imageElement.src = data.profile_picture_url;
            // Also update the main profile picture if the user is viewing their own profile
            const viewedUserId = document.body.dataset.viewedUserId;
            const currentUserId = document.body.dataset.currentUserId;
            if (viewedUserId === currentUserId) {
                 const mainProfilePic = document.querySelector('.profile-pic img');
                 if (mainProfilePic) mainProfilePic.src = data.profile_picture_url;
            }
             // If in settings modal, show the delete button after a successful upload
             if (messagesContainer === profilePicMessageContainer && deletePicButton) {
                 deletePicButton.style.display = 'block';
             }

        } else {
            showMessage(messagesContainer, 'error', data.message);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        showMessage(messagesContainer, 'error', 'An error occurred during upload.');
    } finally {
        // Clear the file input value regardless of success or failure
        if (formElement) {
            const fileInput = formElement.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
        }
         // Hide the upload form visually (it's just a container now) if in settings modal
         if (formElement === uploadForm) {
             if (uploadForm) uploadForm.style.display = 'none';
         }
    }
}


/**
 * Sets up event listeners for profile picture related actions in both settings modal and wizard.
 */
export function setupProfilePicListeners() {
    // --- Settings Modal Listeners ---

    // Clicking on the current profile picture in the settings modal
    // This should trigger the file input directly for the old behavior
    if (currentProfilePicContainer && settingsProfilePicFileInput && profilePicMessageContainer && currentProfileImage) {
        currentProfilePicContainer.style.cursor = 'pointer'; // Indicate clickable
        currentProfilePicContainer.addEventListener('click', () => {
             // Trigger the file input click programmatically
             settingsProfilePicFileInput.click();
             // Hide any other profile pic related UI elements that might be open
             hideProfilePicActions();
             // Clear messages specific to profile pic section
             clearMessageContainers([profilePicMessageContainer].filter(Boolean));
        });

        // Handle file input change for upload in settings modal
        settingsProfilePicFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            // Use the generic upload handler
            handleProfilePicUpload(file, profilePicMessageContainer, currentProfileImage, uploadForm);
        });
    }


    // Clicking "Delete Current Profile Picture" in the settings choice popup
    // This listener needs to be added after the delete button is potentially created dynamically
    // Or we can add it here and it will only be active if the button exists initially
    if (deletePicButton) {
        deletePicButton.addEventListener('click', handleDeleteProfilePic);
    }

    // Clicking "Upload New Picture" in the settings choice popup (if this UI is still used)
    // Based on the user's description, clicking the picture itself triggers upload.
    // This button might be redundant or used for a different flow.
    // If it exists and should show the upload form, add a listener:
    if (uploadNewPicButton && uploadForm) {
         uploadNewPicButton.addEventListener('click', () => {
             hideProfilePicActions(); // Hide the choice popup
             uploadForm.style.display = 'block'; // Show the upload form (if uploadForm is a container for the file input)
             clearMessageContainers([profilePicMessageContainer].filter(Boolean)); // Clear messages
             // Trigger the file input click if the button is meant to initiate the file selection
             if (settingsProfilePicFileInput) settingsProfilePicFileInput.click();
         });
    }

     // Clicking "Cancel" in the settings choice popup (if this UI is still used)
     if (cancelChoiceButton) {
         cancelChoiceButton.addEventListener('click', () => {
             hideProfilePicActions(); // Hide the choice popup
             clearMessageContainers([profilePicMessageContainer].filter(Boolean)); // Clear messages
         });
     }


    // --- Wizard Listeners ---

    // Wizard Profile Picture Upload
    // Trigger file input click when the profile picture area is clicked in the wizard
    if (wizardProfilePicClickableArea && wizardProfilePicFileInput && wizardProfilePictureMessagesContainer && wizardProfileImage) {
         wizardProfilePicClickableArea.style.cursor = 'pointer'; // Indicate it's clickable
         wizardProfilePicClickableArea.addEventListener('click', () => {
             // Trigger the file input click programmatically
             wizardProfilePicFileInput.click();
         });

         // Handle file input change for upload in wizard
         wizardProfilePicFileInput.addEventListener('change', async (event) => {
             const file = event.target.files[0];
             // Use the generic upload handler
             handleProfilePicUpload(file, wizardProfilePictureMessagesContainer, wizardProfileImage, wizardUploadProfilePicForm);
         });
    }

    // Note: Delete profile picture functionality is currently only in the settings modal.
    // If needed in the wizard, a similar button and listener would be added here,
    // potentially reusing the handleDeleteProfilePic function but ensuring it uses
    // the correct messages container for the wizard.
}

// Export profile picture related forms for use in hideAllAddEditForms in modalControl/profileApp
export { uploadForm, wizardUploadProfilePicForm };
