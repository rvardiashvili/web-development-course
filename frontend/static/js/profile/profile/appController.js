
// appController.js - Coordinates the profile application logic

import { loadInitialProfileData } from './dataLoader.js';
import { initializeAllListeners } from './initListeners.js';
import { clearMessageContainers, hideAllAddEditForms } from './utils.js';

export async function runProfileApp() {
    clearMessageContainers();
    hideAllAddEditForms();

    const profileData = await loadInitialProfileData();

    if (profileData?.showDetailsPopup && profileData?.uuid) {
        const { fetchAndRenderExperienceForModal } = await import('./experienceSections.js');
        fetchAndRenderExperienceForModal(profileData.uuid);
    }

    initializeAllListeners();
}
