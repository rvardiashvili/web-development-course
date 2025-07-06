// post_display.js - Handles fetching and displaying posts

import { fetchPostsApi, likePostApi, unlikePostApi, getLikeStatusApi } from './post_api.js'; // Import new API functions

// DOM Elements (assuming postsListContainer exists in your HTML)
const postsListContainer = document.getElementById('posts-list');

// New DOM elements for single post view modal
const singlePostViewModal = document.getElementById('single-post-view-modal');
const singlePostCloseButton = document.querySelector('.single-post-close-button');
const singlePostProfilePic = document.querySelector('.single-post-profile-pic');
const singlePostUsername = document.querySelector('.single-post-username');
const singlePostContentText = document.querySelector('.single-post-content-text');
const singlePostMediaContainer = document.querySelector('.single-post-media-container');
const singlePostMeta = document.querySelector('.single-post-meta');
// Removed global queries for singlePostLikeCountElement and singlePostLikeButtonElement
// as they will be queried inside openSinglePostModal for reliability.


// New DOM elements for image enlargement overlay
const enlargedImageOverlay = document.getElementById('enlarged-image-overlay');
const enlargedImage = document.querySelector('.enlarged-image');
const imageOverlayCloseButton = document.querySelector('.image-overlay-close-button');

// SVG icon for the heart/like
const HEART_SVG = `
    <svg class="like-icon" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
`;


/**
 * Updates the UI for a like button and count based on the provided status.
 * @param {HTMLElement} likeButtonElement - The button element to update.
 * @param {HTMLElement} likeCountElement - The element displaying the like count.
 * @param {boolean} userLiked - True if the current user has liked the post.
 * @param {number} likeCount - The total number of likes for the post.
 */
function updateLikeUI(likeButtonElement, likeCountElement, userLiked, likeCount) {
    if (likeCountElement) { // Add null check
        likeCountElement.textContent = `${likeCount} Likes`;
    }
    const likeIcon = likeButtonElement.querySelector('.like-icon');
    if (likeIcon) {
        if (userLiked) {
            likeIcon.classList.add('liked');
        } else {
            likeIcon.classList.remove('liked');
        }
    }
}

/**
 * Handles liking/unliking a post.
 * This function makes the API call and then updates the UI based on the API response.
 * @param {number} postId - The ID of the post.
 * @param {object} postDataRef - A reference to the postData object (from the list or modal) to update its user_liked status.
 * @param {HTMLElement} likeButtonElement - The button element to update.
 * @param {HTMLElement} likeCountElement - The element displaying the like count.
 */
async function handleLikeUnlike(postId, postDataRef, likeButtonElement, likeCountElement) {
    let result;
    // Use the current user_liked status from the postDataRef
    const currentUserLikedStatus = postDataRef.user_liked;

    if (currentUserLikedStatus) {
        result = await unlikePostApi(postId);
    } else {
        result = await likePostApi(postId); // Default emote type 'like'
    }

    if (result.status === 'success') {
        // After successful API call, fetch the actual updated like status to ensure accuracy
        const updatedStatus = await getLikeStatusApi(postId);
        if (updatedStatus.status === 'success') {
            // Update the postDataRef's user_liked status
            postDataRef.user_liked = updatedStatus.user_liked;
            updateLikeUI(likeButtonElement, likeCountElement, updatedStatus.user_liked, updatedStatus.like_count);
        } else {
            console.error('Failed to fetch updated like status after action:', updatedStatus.message);
            // If fetching updated status fails, revert the UI to its state before the action
            updateLikeUI(likeButtonElement, likeCountElement, currentUserLikedStatus, parseInt(likeCountElement.textContent.split(' ')[0]));
        }
    } else {
        console.error('Failed to update like status:', result.message);
        // If the API call itself failed, revert the UI to its state before the click
        updateLikeUI(likeButtonElement, likeCountElement, currentUserLikedStatus, parseInt(likeCountElement.textContent.split(' ')[0]));
    }
}


