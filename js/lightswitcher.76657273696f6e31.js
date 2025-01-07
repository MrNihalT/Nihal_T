var currentTheme = window.localStorage.getItem("alanvarghese-theme") || "dark";

function setLightMode() {
    document.documentElement.classList.add("light-mode");
    let e = getComputedStyle(document.querySelector(":root")).getPropertyValue("--tertiary-color").trim();
    window.localStorage.setItem("alanvarghese-theme", "light");
    setParticles(e, e);
}

function setDarkMode() {
    document.documentElement.classList.remove("light-mode");
     window.localStorage.setItem("alanvarghese-theme", "dark");
     setParticles("#ffffff", "#ffffff");
}

console.log("%cHey You!", "color:red; font-size:50px;font-weight:700;");
console.log("%cYou're not really supposed to be here but since you're here anyways", "color:gray; font-size:25px");
if (currentTheme === "light") {
    setLightMode();
    console.log("%csetDarkMode()", "color:#ff3f81; font-size:20px;font-family:monospace;");
    console.log("%cto return to the shadows!", "color:gray;font-size:25px;");

} else {
    setDarkMode();
    console.log("%csetLightMode()", "color:#ff3f81; font-size:20px;font-family:monospace;");
    console.log("%cand get blessed!", "color:gray;font-size:25px;");
}