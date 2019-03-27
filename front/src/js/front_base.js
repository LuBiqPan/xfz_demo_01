
function FrontBase() {
    
}

FrontBase.prototype.run = function () {
    var self = this;

    self.listenAuthBoxHover();
};

FrontBase.prototype.listenAuthBoxHover = function () {
    var authBox = $(".auth-box");
    var userMoreBox = $(".user-more-box");

    authBox.hover(function () {
        userMoreBox.show();
    }, function () {
        userMoreBox.hide();
    });
};





// Open / close login page.
// $(function () {
//     // Click on login button.
//     $("#btn").click(function () {
//         $(".mask-wrapper").show();
//     });
//
//     // Click on close button.
//     $(".close-btn").click(function () {
//         $(".mask-wrapper").hide();
//     });
// });


// Login / register switch.
// $(function () {
//     $(".switch").click(function () {
//         var scrollWrapper = $(".scroll-wrapper");
//         var currentLeft = scrollWrapper.css("left");
//         // "left: 10px" -> "10".
//         currentLeft = parseInt(currentLeft);
//
//         if (currentLeft < 0) {
//             scrollWrapper.animate({"left": "0"})
//         } else {
//             scrollWrapper.animate({"left": "-400px"})
//         }
//     });
// });



//csrf设置
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var myajax = {
    'get': function (args) {
        args['method'] = 'get';
        this.ajax(args);
    },
    'post': function (args) {
        args['method'] = 'post';
        this._ajaxSetup();
        this.ajax(args);
    },
    'ajax': function (args) {
        $.ajax(args);
    },
    '_ajaxSetup': function () {
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            }
        });
    }
};

// Construction function.
function Auth() {
    var self = this;

    self.maskWrapper = $(".mask-wrapper");
    self.scrollWrapper = $(".scroll-wrapper");
    self.smsCaptcha = $(".sms-captcha-btn");
}

Auth.prototype.run = function () {
    var self = this;

    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
    self.listenSignupEvent();
    self.listenImgCaptchaEvent();
    self.listenSmsCaptchaEvent();
};

Auth.prototype.showEvent = function () {
    var self = this;
    // Show singin/signup window.
    self.maskWrapper.show();
};

Auth.prototype.hideEvent = function () {
    var self = this;
    // Hide signin/signup window.
    self.maskWrapper.hide();
};

Auth.prototype.listenShowHideEvent = function () {
    var self = this;
    var signinBtn = $(".signin-btn");
    var signupBtn = $(".signup-btn");
    var closeBtn = $(".close-btn");

    // Click signin button to open signin window.
    signinBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left": 0});
    });

    // Click signup button to open signup window.
    signupBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left": -400});
    });

    // Click close button to close signin/signup window.
    closeBtn.click(function () {
        self.hideEvent();
    });
};

// Signin/signup window switch.
Auth.prototype.listenSwitchEvent = function() {
    var self = this;
    var switcher = $(".switch");

    switcher.click(function () {
        var currentLeft = self.scrollWrapper.css("left");
        // "left: 10px" -> "10".
        currentLeft = parseInt(currentLeft);

        if (currentLeft < 0) {
            self.scrollWrapper.animate({"left": "0"})
        } else {
            self.scrollWrapper.animate({"left": "-400px"})
        }
    });
};

Auth.prototype.listenSigninEvent = function () {
    var self = this;
    var signinGroup = $(".signin-group");
    var telephoneInput = signinGroup.find("input[name='telephone']");
    var passwordInput = signinGroup.find("input[name='password']");
    var rememberInput = signinGroup.find("input[name='remember']");

    var submitBtn = signinGroup.find(".submit-btn");
    submitBtn.click(function (event) {
        event.preventDefault();
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
        var remember = rememberInput.prop("checked");

        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember?1:0,
                'csrfmiddlewaretoken': $('#csrf_token').val()
            },
            'success': function (result) {
                window.location.reload();
            }
        });
    });
};

