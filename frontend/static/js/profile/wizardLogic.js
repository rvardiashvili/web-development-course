// wizardLogic.js - Handles the profile setup wizard functionality

import { showMessage, clearMessageContainers, hideAllAddEditForms } from './utils.js';
import { openModal, closeModal } from './modalControl.js'; // Import modal control functions
import { fetchAndRenderMainPageData } from './mainPageDisplay.js'; // Import to refresh main page
import { saveEntry, fetchAndRenderExperienceForModal } from './experienceSections.js'; // Import saveEntry and fetch for WE/Projects/Edu in wizard
// Import forms from settingsFormListeners for hiding
import { editBioForm, editSkillsForm, editInterestsForm, editLanguagesForm } from './settingsFormListeners.js';
// Import profile pic forms for hiding
import { uploadForm, wizardUploadProfilePicForm } from './profilePicListeners.js';


// Get references to wizard modal elements
const profileWizardPopup = document.getElementById('profile-wizard-popup');
const wizardCloseButton = document.getElementById('wizard-close-button');
const wizardTitle = document.getElementById('wizard-title');
const wizardMessagesContainer = document.getElementById('wizard-messages');
const wizardStepsContainer = document.getElementById('wizard-steps');
const wizardSteps = document.querySelectorAll('.wizard-step'); // Get all wizard step divs

// Wizard navigation buttons


// Wizard step specific forms and message containers (for saving)
// Profile Picture form and messages (handled in profilePicListeners.js, but referenced here for hiding)
// wizardUploadProfilePicForm is imported
const wizardProfilePictureMessagesContainer = document.getElementById('wizard-profile-picture-messages');

// Bio form and messages
// wizardEditBioForm is imported
const wizardBioMessagesContainer = document.getElementById('wizard-bio-messages');
// Moved declaration and assignment of wizardBioTextarea inside DOMContentLoaded

// Work Experience form and messages
const wizardAddWorkExperienceForm = document.getElementById('wizard-add-edit-work-experience-form');
const wizardWorkExperienceMessagesContainer = document.getElementById('wizard-work-experience-messages');
const wizardAddWorkExperienceButton = document.getElementById('wizard-add-work-experience-button'); // Add button

// Projects form and messages
const wizardAddProjectsForm = document.getElementById('wizard-add-edit-projects-form');
const wizardProjectsMessagesContainer = document.getElementById('wizard-projects-messages');
const wizardAddProjectButton = document.getElementById('wizard-add-project-button'); // Add button

// Education form and messages
const wizardAddEducationForm = document.getElementById('wizard-add-edit-education-form');
const wizardEducationMessagesContainer = document.getElementById('wizard-education-messages');
const wizardAddEducationButton = document.getElementById('wizard-add-education-button'); // Add button

// Skills form and messages (assuming they exist in wizard HTML)
const wizardEditSkillsForm = document.getElementById('wizard-edit-skills-form'); // Assuming ID based on pattern
const wizardSkillsMessagesContainer = document.getElementById('wizard-skills-messages'); // Assuming ID based on pattern

// Interests form and messages (assuming they exist in wizard HTML)
const wizardEditInterestsForm = document.getElementById('wizard-edit-interests-form'); // Assuming ID based on pattern
const wizardInterestsMessagesContainer = document.getElementById('wizard-interests-messages'); // Assuming ID based on pattern

// Languages form and messages (assuming they exist in wizard HTML)
const wizardEditLanguagesForm = document.getElementById('wizard-edit-languages-form'); // Assuming ID based on pattern
const wizardLanguagesMessagesContainer = document.getElementById('wizard-languages-messages'); // Assuming ID based on pattern

// List of all forms to hide, passed from profileApp.js
let allFormsToHide = [];


let currentWizardStep = 1;

// Get user context (assuming these data attributes are on the body)
const currentUserType = document.body.dataset.currentUserType;
const viewedUserId = document.body.dataset.viewedUserId;
const currentUserId = document.body.dataset.currentUserId;


/**
 * Marks the profile setup wizard as shown in the database.
 */
