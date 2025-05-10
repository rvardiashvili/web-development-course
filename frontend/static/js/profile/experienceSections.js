// experienceSections.js - Handles Work Experience, Projects, and Education sections in the settings modal and wizard

import { showMessage, hideAllAddEditForms, clearMessageContainers, renderEntries } from './utils.js'; // Ensure clearMessageContainers is imported
import { getProfileDataCache } from './detailsPopup.js'; // Import the function to get the cached profile data


// Get references to elements for Work Experience, Projects, and Education sections
// These are used for finding message containers and lists (declared at top level)
const workExperienceSettings = document.getElementById('work-experience-settings');
const projectsSettings = document.getElementById('projects-settings');
const educationSettings = document.getElementById('education-settings');

// Get references to the lists in the settings modal (declared at top level)
const workExperienceList = document.getElementById('work-experience-list');
const projectsList = document.getElementById('projects-list');
const educationList = document.getElementById('education-list');

// NOTE: Removing top-level form references here
// const addEditWorkExperienceForm = document.getElementById('add-edit-work-experience-form');
// const addEditProjectsForm = document.getElementById('add-edit-projects-form');
// const addEditEducationForm = document.getElementById('add-edit-education-form');

// Get references to the add buttons and cancel buttons (declared at top level)
// Refined selector to target buttons ONLY within the settings modal
const addButtons = document.querySelectorAll('#profile-settings-popup .add-new-button'); // All add buttons in settings modal
const cancelFormButtons = document.querySelectorAll('.cancel-form-button'); // All cancel buttons on forms

// Get references to message containers within the settings modal sections (declared at top level)
const workExperienceMessageContainer = workExperienceSettings ? workExperienceSettings.querySelector('.settings-messages') : null;
const projectsMessageContainer = projectsSettings ? projectsSettings.querySelector('.settings-messages') : null;
const educationMessageContainer = educationSettings ? educationSettings.querySelector('.settings-messages') : null;


/**
 * Fetches and renders Work Experience, Projects, and Education data for the settings modal.
 * This is called when the settings modal is opened.
 * It now fetches from the main profile endpoint and extracts the data.
 * @param {string} userId - The ID of the user whose data to fetch.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after modal actions.
 */
export async function fetchAndRenderExperienceForModal(userId, fetchMainPageDataCallback) {
    if (!userId) {
        console.error("User ID not available to fetch experience data for modal.");
        // Optionally show an error message in the modal
        // You might want to target a specific message container in the modal structure
        return;
    }
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Settings Add New button clicked.'); // Log button click

            // Determine which form to show based on the button's parent section
            const parentSection = button.dataset.section + "-settings";   
            let formToShow = null;
            let messagesContainer = null;

            // Get fresh references to forms here
            const addEditWorkExperienceFormClick = document.getElementById('add-edit-work-experience-form');
            const addEditProjectsFormClick = document.getElementById('add-edit-projects-form');
            const addEditEducationFormClick = document.getElementById('add-edit-education-form');

            console.log('Parent section:', parentSection); // Log the parent section

            if (parentSection) {
                if (parentSection === 'work-experience-settings' && addEditWorkExperienceFormClick) {
                    formToShow = addEditWorkExperienceFormClick;
                    messagesContainer = workExperienceMessageContainer;
                } else if (parentSection === 'projects-settings' && addEditProjectsFormClick) {
                    formToShow = addEditProjectsFormClick;
                    messagesContainer = projectsMessageContainer;
                } else if (parentSection === 'education-settings' && addEditEducationFormClick) {
                    formToShow = addEditEducationFormClick;
                    messagesContainer = educationMessageContainer;
                }
            }

            if (formToShow) {
                // Hide all add/edit forms before showing the selected one
                // Get all add/edit forms again here to ensure the list is up-to-date if needed
                const allAddEditForms = document.querySelectorAll('.add-edit-form');
                hideAllAddEditForms(allAddEditForms);
                console.log('Hiding all forms before showing:', allAddEditForms); // Log forms being hidden


                formToShow.style.display = 'block'; // Show the correct form
                console.log('Showing form:', formToShow); // Log the form being shown
                formToShow.reset(); // Clear the form for a new entry
                const entryIdInput = formToShow.querySelector('input[name="entry_id"]');
                if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
                clearMessageContainers([messagesContainer].filter(Boolean)); // Clear messages
            } else {
                 console.warn('Could not find form to show for Add New button.');
            }
            button.dataset.listenerAttached = 'true'; // Prevent rebinding
        });
    });


    try {
        // Fetch ALL profile data from the main endpoint
        const response = await fetch(`/api/profile/${userId}`); // Fetch from the main profile endpoint
        const data = await response.json();

        if (data.status === 'success') {
            // Extract experience data from the full profile data
            const workExperienceData = data.work_experiences || []; // Use 'work_experiences' as per API format
            const projectsData = data.projects || [];
            const educationData = data.education || [];

            // Render Work Experience
            if (workExperienceList) {
                // Pass the necessary callbacks for edit/delete
                renderEntries(workExperienceList, workExperienceData, 'work-experience', false, editEntry, deleteEntry, null);
            }

            // Render Projects
            if (projectsList) {
                 renderEntries(projectsList, projectsData, 'projects', false, editEntry, deleteEntry, null);
            }

            // Render Education
            if (educationList) {
                 renderEntries(educationList, educationData, 'education', false, editEntry, deleteEntry, null);
            }

        } else {
            console.error('Error fetching full profile data for modal experience sections:', data.message);
            // Optionally show an error message in the modal
             // You might want to target a specific message container in the modal structure
        }
    } catch (error) {
        console.error('Error fetching full profile data for modal experience sections:', error);
        // Optionally show an error message in the modal
         // You might want to target a specific message container in the modal structure
    }
}