Auth.prototype.listenSignupEvent = function () {
    var signupGroup = $(".signup-group");
    var submitBtn = signupGroup.find(".submit-btn");
    submitBtn.click(function (event) {
        event.preventDefault();
        var telephoneInput = signupGroup.find("input[name='telephone']");
        var usernameInput = signupGroup.find("input[name='username']");
        var imgCaptchaInput = signupGroup.find("input[name='img_captcha']");
        var password1Input = signupGroup.find("input[name='password1']");
        var password2Input = signupGroup.find("input[name='password2']");
        var smsCaptchaInput = signupGroup.find("input[name='sms_captcha']");

        var telephone = telephoneInput.val();
        var username = usernameInput.val();
        var imgCaptcha = imgCaptchaInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var smsCaptcha = smsCaptchaInput.val();

        xfzajax.post({
            "url": "/account/register/",
            "data": {
                "telephone": telephone,
                "username": username,
                "img_captcha": imgCaptcha,
                "password1": password1,
                "password2": password2,
                "sms_captcha": smsCaptcha
            },
            "success": function (result) {
                if (result.code === 200) {
                    window.location.reload();
                }
            },
            "fail": function (error) {
                window.messageBox.showError("Server internal error.")
            }
        })
    })
};

Auth.prototype.listenImgCaptchaEvent = function () {
    var imgCaptcha = $('.img-captcha');
    imgCaptcha.click(function () {
        imgCaptcha.attr("src", "/account/img_captcha/"+"?random="+Math.random());
    });
};

Auth.prototype.smsSuccessEvent = function () {
    var self = this;
    messageBox.showSuccess('短信验证码发送成功');
    self.smsCaptcha.addClass('disabled');    // 将发送验证码按钮变成灰色
    var count = 30;     // 60秒倒计时
    self.smsCaptcha.unbind('click');     // 取消按钮点击
    var timer = setInterval(function () {
        self.smsCaptcha.text(count + "s");     // 显示倒计时
        count--;    // 倒计时自减1
        if (count <= 0) {
            clearInterval(timer);   //倒计时60秒结束，停止倒计时
            self.smsCaptcha.removeClass('disabled');     // 将发送按钮变回正常显示
            self.smsCaptcha.text('发送验证码');   // 按钮文字变回正常显示
            self.listenSmsCaptchaEvent();   // 重新执行函数
        }
    }, 1000);   // 倒计时间隔1000毫秒
};

Auth.prototype.listenSmsCaptchaEvent = function () {
    var self = this;
    var smsCaptcha = $(".sms-captcha-btn");
    var telephoneInput = $(".signup-group input[name='telephone']");
    smsCaptcha.click(function () {
        var telephone = telephoneInput.val();
        if (!telephone) {
            messageBox.showInfo('Please type a telephone number.');
        }
        xfzajax.get({
            'url': '/account/sms_captcha/',
            'data': {
                'telephone' : telephone
            },
            'success': function (result) {
                if (result['code'] == 200) {
                    self.smsSuccessEvent();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        })
    });
};

$(function () {
   var auth = new Auth();
   auth.run();
});


$(function () {
    var frontBase = new FrontBase();
    frontBase.run();
});


$(function () {
   if (template) {
        template.defaults.imports.timeSince = function (dateValue) {
            var date = new Date(dateValue);
            var datets = date.getTime();    // Time in millisecond.
            var nowts = (new Date()).getTime();
            var timeStamp = (nowts - datets) / 1000; // In second.

            if (timeStamp < 60) {
                return '刚刚';
            } else if (timeStamp >= 60 && timeStamp < 60*60) {
                var minutes = parseInt(timeStamp/60);
                return  minutes + '分钟前';
            } else if (timeStamp >= 60*60 && timeStamp < 60*60*24) {
                var hours = parseInt(timeStamp/60/60);
                return hours + '小时前';
            } else if ( timeStamp >= 60*60*24 && timeStamp < 60*60*24*30) {
                var days = parseInt(timeStamp/60/60/24);
                return days + '天前';
            } else {
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDay();
                var hour = date.getHours();
                var minute = date.getMinutes();
                return year + "/" + month + "/" + day + " " + hour + ": " + minute;
            }
        }
   }
});

// var submitBtn = signinGroup.find(".submit-btn");
// submitBtn.click(function (event) {
//     event.preventDefault();
//     var telephone = telephoneInput.val();
//     var password = passwordInput.val();
//     var remember = rememberInput.prop("checked");
//
//     myajax.post({
//         'url': '/account/login/',
//         'data': {
//             'telephone': telephone,
//             'password': password,
//             'remember': remember?1:0
//         },
//         'success': function (result) {
//             console.log('==============');
//             console.log(result);
//             console.log('==============');
//         },
//         'fail': function (error) {
//             console.log(error);
//         }
//     });
// });