async function markWizardAsShownInDatabase() {
    try {
        const response = await fetch('/api/profile/mark_wizard_shown', {
            method: 'POST', // Use POST as it modifies state
            headers: {
                'Content-Type': 'application/json',
                // Include CSRF token if you are using Flask-WTF or similar
                // 'X-CSRFToken': getCookie('csrf_token') // You'll need a getCookie function
            },
            // No body needed for this simple update
        });

        const data = await response.json();
        if (data.status !== 'success') {
            console.error('Failed to mark wizard as shown in database:', data.message);
            // Optionally show an error message to the user
        } else {
             console.log('Wizard marked as shown in database.');
             // Update the profileData cache if it exists, so subsequent checks are correct
             // (This is a simple approach, a more robust cache might be needed)
             if (window.profileDataCache && window.profileDataCache.user_flags) {
                 window.profileDataCache.user_flags.wizard_shown = true;
             }
        }
    } catch (error) {
        console.error('Error marking wizard as shown:', error);
        // Optionally show an error message to the user
    }
}

/**
 * Updates the wizard title based on the current step.
 * @param {number | 'finish'} stepIdentifier - The identifier for the current wizard step.
 */
function updateWizardTitle(stepIdentifier) {
    let title = 'Welcome to Your Profile!';
    switch (stepIdentifier) {
        case 2: title = 'Step 1: Add Profile Picture'; break;
        case 3: title = 'Step 2: Write Your Bio'; break;
        case 4: title = 'Step 3: Add Work Experience'; break; // Employee specific
        case 5: title = 'Step 4: Add Projects'; break;
        case 6: title = 'Step 5: Add Education'; break;
        case 7: title = 'Step 6: Add Skills'; break;
        case 8: title = 'Step 7: Add Interests'; break;
        case 9: title = 'Step 8: Add Languages'; break; // Employee specific
        case 10: title = 'Setup Complete!'; break;
        case 'finish': title = 'Setup Complete!'; break; // Handle 'finish' case
    }
    if (wizardTitle) wizardTitle.textContent = title;
}

/**
 * Shows a specific wizard step based on number or 'finish'.
 * @param {number | 'finish'} stepIdentifier - The identifier for the step to show.
 */
export function showWizardStep(stepIdentifier) {
    // Map step identifier to the actual HTML element ID
    let elementId;
    switch (stepIdentifier) {
        case 1:
            elementId = 'wizard-step-1'; // Welcome
            break;
        case 2:
            elementId = 'wizard-step-2'; // Profile Picture
            break;
        case 3:
            elementId = 'wizard-step-3'; // Bio
            break;
        case 4:
            elementId = 'wizard-step-4'; // Work Experience (Employee)
            break;
        case 5:
             elementId = 'wizard-step-5'; // Projects
             break;
        case 6:
             elementId = 'wizard-step-6'; // Education
             break;
        case 7:
             elementId = 'wizard-step-7'; // Skills
             break;
        case 8:
             elementId = 'wizard-step-8'; // Interests
             break;
        case 9:
             elementId = 'wizard-step-9'; // Languages (Employee)
             break;
        case 10:
            elementId = 'wizard-step-10'; // Finish
            break;
        case 'finish': // Allow 'finish' as an alternative way to specify the last step
             elementId = 'wizard-step-10'; // Finish // Corrected ID based on profile.html
             stepIdentifier = 10; // Set currentWizardStep to the numerical value for internal logic
             break;
        default:
            console.error('Unknown wizard step identifier:', stepIdentifier);
            return; // Stop if the identifier is unknown
    }

    wizardSteps.forEach(step => {
        step.style.display = 'none';
    });

    const stepToShow = document.getElementById(elementId);
    if (stepToShow) {
        stepToShow.style.display = 'flex'; // Assuming flex layout for steps
        stepToShow.scrollIntoView({ behavior:'smooth' });
 // Assuming textarea is visible for Bio, Skills, Interests, Languages
        // Update currentWizardStep to the numerical value for navigation logic
        currentWizardStep = (typeof stepIdentifier === 'number') ? stepIdentifier : 10; // Ensure currentWizardStep is a number

        // Clear messages specific to wizard steps
        clearMessageContainers([
            wizardMessagesContainer,
            wizardProfilePictureMessagesContainer,
            wizardBioMessagesContainer,
            wizardWorkExperienceMessagesContainer,
            wizardProjectsMessagesContainer, // Added
            wizardEducationMessagesContainer, // Added
            wizardSkillsMessagesContainer, // Added
            wizardInterestsMessagesContainer, // Added
            wizardLanguagesMessagesContainer // Added
        ].filter(Boolean)); // Filter out nulls if elements don't exist

        updateWizardTitle(stepIdentifier); // Call updateWizardTitle after setting the step
        if(stepIdentifier === 3 || stepIdentifier === 7 || stepIdentifier === 8 || stepIdentifier === 9) {
            const form = stepToShow.getElementsByTagName('form')[0]; // Get the first textarea
            form.style.display = 'block'; // Assuming textarea is visible for Bio, Skills, Interests, Languages
        }
    }
}


