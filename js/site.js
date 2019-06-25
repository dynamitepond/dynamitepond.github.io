(function () {
    // load the users preferred theme
    let preferredTheme = loadUserPreferredTheme();


    var themeLinks = document.getElementsByClassName("set-theme");
    for (var i = 0; i < themeLinks.length; i++) {
        themeLinks[i].onclick = function() {
            setTheme(this.dataset.theme);
        };

        if (preferredTheme === themeLinks[i].dataset.theme) {
            setTheme(themeLinks[i].dataset.theme);
        }
    }
})();

function setTheme(theme) {
    var body = document.getElementsByTagName("body")[0];
    body.dataset.theme = theme;
    saveUserPreferredTheme(theme);
}

function saveUserPreferredTheme(theme) {
    localStorage.setItem("theme", theme);
}

function loadUserPreferredTheme() {
    return localStorage.getItem("theme");
}
