"use strict"

var dynamitepond = {};

(function () {

    var htmlElements = {
        articleTitle: document.getElementById("article-title"),
        articleDate: document.getElementById("article-date"),
        articleContent: document.getElementById("article-content"),

        navLinks: document.getElementById("nav-links")
    };

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
    
    
    dynamitepond = {
        defaultArticle: "",
        articleRegistry: [],
        registerArticle: function(name, title, publishDate, keywords) {
            if (dynamitepond.articleRegistry[name]) {
                alert("'" + name + "' has already been registered!");
            }
            dynamitepond.articleRegistry[name] = {
                name,
                title,
                src: "articles/" + name + ".html",
                publishDate: publishDate.getFullYear() + " " + (publishDate.getMonth() + 1).pad(2) + " " + publishDate.getDate().pad(2),
                keywords,
            };
        },

        ignite: function (defaultArticle) {
            dynamitepond.initToggles();
            dynamitepond.customization.init();

            dynamitepond.defaultArticle = defaultArticle;
            dynamitepond.articles.init();
        },
    
        initToggles: function() {
            var toggles = document.getElementsByClassName("toggle");
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].onclick = function() {
                    // TODO: hide other toggles in the group??
                    var target = document.getElementById(this.dataset.target);
                    var turnOn = this.dataset.toggle !== "on";
                    if (turnOn) {
                        this.dataset.toggle = "on";
                        target.dataset.show = "on";
                    }
                    else {
                        this.dataset.toggle = "off";
                        target.dataset.show = "off";
                    }
                };
            }
        },

        customization: {
            init: function() {    
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
                
                // add all links, no pagination or sorting yet
                Object.keys(dynamitepond.articleRegistry).forEach(function(key, index) {
                    var article = dynamitepond.articleRegistry[key];

                    var href = "#" + article.name;
                    var anchor = document.createElement('a');
                    anchor.setAttribute("href", href);
                    anchor.innerHTML = article.title;
                    anchor.title = article.title;
                    htmlElements.navLinks.appendChild(anchor);
                });
            },
    
            loadCurrentArticle: function() {
                var articleName = getHref();
                if (articleName === "") {
                    articleName = dynamitepond.defaultArticle;
                }
    
                var article = dynamitepond.articleRegistry[articleName];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", article.src, true);
                xhr.onreadystatechange = function() {
                    if (this.readyState!==4) return;
                    if (this.status!==200) return;
                    htmlElements.articleTitle.innerHTML = article.title;
                    htmlElements.articleDate.innerHTML = article.publishDate;
                    htmlElements.articleContent.innerHTML = this.responseText;
                };
                xhr.send();
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

    Number.prototype.pad = function(len) {
        var s = String(this);
        while (s.length < len) {
            s = "0" + s;
        }
        return s;
    }

})();
