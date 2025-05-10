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
 * @param {Array<Object> | Array<string> | null} fullEntriesList - The full list of entries (used for skills/interests "Show All").
 */
export async function showDetailsPopup(entryId, section, fullEntriesList = null) {
    if (!detailsPopup) {
        console.error("Details popup element not found.");
        return;
    }

    // Clear previous data
    if (detailsPopupTitle) detailsPopupTitle.textContent = 'Loading...';
    if (detailsPopupContent) detailsPopupContent.innerHTML = ''; // Clear previous content

    // Show the popup
    detailsPopup.style.display = 'block';

    // Handle displaying a list (for "Show All" skills/interests)
    if (fullEntriesList) {
        if (detailsPopupTitle) detailsPopupTitle.textContent = `All ${section}`;
        let contentHTML = '<div class="popup-skills-interests-container">'; // Use a container div
        fullEntriesList.forEach(item => {
            // Assuming skills/interests items are strings, wrap in a div for styling
            contentHTML += `<div class="popup-skill-interest-item">${item || 'N/A'}</div>`;
        });
        contentHTML += '</div>';
        if (detailsPopupContent) detailsPopupContent.innerHTML = contentHTML;
        return; // Exit the function after rendering the list
    }


    // Handle displaying a single entry (Work Experience, Projects, Education)
    if (entryId === null) {
        console.error("showDetailsPopup called for single entry with null entryId.");
         if (detailsPopupTitle) detailsPopupTitle.textContent = 'Error';
         if (detailsPopupContent) detailsPopupContent.innerHTML = '<p>Invalid entry data.</p>';
         return;
    }

    if (!profileDataCache) {
        console.error("showDetailsPopup called for single entry, but profile data cache is not set.");
        if (detailsPopupTitle) detailsPopupTitle.textContent = 'Error';
        if (detailsPopupContent) detailsPopupContent.innerHTML = '<p>Profile data not loaded yet. Please try again.</p>';
        return; // Prevent further execution if cache is null
    }


    // Find the specific entry in the cached data
    let entry = null;
    if (section === 'work-experience' && profileDataCache.work_experiences) {
        entry = profileDataCache.work_experiences.find(exp => exp.id === entryId);
    } else if (section === 'projects' && profileDataCacheF.projects) {
        entry = profileDataCache.projects.find(proj => proj.id === entryId);
    } else if (section === 'education' && profileDataCache.education) {
        entry = profileDataCache.education.find(edu => edu.id === entryId);
    }

    if (!entry) {
        console.error(`Entry with ID ${entryId} not found in cached data for section ${section}.`);
        if (detailsPopupTitle) detailsPopupTitle.textContent = 'Error';
        if (detailsPopupContent) detailsPopupContent.innerHTML = '<p>Entry data not found in cache.</p>';
        return;
    }


    // Set the title based on the section
    if (detailsPopupTitle) {
        if (section === 'work-experience') {
            detailsPopupTitle.textContent = entry.title || 'Work Experience Details';
        } else if (section === 'projects') {
            detailsPopupTitle.textContent = entry.title || 'Project Details';
        } else if (section === 'education') {
            detailsPopupTitle.textContent = entry.degree || 'Education Details';
        } else {
             detailsPopupTitle.textContent = 'Details'; // Fallback title
        }
    }


    // Populate the content based on the section using the found entry data
    let contentHTML = '';
    if (section === 'work-experience') {
         contentHTML = `
            <p><strong>Job Title:</strong> ${entry.title || 'N/A'}</p>
            <p><strong>Company:</strong> ${entry.company || 'N/A'}</p>
            <p><strong>Location:</strong> ${entry.location || 'N/A'}</p>
            <p><strong>Dates:</strong> ${entry.start_date || 'N/A'} - ${entry.end_date || 'Present'}</p>
            <p><strong>Description:</strong> ${entry.description || 'No description provided.'}</p>
         `;
    } else if (section === 'projects') {
         contentHTML = `
            <p><strong>Title:</strong> ${entry.title || 'N/A'}</p>
            <p><strong>Description:</strong> ${entry.description || 'No description provided.'}</p>
            <p><strong>Technologies:</strong> ${entry.technologies || 'None specified.'}</p>
            <p><strong>Link:</strong> ${entry.link ? `<a href="${entry.link}" target="_blank">${entry.link}</a>` : 'No link available.'}</p>
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

    if (detailsPopupContent) detailsPopupContent.innerHTML = contentHTML;
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