/**
 * Creates an HTML element for a single post.
 * @param {object} postData - The post data object.
 * @returns {HTMLElement} - The created post element.
 */
function createPostElement(postData) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    postDiv.dataset.postId = postData.post_id;

    // Add click listener to open the single post modal
    postDiv.addEventListener('click', (event) => {
        // Prevent opening the modal if a click originated from the profile picture link or like button
        if (event.target.closest('.post-user-info') || event.target.closest('.like-button')) {
            return;
        }
        openSinglePostModal(postData);
    });


    const userLink = document.createElement('a');
    userLink.href = `/profile/${postData.user.username}`; // Link to user profile
    userLink.className = 'post-user-info';

    const userPic = document.createElement('img');
    userPic.src = postData.user.profile_picture || '/static/media/default/pfp.jpg';
    userPic.alt = `${postData.user.username}'s profile picture`;
    userPic.className = 'post-profile-pic';
    userLink.appendChild(userPic);

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'post-username';
    usernameSpan.textContent = `@${postData.user.username}`;
    userLink.appendChild(usernameSpan);

    postDiv.appendChild(userLink);

    const postContent = document.createElement('p');
    postContent.className = 'post-content-text';
    postContent.textContent = postData.content;
    postDiv.appendChild(postContent);

    if (postData.media_url) {
        // Determine if it's an image or video based on 'post_type' field from backend
        // (which is now inferred in _serialize_post based on extension)
        if (postData.post_type === 'image') {
            const postMedia = document.createElement('img');
            postMedia.src = postData.media_url;
            postMedia.alt = 'Post media';
            postMedia.className = 'post-media';
            postMedia.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening single post modal when clicking image
                enlargeImage(postData.media_url);
            });
            postDiv.appendChild(postMedia);
        } else if (postData.post_type === 'video') {
            const postVideo = document.createElement('video');
            postVideo.src = postData.media_url;
            postVideo.controls = true; // Add controls for the video
            postVideo.className = 'post-media video'; // Use same class for styling, add 'video' specific class
            postVideo.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening single post modal when clicking video
            });
            postDiv.appendChild(postVideo);
        }
    }

    const postMeta = document.createElement('div');
    postMeta.className = 'post-meta';
    postMeta.textContent = `Posted on ${new Date(postData.created_at).toLocaleString()} | Visibility: ${postData.visibility}`;
    if (postData.group && postData.group.group_name) {
        postMeta.textContent += ` | Group: ${postData.group.group_name}`;
    }
    postDiv.appendChild(postMeta);

    // Like section for individual post items
    const likeSection = document.createElement('div');
    likeSection.className = 'post-like-section';

    const likeCountSpan = document.createElement('span');
    likeCountSpan.className = 'like-count';
    likeCountSpan.textContent = `${postData.like_count} Likes`;
    likeSection.appendChild(likeCountSpan);

    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.innerHTML = HEART_SVG; // Insert the SVG icon

    // Set initial liked state based on postData
    if (postData.user_liked) {
        likeButton.querySelector('.like-icon').classList.add('liked');
    }

    likeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent opening single post modal
        // Pass the postData object reference to handleLikeUnlike
        handleLikeUnlike(postData.post_id, postData, likeButton, likeCountSpan);
    });
    likeSection.appendChild(likeButton);

    postDiv.appendChild(likeSection);

    return postDiv;
}

/**
 * Opens the single post view modal and populates it with post data.
 * @param {object} postData - The post data object to display.
 */