/**
 * Handles editing an existing entry (Work Experience, Project, Education).
 * Populates the correct add/edit form with existing data.
 * Now retrieves data from the cached profile data and gets form/input references
 * reliably within the function, with enhanced null checks and logging.
 * @param {number} entryId - The ID of the entry to edit.
 * @param {string} section - The section name ('work-experience', 'projects', 'education').
 */
function editEntry(entryId, section) {
    console.log(`editEntry called for ID: ${entryId}, Section: ${section}`); // Log start of function

    // Hide all add/edit forms first
    // Get all add/edit forms again here to ensure the list is up-to-date if needed
    const allAddEditForms = document.querySelectorAll('.add-edit-form');
    hideAllAddEditForms(allAddEditForms);

    let formToShow = null;
    let messagesContainer = null;
    let entryData = null; // To hold the data of the entry being edited

    // Get data from the cached profile data
    const profileData = getProfileDataCache(); // Use the imported function

    if (!profileData) {
        console.error("Profile data cache not available for editing.");
        // You might want to show a message to the user, perhaps in a general modal message area
        // Find a general message container if section-specific one is null
        const generalModalMessages = document.getElementById('profile-settings-popup') ? document.getElementById('profile-settings-popup').querySelector('.modal-messages') : null;
        showMessage(messagesContainer || generalModalMessages, 'error', 'Profile data not loaded. Cannot edit entry.');
        return;
    }

    // --- Get form and message container references reliably within the function ---
    // Use document.getElementById here to get the form reference when needed
    if (section === 'work-experience') {
        formToShow = document.getElementById('add-edit-work-experience-form');
        messagesContainer = workExperienceMessageContainer; // Use the top-level constant for message container
        entryData = profileData.work_experiences ? profileData.work_experiences.find(entry => entry.id === entryId) : null; // Use 'work_experiences' as per API
    } else if (section === 'projects') {
        formToShow = document.getElementById('add-edit-projects-form');
        messagesContainer = projectsMessageContainer; // Use the top-level constant for message container
        entryData = profileData.projects ? profileData.projects.find(entry => entry.id === entryId) : null;
    } else if (section === 'education') {
        formToShow = document.getElementById('add-edit-education-form');
        messagesContainer = educationMessageContainer; // Use the top-level constant for message container
        entryData = profileData.education ? profileData.education.find(entry => entry.id === entryId) : null;
    }
    // --- End getting references ---

    console.log(`Form element found for section "${section}":`, formToShow); // Log form element
    console.log(`Entry data found for ID ${entryId}:`, entryData); // Log entry data


    if (formToShow && entryData) {
        formToShow.style.display = 'block'; // Show the form
        formToShow.reset(); // Clear the form first
        clearMessageContainers([messagesContainer].filter(Boolean)); // Clear messages

        if (!formToShow.dataset.listenerAttached) {
            console.log(`[DEBUG] Attaching submit handler to form: ${formToShow.id}`);
            formToShow.addEventListener('submit', (event) => {
                event.preventDefault();
                console.log(`[DEBUG] Form submitted via AJAX: ${formToShow.id}`);
                saveEntry(
                    formToShow,
                    messagesContainer,
                    section,
                    fetchAndRenderExperienceForModal,
                    null
                );
            });
            formToShow.dataset.listenerAttached = 'true'; // Prevent rebinding
        }

        






        // Populate the form fields with existing data
        const entryIdInput = formToShow.querySelector('input[name="entry_id"]');
        if (entryIdInput) {
            entryIdInput.value = entryData.id || '';
            console.log(`Populated entry_id (${formToShow.id}):`, entryIdInput.value); // Log populated value
        } else {
             console.warn(`Input with name="entry_id" not found in form ${formToShow.id}`); // Warn if ID input is missing
        }


        if (section === 'work-experience') {
            const titleInput = formToShow.querySelector('input[name="title"]');
            console.log(`Querying for input[name="title"] in ${formToShow.id}:`, titleInput); // Log query result
            if (titleInput) titleInput.value = entryData.title || '';
            else console.warn(`Input with name="title" not found in form ${formToShow.id}`); // Warn if input is missing

            const companyInput = formToShow.querySelector('input[name="company"]');
            console.log(`Querying for input[name="company"] in ${formToShow.id}:`, companyInput); // Log query result
            if (companyInput) companyInput.value = entryData.company || '';
             else console.warn(`Input with name="company" not found in form ${formToShow.id}`); // Warn if input is missing

            const locationInput = formToShow.querySelector('input[name="location"]');
            console.log(`Querying for input[name="location"] in ${formToShow.id}:`, locationInput); // Log query result
            if (locationInput) locationInput.value = entryData.location || '';
             else console.warn(`Input with name="location" not found in form ${formToShow.id}`); // Warn if input is missing

            const startDateInput = formToShow.querySelector('input[name="start_date"]');
            console.log(`Querying for input[name="start_date"] in ${formToShow.id}:`, startDateInput); // Log query result
            if (startDateInput) startDateInput.value = entryData.start_date || '';
             else console.warn(`Input with name="start_date" not found in form ${formToShow.id}`); // Warn if input is missing


            const endDateInput = formToShow.querySelector('input[name="end_date"]');
            console.log(`Querying for input[name="end_date"] in ${formToShow.id}:`, endDateInput); // Log query result
            if (endDateInput) endDateInput.value = entryData.end_date || '';
             else console.warn(`Input with name="end_date" not found in form ${formToShow.id}`); // Warn if input is missing


            const descriptionTextarea = formToShow.querySelector('textarea[name="description"]');
            console.log(`Querying for textarea[name="description"] in ${formToShow.id}:`, descriptionTextarea); // Log query result
            if (descriptionTextarea) descriptionTextarea.value = entryData.description || '';
             else console.warn(`Textarea with name="description" not found in form ${formToShow.id}`); // Warn if textarea is missing


        } else if (section === 'projects') {
             const nameInput = formToShow.querySelector('input[name="name"]');
             console.log(`Querying for input[name="name"] in ${formToShow.id}:`, nameInput); // Log query result
             if (nameInput) nameInput.value = entryData.name || '';
              else console.warn(`Input with name="name" not found in form ${formToShow.id}`); // Warn if input is missing

             const descriptionTextarea = formToShow.querySelector('textarea[name="description"]');
             console.log(`Querying for textarea[name="description"] in ${formToShow.id}:`, descriptionTextarea); // Log query result
             if (descriptionTextarea) descriptionTextarea.value = entryData.description || '';
              else console.warn(`Textarea with name="description" not found in form ${formToShow.id}`); // Warn if textarea is missing

             const technologiesInput = formToShow.querySelector('input[name="technologies"]');
             console.log(`Querying for input[name="technologies"] in ${formToShow.id}:`, technologiesInput); // Log query result
             if (technologiesInput) technologiesInput.value = entryData.technologies || '';
              else console.warn(`Input with name="technologies" not found in form ${formToShow.id}`); // Warn if input is missing

             const linkInput = formToShow.querySelector('input[name="link"]');
             console.log(`Querying for input[name="link"] in ${formToShow.id}:`, linkInput); // Log query result
             if (linkInput) linkInput.value = entryData.link || '';
              else console.warn(`Input with name="link" not found in form ${formToShow.id}`); // Warn if input is missing

        } else if (section === 'education') {
             const degreeInput = formToShow.querySelector('input[name="degree"]');
             console.log(`Querying for input[name="degree"] in ${formToShow.id}:`, degreeInput); // Log query result
             if (degreeInput) degreeInput.value = entryData.degree || '';
              else console.warn(`Input with name="degree" not found in form ${formToShow.id}`); // Warn if input is missing

             const institutionInput = formToShow.querySelector('input[name="institution"]');
             console.log(`Querying for input[name="institution"] in ${formToShow.id}:`, institutionInput); // Log query result
             if (institutionInput) institutionInput.value = entryData.institution || '';
              else console.warn(`Input with name="institution" not found in form ${formToShow.id}`); // Warn if input is missing

             const fieldOfStudyInput = formToShow.querySelector('input[name="field_of_study"]');
             console.log(`Querying for input[name="field_of_study"] in ${formToShow.id}:`, fieldOfStudyInput); // Log query result
             if (fieldOfStudyInput) fieldOfStudyInput.value = entryData.field_of_study || '';
              else console.warn(`Input with name="field_of_study" not found in form ${formToShow.id}`); // Warn if input is missing

             const yearOfCompletionInput = formToShow.querySelector('input[name="year_of_completion"]');
             console.log(`Querying for input[name="year_of_completion"] in ${formToShow.id}:`, yearOfCompletionInput); // Log query result
             if (yearOfCompletionInput) yearOfCompletionInput.value = entryData.year_of_completion || '';
              else console.warn(`Input with name="year_of_completion" not found in form ${formToShow.id}`); // Warn if input is missing

             const notesTextarea = formToShow.querySelector('textarea[name="notes"]');
             console.log(`Querying for textarea[name="notes"] in ${formToShow.id}:`, notesTextarea); // Log query result
             if (notesTextarea) notesTextarea.value = entryData.notes || '';
              else console.warn(`Textarea with name="notes" not found in form ${formToShow.id}`); // Warn if textarea is missing

                 // Ensure submit listener is attached only once
             if (!formToShow.dataset.listenerAttached) {
                 formToShow.addEventListener('submit', (event) => {
                     event.preventDefault();
                     saveEntry(formToShow, messagesContainer, section === 'work-experience' ? 'work_experience' : section, fetchAndRenderExperienceForModal, null);
                 });
                 formToShow.dataset.listenerAttached = 'true'; // Prevent rebinding
             }

        }
        console.log(`Finished populating form ${formToShow.id}`); // Log end of population

    } else {
        console.error(`Could not find form (${formToShow ? formToShow.id : 'null'}) or data for editing ${section} with ID ${entryId}. Entry data found:`, entryData);
        // Find a general message container if section-specific one is null
        const generalModalMessages = document.getElementById('profile-settings-popup') ? document.getElementById('profile-settings-popup').querySelector('.modal-messages') : null;
        showMessage(messagesContainer || generalModalMessages, 'error', 'Could not load entry for editing.');
    }
}

