// post.js - Main entry point for post display and filtering functionality

// This module focuses solely on setting up the UI and logic
// for displaying and filtering posts.
// It imports necessary functions from post_display.js.
// Post creation logic is handled in post_create.js.
// API interactions are in post_api.js.

import { fetchAndRenderUserPosts, setupSinglePostModalListeners, setupImageEnlargementListeners } from './post_display.js';

// These variables maintain the state of the filters and sort order
// for the currently displayed posts. They are private to this module.
let currentActivePostTypeButton = null;
let currentSortBy = 'recent';

// DOM Elements specific to the posts display component.
// These are assumed to be present within the HTML structure where this module is used.
// The 'postsListContainer' is where the actual post items will be rendered.
let postsListContainer = document.getElementById('posts-list');
let postTypeButtons = document.querySelectorAll(".post-type-button");
let sortBySelect = document.querySelector(".sort-by");


/**
 * Orchestrates fetching and rendering posts based on the current
 * filter and sort selections. This is the central function that
 * triggers a refresh of the displayed posts.
 *
 * @param {number} contextId - The ID relevant to the current page context
 * @param {number} contextType - The ID relevant to the current page context
 * (e.g., viewedUserId for a profile page, groupId for a group page, or null for a general feed).
 * This ID will be passed to fetchAndRenderUserPosts (or a more generic fetchAndRenderPosts).
 */
async function refreshPostsDisplay(contextId, contextType) {
    const selectedPostType = currentActivePostTypeButton ? currentActivePostTypeButton.id : 'All';
    const selectedSortBy = sortBySelect ? sortBySelect.value : 'recent';

    // IMPORTANT: The `visibilityFilter` and how `contextId` is used
    // will depend on the specific page (profile, feed, group).
    // For a profile page, contextId would be `viewedUserId`.
    // For a group page, contextId would be `groupId`.
    // For a general feed, contextId might be `currentUserId` to filter for friends' posts,
    // or null/undefined to get all public posts.
    // The `fetchAndRenderUserPosts` function (or a more generic `fetchAndRenderPosts`)
    // should be designed to handle these different contexts and filters.

    // For now, assuming `fetchAndRenderUserPosts` is flexible enough,
    // and `visibilityFilter` needs to be determined based on the context.
    // For a profile page, 'public' is a common default, but could be 'friends'
    // if the viewer is a friend, or 'private' if it's their own profile.
    // This example keeps 'public' as a default for simplicity.
    await fetchAndRenderUserPosts(contextId, contextType, postsListContainer, selectedPostType, selectedSortBy);
}

/**
 * Initializes the event listeners for the post type filter buttons
 * and the sort-by dropdown. It also sets the initial active state
 * for the "All" button.
 *
 * @param {number} contextId - The ID relevant to the current page context.
 * @param {number} contextType - The ID relevant to the current page context.
 */
function setupPostFilteringAndSorting(contextId, contextType) {
    postsListContainer = document.getElementById('posts-list');
    postTypeButtons = document.querySelectorAll(".post-type-button");
    sortBySelect = document.querySelector(".sort-by");

    // Set the initial active state for the "All" button
    currentActivePostTypeButton = document.getElementById("All");
    if (currentActivePostTypeButton) {
        currentActivePostTypeButton.style.border = "solid black 2px";
    }

    // Add click event listeners to all post type buttons
    postTypeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove the active border from the previously selected button
            if (currentActivePostTypeButton) {
                currentActivePostTypeButton.style.border = "none";
            }
            // Set the active border for the newly clicked button
            this.style.border = "solid black 2px";
            currentActivePostTypeButton = this; // Update the reference to the currently active button

            // Refresh the posts display with the new type filter
            refreshPostsDisplay(contextId, contextType);
        });
    });

    // Add change event listener to the sort-by dropdown
    if (sortBySelect) {
        sortBySelect.addEventListener('change', () => {
            currentSortBy = sortBySelect.value; // Update the current sort order
            refreshPostsDisplay(contextId, contextType); // Refresh the posts display with the new sort order
        });
    } else {
        console.warn("Sort by select dropdown (class='sort-by') not found. Sorting functionality will be limited.");
    }
}


/**
 * Main entry point function for setting up the post display component.
 * This function should be called from your page-specific JavaScript
 * (e.g., profileApp.js, feedApp.js, groupApp.js).
 *
 * @param {number} contextId - The ID relevant to the current page context.
 * For a profile page, this would be the `viewedUserId`.
 * For a group page, this would be the `groupId`.
 * For a general feed, this might be `currentUserId` or a specific feed type.
 */
export function setupPostsDisplayModule(contextId, contextType) {
    // Perform a crucial check to ensure the main container for posts exists.
    // If it doesn't, this module cannot function correctly.
    if (!postsListContainer) {
        console.error("Posts list container (id='posts-list') not found. Post display functionality will not be initialized.");
        return; // Exit the setup if the container is missing.
    }

    // Initialize the filtering and sorting UI and trigger the initial load of posts.
    setupPostFilteringAndSorting(contextId, contextType);
    refreshPostsDisplay(contextId, contextType);
    setupSinglePostModalListeners();
    setupImageEnlargementListeners();
    // The initial call to refreshPostsDisplay is now handled within setupPostFilteringAndSorting
    // to ensure the initial state of buttons/selects is set before the first fetch.
}
