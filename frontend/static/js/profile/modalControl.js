// modalControl.js - Handles opening and closing modals and related UI cleanup

import { clearMessageContainers, hideAllAddEditForms } from './utils.js';
import { fetchAndRenderMainPageData } from './mainPageDisplay.js'; // Import to refresh main page on close
import { fetchAndRenderExperienceForModal } from './experienceSections.js'; // Import to refresh modal data on open
// NOTE: Removing direct form imports here
// import { editBioForm, editSkillsForm, editInterestsForm, editLanguagesForm } from './settingsFormListeners.js';
// import { uploadForm, wizardUploadProfilePicForm } from './profilePicListeners.js';
// Import getProfileDataCache to populate settings forms
import { getProfileDataCache } from './detailsPopup.js';


// Get references to top-level modal elements
const profileSettingsPopup = document.getElementById('profile-settings-popup');
const profileWizardPopup = document.getElementById('profile-wizard-popup');

// Get references to profile picture related nested popups/forms (used by hideProfilePicActions)
// These elements are assumed to exist in the HTML structure of the modals
const settingsProfilePicChoicePopup = document.getElementById('profile-pic-choice-popup');
// NOTE: Removing direct form imports here, will get references when needed
// const settingsUploadForm = document.getElementById('upload-profile-pic-form');
// const wizardUploadProfilePicForm = document.getElementById('wizard-upload-profile-pic-form');


// Placeholders for lists managed by profileApp.js, passed during setup
let allMessageContainers = [];
let allFormsToHide = [];


/**
 * Hides all profile picture related nested popups/forms in both settings and wizard.
 * Gets fresh references to the forms inside this function.
 */
function hideProfilePicActions() {
    const uploadForm = document.getElementById('upload-profile-pic-form');
    const wizardUploadProfilePicForm = document.getElementById('wizard-upload-profile-pic-form');

    if (settingsProfilePicChoicePopup) settingsProfilePicChoicePopup.style.display = 'none';
    // Use the locally obtained form references here
    if (uploadForm) uploadForm.style.display = 'none';
    if (wizardUploadProfilePicForm) wizardUploadProfilePicForm.style.display = 'none';
}


/**
 * Initializes the modal control module with necessary references and listeners.
 * This should be called once from profileApp.js on DOMContentLoaded.
 * @param {HTMLElement[]} messageContainers - Array of all message container elements from profileApp.js.
 * @param {HTMLElement[]} formsToHide - Array of all add/edit form elements from profileApp.js.
 */
export function setupModalControl(messageContainers, formsToHide) {
    allMessageContainers = messageContainers;
    allFormsToHide = formsToHide; // Store the list of all forms to hide

    // Add event listener for closing the profile settings modal close button
    const settingsCloseButton = profileSettingsPopup ? profileSettingsPopup.querySelector('.close-button') : null;
    if (settingsCloseButton) {
        settingsCloseButton.addEventListener('click', () => {
            closeModal(profileSettingsPopup);
        });
    }

    // Add event listener for clicking outside the settings modal to close it
    if (profileSettingsPopup) {
        window.addEventListener('click', (event) => {
            if (event.target === profileSettingsPopup) {
                closeModal(profileSettingsPopup);
            }
        });
    }

    // Note: Wizard close button listener and outside click listener
    // will be handled in wizardLogic.js, calling closeModal.
}


/**
 * Opens a modal and adds the 'modal-open' class to the body.
 * Also performs cleanup for other UI elements and ensures only one modal is visible.
 * @param {HTMLElement} modalElement - The modal element to open (profileSettingsPopup or profileWizardPopup).
 */
