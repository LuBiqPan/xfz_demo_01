
function Banners() {

}

Banners.prototype.loadData = function () {
    var self = this;

    xfzajax.get({
        "url": "/cms/banner_list/",
        "success": function (result) {
            if (result["code"] === 200) {
                var banners = result["data"];
                for (var i=0; i<banners.length; i++) {
                    var banner = banners[i];
                    self.createBannerItem(banner);
                }
            }
        }
    });
};

Banners.prototype.listenAddBannerEvent = function () {
    var self = this;
    var addBtn = $("#add-banner-btn");
    addBtn.click(function () {
        self.createBannerItem();
    });
};

Banners.prototype.createBannerItem = function (banner) {
    var self = this;
    var tpl = template("banner-item", {"banner": banner});
    var bannerListGroup = $(".banner-list-group");
    var bannerItem = null;

    if (banner) {
        bannerListGroup.append(tpl);
        bannerItem = bannerListGroup.find(".banner-item:last");
    } else {
        bannerListGroup.prepend(tpl);
        bannerItem = bannerListGroup.find(".banner-item:first");
    }
    self.addImageSelectEvent(bannerItem);
    self.addRemoveBannerEvent(bannerItem);
    self.addSaveBannerEvent(bannerItem);
};

Banners.prototype.addImageSelectEvent = function (bannerItem) {
    var image = bannerItem.find(".thumbnail");
    var imageInput = bannerItem.find(".image-input");
    image.click(function () {
        imageInput.click();
    });

    imageInput.change(function () {
        var file = this.files[0];
        var formData = new FormData();
        formData.append("file", file);

        xfzajax.post({
            "url": "/cms/upload_file/",
            "data": formData,
            "processData": false,
            "contentType": false,
            "success": function (result) {
                if (result["code"] === 200) {
                    console.log(result);
                    var url = result["data"]["url"];
                    image.attr("src", url);
                }
            }
        });
    });
};

Banners.prototype.addRemoveBannerEvent = function (bannerItem) {
    var closeBtn = bannerItem.find(".close-btn");
    closeBtn.click(function () {
        bannerItem.remove();
    });
};

Banners.prototype.addSaveBannerEvent = function (bannerItem) {
    var imageTag = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    var linkToTag = bannerItem.find("input[name='link_to']");
    var saveBtn = bannerItem.find(".save-btn");
    var prioritySpan = bannerItem.find("span[class='priority']");

    saveBtn.click(function () {
        var image_url = imageTag.attr("src");
        var priority = priorityTag.val();
        var link_to = linkToTag.val();

        xfzajax.post({
            "url": "/cms/add_banners/",
            "data": {
                "image_url": image_url,
                "priority": priority,
                "link_to": link_to
            },
            "success": function (result) {
                if (result["code"] === 200) {
                    var bannerId = result["data"]["banner_id"];
                    prioritySpan.text("优先级："+bannerId);
                    window.messageBox.showSuccess("轮播图添加成功");
                } else {
                    window.messageBox.showError("轮播图添加失败");
                }
            }
        });
    });
};

Banners.prototype.run = function () {
    var self = this;
    self.listenAddBannerEvent();
    self.loadData();
};

$(function () {
    var banners = new Banners();
    banners.run();
});