function openSinglePostModal(postData) {
    if (!singlePostViewModal) {
        console.error("Single post view modal not found.");
        return;
    }

    // Query elements inside the modal when it's being opened to ensure they exist
    const modalLikeCountElement = singlePostViewModal.querySelector('.single-post-actions .single-post-like-count');
    let modalLikeButtonElement = singlePostViewModal.querySelector('.single-post-actions .single-post-like-button');

    if (!modalLikeCountElement || !modalLikeButtonElement) {
        console.error("Like count or button elements not found in single post modal.");
        return;
    }

    // Populate user info
    singlePostProfilePic.src = postData.user.profile_picture || '/static/media/default/pfp.jpg';
    singlePostProfilePic.alt = `${postData.user.username}'s profile picture`;
    singlePostUsername.textContent = `@${postData.user.username}`;

    // Populate post content
    singlePostContentText.textContent = postData.content;

    // Populate media
    singlePostMediaContainer.innerHTML = ''; // Clear previous media
    if (postData.media_url) {
        if (postData.post_type === 'image') {
            const img = document.createElement('img');
            img.src = postData.media_url;
            img.alt = 'Post media';
            img.className = 'single-post-media';
            img.addEventListener('click', () => enlargeImage(postData.media_url)); // Allow enlargement from modal
            singlePostMediaContainer.appendChild(img);
        } else if (postData.post_type === 'video') {
            const video = document.createElement('video');
            video.src = postData.media_url;
            video.controls = true;
            video.className = 'single-post-media';
            singlePostMediaContainer.appendChild(video);
        }
    }

    // Populate meta info
    singlePostMeta.textContent = `Posted on ${new Date(postData.created_at).toLocaleString()} | Visibility: ${postData.visibility}`;
    if (postData.group && postData.group.group_name) {
        singlePostMeta.textContent += ` | Group: ${postData.group.group_name}`;
    }

    // Populate like count and button in modal
    modalLikeCountElement.textContent = `${postData.like_count} Likes`;

    // Re-create the like button element to ensure a fresh event listener
    // and correct initial state.
    const newLikeButton = document.createElement('button');
    newLikeButton.className = 'single-post-like-button';
    newLikeButton.innerHTML = HEART_SVG; // Insert the SVG icon

    // Set initial liked state based on postData
    if (postData.user_liked) {
        newLikeButton.querySelector('.like-icon').classList.add('liked');
    } else {
        newLikeButton.querySelector('.like-icon').classList.remove('liked');
    }

    // Replace the old button with the new one
    if (modalLikeButtonElement && modalLikeButtonElement.parentNode) {
        modalLikeButtonElement.parentNode.replaceChild(newLikeButton, modalLikeButtonElement);
    } else {
        // Fallback if the button element was somehow missing initially
        const actionsContainer = singlePostViewModal.querySelector('.single-post-actions');
        if (actionsContainer) {
            actionsContainer.appendChild(newLikeButton);
        }
    }
    // Update the local reference to the new button
    modalLikeButtonElement = newLikeButton;


    // Attach event listener to the new button
    modalLikeButtonElement.addEventListener('click', () => {
        // Pass the postData object reference to handleLikeUnlike
        handleLikeUnlike(postData.post_id, postData, modalLikeButtonElement, modalLikeCountElement);
    });


    // Display the modal
    singlePostViewModal.style.display = 'flex';
}

/**
 * Initializes event listeners for the single post view modal.
 */
function setupSinglePostModalListeners() {
    if (singlePostViewModal && singlePostCloseButton) {
        singlePostCloseButton.addEventListener('click', () => {
            singlePostViewModal.style.display = 'none';
        });

        // Close modal if clicking outside the content
        singlePostViewModal.addEventListener('click', (event) => {
            if (event.target === singlePostViewModal) {
                singlePostViewModal.style.display = 'none';
            }
        });
    } else {
        console.warn("Single post view modal or close button not found. Single post view functionality will be limited.");
    }
}

/**
 * Opens the image enlargement overlay.
 * @param {string} imageUrl - The URL of the image to enlarge.
 */
function enlargeImage(imageUrl) {
    if (!enlargedImageOverlay || !enlargedImage) {
        console.error("Image enlargement overlay elements not found.");
        return;
    }
    enlargedImage.src = imageUrl;
    enlargedImageOverlay.style.display = 'flex';
}

/**
 * Initializes event listeners for the image enlargement overlay.
 */