/**
 * Handles deleting an existing entry (Work Experience, Project, Education).
 * @param {number} entryId - The ID of the entry to delete.
 * @param {string} section - The section name ('work-experience', 'projects', 'education').
 * @param {function} fetchModalDataCallback - Callback to refresh modal data after deletion.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after deletion.
 */
async function deleteEntry(entryId, section, fetchModalDataCallback, fetchMainPageDataCallback) {
    if (!confirm(`Are you sure you want to delete this ${section.replace('-', ' ')} entry?`)) {
        return; // User canceled deletion
    }

    let apiEndpoint = '';
    let messagesContainer = null;

    // Determine the correct API endpoint and message container based on section
    // These endpoints for DELETE should match your backend implementation
    if (section === 'work-experience') {
        apiEndpoint = `/api/profile/work_experience/${entryId}`;
        messagesContainer = workExperienceMessageContainer;
    } else if (section === 'projects') {
        apiEndpoint = `/api/profile/projects/${entryId}`;
        messagesContainer = projectsMessageContainer;
    } else if (section === 'education') {
        apiEndpoint = `/api/profile/education/${entryId}`;
        messagesContainer = educationMessageContainer;
    } else {
        console.error(`Unknown section for deletion: ${section}`);
        // Try to find a general message container if section-specific one is null
        const generalModalMessages = document.getElementById('profile-settings-popup') ? document.getElementById('profile-settings-popup').querySelector('.modal-messages') : null;
        showMessage(messagesContainer || generalModalMessages, 'error', 'Invalid section for deletion.');
        return;
    }

    if (!apiEndpoint || !messagesContainer) {
         console.error(`API endpoint or messages container not found for section: ${section}`);
         // Try to find a general message container if section-specific one is null
         const generalModalMessages = document.getElementById('profile-settings-popup') ? document.getElementById('profile-settings-popup').querySelector('.modal-messages') : null;
         showMessage(messagesContainer || generalModalMessages, 'error', 'Could not process deletion.');
         return;
    }

    showMessage(messagesContainer, 'info', 'Deleting...'); // Show deleting message

    try {
        const response = await fetch(apiEndpoint, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.status === 'success') {
            showMessage(messagesContainer, 'success', data.message);
            // Refetch and re-render the lists in both modal and main page
            if (fetchModalDataCallback) fetchModalDataCallback();
            if (fetchMainPageDataCallback) fetchMainPageDataCallback();
        } else {
            showMessage(messagesContainer, 'error', data.message || 'Deletion failed.');
        }
    } catch (error) {
        console.error('Deletion failed:', error);
        showMessage(messagesContainer, 'error', 'An error occurred during deletion.');
    }
}


