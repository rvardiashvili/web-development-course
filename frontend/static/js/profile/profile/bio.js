// bio.js - Handles bio updates

import { showMessage } from './utils.js';

// Get references to bio related elements
const editBioForm = document.getElementById('edit-bio-form');
const bioMessageContainer = document.getElementById('bio-messages');
const bioTextarea = document.getElementById('bio');

/**
 * Sets up event listeners for bio updates.
 */
export function setupBioListeners() {
    // Event listener for bio form submission
    if (editBioForm) {
        editBioForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(editBioForm);

            try {
                const response = await fetch('/api/profile/update_bio', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                showMessage(bioMessageContainer, data.status, data.message);

                if (data.status === 'success') {
                    // Optionally update the bio in the main profile view
                    const mainBioElement = document.querySelector('.bio');
                    if (mainBioElement) {
                        const currentBioText = mainBioElement.textContent;
                        const bioPrefix = currentBioText.startsWith('bio: ') ? 'bio: ' : '';
                        mainBioElement.textContent = bioPrefix + (data.bio || ''); // Use data.bio from response
                    }
                    if (bioTextarea) bioTextarea.value = data.bio || ''; // Update textarea with response bio
                }
            } catch (error) {
                console.error('Bio update failed:', error);
                showMessage(bioMessageContainer, 'error', 'An error occurred during bio update.');
            }
        });
    }
}
