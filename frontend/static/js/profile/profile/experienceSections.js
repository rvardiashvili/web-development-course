// experienceSections.js - Handles Work Experience, Projects, Education, Skills, and Interests in the settings modal

import { showMessage, hideAllAddEditForms, renderEntries } from './utils.js';

// Get references to elements for Work Experience, Projects, and Education sections in the settings modal
const workExperienceSettings = document.getElementById('work-experience-settings');
const projectsSettings = document.getElementById('projects-settings');
const educationSettings = document.getElementById('education-settings');
const skillsSettings = document.getElementById('skills-settings'); // Get skills settings section
const interestsSettings = document.getElementById('interests-settings'); // Get interests settings section


const workExperienceList = document.getElementById('work-experience-list'); // List in the settings modal
const projectsList = document.getElementById('projects-list'); // List in the settings modal
const educationList = document.getElementById('education-list'); // List in the settings modal

const addButtons = document.querySelectorAll('.add-new-button'); // All add buttons
const addEditForms = document.querySelectorAll('.add-edit-form'); // All add/edit forms
const cancelFormButtons = document.querySelectorAll('.cancel-form-button'); // All cancel buttons on forms
const settingsMessageContainers = document.querySelectorAll('.settings-messages'); // All message containers in settings sections

const addEditWorkExperienceForm = document.getElementById('add-edit-work-experience-form');
const addEditProjectsForm = document.getElementById('add-edit-projects-form');
const addEditEducationForm = document.getElementById('add-edit-education-form');

// Get references to the skills and interests text areas
const skillsTextarea = document.getElementById('skills-textarea');
const interestsTextarea = document.getElementById('interests-textarea');


// Function to fetch and populate profile data for the settings modal
// This function needs to be called from profileApp.js when the modal opens
export async function fetchAndRenderExperienceForModal(userId, fetchMainPageDataCallback) {
    if (!userId) return;

    try {
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();

        if (data.status === 'success') {
            // Populate lists in the settings modal
            // Pass the edit/delete callbacks to renderEntries
            renderEntries(workExperienceList, data.work_experiences, 'work-experience', false, editEntry, (entryId, section) => deleteEntry(entryId, section, fetchMainPageDataCallback, fetchAndRenderExperienceForModal));
            renderEntries(projectsList, data.projects, 'projects', false, editEntry, (entryId, section) => deleteEntry(entryId, section, fetchMainPageDataCallback, fetchAndRenderExperienceForModal));
            renderEntries(educationList, data.education, 'education', false, editEntry, (entryId, section) => deleteEntry(entryId, section, fetchMainPageDataCallback, fetchAndRenderExperienceForModal));

            // Populate Skills and Interests textareas in the settings modal
            if (skillsTextarea && data.employee_details && data.employee_details.skills !== undefined) {
                console.log(data.employee_details.skills);
                skillsTextarea.value = data.employee_details.skills || '';
            } else if (skillsTextarea) {
                 skillsTextarea.value = ''; // Clear if no data
            }

            if (interestsTextarea && data.employee_details && data.employee_details.interests !== undefined) {
                interestsTextarea.value = data.employee_details.interests || '';
            } else if (interestsTextarea) {
                 interestsTextarea.value = ''; // Clear if no data
            }


        } else {
            console.error('Error fetching profile data for modal:', data.message);
            // Find the first message container in these sections to show the error
            const messageContainer = workExperienceSettings ? workExperienceSettings.querySelector('.settings-messages') : null;
            if (messageContainer) {
                showMessage(messageContainer, 'error', 'Failed to load profile data for settings.');
            }
        }
    } catch (error) {
        console.error('Error fetching profile data for modal:', error);
         const messageContainer = workExperienceSettings ? workExperienceSettings.querySelector('.settings-messages') : null;
         if (messageContainer) {
             showMessage(messageContainer, 'error', 'An error occurred while fetching profile data for settings.');
         }
    }
}


/**
 * Function to populate the form for editing a specific entry.
 * @param {number} entryId - The ID of the entry to edit.
 * @param {string} section - The section name ('work-experience', 'projects', 'education').
 */
