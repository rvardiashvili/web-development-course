// skillsInterests.js - Handles Skills and Interests updates

import { showMessage } from './utils.js';

// Get references to Skills and Interests elements
const skillsSettings = document.getElementById('skills-settings');
const interestsSettings = document.getElementById('interests-settings');

const editSkillsForm = document.getElementById('edit-skills-form');
const editInterestsForm = document.getElementById('edit-interests-form');


/**
 * Sets up event listeners for Skills and Interests updates.
 * Needs a callback to refresh main page data after save.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data.
 */
export function setupSkillsInterestsListeners(fetchMainPageDataCallback) {
    // Event listener for Skills form submission
    if (editSkillsForm) {
        editSkillsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(editSkillsForm);
            const messages = skillsSettings ? skillsSettings.querySelector('.settings-messages') : null;

            showMessage(messages, 'info', 'Saving skills...');

            try {
                const response = await fetch('/api/profile/skills', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                showMessage(messages, data.status, data.message);

                if (data.status === 'success') {
                    console.log('Skills saved:', data.skills);
                    // Refresh main page skills display
                    if (fetchMainPageDataCallback) fetchMainPageDataCallback();
                }
            } catch (error) {
                console.error('Saving skills failed:', error);
                showMessage(messages, 'error', 'An error occurred while saving skills.');
            }
        });
    }

    // Event listener for Interests form submission
    if (editInterestsForm) {
        editInterestsForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(editInterestsForm);
            const messages = interestsSettings ? interestsSettings.querySelector('.settings-messages') : null;

            showMessage(messages, 'info', 'Saving interests...');

            try {
                const response = await fetch('/api/profile/interests', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                showMessage(messages, data.status, data.message);

                if (data.status === 'success') {
                    console.log('Interests saved:', data.interests);
                    // Refresh main page interests display
                    if (fetchMainPageDataCallback) fetchMainPageDataCallback();
                }
            } catch (error) {
                console.error('Saving interests failed:', error);
                showMessage(messages, 'error', 'An error occurred while saving interests.');
            }
        });
    }
}
