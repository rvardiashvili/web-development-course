// utils.js - General utility functions

/**
 * Formats a date string into "Month Year".
 * @param {string | null} dateString - The date string inYYYY-MM-DD format.
 * @returns {string} The formatted date string or 'Present' if null.
 */
function formatMonthYear(dateString) {
    if (!dateString) {
        return 'Present';
    }
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString; // Return original if formatting fails
    }
}


/**
 * Shows a message in a specified container.
 * @param {HTMLElement} container - The HTML element to display the message in.
 * @param {string} status - The status of the message ('success', 'error', 'info'). Used for styling.
 * @param {string} message - The message text to display.
 */
export function showMessage(container, status, message) {
    if (container) {
        container.innerHTML = `<div class="${status}">${message}</div>`;
    }
}

/**
 * Clears the content of multiple message containers.
 * @param {HTMLElement[]} containers - An array of HTML elements to clear.
 */
export function clearMessageContainers(containers) {
    containers.forEach(container => {
        if (container) {
            container.innerHTML = '';
        }
    });
}

/**
 * Hides all add/edit forms and resets them.
 * @param {NodeListOf<HTMLElement>} forms - A NodeList of all add/edit form elements.
 */
export function hideAllAddEditForms(forms) {
    forms.forEach(form => {
        form.style.display = 'none';
        form.reset(); // Also reset forms when hiding
        const entryIdInput = form.querySelector('input[name="entry_id"]');
        if (entryIdInput) {
            entryIdInput.value = ''; // Clear entry ID
        }
    });
}

/**
 * Renders a list of entries into a specified list element.
 * This function is used for BOTH the settings modal and the main page tabs.
 * @param {HTMLElement} listElement - The HTML element (e.g., a div) to render the entries into.
 * @param {Array<Object>} entries - An array of entry objects (Work Experience, Project, Education, etc.).
 * @param {string} section - The section name ('work-experience', 'projects', 'education', 'skills', 'interests').
 * @param {boolean} isMainPage - True if rendering for the main profile page, false for the settings modal.
 * @param {function} editEntryCallback - Callback function for editing an entry (only used for modal).
 * @param {function} deleteEntryCallback - Callback function for deleting an entry (only used for modal).
 * @param {function} showDetailsPopupCallback - Callback function to show a generic details popup (only for main page).
 */
export function renderEntries(listElement, entries, section, isMainPage = false, editEntryCallback, deleteEntryCallback, showDetailsPopupCallback) {
    listElement.innerHTML = ''; // Clear current list
    if (!entries || entries.length === 0) {
        listElement.innerHTML = '<p>No entries added yet.</p>';
        return;
    }

    // Limit for skills and interests on the main page
    const SKILLS_INTERESTS_LIMIT = 6;
    const isSkillsOrInterests = (section === 'skills' || section === 'interests');
    const shouldLimit = isMainPage && isSkillsOrInterests && entries.length > SKILLS_INTERESTS_LIMIT;
    const entriesToRender = shouldLimit ? entries.slice(0, SKILLS_INTERESTS_LIMIT) : entries;


    entriesToRender.forEach(entry => {
        const entryDiv = document.createElement('div');
        // Use different classes for main page vs settings modal if needed for styling
        entryDiv.classList.add(isMainPage ? `${section}-entery` : 'settings-entry');

        if (!isMainPage) {
            entryDiv.dataset.entryId = entry.id; // Store the entry ID only in settings modal

            // Create and append details div for settings modal
            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('entry-details'); // Use settings modal class

            // Customize display based on section
            if (section === 'work-experience') {
                detailsDiv.textContent = `${entry.title} at ${entry.company} (${entry.start_date}${entry.end_date ? ' - ' + entry.end_date : ''})`;
            } else if (section === 'projects') {
                detailsDiv.textContent = `${entry.title}${entry.technologies ? ' (' + entry.technologies + ')' : ''}`;
            } else if (section === 'education') {
                detailsDiv.textContent = `${entry.degree} at ${entry.institution} (${entry.year_of_completion})`;
            }

            entryDiv.appendChild(detailsDiv);

            // Add actions (Edit/Delete) in the settings modal
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('entry-actions');

            const editButton = document.createElement('button');
            editButton.classList.add('edit-entry-button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editEntryCallback(entry.id, section));

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-entry-button', 'delete-button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteEntryCallback(entry.id, section));

            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            entryDiv.appendChild(actionsDiv);

        } else {
            // For the main page, set text content directly on the main div, wrapped in appropriate tags
            let contentHTML = '';
            let isClickable = false;

            if (section === 'work-experience') {
                 // Format dates and wrap parts in spans for styling, each on a new line (paragraphs)
                 const startDateFormatted = formatMonthYear(entry.start_date);
                 const endDateFormatted = formatMonthYear(entry.end_date);
                 contentHTML = `
                    <p><span class="entry-title">${entry.title || 'N/A'}</span></p>
                    <p><span class="entry-company">${entry.company || 'N/A'}</span></p>
                    <p><span class="entry-dates">${startDateFormatted} - ${endDateFormatted}</span></p>
                 `;
                 isClickable = true;
            } else if (section === 'projects') {
                 // Display title, description, and technologies, centered
                 contentHTML = `
                    <h3>${entry.title || 'N/A'}</h3>
                    <p class="description">${entry.description || 'No description provided.'}</p>
                    <p class="technologies"><span class="tech-label">Technologies:</span> ${entry.technologies || 'None specified.'}</p>
                 `;
                 isClickable = true;
            } else if (section === 'education') {
                 // Wrap parts in spans for styling, each on a new line (paragraphs)
                 contentHTML = `
                    <p><span class="entry-degree-institution">${entry.degree || 'N/A'}</span></p>
                    <p><span class="entry-degree-institution">${entry.institution || 'N/A'}</span></p>
                    <p><span class="entry-year">(${entry.year_of_completion || 'N/A'})</span></p>
                 `;
                 isClickable = true;
            } else if (isSkillsOrInterests) {
                 // Skills and Interests are just text, no spans needed for individual items
                 contentHTML = `<p>${entry || 'N/A'}</p>`;
                 isClickable = false; // Skills and Interests entries themselves are not clickable for details
            }

            entryDiv.innerHTML = contentHTML;

            // Add click listener for details popup if applicable
            if (isClickable && showDetailsPopupCallback) {
                 entryDiv.style.cursor = 'pointer'; // Indicate clickable
                 entryDiv.addEventListener('click', () => {
                     showDetailsPopupCallback(entry.id, section);
                 });
            } else {
                 entryDiv.style.cursor = 'default'; // Not clickable
            }
        }

        listElement.appendChild(entryDiv);
    });

    // Add "Show All" button for skills/interests if limited
    if (shouldLimit) {
        const showAllButton = document.createElement('button');
        showAllButton.classList.add('show-all-button');
        showAllButton.textContent = `Show All ${entries.length} ${section}`;
        showAllButton.addEventListener('click', () => {
            if (showDetailsPopupCallback) {
                // Pass the full list and section to the generic popup
                showDetailsPopupCallback(null, section, entries); // Pass null for ID, section, and the full entries array
            }
        });
        listElement.appendChild(showAllButton);
    }
}
