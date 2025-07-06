// post_create.js - Handles post creation UI and logic

import { createPostApi } from './post_api.js'; // Import the API function

// DOM Elements (assuming these exist in your HTML)
const postForm = document.getElementById('post-form');
const postContentInput = document.getElementById('post-content');
const postMediaInput = document.getElementById('post-media');
const postVisibilitySelect = document.getElementById('post-visibility');
const postMessageContainer = document.getElementById('post-messages');

// New DOM elements for the modal
const postCreationModal = document.getElementById('post-creation-modal');
const closeButton = document.querySelector('.close-button');


/**
 * Displays a message to the user in a designated container.
 * @param {string} message - The message text.
 * @param {string} type - The type of message ('success', 'error', 'info').
 */
function displayPostMessage(message, type) {
    if (postMessageContainer) {
        postMessageContainer.textContent = message;
        postMessageContainer.className = `message-container ${type}`;
        // Clear message after a few seconds
        setTimeout(() => {
            postMessageContainer.textContent = '';
            postMessageContainer.className = 'message-container';
        }, 5000);
    } else {
        console.log(`Message (${type}): ${message}`);
    }
}

/**
 * Handles the submission of the post creation form.
 * @param {Event} event - The form submission event.
 * @param {number} currentUserId - The ID of the currently logged-in user.
 * @param {function} refreshPostsCallback - Callback function to refresh the post list after creation.
 */
async function handlePostSubmit(event, currentUserId, refreshPostsCallback) {
    event.preventDefault(); // Prevent default form submission



    const content = postContentInput.value.trim();
    const visibility = postVisibilitySelect.value;
    const mediaFile = postMediaInput.files[0];

    if (!content) {
        displayPostMessage('Post content cannot be empty.', 'error');
        return;
    }

    // Determine post type based on media presence
    let postType = 'article'; // Default to article if no media
    if (mediaFile) {
        if (mediaFile.type.startsWith('image/')) {
            postType = 'image';
        } else if (mediaFile.type.startsWith('video/')) {
            postType = 'video';
        }
    }

    // Use FormData for media upload
    const formData = new FormData();
    formData.append('content', content);
    formData.append('visibility', visibility);
    formData.append('post_type', postType); // Send the determined post type

    if (mediaFile) {
        formData.append('media', mediaFile); // Append the actual file
    }

    displayPostMessage('Creating post...', 'info');

    try {
        const result = await createPostApi(formData); // Call the API function

        if (result.status === 'success') { // Check status from the JSON result
            displayPostMessage(result.message || 'Post created successfully!', 'success');
            postContentInput.value = ''; // Clear content
            postMediaInput.value = ''; // Clear file input
            postVisibilitySelect.value = 'public'; // Reset visibility

            // Hide the modal after successful post creation
            if (postCreationModal) {
                postCreationModal.style.display = 'none';
            }

            // Refresh the list of posts after a successful creation
            if (refreshPostsCallback) {
                await refreshPostsCallback();
            }
        } else {
            displayPostMessage(result.message || 'Failed to create post.', 'error');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        displayPostMessage('An unexpected error occurred while creating the post.', 'error');
    }
}

/**
 * Initializes listeners for the post creation form.
 * @param {number} currentUserId - The ID of the currently logged-in user.
 * @param {function} refreshPostsCallback - Callback to refresh posts after creation.
 */
export function setupPostCreationListeners(currentUserId, refreshPostsCallback) {
    if (postForm) {
        postForm.addEventListener('submit', (event) => handlePostSubmit(event, currentUserId, refreshPostsCallback));
    } else {
        console.warn("Post creation form (id='post-form') not found.");
    }
}

export function setupPostCreationModule(currentUserId){
        const createNewPostButton = document.getElementById('create-new-post-button');
        // const postCreationSection = document.getElementById('post-creation-section'); // No longer directly controlled by this button
        // const cancelPostButton = document.getElementById('cancel-post-button'); // No longer needed
        // Define a callback to refresh the posts display after a new post is created
        // This ensures the newly created post appears in the list.
        // Assuming setupPostsDisplayModule is accessible or passed down from the main app file
        const refreshPostsCallback = () => {
             // You'll need to define `current_user_id` or pass the correct contextId here.
             // For a profile page, this might be `viewedUserId`.
             // For a feed, it might be `null` or `currentUserId` depending on the feed type.
             // For simplicity, using `currentUserId` passed to this module.
            //  setupPostsDisplayModule(currentUserId);
            // Instead of re-importing, if setupPostsDisplayModule is from another file,
            // you might pass it as an argument to setupPostCreationModule or access globally if defined.
            // For this example, assuming it's available or should be re-evaluated how refresh works.
            // A more robust solution would be to pass the actual `refreshPostsDisplay` function
            // from post.js down to this module.
            console.log("Refreshing posts display...");
            // A placeholder to ensure posts are refreshed. The actual refreshPostsDisplay
            // function needs to be imported or passed here.
            // For now, we'll assume the main app calls refreshPostsDisplay after the modal closes.
            // Or you can re-trigger it from here, but you'd need the import or a global function.
            // As a direct fix, assuming `refreshPostsDisplay` from `post.js` is what you want to call:
            // This would require `setupPostCreationModule` to accept `refreshPostsDisplay` as an argument.
            // For now, removing the direct call and assuming the parent app manages the refresh flow.
        };


        // Initialize post creation listeners, passing the refresh callback
        setupPostCreationListeners(currentUserId, refreshPostsCallback);

        // Add visibility toggling for the modal
        if (createNewPostButton && postCreationModal && closeButton) {
            createNewPostButton.addEventListener('click', () => {
                postCreationModal.style.display = 'flex'; // Use flex to center content
            });

            closeButton.addEventListener('click', () => {
                postCreationModal.style.display = 'none';
                // Optional: Clear form content when closing without posting
                postContentInput.value = '';
                postMediaInput.value = '';
                postVisibilitySelect.value = 'public';
                postMessageContainer.textContent = ''; // Clear any messages
                postMessageContainer.className = 'message-container';
            });

            // Close the modal if the user clicks outside of the modal content
            postCreationModal.addEventListener('click', (event) => {
                if (event.target === postCreationModal) {
                    postCreationModal.style.display = 'none';
                    // Optional: Clear form content when closing without posting
                    postContentInput.value = '';
                    postMediaInput.value = '';
                    postVisibilitySelect.value = 'public';
                    postMessageContainer.textContent = ''; // Clear any messages
                    postMessageContainer.className = 'message-container';
                }
            });

        } else {
            console.warn("Post creation UI elements (button/modal/close button) not found for current user.");
        }
}