// profileApp.js - Main entry point and central orchestrator for profile page JavaScript

// --- Imports ---
import { clearMessageContainers, hideAllAddEditForms } from './utils.js';

// Import modal control functions and modal elements
import { setupModalControl, openModal, closeModal, profileSettingsPopup, profileWizardPopup } from './modalControl.js';

// Import setup functions from other modules
// NOTE: We are removing direct form imports here as they should be referenced after DOMContentLoaded
import { setupExperienceListeners, fetchAndRenderExperienceForModal, saveEntry } from './experienceSections.js';
import { setupSkillsInterestsListeners } from './skillsInterests.js';
import { fetchAndRenderMainPageData } from './mainPageDisplay.js'; // This now returns profile data including flags
import { setupTabListeners } from './tabs.js';
import { setupDetailsPopup, setprofileDataCache } from './detailsPopup.js';
import { setupProfilePicListeners } from './profilePicListeners.js'; // Forms are handled internally or via lists passed in setup
import { setupWizardListeners, showWizardStep } from './wizardLogic.js'; // Import wizard setup and step function
import { setupSettingsFormListeners } from './settingsFormListeners.js'; // Forms are handled internally or via lists passed in setup
import { renderLanguages } from './languageDisplay.js';


// --- DOM References (Top Level - for elements expected to be present early) ---
const editProfileButton = document.getElementById('edit-profile-button');
// profileSettingsPopup and profileWizardPopup are now imported from modalControl.js


// --- Get User Context ---
const currentUserId = document.body.dataset.currentUserId;
const viewedUserId = document.body.dataset.viewedUserId;
const currentUserType = document.body.dataset.currentUserType;