async function editEntry(entryId, section) {
    // Hide all forms first
    hideAllAddEditForms(addEditForms);

    const parentSection = document.getElementById(`${section}-settings`);
    const form = parentSection ? parentSection.querySelector('.add-edit-form') : null;
    const messages = parentSection ? parentSection.querySelector('.settings-messages') : null;

    if (!form) return;

    // Fetch the specific entry data for editing
    try {
        const response = await fetch(`/api/profile/${section}/${entryId}`); // Assuming GET /api/profile/experience/<id> etc.
        const entryData = await response.json();

        if (entryData.status === 'success') {
            const entry = entryData.data; // Assuming API returns {status: 'success', data: entry_object}

            // Populate the form fields based on the section
            const entryIdInput = form.querySelector('input[name="entry_id"]');
            if (entryIdInput) entryIdInput.value = entry.id;

            if (section === 'work-experience') {
                const titleInput = form.querySelector('input[name="title"]');
                const companyInput = form.querySelector('input[name="company"]');
                const locationInput = form.querySelector('input[name="location"]');
                const startDateInput = form.querySelector('input[name="start_date"]');
                const endDateInput = form.querySelector('input[name="end_date"]');
                const descriptionTextarea = form.querySelector('textarea[name="description"]');

                if (titleInput) titleInput.value = entry.title || ''; // Use 'title'
                if (companyInput) companyInput.value = entry.company || '';
                if (locationInput) locationInput.value = entry.location || '';
                if (startDateInput) startDateInput.value = entry.start_date || ''; // Assuming ISO-8601 format
                if (endDateInput) endDateInput.value = entry.end_date || ''; // Assuming ISO-8601 format
                if (descriptionTextarea) descriptionTextarea.value = entry.description || '';

            } else if (section === 'projects') {
                const titleInput = form.querySelector('input[name="title"]');
                const descriptionTextarea = form.querySelector('textarea[name="description"]');
                const technologiesInput = form.querySelector('input[name="technologies"]');
                const linkInput = form.querySelector('input[name="link"]');

                if (titleInput) titleInput.value = entry.title || '';
                if (descriptionTextarea) descriptionTextarea.value = entry.description || '';
                if (technologiesInput) technologiesInput.value = entry.technologies || '';
                if (linkInput) linkInput.value = entry.link || '';

            } else if (section === 'education') {
                const degreeInput = form.querySelector('input[name="degree"]');
                const institutionInput = form.querySelector('input[name="institution"]');
                const fieldOfStudyInput = form.querySelector('input[name="field_of_study"]');
                const yearInput = form.querySelector('input[name="year_of_completion"]');
                const notesTextarea = form.querySelector('textarea[name="notes"]');

                if (degreeInput) degreeInput.value = entry.degree || '';
                if (institutionInput) institutionInput.value = entry.institution || '';
                if (fieldOfStudyInput) fieldOfStudyInput.value = entry.field_of_study || '';
                if (yearInput) yearInput.value = entry.year_of_completion || '';
                if (notesTextarea) notesTextarea.value = entry.notes || '';
            }

            form.style.display = 'flex'; // Show the form
            if (messages) messages.innerHTML = ''; // Clear messages

        } else {
            showMessage(messages, 'error', entryData.message || 'Failed to fetch entry data for editing.');
        }
    } catch (error) {
        console.error('Error fetching entry for edit:', error);
        showMessage(messages, 'error', 'An error occurred while fetching entry data.');
    }
}

/**
 * Function to handle deleting a specific entry.
 * @param {number} entryId - The ID of the entry to delete.
 * @param {string} section - The section name ('work-experience', 'projects', 'education').
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after deletion.
 * @param {function} fetchModalDataCallback - Callback to refresh modal data after deletion.
 */
