var dynamiteRepository = {
    availble: localStorageTest(),
    theme: function(themeName) {
        if (this.availble) {
            if (themeName) {
                localStorage.setItem("theme", themeName);
            }
            return localStorage.getItem("theme");
        }
        return "";
    }
};


var dynamitepond = {
    ignite: function () {
        dynamitepond.customization.init();
        dynamitepond.articles.init();
    },

    customization: {
        init: function() {
            // init show/hide of settings
            var toggle = document.getElementById("toggle-settings");
            var settings = document.getElementById("settings");
            toggle.onclick = function () {
                var turnOn = this.dataset.toggle !== "on";
                if (turnOn) {
                    this.dataset.toggle = "on";
                    settings.dataset.show = "on";
                }
                else {
                    this.dataset.toggle = "off";
                    settings.dataset.show = "off";
                }
            };

            // init changing themes
            var preferredTheme = dynamiteRepository.theme();
            var themeLinks = document.getElementsByClassName("set-theme");
            for (var i = 0; i < themeLinks.length; i++) {
                themeLinks[i].onclick = function() {
                    dynamitepond.customization.changeTheme(this.dataset.theme);
                };

                if (preferredTheme === themeLinks[i].dataset.theme) {
                    dynamitepond.customization.changeTheme(themeLinks[i].dataset.theme);
                }
            }
        },
        changeTheme: function(themeName) {
            var body = document.getElementsByTagName("body")[0];
            body.dataset.theme = themeName;
            dynamiteRepository.theme(themeName);
        }
    },

    articles: {
        init: function() {
            dynamitepond.articles.loadCurrentArticle();
            window.onhashchange = function() {
                dynamitepond.articles.loadCurrentArticle();
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
        },

        loadCurrentArticle: function() {
            var articleName = getHref();

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
    },
};

function getHref() {
    var url = window.location.href;

    var href = "";
    var index = url.indexOf("#");
    if (index >= 0) {
        href = url.substring(index+1)
    }
    return href;
}

function localStorageTest() {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

(function () {
    dynamitepond.ignite();
})();