/**
 * Attempts to save data for the current wizard step if it's a form step.
 * This is called before moving to the next step.
 * @returns {Promise<boolean>} A Promise that resolves to true if saving was successful or not needed, false otherwise.
 */
async function saveCurrentWizardStepData() {
    // This function is currently empty as saving is handled by dedicated form listeners
    // for forms that have them (WE, Projects, Education).
    // For textarea-only steps (Bio, Skills, Interests, Languages), their dedicated
    // listeners in settingsFormListeners.js handle saving when the form is submitted.
    // The wizard "Next" button doesn't explicitly submit these forms.
    // If you want saving to happen when clicking "Next" on these steps,
    // you would need to add logic here to find the form and trigger its submit.
    // For now, we assume saving happens via dedicated form buttons or implicitly
    // if the wizard steps are structured that way.

    // Example of how you *could* trigger a save for textarea steps on "Next":
    // let formToSubmit = null;
    // switch (currentWizardStep) {
    //     case 3: formToSubmit = wizardEditBioForm; break; // Bio step
    //     case 7: formToSubmit = wizardEditSkillsForm; break; // Skills step
    //     case 8: formToSubmit = wizardEditInterestsForm; break; // Interests step
    //     case 9: // Languages step (Employee specific)
    //          if (currentUserType === 'employee') {
    //             formToSubmit = wizardEditLanguagesForm;
    //          }
    //         break;
    // }
    // if (formToSubmit) {
    //     // Trigger the form's submit event
    //     const submitEvent = new Event('submit', { cancelable: true });
    //     formToSubmit.dispatchEvent(submitEvent);
    //     // You might want to wait for the submit to complete and check success here
    //     // This requires modifying the submit listeners to return a Promise or use callbacks
    //     // For now, we'll just proceed after dispatching the event.
    //     console.log(`Triggered submit for step ${currentWizardStep}`);
    // }

    return true; // Always indicate success as saving is done elsewhere or not mandatory on "Next" click
}


/**
 * Navigates to the next wizard step after attempting to save the current step's data.
 */