async function deleteEntry(entryId, section, fetchMainPageDataCallback, fetchModalDataCallback) {
    const parentSection = document.getElementById(`${section}-settings`);
    const messages = parentSection ? parentSection.querySelector('.settings-messages') : null;
    const listElement = parentSection ? parentSection.querySelector('.settings-entries-list') : null;

    if (!confirm(`Are you sure you want to delete this ${section.slice(0, -1)} entry?`)) {
        showMessage(messages, 'info', 'Deletion canceled.');
        return;
    }

    showMessage(messages, 'info', 'Deleting entry...');

    try {
        const response = await fetch(`/api/profile/${section}/${entryId}`, { // Assuming DELETE /api/profile/experience/<id> etc.
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.status === 'success') {
            showMessage(messages, 'success', data.message);
            // Remove the entry from the DOM
            const entryElement = listElement ? listElement.querySelector(`[data-entry-id="${entryId}"]`) : null;
            if (entryElement) {
                entryElement.remove();
            }
            // Refetch and re-render the lists in both modal and main page
            if (fetchModalDataCallback) fetchModalDataCallback();
            if (fetchMainPageDataCallback) fetchMainPageDataCallback();

        } else {
            showMessage(messages, 'error', data.message || 'Failed to delete entry.');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showMessage(messages, 'error', 'An error occurred during deletion.');
    }
}


/**
 * Sets up event listeners for Work Experience, Projects, and Education sections.
 * Needs callbacks to refresh data after save/delete.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data.
 * @param {function} fetchModalDataCallback - Callback to refresh modal data.
 */
export function setupExperienceListeners(fetchMainPageDataCallback, fetchModalDataCallback) {
    // Event listeners for "Add New" buttons
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideAllAddEditForms(addEditForms); // Hide other forms before showing this one
            const section = button.dataset.section; // Get section from data attribute
            const parentSection = document.getElementById(`${section}-settings`);
            const form = parentSection ? parentSection.querySelector('.add-edit-form') : null;
            const messages = parentSection ? parentSection.querySelector('.settings-messages') : null;
            if (form) {
                form.style.display = 'flex'; // Show the form (assuming flex layout)
                if (messages) messages.innerHTML = ''; // Clear messages when opening the form
                form.reset(); // Clear form fields for a new entry
                const entryIdInput = form.querySelector('input[name="entry_id"]');
                if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
            }
        });
    });

    // Event listeners for "Cancel" buttons on add/edit forms
    cancelFormButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideAllAddEditForms(addEditForms); // Just hide the form and reset it
            const parentSection = button.closest('section');
            const messages = parentSection ? parentSection.querySelector('.settings-messages') : null;
            if (messages) {
                messages.innerHTML = ''; // Clear messages when canceling
            }
        });
    });

    // Event listeners for add/edit form submissions
    addEditForms.forEach(form => {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const parentSection = form.closest('section');
            const messages = parentSection ? parentSection.querySelector('.settings-messages') : null;
            const sectionId = parentSection ? parentSection.id.replace('-settings', '') : null; // e.g., 'work-experience'
            const entryIdInput = form.querySelector('input[name="entry_id"]');
            const entryId = entryIdInput ? entryIdInput.value : null;

            if (!sectionId) {
                 console.error("Could not determine section ID for form submission.");
                 return;
            }


            // Determine the API endpoint and method
            let apiEndpoint = `/api/profile/${sectionId}`; // Base endpoint
            let method = 'POST'; // Default to POST for adding

            if (entryId) {
                // If entryId exists, it's an edit operation
                apiEndpoint = `/api/profile/${sectionId}/${entryId}`;
                method = 'PUT'; // Use PUT for updating
            }

            showMessage(messages, 'info', 'Saving...'); // Show saving message

            try {
                const response = await fetch(apiEndpoint, {
                    method: method,
                    body: formData,
                });

                const data = await response.json();

                if (data.status === 'success') {
                    showMessage(messages, 'success', data.message);
                    form.style.display = 'none'; // Hide the form on success
                    form.reset(); // Clear the form
                    if (entryIdInput) entryIdInput.value = ''; // Clear entry ID
                    // Refetch and re-render the lists in both modal and main page
                    if (fetchModalDataCallback) fetchModalDataCallback();
                    if (fetchMainPageDataCallback) fetchMainPageDataCallback();

                } else {
                    showMessage(messages, 'error', data.message || 'Save failed.');
                }
            } catch (error) {
                console.error('Save failed:', error);
                showMessage(messages, 'error', 'An error occurred while saving.');
            }
        });
    });

    // Note: Edit and Delete button listeners are added dynamically in renderEntries
    // They call the editEntry and deleteEntry functions defined above.
}
