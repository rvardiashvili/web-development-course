// profilePic.js - Handles profile picture upload and deletion

import { showMessage } from './utils.js';

// Get references to profile picture related elements
const currentProfilePicContainer = document.querySelector('.current-profile-pic-container');
const profilePicChoicePopup = document.getElementById('profile-pic-choice-popup');
const uploadNewPicButton = document.getElementById('upload-new-pic-button');
let deletePicButton = document.getElementById('delete-pic-button'); // Use let as it might be reassigned
const cancelChoiceButton = document.getElementById('cancel-choice-button');
const uploadForm = document.getElementById('upload-profile-pic-form');
const profilePicFileInput = uploadForm.querySelector('input[type="file"]');
const currentProfileImage = document.getElementById('current-profile-image');
const profilePicMessageContainer = document.getElementById('profile-picture-messages');

/**
 * Hides all profile picture related nested popups/forms.
 */
function hideProfilePicActions() {
    if (profilePicChoicePopup) profilePicChoicePopup.style.display = 'none';
    if (uploadForm) uploadForm.style.display = 'none';
}

/**
 * Handles profile picture deletion.
 */
async function handleDeleteProfilePic() {
    hideProfilePicActions(); // Hide the choice popup

    // Confirmation dialog
    if (!confirm('Are you sure you want to delete your profile picture?')) {
        showMessage(profilePicMessageContainer, 'info', 'Profile picture deletion canceled.');
        return;
    }

    showMessage(profilePicMessageContainer, 'info', 'Deleting profile picture...');

    try {
        const response = await fetch('/api/profile/delete_profile_pic', {
            method: 'POST',
        });

        const data = await response.json();

        if (data.status === 'success') {
            showMessage(profilePicMessageContainer, 'success', data.message);
            if (currentProfileImage) currentProfileImage.src = data.profile_picture_url;
            // Optionally update the profile picture in the main header as well
            const headerProfilePic = document.querySelector('.profile-pic img');
            if (headerProfilePic) {
                headerProfilePic.src = data.profile_picture_url;
            }
            // Remove the delete button as there's no picture to delete
            if (deletePicButton) {
                deletePicButton.removeEventListener('click', handleDeleteProfilePic); // Clean up listener
                deletePicButton.remove();
                deletePicButton = null; // Set reference to null
            }
        } else {
            showMessage(profilePicMessageContainer, 'error', data.message);
        }
    } catch (error) {
        console.error('Deletion failed:', error);
        showMessage(profilePicMessageContainer, 'error', 'An error occurred during deletion.');
    }
    // Ensure the upload form is hidden just in case
    if (uploadForm) uploadForm.style.display = 'none';
    // Clear the file input value
    if (profilePicFileInput) profilePicFileInput.value = '';
}

/**
 * Sets up event listeners for profile picture interactions.
 */
export function setupProfilePicListeners() {
    // Clicking on the profile picture shows the choice popup
    if (currentProfilePicContainer) {
        currentProfilePicContainer.addEventListener('click', () => {
            hideProfilePicActions(); // Hide any currently open action
            if (profilePicChoicePopup) profilePicChoicePopup.style.display = 'flex'; // Show the choice popup
            if (profilePicMessageContainer) profilePicMessageContainer.innerHTML = ''; // Clear messages related to previous actions
        });
    }

    // Clicking "Cancel" on the choice popup
    if (cancelChoiceButton) {
        cancelChoiceButton.addEventListener('click', () => {
            hideProfilePicActions(); // Just hide the choice popup
            if (profilePicMessageContainer) profilePicMessageContainer.innerHTML = ''; // Clear messages
        });
    }

    // Clicking "Upload New Profile Picture" in the choice popup
    if (uploadNewPicButton) {
        uploadNewPicButton.addEventListener('click', () => {
            hideProfilePicActions(); // Hide the choice popup
            if (profilePicMessageContainer) profilePicMessageContainer.innerHTML = ''; // Clear messages before file selection
            // Trigger the file input click programmatically
            if (profilePicFileInput) profilePicFileInput.click();
        });
    }

    // Event listener for when a file is selected for profile picture upload
    if (profilePicFileInput) {
        profilePicFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0]; // Get the selected file

            if (!file) {
                // User canceled the file selection
                showMessage(profilePicMessageContainer, 'info', 'Profile picture upload canceled.');
                return;
            }

            // Display a message indicating upload is in progress
            showMessage(profilePicMessageContainer, 'info', 'Uploading profile picture...');

            const formData = new FormData();
            formData.append('profile_pic', file);

            try {
                const response = await fetch('/api/profile/upload_profile_pic', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.status === 'success') {
                    showMessage(profilePicMessageContainer, 'success', data.message);
                    if (currentProfileImage) currentProfileImage.src = data.profile_picture_url;
                    // Optionally update the profile picture in the main header as well
                    const headerProfilePic = document.querySelector('.profile-pic img');
                    if (headerProfilePic) {
                        headerProfilePic.src = data.profile_picture_url;
                    }
                    // If the delete button was not present, add it now dynamically
                    if (!document.getElementById('delete-pic-button')) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.id = 'delete-pic-button';
                        deleteBtn.className = 'popup-choice-button delete-button';
                        deleteBtn.textContent = 'Delete Current Profile Picture';
                        const cancelBtn = document.getElementById('cancel-choice-button');
                        if (cancelBtn && profilePicChoicePopup) {
                            profilePicChoicePopup.insertBefore(deleteBtn, cancelBtn);
                            deleteBtn.addEventListener('click', handleDeleteProfilePic);
                            deletePicButton = deleteBtn; // Update the variable reference
                        }
                    }
                } else {
                    showMessage(profilePicMessageContainer, 'error', data.message);
                }
            } catch (error) {
                console.error('Upload failed:', error);
                showMessage(profilePicMessageContainer, 'error', 'An error occurred during upload.');
            } finally {
                // Clear the file input value regardless of success or failure
                event.target.value = '';
                // Hide the upload form visually (it's just a container now)
                if (uploadForm) uploadForm.style.display = 'none';
            }
        });
    }

    // Clicking "Delete Current Profile Picture" in the choice popup
    // This listener needs to be added after the delete button is potentially created dynamically
    // Or we can add it here and it will only be active if the button exists initially
    if (deletePicButton) {
        deletePicButton.addEventListener('click', handleDeleteProfilePic);
    }
}