export function openModal(modalElement) {
    if (modalElement) {
        // --- Prevent Overlap: Hide both modals before showing the target one ---
        // Explicitly hide both potential modals before showing the target one
        if (profileSettingsPopup) profileSettingsPopup.style.display = 'none';
        if (profileWizardPopup) profileWizardPopup.style.display = 'none';
        // --- End Prevent Overlap ---

        modalElement.style.display = 'block';
        document.body.classList.add('modal-open'); // Add class to body

        // Perform cleanup when opening a modal
        clearMessageContainers(allMessageContainers);
        hideProfilePicActions(); // Use the local hideProfilePicActions
        // Hide all add/edit forms initially when ANY modal opens
        hideAllAddEditForms(allFormsToHide);


        // Fetch and populate data specifically for the settings modal if it's being opened
        if (modalElement === profileSettingsPopup) {
            const currentUserId = document.body.dataset.currentUserId; // Assuming currentUserId is available via data attribute
             if (currentUserId) {
                // Fetch and render experience data for the modal lists
                 fetchAndRenderExperienceForModal(currentUserId, fetchAndRenderMainPageData);

                 // --- Populate and show default forms in settings modal ---
                 const profileData = getProfileDataCache(); // Get cached profile data

                 console.log('Attempting to populate and show default settings forms...'); // Log attempt
                 console.log('Cached profileData for population:', profileData); // Log the cached data

                 // Get fresh references to settings forms inside this function
                 const editBioForm = document.getElementById('edit-bio-form');
                 const editSkillsForm = document.getElementById('edit-skills-form');
                 const editInterestsForm = document.getElementById('edit-interests-form');
                 const editLanguagesForm = document.getElementById('edit-languages-form');


                 // Bio Form
                 console.log('editBioForm:', editBioForm); // Log element reference
                 if (editBioForm) {
                     const bioTextarea = editBioForm.querySelector('textarea');
                     if (bioTextarea && profileData && profileData.bio !== undefined) {
                         bioTextarea.value = profileData.bio || ''; // Populate textarea
                         console.log('Populated Bio textarea:', bioTextarea.value);
                     } else if (bioTextarea) {
                          bioTextarea.value = ''; // Clear if no data
                          console.log('Bio textarea found, but profile data or bio missing. Clearing textarea.');
                     } else {
                         console.warn('Bio textarea not found in editBioForm.');
                     }
                     editBioForm.style.display = 'block'; // Always show the form if found
                 } else {
                     console.warn('editBioForm not found.'); // Log warning if form not found
                 }


                 // Skills Form
                 console.log('editSkillsForm:', editSkillsForm); // Log element reference
                 if (editSkillsForm) {
                     const skillsTextarea = editSkillsForm.querySelector('textarea');
                     if (skillsTextarea && profileData && profileData.employee_details && profileData.employee_details.skills !== undefined) {
                         skillsTextarea.value = profileData.employee_details.skills || ''; // Populate textarea
                         console.log('Populated Skills textarea:', skillsTextarea.value);
                     } else if (skillsTextarea) {
                         skillsTextarea.value = ''; // Clear if no data
                         console.log('Skills textarea found, but profile data or employee_details.skills missing. Clearing textarea.');
                     } else {
                         console.warn('Skills textarea not found in editSkillsForm.');
                     }
                     editSkillsForm.style.display = 'block'; // Always show the form if found
                 } else {
                      console.warn('editSkillsForm not found.'); // Log warning if form not found
                 }


                 // Interests Form
                 console.log('editInterestsForm:', editInterestsForm); // Log element reference
                 if (editInterestsForm) {
                     const interestsTextarea = editInterestsForm.querySelector('textarea');
                     if (interestsTextarea && profileData && profileData.employee_details && profileData.employee_details.interests !== undefined) {
                         interestsTextarea.value = profileData.employee_details.interests || ''; // Populate textarea
                         console.log('Populated Interests textarea:', interestsTextarea.value);
                     } else if (interestsTextarea) {
                          interestsTextarea.value = ''; // Clear if no data
                          console.log('Interests textarea found, but profile data or employee_details.interests missing. Clearing textarea.');
                     } else {
                         console.warn('Interests textarea not found in editInterestsForm.');
                     }
                     editInterestsForm.style.display = 'block'; // Always show the form if found
                 } else {
                      console.warn('editInterestsForm not found.'); // Log warning if form not found
                 }

                 // Languages Form (Employee Specific)
                 const currentUserType = document.body.dataset.currentUserType; // Get user type again locally
                 console.log('editLanguagesForm:', editLanguagesForm); // Log element reference
                 console.log('currentUserType:', currentUserType); // Log user type
                 if (editLanguagesForm && currentUserType === 'employee') {
                      const languagesTextarea = editLanguagesForm.querySelector('textarea');
                      if (languagesTextarea && profileData && profileData.employee_details && profileData.employee_details.languages !== undefined) {
                         languagesTextarea.value = profileData.employee_details.languages || ''; // Populate textarea
                         console.log('Populated Languages textarea:', languagesTextarea.value);
                      } else if (languagesTextarea) {
                          languagesTextarea.value = ''; // Clear if no data
                          console.log('Languages textarea found for employee, but profile data or employee_details.languages missing. Clearing textarea.');
                      } else {
                          console.warn('Languages textarea not found in editLanguagesForm.');
                      }
                     editLanguagesForm.style.display = 'block'; // Always show the form if found for employee
                 } else if (editLanguagesForm) {
                     console.log('editLanguagesForm found, but user is not an employee. Not showing.'); // Log if found but not employee
                 } else {
                      console.warn('editLanguagesForm not found.'); // Log warning if form not found
                 }
                 // --- End Population and Showing ---

             } else {
                 console.error("Current user ID not available to fetch modal data.");
             }
        }
    }
}

/**
 * Closes a modal and removes the 'modal-open' class from the body
 * if no other modals are open. Clears messages and hides forms.
 * @param {HTMLElement} modalElement - The modal element that is being closed.
 */
export function closeModal(modalElement) {
     if (modalElement) {
        modalElement.style.display = 'none';
        // Only remove modal-open if no other modals are open
        if (!document.querySelector('.modal[style*="display: block"]')) {
             document.body.classList.remove('modal-open'); // Remove class from body
        }
     }
     // Clear messages and hide forms for ALL modals when any modal is closed
     clearMessageContainers(allMessageContainers);
     hideProfilePicActions(); // Use the local hideProfilePicActions
     hideAllAddEditForms(allFormsToHide); // Hide all add/edit forms on close
     // Clear file inputs if they exist
     const fileInputs = document.querySelectorAll('input[type="file"]');
     fileInputs.forEach(input => {
         if (input) input.value = '';
     });
     // Refresh main page data after closing any modal
     fetchAndRenderMainPageData();
}

// Export modal elements for use in profileApp.js and wizardLogic.js
export { profileSettingsPopup, profileWizardPopup };
