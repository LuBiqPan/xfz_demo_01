
function News(){

}

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
                    var key = (new Date()).getTime() + "." + file.name.split(".")[1];
                    var putExtra = {
                        fname: key,
                        params: {},
                        mimeType: ["image/png", "image/jpeg", "image/gif"]
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
    console.log(percent);
};

News.prototype.handleFileUploadError = function (error) {
    console.log(error);
};

News.prototype.handleFileUploadComplete = function (response) {
    console.log(response);
};

News.prototype.run = function () {
    var self = this;
    // self.listenUploadFileEvent();
    self.listenUploadQiniuFileEvent();
};

$(function () {
    var news = new News();
    news.run();
});