async function nextWizardStep() {
    // Attempt to save data for the current step before moving on
    // Saving for Bio, Skills, Interests, Languages is handled by dedicated form listeners now.
    // This function will only trigger saving for other wizard steps if added in saveCurrentWizardStepData.
    // We still await it in case future steps need saving here.
    const saveSuccessful = await saveCurrentWizardStepData();

    // Only proceed to the next step if the save was successful or if the step didn't require saving
    if (saveSuccessful) {
        // Determine the next step based on the current step and user type
        if (currentWizardStep === 1) {
            showWizardStep(2); // Welcome -> Profile Picture
        } else if (currentWizardStep === 2) {
            showWizardStep(3); // Profile Picture -> Bio
        } else if (currentWizardStep === 3) {
            // Bio -> Work Experience (Employee) or Finish (Employer)
            if (currentUserType === 'employee') {
                showWizardStep(4);
            } else {
                showWizardStep(10); // Go directly to finish for employer
            }
        } else if (currentWizardStep === 4 && currentUserType === 'employee') {
             showWizardStep(5); // Work Experience -> Projects (Employee)
        } else if (currentWizardStep === 5 && currentUserType === 'employee') {
             showWizardStep(6); // Projects -> Education (Employee)
        } else if (currentWizardStep === 6 && currentUserType === 'employee') {
             showWizardStep(7); // Education -> Skills (Employee)
        } else if (currentWizardStep === 7 && currentUserType === 'employee') {
             showWizardStep(8); // Skills -> Interests (Employee)
        } else if (currentWizardStep === 8 && currentUserType === 'employee') {
             showWizardStep(9); // Interests -> Languages (Employee)
        } else if (currentWizardStep === 9 && currentUserType === 'employee') {
            showWizardStep(10); // Languages -> Finish (Employee)
        } else {
            // Default to finish if somehow in an unexpected state or already at finish
            showWizardStep(10);
        }
    } else {
        console.log(`Save failed for step ${currentWizardStep}. Staying on current step.`);
        // The save function already shows an error message, so no need to do it here.
    }
}

/**
 * Navigates to the previous wizard step.
 */
function prevWizardStep() {
    // Determine the previous step based on the current step and user type
     if (currentWizardStep === 2) {
        showWizardStep(1); // Profile Picture -> Welcome
    } else if (currentWizardStep === 3) {
        showWizardStep(2); // Bio -> Profile Picture
    } else if (currentWizardStep === 4 && currentUserType === 'employee') {
        showWizardStep(3); // Work Experience -> Bio (Employee)
    } else if (currentWizardStep === 5 && currentUserType === 'employee') {
         showWizardStep(4); // Projects -> Work Experience (Employee)
    } else if (currentWizardStep === 6 && currentUserType === 'employee') {
         showWizardStep(5); // Education -> Projects (Employee)
    } else if (currentWizardStep === 7 && currentUserType === 'employee') {
         showWizardStep(6); // Skills -> Education (Employee)
    } else if (currentWizardStep === 8 && currentUserType === 'employee') {
         showWizardStep(7); // Interests -> Skills (Employee)
    } else if (currentWizardStep === 9 && currentUserType === 'employee') {
         showWizardStep(8); // Languages -> Interests (Employee)
    } else if (currentWizardStep === 10) { // If at finish
        // Go back to the last step depending on user type
        if (currentUserType === 'employee') {
             showWizardStep(9); // Finish -> Languages (Employee)
        } else {
             showWizardStep(3); // Finish -> Bio (Employer)
        }
    } else {
         // Default to step 1 if somehow in an unexpected state
         showWizardStep(1);
    }
}

/**
 * Skips the wizard, marks it as shown, and closes the modal.
 */
function skipWizard() {
    // Mark the wizard as shown in the database when the user skips
    markWizardAsShownInDatabase();
    closeModal(profileWizardPopup); // Use imported closeModal
}

/**
 * Finishes the wizard, marks it as shown, and closes the modal.
 */
function finishWizard() {
    // Mark the wizard as shown in the database when the user finishes
    markWizardAsShownInDatabase();
    closeModal(profileWizardPopup); // Use imported closeModal
}


/**
 * Sets up event listeners for the profile setup wizard.
 * @param {function} fetchMainPageDataCallback - Callback to refresh main page data after wizard actions.
 * @param {function} fetchModalDataCallback - Callback to refresh modal data after wizard actions (e.g., for WE/Projects/Edu lists).
 * @param {HTMLElement[]} allFormsToHide - A list of all forms that can be hidden/shown.
 */
