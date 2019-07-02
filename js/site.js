"use strict"

var dynamitepond = {};

(function () {

    var htmlElements = {
        body: document.getElementsByTagName("body")[0],
        articleTitle: document.getElementById("article-title"),
        articleDate: document.getElementById("article-date"),
        articleContent: document.getElementById("article-content"),

        navLinks: document.getElementById("nav-links"),
        navQuery: document.getElementById("nav-query"),
        navPagination: document.getElementById("nav-pagination"),

        navOrderAlpha: document.getElementById("order-alpha"),
        navOrderDate: document.getElementById("order-date"),
        navOrderAsc: document.getElementById("order-asc"),
        navOrderDesc: document.getElementById("order-desc"),
        navClear: document.getElementById("nav-clear"),
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
            console.log(name + " " + name.replace(/_/g, ""));
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
                    window.scrollTo(0,document.body.scrollHeight);
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
            pageSize: 13,

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

                htmlElements.body.addEventListener("click", function(ev) {
                    if (ev.target.className === "nav-page-link") {
                        dynamitepond.nav.page = ev.target.dataset.page - 1;
                        dynamitepond.nav.renderPage();
                    }
                });


                htmlElements.navOrderAlpha.onclick = function() {
                    dynamitepond.nav.orderby = 1;
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };
                htmlElements.navOrderDate.onclick = function() {
                    dynamitepond.nav.orderby = 0;
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };
                htmlElements.navOrderAsc.onclick = function() {
                    dynamitepond.nav.orderdesc = false;
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };
                htmlElements.navOrderDesc.onclick = function() {
                    dynamitepond.nav.orderdesc = true;
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };
                htmlElements.navClear.onclick = function() {
                    htmlElements.navQuery.value = "";
                    dynamitepond.nav.page = 0;
                    dynamitepond.nav.renderPage();
                };

                dynamitepond.nav.renderPage();
            },

            updateNavOptionDisplay: function() {
                if (dynamitepond.nav.orderby === 1) {
                    htmlElements.navOrderAlpha.dataset.current = "true";
                    htmlElements.navOrderDate.dataset.current = "false";
                }
                else {
                    htmlElements.navOrderAlpha.dataset.current = "false";
                    htmlElements.navOrderDate.dataset.current = "true";
                }

                if (dynamitepond.nav.orderdesc) {
                    htmlElements.navOrderDesc.dataset.current = "true";
                    htmlElements.navOrderAsc.dataset.current = "false";
                }
                else {
                    htmlElements.navOrderDesc.dataset.current = "false";
                    htmlElements.navOrderAsc.dataset.current = "true";
                }
            },

            renderPage: function() {
                dynamitepond.nav.updateNavOptionDisplay();

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

                if (filtered.length === 0) {
                    var noDynamite = document.createElement('span');
                    noDynamite.innerHTML = "no dynamite";
                    noDynamite.className = "nav-no-dynamite";
                    htmlElements.navLinks.appendChild(noDynamite);
                }

                var numberPages = Math.ceil(filtered.length / dynamitepond.nav.pageSize);
                dynamitepond.nav.renderPagination(dynamitepond.nav.page + 1, numberPages);
            },

            renderPagination: function(page, numberPages) {
                htmlElements.navPagination.innerHTML = "";
                if (numberPages > 0)
                {
                    var remainingLinks = 4;
                    var startLimit = page;
                    var endLimit = page;

                    while (remainingLinks > 0) {
                        if (startLimit > 1) {
                            startLimit--;
                            remainingLinks--;
                        }
                        if (endLimit < numberPages) {
                            endLimit++;
                            remainingLinks--;
                        }
                        if (startLimit <= 1 && endLimit >= numberPages) {
                            remainingLinks = 0;
                        }
                    }

                    if (startLimit !== 1) {
                        // add links to go to first page
                        htmlElements.navPagination.appendChild(makePageLink(1, "<<"));
                    }

                    for (var i = startLimit; i <= endLimit; i++) {
                        htmlElements.navPagination.appendChild(makePageLink(i, i, i === page));
                    }

                    if (endLimit !== numberPages) {
                        htmlElements.navPagination.appendChild(makePageLink(numberPages, ">>"));
                    }
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
                console.log(dynamitepond.nav.orderby + " " + dynamitepond.nav.orderdesc);
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

    function makePageLink(page, innerHtml, currentPage) {
        innerHtml = innerHtml || page;

        var anchor = document.createElement('a');
        anchor.setAttribute("href", "javascript:void(0)");
        anchor.className = "nav-page-link";
        anchor.innerHTML = innerHtml;
        anchor.title = "Go to page " + page;
        anchor.dataset.page = page;

        if (currentPage) {
            anchor.dataset.current = "true";
        }

        return anchor;
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