function setupImageEnlargementListeners() {
    if (enlargedImageOverlay && imageOverlayCloseButton) {
        imageOverlayCloseButton.addEventListener('click', () => {
            enlargedImageOverlay.style.display = 'none';
            enlargedImage.src = ''; // Clear image src
        });

        // Close overlay if clicking outside the image
        enlargedImageOverlay.addEventListener('click', (event) => {
            if (event.target === enlargedImageOverlay) {
                enlargedImageOverlay.style.display = 'none';
                enlargedImage.src = ''; // Clear image src
            }
        });
    } else {
        console.warn("Image enlargement overlay elements not found. Image enlargement functionality will be limited.");
    }
}


/**
 * Fetches and renders posts based on the provided context and filters.
 * This function is now more generic to support different pages (profile, feed, group).
 *
 * @param {number|null} contextId - The ID relevant to the current page context.
 * - For a profile page, this would be `viewedUserId`.
 * - For a group page, this would be `groupId`.
 * - For a general feed, this might be `currentUserId` (to filter for friends' posts) or `null`/`undefined` (for all public posts).
 * @param {HTMLElement} containerElement - The DOM element where posts will be rendered.
 * @param {string} [visibilityFilter='public'] - Optional visibility filter (e.g., 'public', 'friends').
 * @param {string} [postTypeFilter='All'] - Optional post type filter ('All', 'Articles', 'Images', 'Videos').
 * @param {string} [sortBy='recent'] - Optional sort order ('recent', 'top').
 */
export async function fetchAndRenderUserPosts(contextId, containerElement, postTypeFilter = 'All', sortBy = 'recent') {
    if (!containerElement) {
        console.error("Container element for posts not provided.");
        return;
    }

    containerElement.innerHTML = '<div class="loading-message">Loading posts...</div>';

    try {
        // Construct query parameters for the GET request
        const queryParams = new URLSearchParams({
            sort_by: sortBy
        });

        // Conditionally add user_id or group_id based on contextId
        // The backend's `get_post_list` service should handle these parameters.
        if (contextId) {
            // This assumes contextId is a user_id for profile pages,
            // or a group_id for group pages. You might need more logic here
            // to differentiate if contextId could be both.
            // For a general feed, contextId might not be present or might be current_user_id.
            // For simplicity, if contextId is provided, we assume it's a user_id for now.
            // You'd extend this: if (isProfilePage) queryParams.append('user_id', contextId);
            // else if (isGroupPage) queryParams.append('group_id', contextId);
            queryParams.append('user_id', contextId); // Defaulting to user_id for now
        }


        // Add post_type filter if not 'All'
        // NOTE: Backend now infers post_type, so this filter might need to be
        // applied client-side if the backend doesn't support direct filtering by inferred type.
        // For now, we'll still pass it, assuming the backend might use it for internal logic
        // or that it will be ignored if not a DB column.
        if (postTypeFilter !== 'All') {
            queryParams.append('post_type', postTypeFilter.toLowerCase()); // Backend expects 'articles', 'images', 'videos'
        }

        const result = await fetchPostsApi(queryParams); // Call the API function

        containerElement.innerHTML = ''; // Clear loading message

        if (result.status === 'success' && result.posts && result.posts.length > 0) {
            result.posts.forEach(postData => {
                const postElement = createPostElement(postData);
                containerElement.appendChild(postElement);
            });
        } else if (result.status === 'info' && result.posts && result.posts.length === 0) {
            containerElement.innerHTML = '<div class="no-posts-message">No posts found.</div>';
        } else {
            containerElement.innerHTML = `<div class="error-message">${result.message || 'Failed to load posts.'}</div>`;
            console.error('Error fetching posts:', result.message);
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        containerElement.innerHTML = '<div class="error-message">An unexpected error occurred while loading posts.</div>';
    }
}

// Ensure listeners for the new modals are set up when the module loads
setupSinglePostModalListeners();
setupImageEnlargementListeners();