export function setupWizardListeners(fetchMainPageDataCallback, fetchModalDataCallback, allFormsToHideFromApp) {

    // Assign the list of forms passed from profileApp.js
    allFormsToHide = allFormsToHideFromApp;

    // Get references to wizard forms and textarea *after* DOMContentLoaded
    let wizardEditBioForm;
    let wizardBioTextarea;
    let wizardEditSkillsForm;
    let wizardEditInterestsForm;
    let wizardEditLanguagesForm;

        wizardEditBioForm = document.getElementById('wizard-edit-bio-form');
        wizardBioTextarea = wizardEditBioForm ? wizardEditBioForm.querySelector('textarea') : null;

        wizardEditSkillsForm = document.getElementById('wizard-edit-skills-form');
        wizardEditInterestsForm = document.getElementById('wizard-edit-interests-form');
        wizardEditLanguagesForm = document.getElementById('wizard-edit-languages-form');
        const wizardStartButton = document.getElementById('wizard-start-button');
        const wizardSkipButton = document.getElementById('wizard-skip-button');
        const wizardPrevButtons = document.querySelectorAll('.wizard-navigation .secondary'); // All "Previous" buttons
        const wizardNextButtons = document.querySelectorAll('.wizard-navigation .wizard-button:not(.secondary)'); // All "Next" buttons
        const wizardGoToProfileButton = document.getElementById('wizard-go-to-profile');
        console.log('wizzard start button ' + wizardStartButton);
        // Event listener for wizard close button
        if (wizardCloseButton) {
            wizardCloseButton.addEventListener('click', () => {
                // Treat closing the wizard as skipping it for the "show once" logic
                skipWizard();
            });
        }

        // Event listener for clicking outside the wizard modal to close it
        if (profileWizardPopup) {
            window.addEventListener('click', (event) => {
                if (event.target === profileWizardPopup) {
                    // Treat clicking outside as skipping
                    skipWizard();
                }
            });
        }

        // Event listener for the "Start Setup" button
        if (wizardStartButton) {
            wizardStartButton.addEventListener('click', () => {
                showWizardStep(2); // Go to Profile Picture step
            });
        }

        // Event listener for the "Skip Setup" button
        if (wizardSkipButton) {
            wizardSkipButton.addEventListener('click', () => {
                skipWizard();
            });
        }

        // "Previous" buttons
        wizardPrevButtons.forEach(button => {
            button.addEventListener('click', () => {
                prevWizardStep();
            });
        });

        // "Next" buttons
        wizardNextButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Before moving to the next step, we might want to trigger a save for the current step's form
                // This depends on whether you want saving to be mandatory before proceeding
                // For simplicity now, we'll just move to the next step.
                // You'll need to add specific save logic here if needed.
                nextWizardStep();
            });
        });

        // "Go to Profile" button on the finish step
        if (wizardGoToProfileButton) {
            wizardGoToProfileButton.addEventListener('click', () => {
                finishWizard();
            });
        }

        // --- Wizard Step Specific Form Listeners (for Add New buttons within wizard steps) ---
        // --- Fix for Issue 3: Ensure these buttons show the correct wizard forms ---

        // Event listener for "Add New Work Experience" button in wizard
        if (wizardAddWorkExperienceButton && wizardAddWorkExperienceForm) {
            wizardAddWorkExperienceButton.addEventListener('click', () => {
                // Hide ALL add/edit forms before showing the specific one
                hideAllAddEditForms(allFormsToHide);
                wizardAddWorkExperienceForm.style.display = 'block'; // Show the work experience form
                wizardAddWorkExperienceForm.reset(); // Clear the form for a new entry
                const entryIdInput = wizardAddWorkExperienceForm.querySelector('input[name="entry_id"]');
                if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
                clearMessageContainers([wizardWorkExperienceMessagesContainer].filter(Boolean)); // Clear messages
            });
        } else {
            console.warn('Wizard Work Experience Add button or form not found.');
        }

        // Event listener for "Add New Project" button in wizard
        if (wizardAddProjectButton && wizardAddProjectsForm) {
            wizardAddProjectButton.addEventListener('click', () => {
                // Hide ALL add/edit forms before showing the specific one
                hideAllAddEditForms(allFormsToHide);
                wizardAddProjectsForm.style.display = 'block'; // Show the projects form
                wizardAddProjectsForm.reset(); // Clear the form for a new entry
                const entryIdInput = wizardAddProjectsForm.querySelector('input[name="entry_id"]');
                if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
                clearMessageContainers([wizardProjectsMessagesContainer].filter(Boolean)); // Clear messages
            });
        } else {
            console.warn('Wizard Project Add button or form not found.');
        }

        // Event listener for "Add New Education" button in wizard
        if (wizardAddEducationButton && wizardAddEducationForm) {
            wizardAddEducationButton.addEventListener('click', () => {
                // Hide ALL add/edit forms before showing the specific one
                hideAllAddEditForms(allFormsToHide);
                wizardAddEducationForm.style.display = 'block'; // Show the education form
                wizardAddEducationForm.reset(); // Clear the form for a new entry
                const entryIdInput = wizardAddEducationForm.querySelector('input[name="entry_id"]');
                if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
                clearMessageContainers([wizardEducationMessagesContainer].filter(Boolean)); // Clear messages
            });
        } else {
            console.warn('Wizard Education Add button or form not found.');
        }

        // Note: Wizard languages step likely just shows the textarea directly,
        // but if you had an "Add New" button for languages in the wizard,
        // you would uncomment and adjust this listener:
        // if (wizardAddLanguagesButton) {
        //      wizardAddLanguagesButton.addEventListener('click', () => {
        //          if (wizardEditLanguagesForm) {
        //              // Hide other wizard forms
        //              hideAllAddEditForms([wizardAddWorkExperienceForm, wizardAddProjectsForm, wizardAddEducationForm, wizardEditLanguagesForm].filter(Boolean));
        //              wizardEditLanguagesForm.style.display = 'block'; // Show the languages form (using the edit form for adding)
        //              wizardEditLanguagesForm.reset(); // Clear the form
        //              const entryIdInput = wizardEditLanguagesForm.querySelector('input[name="entry_id"]');
        //              if (entryIdInput) entryIdInput.value = ''; // Ensure ID is empty for new entries
        //              clearMessageContainers([wizardLanguagesMessagesContainer].filter(Boolean)); // Clear messages
        //          }
        //      });
        // }


        // --- Event Listeners for Cancel buttons within Wizard Forms ---
        const wizardCancelButtons = document.querySelectorAll('.wizard-cancel-form-button');
        wizardCancelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const form = button.closest('form');
                if (form) {
                    form.style.display = 'none'; // Hide the form
                    form.reset(); // Clear the form
                    const entryIdInput = form.querySelector('input[name="entry_id"]');
                    if (entryIdInput) entryIdInput.value = ''; // Clear entry ID
                    // Clear messages associated with this form
                    const messagesContainer = form.nextElementSibling; // Assuming messages are right after the form
                    if (messagesContainer && messagesContainer.classList.contains('settings-messages')) {
                        clearMessageContainers([messagesContainer]);
                    }
                }
            });
        });

        // --- Wizard Form Submission Listeners (for forms within wizard steps) ---
        // These call the generic saveEntry function from experienceSections.js

        if (wizardAddWorkExperienceForm && wizardWorkExperienceMessagesContainer) {
            wizardAddWorkExperienceForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                // Call saveEntry from experienceSections.js
                saveEntry(wizardAddWorkExperienceForm, wizardWorkExperienceMessagesContainer, 'work-experience', fetchModalDataCallback, fetchMainPageDataCallback);
            });
        }

        if (wizardAddProjectsForm && wizardProjectsMessagesContainer) {
            wizardAddProjectsForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                // Call saveEntry from experienceSections.js
                saveEntry(wizardAddProjectsForm, wizardProjectsMessagesContainer, 'projects', fetchModalDataCallback, fetchMainPageDataCallback);
            });
        }

        if (wizardAddEducationForm && wizardEducationMessagesContainer) {
            wizardAddEducationForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                // Call saveEntry from experienceSections.js
                saveEntry(wizardAddEducationForm, wizardEducationMessagesContainer, 'education', fetchModalDataCallback, fetchMainPageDataCallback);
            });
        }

        // Wizard Bio Save (Logic adapted from bio.js) - Added listener here for wizard's bio form
        if (wizardEditBioForm && wizardBioMessagesContainer) {
            wizardEditBioForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(wizardEditBioForm);

                showMessage(wizardBioMessagesContainer, 'info', 'Saving bio...');

                try {
                    const response = await fetch('/api/profile/update_bio', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(wizardBioMessagesContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Wizard Bio saved:', data.bio);
                        // Update the bio text area value in the wizard
                        if (wizardBioTextarea) wizardBioTextarea.value = data.bio || '';
                        // Also update the main profile bio if viewing own profile
                        const viewedUserId = document.body.dataset.viewedUserId;
                        const currentUserId = document.body.dataset.currentUserId;
                        if (viewedUserId === currentUserId) {
                            const mainBioElement = document.querySelector('.bio');
                            if (mainBioElement) {
                                // Preserve any prefix like "bio: " if it exists
                                const currentBioText = mainBioElement.textContent;
                                const bioPrefix = currentBioText.startsWith('bio: ') ? 'bio: ' : '';
                                mainBioElement.textContent = bioPrefix + (data.bio || ''); // Use data.bio from response
                            }
                        }
                    }
                } catch (error) {
                    console.error('Wizard Bio save failed:', error);
                    showMessage(wizardBioMessagesContainer, 'error', 'An error occurred while saving bio.');
                }
            });
        }

        // Wizard Skills Save - Added listener here for wizard's skills form
        if (wizardEditSkillsForm && wizardSkillsMessagesContainer) {
            wizardEditSkillsForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(wizardEditSkillsForm);

                showMessage(wizardSkillsMessagesContainer, 'info', 'Saving skills...');

                try {
                    const response = await fetch('/api/profile/skills', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(wizardSkillsMessagesContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Wizard Skills saved:', data.skills);
                        // Refresh main page skills display
                        fetchAndRenderMainPageData();
                    }
                } catch (error) {
                    console.error('Wizard Skills save failed:', error);
                    showMessage(wizardSkillsMessagesContainer, 'error', 'An error occurred while saving skills.');
                }
            });
        }

        // Wizard Interests Save - Added listener here for wizard's interests form
        if (wizardEditInterestsForm && wizardInterestsMessagesContainer) {
            wizardEditInterestsForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(wizardEditInterestsForm);

                showMessage(wizardInterestsMessagesContainer, 'info', 'Saving interests...');

                try {
                    const response = await fetch('/api/profile/interests', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(wizardInterestsMessagesContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Wizard Interests saved:', data.interests);
                        // Refresh main page interests display
                        fetchAndRenderMainPageData();
                    }
                } catch (error) {
                    console.error('Wizard Interests save failed:', error);
                    showMessage(wizardInterestsMessagesContainer, 'error', 'An error occurred while saving interests.');
                }
            });
        }

        // Wizard Languages Save (Employee Specific) - Added listener here for wizard's languages form
        const currentUserType = document.body.dataset.currentUserType; // Get user type again locally if needed
        if (wizardEditLanguagesForm && wizardLanguagesMessagesContainer && currentUserType === 'employee') {
            wizardEditLanguagesForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(wizardEditLanguagesForm);

                showMessage(wizardLanguagesMessagesContainer, 'info', 'Saving languages...');

                try {
                    const response = await fetch('/api/profile/languages', { // Assuming this is the correct endpoint
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    showMessage(wizardLanguagesMessagesContainer, data.status, data.message);

                    if (data.status === 'success') {
                        console.log('Wizard Languages saved:', data.languages);
                        // Refresh main page languages display
                        fetchAndRenderMainPageData();
                    }
                } catch (error) {
                    console.error('Wizard Languages save failed:', error);
                    showMessage(wizardLanguagesMessagesContainer, 'error', 'An error occurred while saving languages.');
                }
            });
        }
    


}

// Export wizard modal element for profileApp.js
export { profileWizardPopup };
