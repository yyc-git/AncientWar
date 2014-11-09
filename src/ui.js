/**古代战争
 * 作者：YYC
 * 日期：2014-02-26
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var ui = {
        showLoadingMessage: function (msg) {
            $("#enterGame").hide();
            $("#loadingMessage").show();
            $("#loadingMessage").text(msg);
            $("#systemInfo").hide();
        },
        showEnterGame: function () {
            $("#loadingMessage").hide();
            $("#enterGame").show();
        },
        showLevelBrif: function (msg) {
            $("#loading p").html(msg);
        },
        showIndex: function () {
            $("#loading").hide();
            $('#gameArea').hide();
            $('#index').show();
            $("#systemInfo").hide();
        },
        showLoading: function () {
            $('#gameArea').hide();
            $('#index').hide();
            $("#loading").show();
        },
        showGameArea: function () {
            $('#index').hide();
            $("#loading").hide();
            $("#gameArea").show();
            $("#systemInfo").show();
        },
        showDialogue: function (info) {
            $("#dialogue").show();
            $("#dialogue").html(info);
        },
        showMessageBox: function (msg, callback, time) {
            $("#gameInfo").html(msg);

            setTimeout(function () {
                $("#gameInfo").html("");
                callback && callback();
            }, time || 2000);
        },
        showResource: function (meat) {
            $("#meat").html(meat);
        },
        showSpriteInfo: function (info) {
            $("#basicInfo").append($("<p></p>").html(info));
        },
        clearInfo: function () {
            $("#basicInfo").html("");
            $("#moreInfo").html("");
            $("#downLeftPanel > div").hide();
        },
        show: function (id) {
            $("#" + id).show();
        },
        hide: function (id) {
            $("#" + id).hide();
        },
        showProgress: function (percent) {
            var img = $("<div>").css({
                    width: "100px",
                    height: "12px",
                    "background-image": "url(content/image/interface/progress.png)",
                    "background-position": "0px -" + percent * 12 + "px"
                }),
                text = $("<span>").html("进度为：" + percent + "%");

            $("#moreInfo").html("");
            $("#moreInfo").append(img).append(text);
        },
        showProduceNum: function (num) {
            $("#moreInfo").append($("<p>").html("有" + num + "个单位正在建造"));
        },
        showSystemInfo: function (info) {
            $("#systemInfo").html(info);
        },
        initEvent: function () {
            var self = this;

            $("#singlePlayerArea").hover(function () {
                $(this).css("background-image", "url(content/image/interface/single_hover.png)");
            }, function () {
                $(this).css("background-image", "url(content/image/interface/single.png)");
            });
            $("#singlePlayerArea").mousedown(function () {
                $(this).css("background-image", "url(content/image/interface/single_mousedown.png)");
            });
            $("#singlePlayerArea").mouseup(function () {
                $(this).css("background-image", "url(content/image/interface/single_mouseup.png)");
                $("#loading").show();
                $("#index").hide();

                LevelManager.getInstance().start();
            });

            $("#editArea").click(function () {
                $("#index").hide();
                $("#edit").show();
            });

            $("#mapEdit").click(function () {
                window.location.href = "./mapEdit.html";
            });
            $("#animEdit").click(function () {
                window.location.href = "./animEdit.html";
            });
            $("#imgEdit").click(function () {
                window.location.href = "./imgEdit.html";
            });


            $("#enterGame").click(function () {
                LevelManager.getInstance().enterGame();
            });

            //Initialize building construction buttons
            $("#build_base").click(function () {
                window.effectLayer.build("base", BaseSprite);
            });
            $("#build_tower").click(function () {
                window.effectLayer.build("tower", TowerSprite);
            });
            $("#build_shootingRange").click(function () {
                window.effectLayer.build("shootingRange", ShootingRangeSprite);
            });


            $("#produce_farmer").click(function () {
                window.entityLayer.produce("farmer", FarmerSprite);
            });
            $("#produce_archer").click(function () {
                window.entityLayer.produce("archer", ArcherSprite);
            });

            $("#moveAndAttack").click(function () {
//            window.effectLayer.command(MoveAndAttackCommand);
                window.effectLayer.moveAndAttack();
            });

            $("#systemIco img").click(function () {
                $("#dialogue").hide();

                if (self._isShow($("#menu"))) {
                    YE.Director.getInstance().resume();
                    $("#menu").hide();
                }
                else {
                    YE.Director.getInstance().pause();
                    $("#menu").show();
                }

            });
        },
        _isShow: function (jqObj) {
            return jqObj.css("display") !== "none";
        },
        initHtml: function () {
            new YYC.Control.Button({
                text: "退出游戏",

                className: "button3",
                addClass: "button",

                onclick: function (e) {
                    LevelManager.getInstance().exit();
                    $("#menu").hide();
                    ui.showIndex();
                },

                width: 200,
                height: 50
            }).renderTo("menu");

            new YYC.Control.Button({
                text: "查看作者信息",

                className: "button3",
                addClass: "button",

                onclick: function (e) {
                    ui.showDialogue("<p style='margin-bottom: 50px;'>古代战争 v"
                        + config.version
                        + "</p><p>作者：YYC</p><p>邮箱：395976266@qq.com</p>"
                        + "<p>博客：<a href='http://www.cnblogs.com/chaogex/' target='_blank'>码农终结者</a></p>");
                },

                width: 200,
                height: 50
            }).renderTo("menu");
        },
        getGameAreaSize: function () {
            var gameArea = $("#gameArea");

            return {width: gameArea.width(), height: gameArea.height()};
        }
    };

    window.ui = ui;
}());


