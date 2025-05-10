// tabs.js - Handles the expansion/collapse of the experience tabs

// Get references to tab elements
const expTab = document.querySelectorAll(".experience-tab");
const expTabExpanded = document.getElementsByClassName("experience-tab-expanded");
const expandButton = document.querySelector(".drop-down");

let expanded = null;
let hidden = null;
let isFullyExpanded = false;

/**
 * Sets up event listeners for the experience tabs to handle expansion/collapse.
 */
export function setupTabListeners() {
    expTab.forEach((tab) => {
        tab.addEventListener("click", function() {
            if (isFullyExpanded)
                return;
            if (expanded) {
                expanded.style.display = "none";
                if (hidden) hidden.style.display = "flex"; // Ensure hidden tab is shown
            }
            expanded = document.getElementById(tab.id + "-expanded");
            if (expanded) expanded.style.display = "flex";
            tab.style.display = "none";
            hidden = tab;
        });
    });

    if (expandButton) {
        expandButton.addEventListener("click", function() {
            for (let i = 0; i < expTab.length; i++) {
                if (!isFullyExpanded) {
                    if (expTab[i]) expTab[i].style.display = "none";
                    if (expTabExpanded[i]) expTabExpanded[i].style.display = "flex";
                    if (expandButton) expandButton.style.transform = "rotate(180deg)  scale(1.8)";
                } else if (isFullyExpanded) {
                    if (expTab[i]) expTab[i].style.display = "flex";
                    if (expTabExpanded[i]) expTabExpanded[i].style.display = "none";
                    if (expandButton) expandButton.style.transform = "rotate(0deg)  scale(1.8)";
                }
            }
            isFullyExpanded = !isFullyExpanded;
        });
    }

    // Initialize the first tab to be open on page load
    if (expTab.length > 0) {
        const firstTab = expTab[0];
         const firstExpanded = document.getElementById(firstTab.id + "-expanded");
         if (firstExpanded) {
             firstExpanded.style.display = "flex";
             firstTab.style.display = "none";
             expanded = firstExpanded;
             hidden = firstTab;
         }
    }
}
