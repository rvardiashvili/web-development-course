// mainPageDisplay.js - Handles fetching and rendering data on the main profile page

import { renderEntries } from './utils.js';
import { showDetailsPopup } from './detailsPopup.js'; // Import the generic details popup function
import { setprofileDataCache } from './detailsPopup.js';
// References to the lists on the main profile page
const mainWorkExperienceList = document.getElementById('main-work-experience-list');
const mainProjectsList = document.getElementById('main-projects-list');
const mainEducationList = document.getElementById('main-education-list');
const mainSkillsList = document.getElementById('main-skills-list');
const mainInterestsList = document.getElementById('main-interests-list');

/**
 * Fetches and populates profile data for the main page tabs.
 * This function is called on page load and after modal saves/deletes.
 */
export async function fetchAndRenderMainPageData() {
    // Get viewed user ID from the data attribute on the body
    const userId = document.body.dataset.viewedUserId;

    if (!userId) {
        console.error("Viewed user ID not available for main page data fetch.");
        // Optionally show a message on the main page indicating data could not load
        return;
    }

    try {
        // Assuming the same endpoint can serve data for the viewed user
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();

        if (data.status === 'success') {
            setprofileDataCache(data); // Cache the fetched data for the details popup
            // Populate lists on the main profile page tabs
            // Pass the generic showDetailsPopup callback for Work Experience, Projects, and Education
            renderEntries(mainWorkExperienceList, data.work_experiences, 'work-experience', true, null, null, showDetailsPopup);
            renderEntries(mainProjectsList, data.projects, 'projects', true, null, null, showDetailsPopup);
            renderEntries(mainEducationList, data.education, 'education', true, null, null, showDetailsPopup);

            // Populate Skills on the main page
            if (data.employee_details && data.employee_details.skills !== undefined) {
                // Split skills string into an array for rendering
                const skillsArray = data.employee_details.skills ? data.employee_details.skills.split(',').map(skill => skill.trim()) : [];
                renderEntries(mainSkillsList, skillsArray, 'skills', true, null, null, showDetailsPopup); // Pass showDetailsPopup for "Show All" button
            } else {
                renderEntries(mainSkillsList, [], 'skills', true); // Render empty if no skills
            }

            // Populate Interests on the main page
            if (data.employee_details && data.employee_details.interests !== undefined) {
                // Split interests string into an array for rendering
                const interestsArray = data.employee_details.interests ? data.employee_details.interests.split(',').map(interest => interest.trim()) : [];
                renderEntries(mainInterestsList, interestsArray, 'interests', true, null, null, showDetailsPopup); // Pass showDetailsPopup for "Show All" button
            } else {
                renderEntries(mainInterestsList, [], 'interests', true); // Render empty if no interests
            }

        } else {
            console.error('Error fetching profile data for main page:', data.message);
            // Optionally show an error on the main page in a designated area
        }
    } catch (error) {
        console.error('Error fetching profile data for main page:', error);
        // Optionally show an error on the main page in a designated area
    }
}
