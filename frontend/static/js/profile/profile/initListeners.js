
// initListeners.js - Sets up all listeners for the profile page

import { setupExperienceListeners } from './experienceSections.js';
import { setupSkillsInterestsListeners } from './skillsInterests.js';
import { setupTabListeners } from './tabs.js';
import { setupDetailsPopup } from './detailsPopup.js';

export function initializeAllListeners() {
    setupExperienceListeners();
    setupSkillsInterestsListeners();
    setupTabListeners();
    setupDetailsPopup();
}
