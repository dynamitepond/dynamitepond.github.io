"use strict"

var dynamitepond = {};

(function () {

    var htmlElements = {
        body: document.getElementsByTagName("body")[0],
        articleTitle: document.getElementById("article-title"),
        articleDate: document.getElementById("article-date"),
        articleContent: document.getElementById("article-content"),

        navLinks: document.getElementById("nav-links"),
        navQuery: document.getElementById("nav-query")
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
        articleRegistry: [], // for looking up by name
        articleList: [], // for sorting/pagination

        registerArticle: function(name, title, publishDate, keywords) {
            if (dynamitepond.articleRegistry[name]) {
                alert("'" + name + "' has already been registered!");
            }
            var article = {
                name,
                title,
                src: "articles/" + name + ".html",
                publishDate: publishDate,
                keywords,
            };
            dynamitepond.articleRegistry[name] = article;
            dynamitepond.articleList.push(article);
        },

        ignite: function (defaultArticle) {
            dynamitepond.initToggles();
            dynamitepond.customization.init();

            dynamitepond.defaultArticle = defaultArticle;
            dynamitepond.nav.init();
        },
    
        initToggles: function() {
            var toggles = document.getElementsByClassName("toggle");
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].onclick = function() {
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
                htmlElements.body.dataset.theme = themeName;
                dynamiteRepository.theme(themeName);
            }
        },
    
        nav: {
            page: 0,
            pageSize: 20,

            orderby: 0, // 0: date, 1: alpha
            orderdesc: true,

            init: function() {
                dynamitepond.nav.loadCurrentArticle();
                window.onhashchange = function() {
                    dynamitepond.nav.loadCurrentArticle();
                };
                
                htmlElements.navQuery.onchange = function () {
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };

                dynamitepond.nav.renderPage();
            },

            renderPage: function() {
                htmlElements.navLinks.innerHTML = "";

                var filtered = dynamitepond.nav.filterArticles();

                var start = dynamitepond.nav.page * dynamitepond.nav.pageSize;
                var end = Math.min(start + dynamitepond.nav.pageSize, filtered.length);

                for(var i = start; i < end; i++) {
                    var article = filtered[i];

                    var href = "#" + article.name;
                    var anchor = document.createElement('a');
                    anchor.setAttribute("href", href);
                    anchor.className = "article-link";
                    anchor.innerHTML = "<div>" + article.title + "</div><div class='pub-date'>" + article.publishDate.toDynamite() + "</div>";
                    anchor.title = article.title;
                    htmlElements.navLinks.appendChild(anchor);
                }
            },
            
            filterArticles: function() {
                var filtered = dynamitepond.articleList;
                var query = (htmlElements.navQuery.value || "").toUpperCase();
                
                if (query) {
                    filtered = filtered.filter(function (el) {
                        return el.title.toUpperCase().indexOf(query) !== -1;
                    });
                }

                filtered.dynamiteSort(dynamitepond.nav.orderby, dynamitepond.nav.orderdesc);

                return filtered;
            },

            loadCurrentArticle: function() {
                /* TODO: consider storing articles in local storage
                maybe expire them after a half hour or so (or if they have lots of articles stored)
                add an option to purge storage in settings? */

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
                    htmlElements.articleDate.innerHTML = article.publishDate.toDynamite();
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
    };

    Date.prototype.toDynamite = function() {
        return this.getFullYear() + " " + (this.getMonth() + 1).pad(2) + " " + this.getDate().pad(2);
    };

    Array.prototype.dynamiteSort = function(orderby, orderdesc) {
        if (orderby === 1) {
            this.dynamiteAlphaSort(orderdesc);
        }
        else {
            this.dynamiteDateSort(orderdesc);
        }
    };

    Array.prototype.dynamiteDateSort = function(descending) {
        descending || true;
        this.sort(function(a, b) {
            if (a.publishDate < b.publishDate) {
                return descending ? 1 : -1;
            }
            if (a.publishDate > b.publishDate) {
                return descending ? -1 : 1;
            }
            return 0;
        });
        return this;
    };

    Array.prototype.dynamiteAlphaSort = function(descending) {
        descending || true;
        this.sort(function(a, b) {
            if (a.title < b.title) {
                return descending ? 1 : -1;
            }
            if (a.title > b.title) {
                return descending ? -1 : 1;
            }
            return 0;
        });
        return this;
    }

})();
