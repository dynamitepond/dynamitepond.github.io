(function () {
    enableThemes();
    enableArticles();
})();

function enableArticles() {
    updateVisibleArticle();
    window.onhashchange = function() {
        updateVisibleArticle();
    };

    var allArticles = document.getElementsByClassName("article");
    var target = document.getElementById("nav-links");
    // add bunch of links
    for (var i=0; i< allArticles.length; i++) {
        var articleName = allArticles[i].dataset.name;

        if (articleName !== "") {
            var href = "#" + articleName;
            var articleTitle = allArticles[i].dataset.title;
            var anchor = document.createElement('a');
            anchor.setAttribute("href", href);
            anchor.innerHTML = articleTitle;
            target.appendChild(anchor);
        }
    }
}

function updateVisibleArticle() {
    // check the current url, to see if an article needs to be displayed
    var url = window.location.href;
    var articleName = "";
    var index = url.indexOf("#");
    if (index >= 0) {
        articleName = url.substring(index+1)
    }

    var selected = document.querySelectorAll('.article[data-name="' + articleName + '"]');
    if (selected.length > 0) {
        var visibleArticles = document.getElementsByClassName("visible-article");
        for(var i=0; i< visibleArticles.length; i++) {
            visibleArticles[i].classList.remove("visible-article");
        }
        
        var src = selected[0].dataset.source;
        if (!selected[0].innerHTML && src) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", src, true);
            xhr.onreadystatechange = function() {
                if (this.readyState!==4) return;
                if (this.status!==200) return;
                selected[0].innerHTML = this.responseText;
                selected[0].classList.add("visible-article");
            };
            xhr.send();
        }
        else {
            selected[0].classList.add("visible-article");
        }
    }
}

function enableThemes() {
    // load the users preferred theme
    var preferredTheme = loadUserPreferredTheme();

    var themeLinks = document.getElementsByClassName("set-theme");
    for (var i = 0; i < themeLinks.length; i++) {
        themeLinks[i].onclick = function() {
            setTheme(this.dataset.theme);
        };

        if (preferredTheme === themeLinks[i].dataset.theme) {
            setTheme(themeLinks[i].dataset.theme);
        }
    }
}

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
