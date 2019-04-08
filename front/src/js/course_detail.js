
function CourseDetail () {}

CourseDetail.prototype.initPlayer = function () {
    var videoInfo = $("#video-info");
    var video_url = videoInfo.attr("data-video-url");
    var cover_url = videoInfo.attr("data-cover-url");
    var course_id = videoInfo.attr("data-course-id");

    var player = cyberplayer("playercontainer").setup({
        width: '100%',
        height: '100%',
        file: video_url,
        image: cover_url,
        autostart: false,
        stretching: "uniform",
        repeat: false,
        volume: 100,
        controls: true,
        tokenEncrypt: true,
        // AccessKey
        ak: '938c922cb55d4218b2a20d358419e1ea'
    });

    player.on('beforePlay',function (e) {
        if(!/m3u8/.test(e.file)){
            return;
        }
        xfzajax.get({
            'url': '/course/course_token/',
            'data': {
                'video': video_url,
                'course_id': course_id
            },
            'success': function (result) {
                if(result['code'] === 200){
                    var token = result['data']['token'];
                    player.setToken(e.file,token);
                }else{
                    window.messageBox.showInfo(result['message']);
                    player.stop();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};

CourseDetail.prototype.run = function () {
    var self = this;
    self.initPlayer();
};

$(function () {
    var courseDetail = new CourseDetail();
    courseDetail.run();
});
