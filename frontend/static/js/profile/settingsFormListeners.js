// settingsFormListeners.js - Handles form submissions for settings modal sections (Bio, Skills, Interests, Languages)

import { showMessage } from './utils.js';
// Import fetchAndRenderMainPageData to refresh the main page after saves
import { fetchAndRenderMainPageData } from './mainPageDisplay.js';
// Import getProfileDataCache to update cache after saves if needed (optional but good practice)
import { getProfileDataCache, setprofileDataCache } from './detailsPopup.js';


// Get references to settings modal forms and message containers
const editBioForm = document.getElementById('edit-bio-form');
const bioMessageContainer = document.getElementById('bio-messages');
const bioTextarea = document.getElementById('bio'); // Also needed for reference

const skillsSettings = document.getElementById('skills-settings');
const editSkillsForm = document.getElementById('edit-skills-form');
const skillsTextarea = document.getElementById('skills-textarea'); // Also needed for reference
const skillsMessageContainer = skillsSettings ? skillsSettings.querySelector('.settings-messages') : null;

const interestsSettings = document.getElementById('interests-settings');
const editInterestsForm = document.getElementById('edit-interests-form');
const interestsTextarea = document.getElementById('interests-textarea'); // Also needed for reference
const interestsMessageContainer = interestsSettings ? interestsSettings.querySelector('.settings-messages') : null;

const languagesSettings = document.getElementById('languages-settings');
const editLanguagesForm = document.getElementById('edit-languages-form');
const languagesTextarea = document.getElementById('languages-textarea'); // Also needed for reference
const languagesMessageContainer = languagesSettings ? languagesSettings.querySelector('.settings-messages') : null;

// Get user context (assuming these data attributes are on the body)
const currentUserType = document.body.dataset.currentUserType;


/**
 * Sets up event listeners for Bio, Skills, Interests, and Languages forms in the settings modal.
 * This function is called from profileApp.js on DOMContentLoaded.
 */