/**
 * Handles saving a new or existing entry (Work Experience, Project, Education).
 * @param {HTMLFormElement} form - The form element being submitted.
 * @param {HTMLElement} messages - The message container for the form.
 * @param {string} sectionId - The section identifier ('work_experience', 'projects', 'education').
 * @param {function} fetchModalDataCallback - Callback to refresh modal data after save.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after save.
 */
export async function saveEntry(form, messages, sectionId, fetchModalDataCallback, fetchMainPageDataCallback) {
    const formData = new FormData(form);
    const entryId = formData.get('entry_id'); // Get the entry ID from the hidden input

    let apiEndpoint = '';
    let method = '';

    // Determine API endpoint and method based on whether it's a new entry or an update
    // These endpoints for POST/PUT should match your backend implementation
    if (!entryId) {
        // New entry
        apiEndpoint = `/api/profile/${sectionId}`; // Example: /api/profile/work_experience
        method = 'POST';
    } else {
        // Existing entry (update)
        apiEndpoint = `/api/profile/${sectionId}/${entryId}`; // Example: /api/profile/work_experience/123
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
            const entryIdInput = form.querySelector('input[name="entry_id"]');
            if (entryIdInput) entryIdInput.value = ''; // Clear entry ID
            // Refetch and re-render the lists in both modal and main page
            if (fetchModalDataCallback) fetchModalDataCallback(document.body.dataset["currentUserId"])    
            if (fetchMainPageDataCallback) fetchMainPageDataCallback();

        } else {
            showMessage(messages, 'error', data.message || 'Save failed.');
        }
    } catch (error) {
        console.error('Save failed:', error);
        showMessage(messages, 'error', 'An error occurred while saving.');
    }
}


