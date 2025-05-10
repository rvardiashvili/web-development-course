
// dataLoader.js - Handles loading of initial data

import { fetchAndRenderMainPageData } from './mainPageDisplay.js';

export async function loadInitialProfileData() {
    return await fetchAndRenderMainPageData();
}