export function setupSettingsFormListeners() {

    // Wait for the DOM to be fully loaded before setting up listeners
    document.addEventListener('DOMContentLoaded', () => {

        // Event listener for Bio form submission
        if (editBioForm && bioMessageContainer) {
            editBioForm.addEventListener('submit', async (event) => {
                console.log('Bio settings form submitted.'); // Log submit event
                event.preventDefault(); // Prevent default form submission (stops page refresh)
                console.log('event.preventDefault() called for Bio.'); // Confirm preventDefault

                const formData = new FormData(editBioForm);

                showMessage(bioMessageContainer, 'info', 'Saving bio...');

                try {
                    const response = await fetch('/api/profile/update_bio', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(bioMessageContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Bio saved:', data.bio);
                        // Update the bio text area value in the form
                        if (bioTextarea) bioTextarea.value = data.bio || '';
                        // Refresh main page data to show updated bio
                        fetchAndRenderMainPageData();
                        // Optional: Update the cached profile data
                         const cachedData = getProfileDataCache();
                         if (cachedData) {
                             cachedData.bio = data.bio || '';
                             setprofileDataCache(cachedData); // Update cache
                         }
                    }
                } catch (error) {
                    console.error('Bio save failed:', error);
                    showMessage(bioMessageContainer, 'error', 'An error occurred while saving bio.');
                }
            });
        } else {
             console.warn('Bio settings form or message container not found for submit listener.');
        }

        // Event listener for Skills form submission
        if (editSkillsForm && skillsMessageContainer) {
            editSkillsForm.addEventListener('submit', async (event) => {
                console.log('Skills settings form submitted.'); // Log submit event
                event.preventDefault(); // Prevent default form submission (stops page refresh)
                console.log('event.preventDefault() called for Skills.'); // Confirm preventDefault

                const formData = new FormData(editSkillsForm);

                showMessage(skillsMessageContainer, 'info', 'Saving skills...');

                try {
                    const response = await fetch('/api/profile/skills', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(skillsMessageContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Skills saved:', data.skills);
                        // Update the skills text area value in the form
                        if (skillsTextarea) skillsTextarea.value = data.skills || '';
                        // Refresh main page skills display
                        fetchAndRenderMainPageData();
                         // Optional: Update the cached profile data
                         const cachedData = getProfileDataCache();
                         if (cachedData && cachedData.employee_details) {
                             cachedData.employee_details.skills = data.skills || '';
                             setprofileDataCache(cachedData); // Update cache
                         }
                    }
                } catch (error) {
                    console.error('Saving skills failed:', error);
                    showMessage(skillsMessageContainer, 'error', 'An error occurred while saving skills.');
                }
            });
        } else {
             console.warn('Skills settings form or message container not found for submit listener.');
        }

        // Event listener for Interests form submission
        if (editInterestsForm && interestsMessageContainer) {
            editInterestsForm.addEventListener('submit', async (event) => {
                console.log('Interests settings form submitted.'); // Log submit event
                event.preventDefault(); // Prevent default form submission (stops page refresh)
                console.log('event.preventDefault() called for Interests.'); // Confirm preventDefault

                const formData = new FormData(editInterestsForm);

                showMessage(interestsMessageContainer, 'info', 'Saving interests...');

                try {
                    const response = await fetch('/api/profile/interests', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(interestsMessageContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Interests saved:', data.interests);
                        // Update the interests text area value in the form
                        if (interestsTextarea) interestsTextarea.value = data.interests || '';
                        // Refresh main page interests display
                        fetchAndRenderMainPageData();
                         // Optional: Update the cached profile data
                         const cachedData = getProfileDataCache();
                         if (cachedData && cachedData.employee_details) {
                             cachedData.employee_details.interests = data.interests || '';
                             setprofileDataCache(cachedData); // Update cache
                         }
                    }
                } catch (error) {
                    console.error('Saving interests failed:', error);
                    showMessage(interestsMessageContainer, 'error', 'An error occurred while saving interests.');
                }
            });
        } else {
             console.warn('Interests settings form or message container not found for submit listener.');
        }

        // Languages Form Submission (Employee Specific)
        const currentUserType = document.body.dataset.currentUserType; // Get user type again locally if needed
        if (editLanguagesForm && languagesMessageContainer && languagesTextarea && currentUserType === 'employee') {
            editLanguagesForm.addEventListener('submit', async (event) => {
                console.log('Languages settings form submitted.'); // Log submit event
                event.preventDefault(); // Prevent default form submission (stops page refresh)
                console.log('event.preventDefault() called for Languages.'); // Confirm preventDefault

                const formData = new FormData(editLanguagesForm);

                showMessage(languagesMessageContainer, 'info', 'Saving languages...');

                try {
                    const response = await fetch('/api/profile/languages', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(languagesMessageContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Languages saved:', data.languages);
                        // Update the languages text area value in the form
                        if (languagesTextarea) languagesTextarea.value = data.languages || '';
                        // Refresh main page languages display
                        fetchAndRenderMainPageData();
                         // Optional: Update the cached profile data
                         const cachedData = getProfileDataCache();
                         if (cachedData && cachedData.employee_details) {
                             cachedData.employee_details.languages = data.languages || '';
                             setprofileDataCache(cachedData); // Update cache
                         }
                    }
                } catch (error) {
                    console.error('Languages save failed:', error);
                    showMessage(languagesMessageContainer, 'error', 'An error occurred while saving languages.');
                }
            });
        } else if (editLanguagesForm && currentUserType === 'employee') {
             console.warn('Languages settings form, message container, or textarea not found for employee submit listener.');
        } else if (editLanguagesForm) {
             console.log('Languages settings form found, but user is not an employee. Submit listener not attached.');
        } else {
             console.warn('Languages settings form not found.');
        }
    });
}

// Export forms for use in profileApp.js (for hideAllAddEditForms)
export { editBioForm, editSkillsForm, editInterestsForm, editLanguagesForm };