/**
 * Sets up event listeners for the experience sections in the settings modal.
 * This function is called from profileApp.js on DOMContentLoaded.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after actions.
 * @param {function} fetchModalDataCallback - Callback to refresh modal data after actions.
 */
export function setupExperienceListeners(fetchMainPageDataCallback, fetchModalDataCallback) {

    // Wait for the DOM to be fully loaded before setting up listeners that interact with DOM elements
    document.addEventListener('DOMContentLoaded', () => {

        console.log('DOMContentLoaded fired in experienceSections.js');

        // Event listeners for the "Add New" buttons in the settings modal
        addButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('Settings Add New button clicked.'); // Log button click

                // Determine which form to show based on the button's parent section
                const parentSection = button.closest('.settings-section');
                let formToShow = null;
                let messagesContainer = null;

                // Get fresh references to forms here
                const addEditWorkExperienceFormClick = document.getElementById('add-edit-work-experience-form');
                const addEditProjectsFormClick = document.getElementById('add-edit-projects-form');
                const addEditEducationFormClick = document.getElementById('add-edit-education-form');


                if (parentSection) {
                    if (parentSection.id === 'work-experience-settings' && addEditWorkExperienceFormClick) {
                        formToShow = addEditWorkExperienceFormClick;
                        messagesContainer = workExperienceMessageContainer;
                    } else if (parentSection.id === 'projects-settings' && addEditProjectsFormClick) {
                        formToShow = addEditProjectsFormClick;
                        messagesContainer = projectsMessageContainer;
                    } else if (parentSection.id === 'education-settings' && addEditEducationFormClick) {
                        formToShow = addEditEducationFormClick;
                        messagesContainer = educationMessageContainer;
                    }
                }

                if (formToShow) {
                    // Hide all add/edit forms before showing the selected one
                    // Get all add/edit forms again here to ensure the list is up-to-date if needed
                    const allAddEditForms = document.querySelectorAll('.add-edit-form');
                    hideAllAddEditForms(allAddEditForms);
                    console.log('Hiding all forms before showing:', allAddEditForms); // Log forms being hidden


                    formToShow.style.display = 'block'; // Show the correct form
                    console.log('Showing form:', formToShow); // Log the form being shown
                    formToShow.reset(); // Clear the form for a new entry
                    const entryIdInput = formToShow.querySelector('input[name="entry_id"]');
                    if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
                    clearMessageContainers([messagesContainer].filter(Boolean)); // Clear messages
                } else {
                     console.warn('Could not find form to show for Add New button.');
                }
            });
        });

        // Event listeners for the "Cancel" buttons on the add/edit forms
        cancelFormButtons.forEach(button => {
            button.addEventListener('click', () => {
                const form = button.closest('form');
                if (form) {
                    form.style.display = 'none'; // Hide the form
                    form.reset(); // Clear the form
                    const entryIdInput = form.querySelector('input[name="entry_id"]');
                    if (entryIdInput) entryIdInput.value = ''; // Clear entry ID
                    // Clear messages associated with this form
                    // Assuming messages container is the next sibling
                    const messagesContainer = form.nextElementSibling;
                    if(messagesContainer && messagesContainer.classList.contains('settings-messages')) {
                        clearMessageContainers([messagesContainer]);
                    } else {
                         // Fallback if structure is different, try to find within parent section
                         const parentSection = form.closest('.settings-section');
                         if(parentSection) {
                             const sectionMessages = parentSection.querySelector('.settings-messages');
                             if(sectionMessages) clearMessageContainers([sectionMessages]);
                         }
                    }
                }
            });
        });

        // --- Form Submission Listeners for Add/Edit Forms (Settings Modal) ---
        // --- Ensure preventDefault is called and callbacks refresh data ---

        // Helper function to handle form submission logic
        const handleExperienceFormSubmit = async (event, form, messages, sectionId, fetchModalDataCallback, fetchMainPageDataCallback) => {
             console.log(`${sectionId} settings form submitted.`); // Log submit event
             event.preventDefault(); // Prevent default form submission (stops page refresh)
             console.log(`event.preventDefault() called for ${sectionId}.`); // Confirm preventDefault

             // Call saveEntry from experienceSections.js
             // saveEntry already calls fetchModalDataCallback and fetchMainPageDataCallback on success
             saveEntry(form, messages, sectionId, fetchModalDataCallback, fetchMainPageDataCallback);
        };







        // Get fresh references to forms here for attaching submit listeners
        const workExperienceForm = document.getElementById('add-edit-work-experience-form');
        const projectsForm = document.getElementById('add-edit-projects-form');
        const educationForm = document.getElementById('add-edit-education-form');

        console.log('Attaching submit listeners after DOMContentLoaded:');
        console.log('  Work Experience Form:', workExperienceForm);
        console.log('  Projects Form:', projectsForm);
        console.log('  Education Form:', educationForm);


        if (workExperienceForm && workExperienceMessageContainer) {
            console.log('Attaching submit listener to Work Experience form:', workExperienceForm); // Log attachment
            // Primary submit listener
            workExperienceForm.addEventListener('submit', (event) => {
                 handleExperienceFormSubmit(event, workExperienceForm, workExperienceMessageContainer, 'work_experience', fetchModalDataCallback, fetchMainPageDataCallback);
            });

            // Fallback click listener for submit button
            const submitButton = workExperienceForm.querySelector('button[type="submit"]');
            if (submitButton) {
                console.log('Attaching click listener to Work Experience submit button:', submitButton); // Log attachment
                 submitButton.addEventListener('click', (event) => {
                     // Only prevent default and handle if the button is clicked directly
                     // The form's submit listener should ideally handle this, but this is a fallback
                     if (!event.defaultPrevented) { // Check if default was already prevented by form listener
                        console.log('Work Experience submit button clicked (fallback).'); // Log button click
                        event.preventDefault(); // Prevent default button click behavior
                        // Manually trigger the form's submit event
                        workExperienceForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                     }
                 });
            } else {
                 console.warn('Work Experience submit button not found in form.');
            }

        } else {
             console.warn('Work Experience settings form or message container not found for submit listener setup.');
        }

        if (projectsForm && projectsMessageContainer) {
             console.log('Attaching submit listener to Projects form:', projectsForm); // Log attachment
             // Primary submit listener
            projectsForm.addEventListener('submit', (event) => {
                 handleExperienceFormSubmit(event, projectsForm, projectsMessageContainer, 'projects', fetchModalDataCallback, fetchMainPageDataCallback);
            });

             // Fallback click listener for submit button
            const submitButton = projectsForm.querySelector('button[type="submit"]');
            if (submitButton) {
                 console.log('Attaching click listener to Projects submit button:', submitButton); // Log attachment
                 submitButton.addEventListener('click', (event) => {
                     if (!event.defaultPrevented) {
                        console.log('Projects submit button clicked (fallback).'); // Log button click
                        event.preventDefault();
                        projectsForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                     }
                 });
            } else {
                 console.warn('Projects submit button not found in form.');
            }

        } else {
             console.warn('Projects settings form or message container not found for submit listener setup.');
        }

        if (educationForm && educationMessageContainer) {
             console.log('Attaching submit listener to Education form:', educationForm); // Log attachment
             // Primary submit listener
            educationForm.addEventListener('submit', (event) => {
                 handleExperienceFormSubmit(event, educationForm, educationMessageContainer, 'education', fetchModalDataCallback, fetchMainPageDataCallback);
            });

            // Fallback click listener for submit button
            const submitButton = educationForm.querySelector('button[type="submit"]');
            if (submitButton) {
                 console.log('Attaching click listener to Education submit button:', submitButton); // Log attachment
                 submitButton.addEventListener('click', (event) => {
                     if (!event.defaultPrevented) {
                        console.log('Education submit button clicked (fallback).'); // Log button click
                        event.preventDefault();
                        educationForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                     }
                 });
            } else {
                 console.warn('Education submit button not found in form.');
            }

        } else {
             console.warn('Education settings form or message container not found for submit listener setup.');
        }

        // Note: Edit and Delete button listeners are added dynamically in renderEntries
        // They call the editEntry and deleteEntry functions defined above.
    });
}

// Export functions for use in other modules
// NOTE: Removing form exports here as they should be referenced after DOMContentLoaded
