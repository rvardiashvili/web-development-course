
export function initPostTypeButtons() {
    const postTypeSelector = document.querySelectorAll(".post-type-button");
    let active = document.getElementById("All");

    postTypeSelector.forEach((type) => {
        type.addEventListener("click", function () {
            if (active) active.style.border = "none";
            type.style.border = "solid black 2px";
            active = type;
        });
    });
}

initPostTypeButtons();