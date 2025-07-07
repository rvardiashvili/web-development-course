// /home/rati/Documents/webdevelopement/frontend/static/js/suggestions.js

/**
 * Creates the HTML for a single suggestion item.
 * @param {object} suggestion - The suggestion object from the API.
 * @returns {HTMLElement} - The created DOM element for the suggestion.
 */
function createSuggestionElement(suggestion) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';

    const data = suggestion.data;
    const type = suggestion.type;
    let profilePic, name, link;

    if (type === 'user') {
        profilePic = data.profile_picture || '/static/media/default/pfp.jpg';
        name = data.full_name;
        link = `/profile/${data.username}`;
    } else if (type === 'group') {
        profilePic = data.profile_picture || '/static/media/default/community.png';
        name = data.name;
        link = `/feed/community/${data.group_id}`;
    }

    item.innerHTML = `
        <a href="${link}" class="suggestion-link">
            <div class="suggestion-image">
                <img src="${profilePic}" alt="${name}'s picture">
            </div>
            <div class="suggestion-content">
                <span class="suggestion-name">${name}</span>
                <p class="suggestion-reason">${suggestion.reason}</p>
            </div>
        </a>

    `;
    return item;
}

/**
 * Fetches suggestions from the API and renders them into the container.
 */
async function fetchAndDisplaySuggestions() {
    const container = document.querySelector('.suggestions-list');
    if (!container) {
        console.warn("Suggestion list container (.suggestions-list) not found.");
        return;
    }

    container.innerHTML = '<p class="loading-suggestions">Loading suggestions...</p>';

    try {
        const response = await fetch('/suggestions/');
        const suggestions = await response.json();

        container.innerHTML = ''; // Clear loading message

        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(suggestion => container.appendChild(createSuggestionElement(suggestion)));
        } else {
            container.innerHTML = '<p class="no-suggestions">No new suggestions right now.</p>';
        }
    } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        container.innerHTML = '<p class="error-suggestions">Could not load suggestions.</p>';
    }
}

/**
 * Main entry point for the suggestions module.
 */
export function setupSuggestionsModule() {
    fetchAndDisplaySuggestions();
}