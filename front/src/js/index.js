
/* When I wrote this Banner() algorithm, only God knew what it mean.
 * Now, God doesn't know either. */
function Banner() {
    this.index = 1;
    this.bannerWidth = 798;

    this.bannerGroup = $("#banner-group");
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    this.bannerUl = $(".banner-ul");
    this.pageControl = $(".page-control");
    this.liList = this.bannerUl.children("li");
    this.bannerCount = this.liList.length;

}

Banner.prototype.initBanner = function () {
    var self = this;
    // Select first li element and clone one.
    var firstBanner = self.liList.eq(0).clone();
    // Select last li element and clone one.
    var lastBanner = self.liList.eq(self.bannerCount-1).clone();
    // Add first banner to the end.
    self.bannerUl.append(firstBanner);
    // Add last banner to the beginning.
    self.bannerUl.prepend(lastBanner);
    // Extend banner width.
    self.bannerUl.css({"width": self.bannerWidth*(self.bannerCount+2), "left": -self.bannerWidth});
};

Banner.prototype.initPageControl = function () {
    var self = this;
    for (var i=0; i<self.bannerCount; i++) {
        // Add li element.
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        if (i === 0) {
            circle.addClass("active");
        }
    self.pageControl.css({"width": self.bannerCount*(12+16)});
    }
};

Banner.prototype.toggleArrow = function (isShow) {
    var self = this;
    if (isShow) {
        self.leftArrow.show();
        self.rightArrow.show();
    } else {
        self.leftArrow.hide();
        self.rightArrow.hide();
    }
};

Banner.prototype.animate = function () {
    var self = this;
    self.bannerUl.stop().animate({"left": -798*self.index}, 1000);
    var index = self.index;
    if (index === 0) {
        index = self.bannerCount - 1;
    } else if (index === self.bannerCount+1) {
        index = 0;
    } else {
        index = index - 1;
    }
    /* Add class "active" to clicked circle
    *  and remove "active" from all brother circles. */
    self.pageControl.children("li").eq(index).addClass("active").siblings().removeClass("active");
};

Banner.prototype.loop = function () {
    var self = this;
    this.timer = setInterval(function () {
        if (self.index >= self.bannerCount+1){
            self.bannerUl.css({"left": -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 5000);
};

Banner.prototype.listenArrowClick = function () {
    var self = this;

    self.leftArrow.click(function () {
        if (self.index === 0) {
            self.bannerUl.css({'left': -self.bannerCount*self.bannerWidth});
            self.index = self.bannerCount - 1;
        } else {
            self.index--;
        }
        self.animate();
    });

    self.rightArrow.click(function () {
        if (self.index === self.bannerCount+1) {
            self.bannerUl.css({"left": -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    });
};

Banner.prototype.listenBannerHover = function () {
    var self = this;
    this.bannerGroup.hover(function () {
        /* Functions that would be executed
        *  when mouse is hovered. */
        clearInterval(self.timer);
        self.toggleArrow(true);
    }, function () {
        /* Functions that would be executed
         * when mouse is dragged away. */
        self.loop();
        self.toggleArrow(false);
    })
};

Banner.prototype.listenPageControl = function () {
    var self = this;
    self.pageControl.children("li").each(function (index, obj) {
        // console.log(index);
        // console.log(obj);
        // console.log("============");
        $(obj).click(function () {
            self.index = index+1;
            self.animate();
        });
    });
};

Banner.prototype.run = function () {
    this.initBanner();
    this.initPageControl();
    this.loop();
    this.listenBannerHover();
    this.listenArrowClick();
    this.listenPageControl();
};


function Index () {
    var self = this;
    self.page = 2;
    self.category_id = 0;
    self.loadMoreBtn = $("#load-more-btn");
}

Index.prototype.listenLoadMoreEvent = function () {
    var self = this;
    self.loadMoreBtn.click(function () {
        xfzajax.get({
            "url": "/news/list/",
            "data": {
                "p": self.page,
                "category_id": self.category_id
            },
            "success": function (result) {
                if (result["code"] === 200) {
                    // console.log(result);
                    var newses = result["data"];
                    if (newses.length > 0) {
                        var tpl = template("news-item", {"newses": newses});
                        var ul = $(".list-inner-group");
                        ul.append(tpl);
                        self.page += 1;
                    } else {
                        self.loadMoreBtn.hide();
                    }
                }
            }
        });
    });
};

Index.prototype.listenCategorySwitchEvent = function () {
    var self = this;
    var tabGroup = $(".list-tab");
    tabGroup.children().click(function () {
        // this: currently selected tag
        var li = $(this);
        var category_id = li.attr("data-category");
        var page = 1;

        xfzajax.get({
            "url": "/news/list/",
            "data": {
                "category_id": category_id,
                "p": page
            },
            "success": function (result) {
                if (result["code"] === 200) {
                    var newses = result["data"];
                    var tpl = template("news-item", {"newses": newses});
                    var newsListGroup = $(".list-inner-group");
                    // Clear all content first.
                    newsListGroup.empty();
                    // Append news by category.
                    newsListGroup.append(tpl);
                    self.page = 2;
                    self.category_id = category_id;
                    // Add class "active" to current tag and remove "active" from others.
                    li.addClass("active").siblings().removeClass("active");
                    self.loadMoreBtn.show();
                }
            }
        });
    });
};

Index.prototype.run = function () {
    var self = this;
    self.listenLoadMoreEvent();
    self.listenCategorySwitchEvent();
};


$(function () {
    var banner = new Banner();
    var index = new Index();
    banner.run();
    index.run();
});