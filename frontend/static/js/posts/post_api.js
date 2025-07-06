// post_api.js - Centralized API calls for posts

/**
 * Makes an API call to create a new post.
 * @param {FormData} formData - FormData object containing post data (content, media, etc.).
 * @returns {Promise<object>} - A promise that resolves to the JSON result from the API.
 */
export async function createPostApi(formData) {
    const response = await fetch('/post/', {
        method: 'POST',
        body: formData, // FormData handles Content-Type automatically
    });
    return response.json();
}

/**
 * Makes an API call to fetch a list of posts.
 * @param {URLSearchParams} queryParams - URLSearchParams object containing filters and sort order.
 * @returns {Promise<object>} - A promise that resolves to the JSON result from the API.
 */
export async function fetchPostsApi(queryParams) {
    const response = await fetch(`/post/?${queryParams.toString()}`);
    return response.json();
}

/**
 * Makes an API call to like a post.
 * @param {number} postId - The ID of the post to like.
 * @param {string} [emoteType='like'] - The type of emote (e.g., 'like', 'heart').
 * @returns {Promise<object>} - A promise that resolves to the JSON result from the API.
 */
export async function likePostApi(postId, emoteType = 'like') {
    const response = await fetch(`/post/${postId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emote_type: emoteType }),
    });
    return response.json();
}

/**
 * Makes an API call to unlike a post.
 * @param {number} postId - The ID of the post to unlike.
 * @returns {Promise<object>} - A promise that resolves to the JSON result from the API.
 */
export async function unlikePostApi(postId) {
    const response = await fetch(`/post/${postId}/unlike`, {
        method: 'POST', // Using POST for unliking as it's a state change
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
}

/**
 * Makes an API call to get the like status of a post.
 * @param {number} postId - The ID of the post.
 * @returns {Promise<object>} - A promise that resolves to the JSON result from the API.
 */
export async function getLikeStatusApi(postId) {
    const response = await fetch(`/post/${postId}/like_status`);
    return response.json();
}
