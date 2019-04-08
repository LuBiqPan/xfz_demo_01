
function NewsList() {}

NewsList.prototype.listenSubmitEvent = function () {
    var submitBtn = $(".submit-btn");
    var textarea = $("textarea[name='comment']");
    submitBtn.click(function () {
        var content = textarea.val();
        var news_id = submitBtn.attr("data-news-id");

        xfzajax.post({
            "url": "/news/public_comment/",
            "data": {
                "news_id": news_id,
                "content": content
            },
            "success": function (result) {
                if (result["code"] === 200) {
                    var comment = result["data"];
                    var tpl = template("comment-item", {"comment": comment});
                    var commentListGroup = $(".comment-list");
                    commentListGroup.prepend(tpl);
                    window.messageBox.showSuccess("评论发表成功");
                    textarea.val("");
                } else {
                    window.messageBox.showError(result["message"]);
                }
            }
        });
    });
};

NewsList.prototype.run = function () {
    var self = this;
    self.listenSubmitEvent();
};

/*************************************** CMSNewsList ***************************************/
function CMSNewsList () {}

CMSNewsList.prototype.initDatePicker = function () {
    var startPicker = $("#start-picker");
    var endPicker = $("#end-picker");

    var todayDate = new Date();
    var todayStr = todayDate.getFullYear() + '/' + (todayDate.getMonth()+1) + '/' + todayDate.getDate();
    var options = {
        'showButtonPanel': true,
        'format': 'yyyy/mm/dd',
        'startDate': '2017/6/1',
        'endDate': todayStr,
        'language': 'zh-CN',
        'todayBtn': 'linked',
        'todayHighlight': true,
        'clearBtn': true,
        'autoclose': true
    };

    startPicker.datepicker(options);
    endPicker.datepicker(options);
};

CMSNewsList.prototype.listenDeleteEvent = function () {
    var deleteBtns = $(".delete-btn");
    deleteBtns.click(function () {
        var btn = $(this);
        var news_id = btn.attr("data-news-id");

        xfzalert.alertConfirm({
            "text": "确定要删除这篇新闻吗？",
            "confirmCallback": function () {
                xfzajax.post({
                    "url": "/cms/delete_news/",
                    "data": {
                        "news_id": news_id
                    },
                    "success": function (result) {
                        if (result["code"] === 200) {
                            window.location = window.location.href;
                        }
                    }
                });
            }
        });


    });
};

CMSNewsList.prototype.run = function () {
    var self = this;
    self.initDatePicker();
    self.listenDeleteEvent();
};

$(function () {
    var newsList = new NewsList();
    var cmsNewsList = new CMSNewsList();

    newsList.run();
    cmsNewsList.run();
});


