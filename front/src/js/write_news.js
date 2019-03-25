
function News(){

}

News.prototype.initUEditor = function () {
    window.ue = UE.getEditor("editor", {
        "initialFrameHeight": 400,
        "serverUrl": "/ueditor/upload/"
    });
};

News.prototype.listenUploadFileEvent = function () {
    var self = this;
    var uploadBtn = $("#thumbnail-btn");
    uploadBtn.change(function () {
        var file = uploadBtn[0].files[0];
        var formData = new FormData();
        formData.append("file", file);
        xfzajax.post({
            "url": "/cms/upload_file/",
            "data": formData,
            "processData": false,
            "contentType": false,
            "success": function (result) {
                if (result["code"] === 200) {
                    console.log(result["data"]);
                    var url = result["data"]["url"];
                    var thumbnailInput = $("#thumbnail-form");
                    thumbnailInput.val(url);
                }
            }
        });
    });
};

News.prototype.listenUploadQiniuFileEvent = function () {
    var self = this;
    var uploadBtn = $("#thumbnail-btn");
    uploadBtn.change(function () {
        var file = this.files[0];
        xfzajax.get({
            "url": "/cms/qntoken/",
            "success": function (result) {
                if (result["code"] === 200) {
                    var token = result["data"]["token"];
                    // Split file name with "." and return array length.
                    var fileLength = file.name.split(".").length;
                    // Select the last element as suffix.
                    var key = (new Date()).getTime() + "." + file.name.split(".")[fileLength-1];
                    var putExtra = {
                        fname: key,
                        params: {},
                        mimeType: ["image/png", "image/jpeg", "image/gif", "audio/mp3"]
                    };
                    var config = {
                        userCdnDomain: true,
                        retryCount: 6,
                        region: qiniu.region.z0
                    };
                    var observable = qiniu.upload(file, key, token, putExtra, config);
                    observable.subscribe({
                        "next": self.handleFileUploadProgress,
                        "error": self.handleFileUploadError,
                        "complete": self.handleFileUploadComplete
                    });
                }
            }
        });
    });
};

News.prototype.handleFileUploadProgress = function (response) {
    var total = response.total;
    var percent = total.percent;
    var percentText = percent.toFixed(0) + "%";
    // console.log(percent);
    var progressGroup = News.progressGroup;
    progressGroup.show();
    var progressBar = $(".progress-bar");
    progressBar.css({"width": percentText});
    progressBar.text(percentText);
};

News.prototype.handleFileUploadError = function (error) {
    console.log(error);
    var progressGroup = News.progressGroup;
    progressGroup.hide();
};

News.prototype.handleFileUploadComplete = function (response) {
    console.log(response);
    var progressGroup = News.progressGroup;
    progressGroup.hide();

    // Show url in input tag.
    var domain = "http://porbkvyou.bkt.clouddn.com";
    var fileName = response.key;
    var url = domain + fileName;
    var thumbnailInput = $("input[name='thumbnail']");
    thumbnailInput.val(url);

    // Upload done, reset progress bar to 0%.
    var progressBar = $(".progress-bar");
    progressBar.css({"width": "0"});
    progressBar.text("0%");
};

News.prototype.listenSubmitEvent = function () {
    var submitBtn = $("#submit-btn");
    submitBtn.click(function (event) {
        event.preventDefault();
        var btn = $(this);
        var pk = btn.attr('data-news-id');

        var title = $("input[name='title']").val();
        var category = $("select[name='category']").val();
        var desc = $("input[name='desc']").val();
        var thumbnail = $("input[name='thumbnail']").val();
        var content = window.ue.getContent();

        xfzajax.post({
            "url": "/cms/write_news/",
            "data": {
                "title": title,
                "category": category,
                "desc": desc,
                "thumbnail": thumbnail,
                "content": content,
                "pk": pk
            },
            "success": function (result) {
                if (result["code"] === 200) {
                    xfzalert.alertSuccess(
                        "发布成功",
                        function () {
                            window.location.reload();
                        }
                    );
                }
            }
        });
    });
};

News.prototype.run = function () {
    var self = this;
    self.initUEditor();
    // self.listenUploadFileEvent();
    self.listenUploadQiniuFileEvent();
    self.listenSubmitEvent();
};

$(function () {
    var news = new News();
    news.run();

    News.progressGroup = $("#progress-group");
});