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
            $("#loadingMessage").html(msg);
            $("#systemInfo").html("");
        },
        showLoadErrorMessage: function (msg) {
            $("#loadError").show();
            $("#loadError").html(msg);
            $("#loadingMessage").hide();
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
            ui.showUserInfo();
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
            $("#systemInfo").show();
            $("#systemInfo").html(info);
        },
        showUserInfo: function () {
            this.showSystemInfo(config.authorInfo + config.bowerSupport + config.versionHistory);
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

//            $("#editArea").on("click", function(){
//                $("#index").hide();
//                $("#edit").show();
//            });

//            $("#mapEdit").on("click", function(){
//                window.location.href = "./mapEdit.html";
//            });
//            $("#animEdit").on("click", function(){
//                window.location.href = "./animEdit.html";
//            });
//            $("#imgEdit").on("click", function(){
//                window.location.href = "./imgEdit.html";
//            });

            $("#loadError").on("click", function () {
                $(this).hide();
                LevelManager.getInstance().initAnimation();
            });

            $("#enterGame").on("click", function () {
                LevelManager.getInstance().enterGame();
            });

            //Initialize building construction buttons
            $("#build_base").on("click", function () {
                window.effectLayer.build("base", BaseSprite);
            });
            $("#build_tower").on("click", function () {
                window.effectLayer.build("tower", TowerSprite);
            });
            $("#build_shootingRange").on("click", function () {
                window.effectLayer.build("shootingRange", ShootingRangeSprite);
            });


            $("#produce_farmer").on("click", function () {
                window.entityLayer.produce("farmer", FarmerSprite);
            });
            $("#produce_archer").on("click", function () {
                window.entityLayer.produce("archer", ArcherSprite);
            });

            $("#moveAndAttack").on("click", function () {
//            window.effectLayer.command(MoveAndAttackCommand);
                window.effectLayer.moveAndAttack();
            });

            $("#systemIco").on("click", function (e) {
                e.stopPropagation();

                if (self._isShow(self._getCenterBox())) {
                    self._resumeGame();
                }
                else {
                    YE.Director.getInstance().pause();
                    self._showMenuDom();
                }
            });

            this._getCenterBox().on("click", function (e) {
                e.stopPropagation();
            });

            $("#gameArea").on("click", function (e) {
                if (self._isShow(self._getCenterBox())) {
                    self._resumeGame();
                }
            });
        },
        showCenterInfo: function (info) {
            YE.Director.getInstance().pause();
            this._showCenterInfoDom();
            this._getCenterInfo().html(info)
        },
        _isNotMenuDom: function (jqObj) {
            return jqObj.attr("id") !== "menu";
        },
        _getCenterBox: function () {
            return $("#centerBox");
        },
        _getMenu: function () {
            return $("#centerBox .menu");
        },
        _getCenterInfo: function () {
            return $("#centerBox .info");
        },
        _showMenuDom: function () {
//            YE.Director.getInstance().pause();
            this._getCenterBox().show();
            this._getCenterInfo().hide();
            this._getMenu().show();
        },
        _showCenterInfoDom: function(){
            this._getCenterBox().show();
            this._getMenu().hide();
            this._getCenterInfo().show();
        },
        _resumeGame: function () {
            YE.Director.getInstance().resume();
            this._getCenterBox().hide();
        },
        _isShow: function (jqObj) {
            return jqObj.css("display") !== "none";
        },
//        _isHide: function(jqObj){
//            return jqObj.css("display") === "none";
//        },
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
            }).renderTo(this._getMenu());

            new YYC.Control.Button({
                text: "查看作者信息",

                className: "button3",
                addClass: "button",

                onclick: function (e) {
                    ui.showCenterInfo("<p style='margin-bottom: 50px;'>古代战争 v"
                        + config.version + "</p>"
                        + config.authorInfo);
                },

                width: 200,
                height: 50
            }).renderTo(this._getMenu());
        },
        getGameAreaSize: function () {
            var gameArea = $("#gameArea");

            return {width: gameArea.width(), height: gameArea.height()};
        }
    };

    window.ui = ui;
}());


