// detailsPopup.js - Handles a generic details popup for Work Experience, Projects, Education, Skills, and Interests

import { showMessage } from './utils.js';

// Get references to popup elements
const detailsPopup = document.getElementById('details-popup');
const detailsPopupTitle = document.getElementById('details-popup-title');
const detailsPopupContent = document.getElementById('details-popup-content');
const detailsCloseButton = detailsPopup ? detailsPopup.querySelector('.close-button') : null;

// Variable to hold the profile data cache
let profileDataCache = null;

/**
 * Sets the profile data cache for the details popup module.
 * This should be called after the main profile data is fetched.
 * @param {object} data - The profile data object.
 */
export function setprofileDataCache(data) {
    profileDataCache = data;
    console.log("Details popup cache set:", profileDataCache); // Log when cache is set
}
export function getProfileDataCache() {
    return profileDataCache;
}

/**
 * Shows the generic details popup and populates it with data for a given entry or list.
 * Uses the cached profile data.
 * @param {number | null} entryId - The ID of the entry to display, or null if displaying a list.
 * @param {string} section - The section name ('work-experience', 'projects', 'education', 'skills', 'interests').
 * @param {Array<Object> | Array<string> | null} fullEntriesList - The full list of entries (used for skills/interests \"Show All\").
 */
export async function showDetailsPopup(entryId, section, fullEntriesList = null) {
    if (!detailsPopup || !detailsPopupTitle || !detailsPopupContent) {
        console.error("Details popup elements not found.");
        return;
    }

    // Clear previous content and messages
    detailsPopupTitle.textContent = '';
    detailsPopupContent.innerHTML = '';
    // Assuming a messages container exists within the details popup if needed
    const messagesContainer = detailsPopupContent.querySelector('.popup-messages');
    if (messagesContainer) messagesContainer.innerHTML = '';


    // Use the cached data
    const profileData = getProfileDataCache();

    if (!profileData) {
        console.error("Profile data cache not available for details popup.");
        showMessage(messagesContainer, 'error', 'Could not load details.');
        return;
    }

    let entries = [];
    let title = '';
    let contentHTML = '';

    // Determine which data to use based on section
    if (section === 'work-experience' && profileData.work_experiences) {
        entries = profileData.work_experiences;
        title = 'Work Experience Details';
    } else if (section === 'projects' && profileData.projects) {
        entries = profileData.projects;
        title = 'Project Details';
    } else if (section === 'education' && profileData.education) {
        entries = profileData.education;
        title = 'Education Details';
    } else if ((section === 'skills' || section === 'interests') && profileData.employee_details) {
        // For skills and interests, the full list is passed when clicking "Show All"
        if (fullEntriesList) {
            entries = fullEntriesList;
        } else {
             // If fullEntriesList is not passed, get from cache (might be a single string)
             const dataString = (section === 'skills' ? profileData.employee_details.skills : profileData.employee_details.interests) || '';
             entries = dataString.split(',').map(item => item.trim()).filter(item => item);
        }
        title = section.charAt(0).toUpperCase() + section.slice(1); // Capitalize section name
    } else {
        console.error('Unknown section or data not available for details popup:', section);
        showMessage(messagesContainer, 'error', 'Details not available for this section.');
        return;
    }

    detailsPopupTitle.textContent = title;

    // Populate content based on whether a specific entry or a list is displayed
    if (entryId !== null) {
        // Display details for a specific entry
        const entry = entries.find(item => item.id == entryId); // Use == for potential type coercion
        if (entry) {
            // Format content based on section
            if (section === 'work-experience') {
                contentHTML = `
                    <p><strong>Title:</strong> ${entry.title || 'N/A'}</p>
                    <p><strong>Company:</strong> ${entry.company || 'N/A'}</p>
                    <p><strong>Location:</strong> ${entry.location || 'N/A'}</p>
                    <p><strong>Dates:</strong> ${formatMonthYear(entry.start_date)} - ${formatMonthYear(entry.end_date)}</p>
                    <p><strong>Description:</strong> ${entry.description || 'No description provided.'}</p>
                `;
            } else if (section === 'projects') {
                 contentHTML = `
                    <p><strong>Name:</strong> ${entry.name || 'N/A'}</p>
                    <p><strong>Description:</strong> ${entry.description || 'No description provided.'}</p>
                    <p><strong>Technologies:</strong> ${entry.technologies || 'None specified.'}</p>
                    <p><strong>Link:</strong> ${entry.link ? `<a href=\"${entry.link}\" target=\"_blank\">${entry.link}</a>` : 'No link available.'}</p>
                 `;
            } else if (section === 'education') {
                 contentHTML = `
                    <p><strong>Degree/Certification:</strong> ${entry.degree || 'N/A'}</p>
                    <p><strong>Institution:</strong> ${entry.institution || 'N/A'}</p>
                    <p><strong>Field of Study:</strong> ${entry.field_of_study || 'N/A'}</p>
                    <p><strong>Year of Completion:</strong> ${entry.year_of_completion || 'N/A'}</p>
                    <p><strong>Notes:</strong> ${entry.notes || 'No notes provided.'}</p>
                 `;
            }
            // Skills and Interests don't have individual detail popups with entryId
        } else {
            contentHTML = '<p>Entry details not found.</p>';
        }
    } else {
        // Display the full list (used for Skills and Interests "Show All")
        if (section === 'skills' || section === 'interests') {
            if (entries.length > 0) {
                contentHTML = '<ul>' + entries.map(item => `<li>${item}</li>`).join('') + '</ul>';
            } else {
                contentHTML = `<p>No ${section.replace('-', ' ')} listed.</p>`;
            }
        } else {
             contentHTML = '<p>List view not available for this section.</p>';
        }
    }


    if (detailsPopupContent) detailsPopupContent.innerHTML = contentHTML;

    // Open the modal
    detailsPopup.style.display = 'block';
}

/**
 * Hides the generic details popup.
 */
export function hideDetailsPopup() {
    if (detailsPopup) {
        detailsPopup.style.display = 'none';
    }
}

/**
 * Sets up event listeners for the generic details popup.
 */
export function setupDetailsPopup() {
    // Add event listener to close button
    if (detailsCloseButton) {
        detailsCloseButton.addEventListener('click', hideDetailsPopup);
    }

    // Add event listener to close when clicking outside the modal content
    if (detailsPopup) {
        window.addEventListener('click', (event) => {
            if (event.target === detailsPopup) {
                hideDetailsPopup();
            }
        });
    }
}

// Helper function (assuming formatMonthYear is in utils.js)
function formatMonthYear(dateString) {
    if (!dateString) {
        return 'Present';
    }
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error("Error formatting date in detailsPopup:", dateString, error);
        return dateString; // Return original if formatting fails
    }
}
