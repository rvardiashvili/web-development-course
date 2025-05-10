// languageDisplay.js - Handles rendering languages on the main profile page

// Get reference to the main profile languages display element
const mainLanguagesDisplay = document.getElementById('main-languages-display');

/**
 * Function to render languages on the main profile page.
 * Parses strings like "Language (Level)" and renders them with hover effect for level.
 * @param {string} languagesString - The comma-separated string of languages and levels.
 */
export function renderLanguages(languagesString) {
    if (mainLanguagesDisplay) {
        mainLanguagesDisplay.innerHTML = ''; // Clear current content

        if (languagesString) {
            // Split the string by comma and trim whitespace
            const languagesArray = languagesString.split(',').map(lang => lang.trim()).filter(lang => lang); // Filter out empty strings

            languagesArray.forEach(languageEntry => {
                const languageSpan = document.createElement('span');
                languageSpan.classList.add('language-entry'); // Add a class for styling

                // Use regex to find the language name and the level in parentheses
                const match = languageEntry.match(/^(.+?)\s*(\(.+\))?$/);

                if (match) {
                    const languageName = match[1].trim();
                    // Get the level and remove parentheses using replace
                    const languageLevel = match[2] ? match[2].replace(/[()]/g, '').trim() : '';

                    languageSpan.innerHTML = `
                        <span class="language-name">${languageName}</span>
                        <span class="language-level">${languageLevel}</span>
                    `;
                } else {
                    // If format doesn't match, just display the whole string as the name
                     languageSpan.innerHTML = `<span class="language-name">${languageEntry}</span>`;
                }

                mainLanguagesDisplay.appendChild(languageSpan);
            });

            // Add or remove the 'has-languages' class based on whether there are languages
            mainLanguagesDisplay.classList.add('has-languages');
        } else {
            mainLanguagesDisplay.classList.remove('has-languages');
        }
    }
}