// --- Initial Setup on DOM Ready ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed. profileApp.js executing.');

    // --- Collect Lists of Forms and Message Containers AFTER DOMContentLoaded ---
    // Get fresh references to all forms and message containers here
    const allFormsToHide = [
        document.getElementById('edit-bio-form'), // Settings bio form
        document.getElementById('edit-skills-form'), // Settings skills form
        document.getElementById('edit-interests-form'), // Settings interests form
        document.getElementById('edit-languages-form'), // Settings languages form
        document.getElementById('add-edit-work-experience-form'), // Settings WE form
        document.getElementById('add-edit-projects-form'), // Settings Projects form
        document.getElementById('add-edit-education-form'), // Settings Education form
        document.getElementById('upload-profile-pic-form'), // Settings profile pic upload
        document.getElementById('wizard-upload-profile-pic-form'), // Wizard profile pic upload
        document.getElementById('wizard-edit-bio-form'), // Wizard bio form
        document.getElementById('wizard-add-edit-work-experience-form'), // Wizard WE form
        document.getElementById('wizard-add-edit-projects-form'), // Wizard Projects form
        document.getElementById('wizard-add-edit-education-form'), // Wizard Education form
        document.getElementById('wizard-edit-skills-form'), // Wizard skills form
        document.getElementById('wizard-edit-interests-form'), // Wizard interests form
        document.getElementById('wizard-edit-languages-form') // Wizard languages form
    ].filter(Boolean); // Filter out any null references

    const allMessageContainers = document.querySelectorAll('.settings-messages, #profile-picture-messages, #bio-messages, #wizard-messages, #wizard-profile-picture-messages, #wizard-bio-messages, #wizard-work-experience-messages, #wizard-projects-messages, #wizard-education-messages, #wizard-skills-messages, #wizard-interests-messages, #wizard-languages-messages');


    console.log('Collected allFormsToHide (after DOMContentLoaded):', allFormsToHide); // Log the final list of forms
    console.log('Collected allMessageContainers (after DOMContentLoaded):', allMessageContainers);


    // --- Setup Modules ---

    // Initialize Modal Control with references to all containers and forms
    // Pass the collected lists to modalControl
    console.log('Calling setupModalControl...');
    setupModalControl(Array.from(allMessageContainers), allFormsToHide);
    console.log('setupModalControl called.');


    // Setup details popup listeners
    console.log('Calling setupDetailsPopup...');
    setupDetailsPopup();
    console.log('setupDetailsPopup called.');


    // Fetch and render initial main page data
    console.log('Calling fetchAndRenderMainPageData...');
    const profileData = await fetchAndRenderMainPageData(); // Fetch data and populate main page
    console.log('fetchAndRenderMainPageData called, data fetched:', profileData);


    // Set the profile data cache after fetching
    if (profileData) {
         setprofileDataCache(profileData);
         console.log("Profile data cached in profileApp.js:", profileData);
    } else {
         console.error("Failed to fetch initial profile data.");
         // Handle case where initial data fetch fails (e.g., show error message)
    }


    // Setup listeners for various sections, passing necessary callbacks
    // Pass fetchAndRenderMainPageData for refreshing the main page after modal actions
    // Pass a callback to fetchAndRenderExperienceForModal for refreshing the modal lists
    console.log('Calling setupProfilePicListeners...');
    setupProfilePicListeners(fetchAndRenderMainPageData); // Pass callback to refresh main page
    console.log('setupProfilePicListeners called.');

    console.log('Calling setupSettingsFormListeners...');
    setupSettingsFormListeners(fetchAndRenderMainPageData); // Pass callback to refresh main page
    console.log('setupSettingsFormListeners called.');

    console.log('Calling setupExperienceListeners...');
    setupExperienceListeners(fetchAndRenderMainPageData, () => fetchAndRenderExperienceForModal(currentUserId, fetchAndRenderMainPageData)); // Pass callbacks
    console.log('setupExperienceListeners called.');

    console.log('Calling setupSkillsInterestsListeners...');
    setupSkillsInterestsListeners(fetchAndRenderMainPageData); // Pass callback to refresh main page
    console.log('setupSkillsInterestsListeners called.');

    console.log('Calling setupTabListeners...');
    setupTabListeners(); // Setup listeners for the main page tabs
    console.log('setupTabListeners called.');


    // --- Fix for Issue 1: Render languages on the main page after fetching data ---
    // Access languages from the fetched profileData, which now includes employee_details
    if (profileData && profileData.employee_details && profileData.employee_details.languages) {
        renderLanguages(profileData.employee_details.languages);
    } else {
        renderLanguages(''); // Clear languages if no data
    }
    // --- End Fix for Issue 1 ---


    // --- Check URL for 'open_edit' parameter and open modal/wizard if present ---
    const urlParams = new URLSearchParams(window.location.search);
    const openEditModal = urlParams.get('open_edit');

    // Check if the user is viewing their own profile, the flag is set, AND the wizard hasn't been shown before (based on database)
    // Access the wizard_shown flag from the user_flags JSON object in the fetched data
    const hasWizardBeenShown = profileData && profileData.user_flags && profileData.user_flags.wizard_shown === true;

    if (viewedUserId === currentUserId && openEditModal === 'true' && !hasWizardBeenShown) {
        console.log('Opening wizard based on URL parameter and wizard_shown flag.');
        openModal(profileWizardPopup); // Use imported openModal
        // showWizardStep(1); // Assuming showWizardStep is exported and works correctly
        // Note: If showWizardStep is not exported, the wizardLogic module
        // should handle showing the first step when setupWizardListeners is called
        // and the modal is opened.
        console.log('Calling setupWizardListeners for wizard open...');
        setupWizardListeners(fetchAndRenderMainPageData, () => fetchAndRenderExperienceForModal(currentUserId, fetchAndRenderMainPageData), allFormsToHide); // Setup wizard listeners
        console.log('setupWizardListeners called for wizard open.');


        // Optional: Clean up the URL after using the parameter
        // history.replaceState({}, document.title, window.location.pathname);
        // Note: Removing the URL parameter here might be tricky if the user refreshes
        // before the database flag is updated. Keeping the flag in the database is the
        // primary mechanism to prevent showing it again.
    } else {
         // If wizard is not opened via URL parameter, still setup wizard listeners
         // in case the user opens it manually later.
         console.log('Wizard not opened via URL. Calling setupWizardListeners anyway.');
         setupWizardListeners(fetchAndRenderMainPageData, () => fetchAndRenderExperienceForModal(currentUserId, fetchAndRenderMainPageData), allFormsToHide); // Setup wizard listeners
         console.log('setupWizardListeners called (not via URL).');
    }


    // --- Event listener for opening the profile settings modal button (Keep this for opening via button click) ---
    if (editProfileButton) {
        editProfileButton.addEventListener('click', () => {
            console.log('Edit Profile button clicked. Opening settings modal.'); // Log button click
            openModal(profileSettingsPopup); // Use imported openModal
            // Data fetching for settings modal is handled within openModal now
        });
    }

    // Note: Close button listeners and outside click listeners for the main modals
    // are now handled within modalControl.js
});

document.addEventListener('DOMContentLoaded', () => {
    setupExperienceListeners(
        () => console.log("Main page data refresh (placeholder)"),
        () => console.log("Modal data refresh (placeholder)")
    );
});


// Optional: Add a way to clear the wizard flag for testing purposes
// You would need a backend endpoint to reset the wizard_shown flag in the database
// window.clearProfileWizardFlag = async () => {
//      try {
//          const response = await fetch('/api/profile/reset_wizard_flag', { method: 'POST' }); // Assuming you create this endpoint
//          const data = await response.json();
//          if (data.status === 'success') {
//              console.log('Wizard flag reset in database.');
//              if (window.profileDataCache && window.profileDataCache.user_flags) {
//                  window.profileDataCache.user_flags.wizard_shown = false; // Update cache
//              }
//          } else {
//               console.error('Failed to reset wizard flag:', data.message);
//          }
//      } catch (error) {
//           console.error('Error resetting wizard flag:', error);
//      }
// };
