postTypeSelector = document.querySelectorAll(".post-type-button");

active = document.getElementById("All");

postTypeSelector.forEach((type) => {
    type.addEventListener("click", function(){
        type.style.border = ("solid black 2px");
        active.style.border = ("none");
        active = type;
    });
    
});

