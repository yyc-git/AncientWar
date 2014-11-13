/*!
 yEngine2D
 2D web game engine

 version: 0.1.0
 author: YYC
 email: 395976266@qq.com
 qq: 395976266
 blog: http://www.cnblogs.com/chaogex/
 homepage: 
 repository: https://github.com/yyc-git/YEngine2D
 license: MIT
 date: 2014-11-13
*/
(function () {
    function _extend(destination, source) {
        var property = "";

        for (property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    function JsLoader() {
        this.ye_container = [];
    }

    JsLoader.prototype = {
        ye_loadJsSync: function (js, func) {
            var script = null;

            script = this.ye_createScript(js);
            this.ye_appendScript(script);

            this.ye_onloadSync(js, script, func);
        },
        ye_appendScript: function (script) {
            var head = document.getElementsByTagName("head")[0];

            head.appendChild(script);
        },
        ye_createScript: function (js) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = js.src;

            return script;
        },
        ye_onloadSync: function (js, script, func) {
            var self = this;

            if (script.readyState) { //IE
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        js.callback && js.callback.apply(js.obj, js.args);

                        self.ye_loadNext(func);
                    }
                };
            }
            else { //Others
                script.onload = function () {
                    js.callback && js.callback.apply(js.obj, js.args);

                    self.ye_loadNext(func);
                };
            }
        },
        ye_loadNext: function (func) {
            if (this.ye_container.length == 0) {
                this.onload();
                return;
            }
            else {
                func.call(this, null);
            }
        },

        onload: function () {
        },

        add: function (src, callback, args, obj) {
            this.ye_container.push({ src: src, callback: callback, args: args || [], obj: obj ? obj : window });

            return this;
        },
        loadSync: function () {
            var js = null;

            if (this.ye_container.length == 0) {
                throw new Error("请先加入js");
            }

            js = this.ye_container.shift();

            this.ye_loadJsSync(js, this.loadSync);
        }
    };

    JsLoader.create = function () {
        return new this();
    };

    //*全局方法
    (function () {
        /**
         * 创建命名空间。
         示例：
         namespace("YE.Tool.Button");
         */
        var global = {
            namespace: function (str) {
                var parent = window,
                    parts = str.split('.'),
                    i = 0,
                    len = 0;

                if (str.length == 0) {
                    YE.error(true, "命名空间不能为空");
                }

                for (i = 0, len = parts.length; i < len; i++) {
                    if (typeof parent[parts[i]] === "undefined") {
                        parent[parts[i]] = {};
                    }
                    parent = parent[parts[i]];  //递归增加命名空间
                }

                return parent;
            }
        };

        _extend(window, global);
    }());

    //创建命名空间
    namespace("YE");

    //* 调试辅助方法
    (function () {
        function _logToWebPage(message) {
            YE.$("body").prepend("<div style='color:red;font-size: 20;'>引擎调试信息：" + message + "</div>");
        }

        //定义用于测试的返回值
        YE.returnForTest = "YEngine2D_testReturn";

        /**
         * Output Debug message.
         * @function
         * @param {String} message
         */
        YE.log = function (message) {
            if (YE.main.getConfig().isDebug) {
                if (!YE.main.getConfig().isShowDebugOnPage) {
                    console.log && console.log(message);
                } else {
                    _logToWebPage(message);
                }
            }
        };

        /**
         * 断言失败时，会提示错误信息，但程序会继续执行下去
         * 使用断言捕捉不应该发生的非法情况。不要混淆非法情况与错误情况之间的区别，后者是必然存在的并且是一定要作出处理的。
         *
         * 1）对非预期错误使用断言
         断言中的布尔表达式的反面一定要描述一个非预期错误，下面所述的在一定情况下为非预期错误的一些例子：
         （1）空指针。
         （2）输入或者输出参数的值不在预期范围内。
         （3）数组的越界。
         非预期错误对应的就是预期错误，我们通常使用错误处理代码来处理预期错误，而使用断言处理非预期错误。在代码执行过程中，有些错误永远不应该发生，这样的错误是非预期错误。断言可以被看成是一种可执行的注释，你不能依赖它来让代码正常工作（《Code Complete 2》）。例如：
         int nRes = f(); // nRes 由 f 函数控制， f 函数保证返回值一定在 -100 ~ 100
         Assert(-100 <= nRes && nRes <= 100); // 断言，一个可执行的注释
         由于 f 函数保证了返回值处于 -100 ~ 100，那么如果出现了 nRes 不在这个范围的值时，就表明一个非预期错误的出现。后面会讲到“隔栏”，那时会对断言有更加深刻的理解。
         2）不要把需要执行的代码放入断言中
         断言用于软件的开发和维护，而通常不在发行版本中包含断言。
         需要执行的代码放入断言中是不正确的，因为在发行版本中，这些代码通常不会被执行，例如：
         Assert(f()); // f 函数通常在发行版本中不会被执行
         而使用如下方法则比较安全：
         res = f();
         Assert(res); // 安全
         3）对来源于内部系统的可靠的数据使用断言，而不要对外部不可靠的数据使用断言，对于外部不可靠数据，应该使用错误处理代码。
         再次强调，把断言看成可执行的注释。
         * @param cond 如果cond返回false，则断言失败，显示message
         * @param message
         */
        YE.assert = function (cond, message) {
            if (YE.main.getConfig().isDebug) {
                if (console.assert) {
                    console.assert(cond, message);
                }
                else {
                    if (!cond && message) {
                        if (console && console.log) {
                            console.log("断言：" + message);
                        }
                        else {
                            alert("断言：" + message);
                        }
                    }
                }
            }
        };

        /**
         * 如果发生错误，则抛出异常并终止程序
         * @param cond
         * @param message
         */
        YE.error = function (cond, message) {
            if (cond) {
                throw new Error(message);
            }
        };
    }());


    YE.main = {
        ye_config: {
            isDebug: false,  //是否处于调试状态
            isShowDebugOnPage: false, //是否在页面上显示调试信息
            isAutoLoadWhenDomReady: true, //是否在DOM加载完成后自动加载
            engineDir: "",
            isSingleEngineFile: true,
            userFilePaths: [],              //这里加入用户文件路径
            onload: function () {
            }
        },
        ye_engineFilePaths: [
            "import/yeQuery.js",
            "import/YOOP.js",
            "import/jsExtend.js",

            "tool/Tool.js",

            "base/Entity.js",
            "base/Node.js",
            "base/NodeContainer.js",
            "base/CollectionManager.js" ,

            "structure/Hash.js"  ,
            "structure/Collection.js" ,
            "structure/Geometry.js",
            "structure/Bitmap.js",

            "algorithm/collision.js",
            "algorithm/AStar.js" ,

            "loader/Loader.js"  ,
            "loader/ImgLoader.js" ,

            "loader/JsonLoader.js",
            "loader/SoundLoader.js",
            "loader/LoaderManager.js" ,

            "sound/SoundManager.js"  ,

            "core/Director.js",
            "core/Scene.js",
            "core/Layer.js" ,
            "core/Sprite.js"  ,

            "event/Event.js",
            "event/EventManager.js" ,

            "animation/AnimationFrame.js"  ,
            "animation/Animation.js" ,
            "animation/Frame.js",
            "animation/FrameCache.js",
            "animation/AnimationManager.js",
            "animation/AnimationFrameManager.js" ,
            "animation/AnimationCache.js"  ,

            "action/Action.js",
            "action/ActionInterval.js" ,
            "action/ActionInstant.js" ,
            "action/Control.js"  ,
            "action/Animate.js" ,
            "action/ActionManager.js",
            "action/Repeat.js",
            "action/RepeatForever.js" ,
            "action/RepeatCondition.js"  ,
            "action/Sequence.js" ,
            "action/Spawn.js"  ,
            "action/CallFunc.js" ,
            "action/DelayTime.js",
            "action/MoveBy.js",
            "action/JumpBy.js",
            "action/Place.js",

            "ui/Graphics.js" ,

            "ySoundEngine/YSoundEngine.js"
        ],
        ye_isLoaded: false,

        ye_loadJsLoader: function () {
            var engineFilePaths = this.ye_engineFilePaths,
                engineDir = this.ye_config.engineDir,
                userFilePaths = this.ye_config.userFilePaths,
                onload = this.ye_config.onload,
                jsLoader = JsLoader.create();

            this.ye_isLoaded = true;
            jsLoader.onload = onload;

            if (!this.ye_config.isSingleEngineFile) {
                engineFilePaths.forEach(function (filePath) {
                    jsLoader.add(engineDir + filePath);
                });
            }

            userFilePaths.forEach(function (filePath) {
                jsLoader.add(filePath);
            });

            jsLoader.loadSync();
        },
        setConfig: function (config) {
            var self = this;

            _extend(this.ye_config, config);

            if (this.ye_config.isAutoLoadWhenDomReady) {
                window.addEventListener("DOMContentLoaded", function () {
                    self.ye_loadJsLoader();
                });
            }
        },
        getConfig: function () {
            return this.ye_config;
        },
        load: function () {
            if (this.ye_config.isAutoLoadWhenDomReady) {
                YE.log("已配置为DOM加载完成后自动加载文件，此处不再进行加载");
                return false;
            }
            if (this.ye_isLoaded) {
                YE.log("已经加载过文件了，不能重复加载");
                return false;
            }

            this.ye_loadJsLoader();
        },

        forTest_getJsLoader: function () {
            return JsLoader;
        }
    };

}());
(function () {
    var global = this;

    function _isArray(val) {
        return Object.prototype.toString.call(val) === "[object Array]";
    }

    function _isFunction(func) {
        return Object.prototype.toString.call(func) === "[object Function]";
    }

    /*!
     扩展String对象
    */
    (function(){
        String.prototype.contain = function (str) {
            return this.indexOf(str) >= 0
        };

        String.prototype.containIgnoreCase = function (str) {
            return this.toLowerCase().indexOf(str.toLowerCase()) >= 0;
        };

        String.prototype.trim = function () {
            return this.replace(/^\s*/g, "").replace(/\s*$/g, "");
        };
    }());

    /*!
     扩展Array对象
     */
    (function(){
        global.$break = {};

        Array.prototype.forEach = function (fn, context) {
            var scope = context || global;

            for (var i = 0, j = this.length; i < j; ++i) {
                if (fn.call(scope, this[i], i) === $break) {
                    break;
                }
            }
        };

        Array.prototype.filter = function (fn, context) {
            var scope = context || global,
                self = this,
                a = [];

            this.forEach(function (value, index) {
                if (!fn.call(scope, value, index, self)) {
                    return;
                }
                a.push(value);
            });

            return a;
        };

        /**
         * 如果数组中不存在该元素，则push到数组末尾；否则不加入。
         * obj为单个元素，该方法参数只能有一个。
         */
        Array.prototype.pushNoRepeat = function (obj) {
            if (!this.contain(function (value, index) {
                if (value === obj) {
                    return true;
                }
                else {
                    return false;
                }
            })) {
                this.push(obj);
            }
        };

        Array.prototype.removeChild = function (func) {
            var self = this,
                index = null;

            index = this.indexOf(function (e, index) {
                return !!func.call(self, e);
            });

            if (index !== null && index !== -1) {
                this.splice(index, 1);
                return true;
            }
            return false;
        };

        Array.prototype.map = function (func, valueArr) {
            if (valueArr && !_isArray(valueArr)) {
                throw new Error("参数必须为数组");
            }

            this.forEach(function (e) {
                e && e[func] && e[func].apply(e, valueArr);
            })
        };

        /**
         * 判断数组是否包含元素。
         */
        Array.prototype.contain = function (arg) {
            var result = false;

            if (_isFunction(arg)) {
                this.forEach(function (value, index) {
                    if (!!arg.call(null, value, index)) {
                        result = true;
                        return $break;   //如果包含，则置返回值为true,跳出循环
                    }
                });
            }
            else {
                this.forEach(function (value, index) {
                    if (arg === value || (value.contain && value.contain(arg))) {
                        result = true;
                        return $break;   //如果包含，则置返回值为true,跳出循环
                    }
                });
            }

            return result;
        };
        /**
         * 返回满足条件的元素的位置。
         * 如果找不到满足条件的元素，则返回-1。
         */
        Array.prototype.indexOf = function (iterator) {
            var result = -1,
                isFind = null;

            this.forEach(function (value, index) {
                isFind = iterator.call(null, value, index);
                if (isFind) {
                    result = index;
                    return $break;
                }
            });

            return result;
        };
    }());
})();
(function () {
    var yeQuery = (function () {
        function _isString(value) {
            return typeof value === 'string';
        }

        function _buildDom(domStr) {
            if (_isString(domStr)) {
                var div = document.createElement("div");
                div.innerHTML = domStr;

                return div.firstChild;
            }

            return domStr;
        }

        function YEQuery(domStr) {
            this.ye_doms = document.querySelectorAll(domStr);

            if (!(this instanceof YEQuery)) {
                return new YEQuery(domStr);
            }
        }

        /*!
         实现ajax

         ajax({
         type:"post",//post或者get，非必须
         url:"test.jsp",//必须的
         data:"name=dipoo&info=good",//非必须
         dataType:"json",//text/xml/json，非必须
         success:function(data){//回调函数，非必须
         alert(data.name);
         }
         });*/
        YEQuery.ajax = (function (error) {
            function ajax(conf) {
                var type = conf.type;//type参数,可选
                var url = conf.url;//url参数，必填
                var data = conf.data;//data参数可选，只有在post请求时需要
                var dataType = conf.dataType;//datatype参数可选
                var success = conf.success;//回调函数可选
                var error = conf.error;
                var xhr = null;

                if (type === null) {//type参数可选，默认为get
                    type = "get";
                }
                if (dataType === null) {//dataType参数可选，默认为text
                    dataType = "text";
                }

                xhr = _createAjax(error);
                if (!xhr) {
                    return;
                }

                try {
                    xhr.open(type, url, true);
                    if (type === "GET" || type === "get") {
                        xhr.send(null);
                    } else if (type === "POST" || type === "post") {
                        xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
                        xhr.send(data);
                    }

                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4
                            //如果ajax访问的是本地文件，则status为0
                            && (xhr.status === 200 || _isLocalFile(xhr.status))) {
                            if (dataType === "text" || dataType === "TEXT") {
                                if (success !== null) {//普通文本
                                    success(xhr.responseText);
                                }
                            } else if (dataType === "xml" || dataType === "XML") {
                                if (success !== null) {//接收xml文档
                                    success(xhr.responseXML);
                                }
                            } else if (dataType === "json" || dataType === "JSON") {
                                if (success !== null) {//将json字符串转换为js对象
                                    success(eval("(" + xhr.responseText + ")"));
                                }
                            }
                        }
                    };
                }
                catch (e) {
                    error(xhr, e);
                }
            }

            function _createAjax() {
                var xhr = null;
                try {//IE系列浏览器
                    xhr = new ActiveXObject("microsoft.xmlhttp");
                } catch (e1) {
                    try {//非IE浏览器
                        xhr = new XMLHttpRequest();
                    } catch (e2) {
                        error(xhr, {message: "您的浏览器不支持ajax，请更换！"});
                        return null;
                    }
                }
                return xhr;
            }

            function _isLocalFile(status) {
                return document.URL.contain("file://") && status === 0;
            }

            return ajax;
        }());

        YEQuery.prototype = {
            /**
             * 获得指定序号的dom元素
             * @param index
             * @returns {*}
             */
            get: function (index) {
                return this.ye_doms[index];
            },
            prepend: function (node) {
                var dom = null,
                    i = 0,
                    len = 0;

                dom = _buildDom(node);

                for (i = 0, len = this.ye_doms.length; i < len; i++) {
                    if (this.ye_doms[i].nodeType === 1) {
                        this.ye_doms[i].insertBefore(dom, this.ye_doms[i].firstChild);
                    }
                }

                return this;
            }
        }

        return YEQuery;
    }());

    YE.$ = yeQuery;
}());
/*!
私有成员前缀为“ye_entity_”
为什么不将前缀设成“ye_”？
这是因为是这样，那么继承Entity的引擎类的私有成员前缀就都要加一个下划线“_”。
因此，将前缀设为Entity类独有，则不用担心子类的私有成员会覆盖Entity的私有成员！
*/
YE.Entity = YYC.AClass({
    Init: function () {
        this.ye_entity_addUid();

        this.ye_entity_cacheData = YE.Hash.create();
    },
    Private: {
        ye_entity_uid: 0,
        ye_entity_cacheData: null,
        ye_entity_tag: null,

        ye_entity_addUid: function () {
            this.ye_entity_uid = YE.Entity.count++;
        }
    },
    Public: {
        setCacheData: function (key, dataArr) {
            this.ye_entity_cacheData.addChild(key, dataArr);
        },
        getCacheData: function (key) {
            return this.ye_entity_cacheData.getValue(key);
        },
        getUid: function () {
            return this.ye_entity_uid;
        },
        setTag: function (tag) {
            if (YE.Tool.judge.isArray(tag)) {
                this.ye_entity_tag = tag;
            }
            else {
                this.ye_entity_tag = [tag];
            }
        },
        addTag: function (tag) {
            if (this.ye_entity_tag === null) {
                this.setTag(tag);
                return;
            }

            this.ye_entity_tag.push(tag);
        },
        removeTag: function (tag) {
            if (this.ye_entity_tag === null) {
                return;
            }

            this.ye_entity_tag.removeChild(function (t) {
                return t === tag;
            });
        },
        getTag: function () {
            return this.ye_entity_tag;
        },
        hasTag: function (tag) {
            return this.ye_entity_tag &&
                (this.ye_entity_tag === tag || this.ye_entity_tag.contain(function (t) {
                    return t === tag;
                }));
        },
        containTag: function (tag) {
            if (!this.ye_entity_tag) {
                return;
            }

            return this.ye_entity_tag.contain(tag);
        }
    },
    Static: {
        //uid计数器
        count: 1
    }
});
YE.Node = YYC.AClass(YE.Entity, {
    Private: {
        ye_parent: null,
        ye_zOrder: 0,

        ye_setZOrder: function (zOrder) {
            this.ye_zOrder = zOrder;
        }
    },
    Public: {
        getParent: function () {
            return this.ye_parent;
        },
        getZOrder: function () {
            return this.ye_zOrder;
        },

        Virtual: {
            init: function (parent) {
                this.ye_parent = parent;
            },

            //*钩子

            onStartLoop: function () {
            },
            onEndLoop: function () {
            },
            onEnter: function () {
            },
            onExit: function () {
            }
        }
    }
});

(function () {
    YE.CollectionManager = YYC.AClass(YE.Entity, {
        Init: function () {
            this.ye_P_childs = YE.Collection.create();
        },
        Private: {
        },
        Protected: {
            ye_P_childs: null
        },
        Public: {
            update: function () {
                var self = this,
                    removeQueue = [],
                    time = null;

                time = 1 / YE.Director.getInstance().getFps();

                this.ye_P_childs.forEach(function (child) {
                    //修复“如果遍历的动作删除了动作序列中某个动作，则在后面的遍历中会报错”的bug
                    if (!child) {
                        return;
                    }

                    if (child.isFinish()) {
                        removeQueue.push(child);
                        return;
                    }
                    if (child.isStop()) {
                        return;
                    }

                    child.update(time);
                });

                removeQueue.forEach(function (child) {
                    self.removeChild(child);
                });
            },
            getCount: function () {
                return this.ye_P_childs.getCount();
            },
            addChild: function (child, target) {
                child.setTarget(target);
                this.ye_P_childs.addChild(child);
                child.init();
                child.onEnter();
            },
            removeChild: function (child, isReset) {
                child.onExit();
                if (isReset === true) {
                    child.reset();
                }

                this.ye_P_childs.removeChild(function (e) {
                    return child.getUid() === e.getUid();
                });
            },
            removeAllChilds: function (isReset) {
                this.ye_P_childs.map("onExit");
                if (isReset === true) {
                    this.ye_P_childs.map("reset");
                }

                this.ye_P_childs.removeAllChilds();
            },
            hasChild: function (child) {
                var actionName = null;

                if (!child) {
                    return false;
                }

                if (YE.Tool.judge.isString(arguments[0])) {
                    actionName = arguments[0];

                    return this.ye_P_childs.hasChild(function (c) {
                        return c.hasTag(actionName);
                    });
                }

                return this.ye_P_childs.hasChild(child);
            },
            getChilds: function () {
                return this.ye_P_childs.getChilds();
            }
        }
    });
}());
YE.NodeContainer = YYC.AClass(YE.Node, {
    Init: function () {
        this.base();

        this.ye__childs = YE.Collection.create();
    },
    Private: {
        ye__isChangeZOrder: false,
        ye__childs: null
    },
    Protected: {
        Abstract: {
            ye_P_run: function () {
            }
        }
    },
    Public: {
        isSortAllChilds: true,

        reorderChild: function (child, zOrder) {
            this.ye__isChangeZOrder = true;

            child.ye_setZOrder(zOrder);
        },
        sortByZOrder: function () {
            if (this.ye__isChangeZOrder) {
                this.ye__isChangeZOrder = false;

                this.sort(function (child1, child2) {
                    return child1.getZOrder() - child2.getZOrder();
                });
            }
        },
        sort: function (func) {
            this.ye__childs.sort(func);
        },
        getChilds: function () {
            return this.ye__childs.getChilds();
        },
        getChildAt: function (index) {
            return this.ye__childs.getChildAt(index);
        },
        addChilds: function (childs, zOrder, tag) {
            var self = this;

            YE.error(!YE.Tool.judge.isArray(childs), "第一个参数必须为数组");

            if (zOrder) {
                this.ye__isChangeZOrder = true;
            }

            this.ye__childs.addChilds(childs);

            childs.forEach(function (child) {
                if (zOrder) {
                    child.ye_setZOrder(zOrder);
                }
                if (tag) {
                    child.addTag(tag);
                }
                child.init(self);
                child.onEnter();
            });
        },
        addChild: function (child, zOrder, tag) {
            this.ye__childs.addChild(child);

            if (zOrder) {
                this.ye__isChangeZOrder = true;
                child.ye_setZOrder(zOrder);
            }
            if (tag) {
                child.addTag(tag);
            }
            child.init(this);
            child.onEnter();
        },
        hasChild: function (child) {
            return this.ye__childs.hasChild(child);
        },
        getChildByTag: function (tag) {
            return YE.Tool.collection.getChildByTag(this.ye__childs, tag);
        },
        getChildsByTag: function (tag) {
            return YE.Tool.collection.getChildsByTag(this.ye__childs, tag);
        },
        removeChildByTag: function (tag) {
            YE.Tool.collection.removeChildByTag(this.ye__childs, tag, function (child) {
                child.onExit();
            });
        },
        removeChildsByTag: function (tag) {
            YE.Tool.collection.removeChildsByTag(this.ye__childs, tag, function (child) {
                child.onExit();
            });
        },
        removeChild: function (child) {
            child.onExit();
            this.ye__childs.removeChild(child);
        },
        removeAllChilds: function () {
            this.ye__childs.map("onExit");

            this.ye__childs.removeAllChilds();
        },
        iterate: function (handler, args) {
            if (YE.Tool.judge.isFunction(arguments[0])) {
                this.ye__childs.forEach.apply(this.ye__childs, arguments);
            }
            else {
                this.ye__childs.map.apply(this.ye__childs, arguments);
            }
        },
        //游戏主循环调用的方法
        run: function () {
            if (this.isSortAllChilds) {
                this.sortByZOrder();
            }

            this.ye_P_run();
        }
    }
});

(function () {
    YE.Action = YYC.AClass(YE.Entity, {
        Init: function () {
            this.base();

            this.ye_isFinish = false;
        },
        Private: {
            ye_target: null,
            ye_isFinish: null
        },
        Public: {
            setTarget: function (target) {
                this.ye_target = target;
            },
            getTarget: function () {
                return this.ye_target;
            },
            isStart: function () {
                return !this.isStop();
            },
            isFinish: function () {
                return this.ye_isFinish;
            },
            reset: function () {
                this.ye_isFinish = false;
            },
            finish: function () {
                this.ye_isFinish = true;
                this.stop();
            },

            Virtual: {
                init: function () {
                },

                //*自定义动作的钩子

                onEnter: function () {
                },
                onExit: function () {
                }
            }
        },
        Abstract: {
            update: function (time) {
            },
            copy: function () {
            },
            start: function () {
            },
            stop: function () {
            },
            isStop: function () {
            },
            reverse: function () {
            }
        }
    });
}());
YE.ActionInstant = YYC.AClass(YE.Action, {
    Public: {
        isStop: function () {
            return false;
        },
        start: function () {
        },
        stop: function () {
        }
    }
});
YE.ActionInterval = YYC.AClass(YE.Action, {
    Init: function () {
        this.base();
    },
    Private: {
        ye__isStop: false
    },
    Public: {
        start: function () {
            this.ye__isStop = false;
        },
        reset: function () {
            this.base();

            this.ye__isStop = false;
        },
        stop: function () {
            this.ye__isStop = true;
        },
        isStop: function () {
            return this.ye__isStop;
        }
    }
});

YE.Control = YYC.AClass(YE.ActionInterval, {
    Init: function () {
        this.base();
    },
    Protected: {
        Virtual: {
            ye_P_iterate: function (method, arg) {
                var actions = this.getInnerActions();

                actions.map.apply(actions, arguments);
            }
        }
    },
    Public: {
        init: function () {
            this.ye_P_iterate("init");
        },
        onEnter: function () {
            this.ye_P_iterate("onEnter");
        },
        onExit: function () {
            this.ye_P_iterate("onExit");
        },
        setTarget: function (target) {
            this.base(target);

            this.ye_P_iterate("setTarget", [target]);
        },
        reverse: function () {
            this.ye_P_iterate("reverse");

            return this;
        },
        reset: function () {
            this.base();

            this.ye_P_iterate("reset");
        }
    },
    Abstract: {
        getInnerActions: function () {
        }
    }
});
(function () {
    YE.Loader = YYC.AClass(YE.Entity, {
        Init: function () {
            this.base();

            this.ye_P_container = YE.Hash.create();
            this.ye_loadedUrl = YE.Collection.create();
        },
        Private: {
            ye_loadedUrl: null
        },
        Protected: {
            ye_P_container: null   ,

            Abstract: {
                ye_P_load: function () {
                }
            }
        },
        Public: {
            get: function (key) {
                return this.ye_P_container.getValue(key);
            },
            load: function (url, id) {
                var key = id ? id : url;

                if (this.ye_loadedUrl.hasChild(url)) {
                    YE.LoaderManager.getInstance().onResLoaded();
                    return this.get(key);
                }

                this.ye_loadedUrl.addChild(url);

                this.ye_P_load(url, key);
            }
        }
    });
}());
(function () {
    YE.ActionManager = YYC.Class(YE.CollectionManager, {
        Init: function () {
            this.base();
        },
        Public: {
            getChildByTag: function (tag) {
                return YE.Tool.collection.getChildByTag(this.ye_P_childs, tag);
            },
            getChildsByTag: function (tag) {
                return YE.Tool.collection.getChildsByTag(this.ye_P_childs, tag);
            },
            removeChildByTag: function (tag, isReset) {
                YE.Tool.collection.removeChildByTag(this.ye_P_childs, tag, function (child) {
                    child.onExit();
                    if (isReset) {
                        child.reset();
                    }
                });
            },
            removeChildsByTag: function (tag, isReset) {
                YE.Tool.collection.removeChildsByTag(this.ye_P_childs, tag, function (child) {
                    child.onExit();
                    if (isReset) {
                        child.reset();
                    }
                });
            }
        },
        Static: {
            create: function () {
                return new this();
            }
        }
    });
}());
(function () {
    YE.Animate = YYC.Class(YE.ActionInterval, {
        Init: function (animation) {
            this.base();

            this.ye___anim = animation;
        },
        Private: {
            ye___anim: null,
            ye___frames: null,
            // 包含的Frame数目
            ye___frameCount: -1,

            ye___duration: 0,

            ye___currentFrameIndex: -1,
            ye___currentFramePlayed: -1,
            ye___currentFrame: null,

            ye___setCurrentFrame: function (index) {
                this.ye___currentFrameIndex = index;
                this.ye___setFrame(this.ye___frames.getChildAt(index));
                this.ye___currentFramePlayed = 0;
            },
            ye___setFrame: function (frame) {
                this.ye___currentFrame = frame;
            }
        },
        Public: {
            initWhenCreate: function () {
                this.ye___frames = YE.Collection.create();

                this.ye___frames.addChilds(this.ye___anim.getFrames());
                this.ye___duration = this.ye___anim.getDurationPerFrame();
                this.ye___frameCount = this.ye___frames.getCount();

                this.ye___anim.setFrameIndex(this.ye___anim.getFrames());

                this.ye___setCurrentFrame(0);
            },
            /**
             * 更新Animation状态，只播放一次
             * @param deltaTime 游戏主循环的间隔时间，以秒为单位
             */
            update: function (deltaTime) {
                //判断当前Frame是否已经播放完成,
                if (this.ye___currentFramePlayed >= this.ye___duration) {
                    //播放下一帧

                    //如果最后一帧播放完毕
                    if (this.ye___currentFrameIndex >= this.ye___frameCount - 1) {
                        this.finish();

                        return YE.returnForTest;
                    }

                    //进入下一帧
                    this.ye___currentFrameIndex++;

                    //设置当前帧信息
                    this.ye___setCurrentFrame(this.ye___currentFrameIndex);

                }
                else {
                    //增加当前帧的已播放时间.
                    this.ye___currentFramePlayed += deltaTime;
                }


                this.ye___currentFrame.setCacheData("animSize", this.ye___anim.getAnimSize());
                this.getTarget().setDisplayFrame(this.ye___currentFrame);
            },
            reset: function () {
                this.base();

                this.ye___setCurrentFrame(0);
            },
            copy: function () {
                return YE.Animate.create(this.ye___anim.copy());
            },
            reverse: function () {
                this.ye___frames.reverse();
                this.ye___anim.setFrameIndex(this.ye___frames.getChilds());
                this.ye___setFrame(this.ye___frames.getChildAt(this.ye___currentFrameIndex));

                return this;
            }
        },
        Static: {
            create: function (animation) {
                var animate = new this(animation);
                animate.initWhenCreate();

                return animate;
            }
        }
    });
}());
YE.CallFunc = YYC.Class(YE.ActionInstant, {
    Init: function (func, context, dataArr) {
        this.base();

        this.ye___context = context || window;
        this.ye___callFunc = func;
        this.ye___dataArr = dataArr;
    },
    Private: {
        ye___context: null,
        ye___callFunc: null,
        ye___dataArr: null
    },
    Public: {
        reverse: function () {
            return this;
        },
        update: function (time) {
            if (this.ye___callFunc) {
                this.ye___callFunc.call(this.ye___context, this.getTarget(), this.ye___dataArr);
            }

            this.finish();
        },
        copy: function () {
            return new YE.CallFunc(this.ye___context, this.ye___callFunc, YE.Tool.extend.extendDeep(this.ye___dataArr));
        }
    },
    Static: {
        create: function (func, context, args) {
            var dataArr = Array.prototype.slice.call(arguments, 2),
                action = new this(func, context, dataArr);

            return action;
        }
    }
});
YE.DelayTime = YYC.Class(YE.ActionInterval, {
    Init: function (delayTime) {
        this.base();

        this.___delayTime = delayTime;
    },
    Private: {
        ___delayTime: -1,
        ___elapsed: -1,
        ___firstTick: true
    },
    Public: {
        reverse: function () {
            return this;
        },
        update: function (time) {
            if (this.___firstTick) {
                this.___firstTick = false;
                this.___elapsed = 0;

                return YE.returnForTest;
            }
            this.___elapsed += time;

            if (this.___elapsed >= this.___delayTime) {
                this.finish();
            }
        },
        copy: function () {
            return YE.DelayTime.create(this.___delayTime);
        }
    },
    Static: {
        create: function (delayTime) {
            var action = new this(delayTime);

            return action;
        }
    }
});

YE.JumpBy = YYC.Class(YE.ActionInterval, {
    Init: function (duration, x, y, height) {
        this.base();

        this.ye___duration = duration;
        this.ye___x = x;
        this.ye___y = y;
        this.ye___height = height;
    },
    Private: {
        ye___elapsed: 0,
        ye___topY: 0,
        ye___topX: 0,
        ye___x: 0,
        ye___y: 0,
        ye___destX: 0,
        ye___destY: 0,
        ye___posX: 0,
        ye___posY: 0,
        ye___directionX: null,
        ye___directionY: null,

        ye___isFinish: function () {
            return this.ye___elapsed >= this.ye___duration;
        },
        ye___computeTotalDistance: function () {
            this.ye___totalX = Math.abs(this.ye___x);
            this.ye___totalY = this.ye___height * 2 + Math.abs(this.ye___y);
        },
        ye___computeDestPos: function () {
            this.ye___destX = this.ye___posX + this.ye___x;
            this.ye___destY = this.ye___posY + this.ye___y;
        },
        ye___initDirection: function () {
            if (this.ye___height === 0 && this.ye___y > 0) {
                this.ye___directionY = "down";
            }
            else {
                this.ye___directionY = "up";
            }

            if (this.ye___x > 0) {
                this.ye___directionX = "right";
            }
            else {
                this.ye___directionX = "left";
            }
        },
        ye___savePosition: function () {
            var target = null;

            target = this.getTarget();

            this.ye___posX = target.getPositionX();
            this.ye___posY = target.getPositionY();
        },
        ye___computeTopY: function () {
            this.ye___topY = Math.min(this.ye___posY, this.ye___posY + this.ye___y) - this.ye___height;
        },
        ye___setTargetToDest: function () {
            this.getTarget().setPosition(this.ye___destX, this.ye___destY);
        },
        ye___computeMoveDistance: function (time) {
            var ratio = null,
                moveX = null,
                moveY = null;

            ratio = time / this.ye___duration;
            moveX = ratio * this.ye___totalX;
            moveY = ratio * this.ye___totalY;

            return [moveX, moveY];
        },
        ye___setPosX: function (moveX) {
            if (this.ye___directionX === "left") {
                this.ye___posX -= moveX;
            }
            else {
                this.ye___posX += moveX;
            }

            this.getTarget().setPositionX(this.ye___posX);
        },
        ye___setPosY: function (moveY) {
            if (this.ye___directionY === "up") {
                this.ye___posY -= moveY;

                if (this.ye___isJumpOverTopPoint()) {
                    this.ye___enterDownProcess();
                }
            }
            else if (this.ye___directionY === "down") {
                this.ye___posY += moveY;
            }

            this.getTarget().setPositionY(this.ye___posY);
        },
        ye___isJumpOverTopPoint: function () {
            return this.ye___posY <= this.ye___topY;
        },
        ye___enterDownProcess: function () {
            this.ye___directionY = "down";
            this.ye___posY = this.ye___topY + (this.ye___topY - this.ye___posY);
        }
    },
    Public: {
        initWhenCreate: function () {
            YE.error(this.ye___height < 0, "高度必须为非负值");

            this.ye___computeTotalDistance();
            this.ye___initDirection();
        },
        init: function () {
            //初始化时保存精灵跳跃前的坐标，然后在跳跃的过程中基于该坐标变换。
            //相对于跳跃过程中基于精灵的坐标变换，可避免受到用户修改精灵坐标的影响
            this.ye___savePosition();

            this.ye___computeTopY();
            this.ye___computeDestPos();
        },
        update: function (time) {
            var target = null,
                dis = null;

            target = this.getTarget();

            if (this.ye___isFinish()) {
                this.finish();
                this.ye___setTargetToDest();
                return;
            }

            dis = this.ye___computeMoveDistance(time);

            this.ye___setPosX(dis[0]);
            this.ye___setPosY(dis[1]);

            this.ye___elapsed += time;
        },
        copy: function () {
            return YE.JumpBy.create(this.ye___duration, this.ye___x, this.ye___y, this.ye___height);
        },
        reverse: function () {
            return YE.JumpBy.create(this.ye___duration, -this.ye___x, -this.ye___y, this.ye___height);
        }
    },
    Static: {
        create: function (duration, x, y, height) {
            var action = new this(duration, x, y, height);

            action.initWhenCreate();

            return action;
        }
    }
});
YE.MoveBy = YYC.Class(YE.ActionInterval, {
    Init: function (duration, x, y) {
        this.base();

        this.ye___duration = duration;
        this.ye___x = x;
        this.ye___y = y;
    },
    Private: {
        ye___elapsed: 0,
        ye___duration: null,
        ye___x: null,
        ye___y: null,
        ye___destX: null,
        ye___destY: null,

        ye___computeDestPos: function () {
            var target = null;

            target = this.getTarget();

            this.ye___destX = target.getPositionX() + this.ye___x;
            this.ye___destY = target.getPositionY() + this.ye___y;
        },
        ye___computeMoveDistance: function (time) {
            var ratio = null,
                moveX = null,
                moveY = null;

            ratio = time / this.ye___duration;
            moveX = ratio * this.ye___x;
            moveY = ratio * this.ye___y;

            return [moveX, moveY];
        },
        ye___isFinish: function () {
            return this.ye___elapsed >= this.ye___duration;
        },
        ye___setTargetToDest: function () {
            this.getTarget().setPosition(this.ye___destX, this.ye___destY);
        }
    },
    Public: {
        init: function () {
            this.ye___computeDestPos();
        },
        update: function (time) {
            var target = null,
                dis = null;

            target = this.getTarget();

            if (this.ye___isFinish()) {
                this.finish();
                this.ye___setTargetToDest();
                return;
            }

            dis = this.ye___computeMoveDistance(time);

            target.setPositionX(target.getPositionX() + dis[0]);
            target.setPositionY(target.getPositionY() + dis[1]);

            this.ye___elapsed += time;
        },
        copy: function () {
            return YE.MoveBy.create(this.ye___duration, this.ye___x, this.ye___y);
        },
        reverse: function () {
            return YE.MoveBy.create(this.ye___duration, -this.ye___x, -this.ye___y);
        }
    },
    Static: {
        create: function (duration, x, y) {
            var action = new this(duration, x, y);

            return action;
        }
    }
});
YE.Place = YYC.Class(YE.ActionInstant, {
    Init: function (x, y) {
        this.base();

        this.ye___posX = x;
        this.ye___posY = y;
    },
    Private: {
        ye___posX: null,
        ye___posY: null
    },
    Public: {
        update: function (time) {
            var target = null;

            target = this.getTarget();

            target.setPositionX(this.ye___posX);
            target.setPositionY(this.ye___posY);

            this.finish();
        },
        copy: function () {
            return YE.Place.create(this.ye___posX, this.ye___posY);
        },
        reverse: function () {
            this.ye___posX = -this.ye___posX;
            this.ye___posY = -this.ye___posY;

            return this;
        }
    },
    Static: {
        create: function (x, y) {
            var action = new this(x, y);

            return action;
        }
    }
});
YE.Repeat = YYC.Class(YE.Control, {
    Init: function (action, times) {
        this.base();

        this.ye____innerAction = action;
        this.ye____times = times;
    },
    Private: {
        ye____innerAction: null,
        ye____originTimes: 0,
        ye____times: 0
    },
    Public: {
        initWhenCreate: function () {
            this.ye____originTimes = this.ye____times;
        },
        update: function (time) {
            if (this.ye____times === 0) {
                this.finish();

                return;
            }
            this.ye____innerAction.update(time);

            if (this.ye____innerAction.isFinish()) {
                this.ye____times -= 1;

                if (this.ye____times !== 0) {
                    this.ye____innerAction.reset();
                }
            }
        },
        copy: function () {
            return YE.Repeat.create(this.ye____innerAction.copy(), this.ye____times);
        },
        reset: function () {
            this.base();

            this.ye____times = this.ye____originTimes;
        },
        start: function () {
            this.base();

            this.ye____innerAction.start();
        },
        stop: function () {
            this.base();

            this.ye____innerAction.stop();
        },
        getInnerActions: function () {
            return [this.ye____innerAction];
        }
    },
    Static: {
        create: function (action, times) {
            var repeat = new this(action, times);

            repeat.initWhenCreate();

            return repeat;
        }
    }
});
YE.RepeatCondition = YYC.Class(YE.Control, {
    Init: function (action, context, conditionFunc) {
        this.base();

        this.ye____innerAction = action;
        this.ye____context = context || window;
        this.ye____conditionFunc = conditionFunc;
    },
    Private: {
        ye____innerAction: null,
        ye____context: null,
        ye____conditionFunc: null
    },
    Public: {
        initWhenCreate: function () {
            YE.error(!this.ye____conditionFunc, "必须传入重复条件");
        },
        update: function (time) {
            if (!!this.ye____conditionFunc.call(this.ye____context) === false || this.ye____innerAction.isFinish()) {
                this.finish();
                return;
            }

            this.ye____innerAction.update(time);
        },
        copy: function () {
            return YE.RepeatCondition.create(this.ye____innerAction.copy(), this.ye____context, this.ye____conditionFunc);
        },
        start: function () {
            this.base();

            this.ye____innerAction.start();
        },
        stop: function () {
            this.base();

            this.ye____innerAction.stop();
        },
        getInnerActions: function () {
            return [this.ye____innerAction];
        }
    },
    Static: {
        create: function (action, context, conditionFunc) {
            var repeat = new this(action, context, conditionFunc);

            repeat.initWhenCreate();

            return repeat;
        }
    }
});
YE.RepeatForever = YYC.Class(YE.Control, {
    Init: function (action) {
        this.base();

        this.ye____innerAction = action;
    },
    Private: {
        ye____innerAction: null
    },
    Public: {
        update: function (time) {
            this.ye____innerAction.update(time);

            if (this.ye____innerAction.isFinish()) {
                this.ye____innerAction.reset();
            }
        },
        isFinish: function () {
            return false;
        },
        copy: function () {
            return YE.RepeatForever.create(this.ye____innerAction.copy());
        },
        start: function () {
            this.base();

            this.ye____innerAction.start();
        },
        stop: function () {
            this.base();

            this.ye____innerAction.stop();
        },
        getInnerActions: function () {
            return [this.ye____innerAction];
        }
    },
    Static: {
        create: function (action) {
            var repeat = new this(action);

            return repeat;
        }
    }
});

YE.Sequence = YYC.Class(YE.Control, {
    Init: function () {
        this.base();
    },
    Private: {
        ye____actions: null,
        ye____currentAction: null,
        ye____actionIndex: -1
    },
    Public: {
        initWhenCreate: function (actionArr) {
            this.ye____actions = YE.Collection.create();

            this.ye____actions.addChilds(actionArr);
            this.ye____currentAction = this.ye____actions.getChildAt(0);
            this.ye____actionIndex = 0;
        },
        update: function (time) {
            if (this.ye____actionIndex === this.ye____actions.getCount()) {
                this.finish();
                return;
            }

            this.ye____currentAction = this.ye____actions.getChildAt(this.ye____actionIndex);

            if (!this.ye____currentAction.isFinish()) {
                this.ye____currentAction.update(time);

                return YE.returnForTest;
            }

            this.ye____actionIndex += 1;

            this.update(time);
        },
        copy: function () {
            var actionArr = [];

            this.ye____actions.forEach(function (action) {
                actionArr.push(action.copy());
            });

            return YE.Sequence.create.apply(YE.Sequence, actionArr);
        },
        reverse: function () {
            this.ye____actions.reverse();

            this.base();

            return this;
        },
        reset: function () {
            this.base();

            this.ye____actionIndex = 0;
            this.ye____actions.map("reset");
        },
        start: function () {
            this.base();

            this.ye____currentAction.start();
        },
        stop: function () {
            this.base();

            this.ye____currentAction.stop();
        },
        getInnerActions: function () {
            return this.ye____actions;
        }
    },
    Static: {
        create: function (actions) {
            var actionArr = null,
                sequence = null;

            YE.assert(arguments.length >= 2, "应该有2个及以上动作");

            actionArr = Array.prototype.slice.call(arguments, 0);

            sequence = new this();
            sequence.initWhenCreate(actionArr);

            return sequence;
        }
    }
});

//
///** Runs actions sequentially, one after another
// * @class
// * @extends cc.ActionInterval
// */
//cc.Sequence = cc.ActionInterval.extend(/** @lends cc.Sequence# */{
//    ye_actions: null,
//    ye_split: null,
//    ye_last: 0,
//
//    /**
//     * Constructor
//     */
//    ctor: function () {
//        this.ye_actions = [];
//    },
//
//    /** initializes the action <br/>
//     * @param {cc.FiniteTimeAction} actionOne
//     * @param {cc.FiniteTimeAction} actionTwo
//     * @return {Boolean}
//     */
//    initOneTwo: function (actionOne, actionTwo) {
//        cc.Assert(actionOne != null, "Sequence.initOneTwo");
//        cc.Assert(actionTwo != null, "Sequence.initOneTwo");
//
//        var one = actionOne.getDuration();
//        var two = actionTwo.getDuration();
//        if (isNaN(one) || isNaN(two)) {
//            console.log(actionOne);
//            console.log(actionTwo);
//        }
//        var d = actionOne.getDuration() + actionTwo.getDuration();
//        this.initWithDuration(d);
//
//        this.ye_actions[0] = actionOne;
//        this.ye_actions[1] = actionTwo;
//
//        return true;
//    },
//
//    /**
//     * @param {cc.Node} target
//     */
//    startWithTarget: function (target) {
//        cc.ActionInterval.prototype.startWithTarget.call(this, target);
//        //this.ye_super(target);
//        this.ye_split = this.ye_actions[0].getDuration() / this.ye_duration;
//        this.ye_last = -1;
//    },
//
//    /**
//     * stop the action
//     */
//    stop: function () {
//        // Issue #1305
//        if (this.ye_last != -1) {
//            this.ye_actions[this.ye_last].stop();
//        }
//        cc.Action.prototype.stop.call(this);
//    },
//
//    /**
//     * @param {Number} time  time in seconds
//     */
//    update: function (time) {
//        var new_t, found = 0;
//        if (time < this.ye_split) {
//            // action[0]
//            //found = 0;
//            new_t = (this.ye_split) ? time / this.ye_split : 1;
//        } else {
//            // action[1]
//            found = 1;
//            new_t = (this.ye_split == 1) ? 1 : (time - this.ye_split) / (1 - this.ye_split);
//
//            if (this.ye_last == -1) {
//                // action[0] was skipped, execute it.
//                this.ye_actions[0].startWithTarget(this.ye_target);
//                this.ye_actions[0].update(1);
//                this.ye_actions[0].stop();
//            }
//            if (!this.ye_last) {
//                // switching to action 1. stop action 0.
//                this.ye_actions[0].update(1);
//                this.ye_actions[0].stop();
//            }
//        }
//
//        if (this.ye_last != found) {
//            this.ye_actions[found].startWithTarget(this.ye_target);
//        }
//        this.ye_actions[found].update(new_t);
//        this.ye_last = found;
//    },
//
//    /**
//     * @return {cc.ActionInterval}
//     */
//    reverse: function () {
//        return cc.Sequence.ye_actionOneTwo(this.ye_actions[1].reverse(), this.ye_actions[0].reverse());
//    },
//
//    /**
//     * to copy object with deep copy.
//     * @return {object}
//     */
//    copy: function () {
//        return cc.Sequence.ye_actionOneTwo(this.ye_actions[0].copy(), this.ye_actions[1].copy());
//    }
//});
///** helper constructor to create an array of sequenceable actions
// * @param {Array|cc.FiniteTimeAction} tempArray
// * @return {cc.FiniteTimeAction}
// * @example
// * // example
// * // create sequence with actions
// * var seq = cc.Sequence.create(act1, act2);
// *
// * // create sequence with array
// * var seq = cc.Sequence.create(actArray);
// */
//cc.Sequence.create = function (/*Multiple Arguments*/tempArray) {
//    var paraArray = (tempArray instanceof Array) ? tempArray : arguments;
//    var prev = paraArray[0];
//    for (var i = 1; i < paraArray.length; i++) {
//        if (paraArray[i]) {
//            prev = cc.Sequence.ye_actionOneTwo(prev, paraArray[i]);
//        }
//    }
//    return prev;
//};
//
///** creates the action
// * @param {cc.FiniteTimeAction} actionOne
// * @param {cc.FiniteTimeAction} actionTwo
// * @return {cc.Sequence}
// * @private
// */
//cc.Sequence.ye_actionOneTwo = function (actionOne, actionTwo) {
//    var sequence = new cc.Sequence();
//    sequence.initOneTwo(actionOne, actionTwo);
//    return sequence;
//};
YE.Spawn = YYC.Class(YE.Control, {
    Init: function (actionArr) {
        this.base();

        this.ye____actions = actionArr;
    },
    Private: {
        ye____actions: null,

        ye____isFinish: function () {
            var isFinish = true;

            this.ye____actions.forEach(function (action, i) {
                if (!action.isFinish()) {
                    isFinish = false;
                    return $break;
                }
            });

            return isFinish;
        },
        ye____iterate: function (method, arg) {
            this.ye____actions.forEach(function (action, i) {
                if (!action.isFinish()) {
                    action[method].apply(action, arg);
                }
            });
        }
    },
    Public: {
        update: function (time) {
            if (this.ye____isFinish()) {
                this.finish();
            }

            this.ye____iterate("update", [time]);
        },
        start: function () {
            this.base();

            this.ye_P_iterate("start");
        },
        copy: function () {
            var actions = [];

            this.ye____actions.forEach(function (action) {
                actions.push(action.copy());
            });
            return YE.Spawn.create.apply(YE.Spawn, actions);
        },
        reverse: function () {
            this.ye____actions.reverse();

            this.base();

            return this;
        },
        stop: function () {
            this.base();

            this.ye_P_iterate("stop");
        },
        reset: function () {
            this.base();

            this.ye_P_iterate("reset");
        },
        getInnerActions: function () {
            return this.ye____actions;
        }
    },
    Static: {
        create: function () {
            var spawn = null;

            YE.assert(arguments.length >= 2, "应该有2个及以上动作");

            spawn = new this(Array.prototype.slice.call(arguments, 0));

            return spawn;
        }
    }
});
(function () {
    var pass = 0,
        stop = 1,
        DIRECTION = 4;  //默认为4方向寻路

    var arr_map = [],
        open_list = [], //创建OpenList
        close_list = [], //创建CloseList
        map_w = null;

    function aCompute(mapData, begin, end) {
        var startTime = null,
            endTime = null,
            d = new Date(),
            time = null,
            beginx = null,
            beginy = null,
            endx = null,
            endy = null,
            arr_path_out = [],
            arr_path = [],
            stopn = 0,
            tmp = [],

            startTime = d.getTime();


        /********************函数主体部分*************************/
        map_w = mapData.length;
        arr_map = setMap(mapData);
        beginx = begin[0];
        beginy = map_w - 1 - begin[1];
        endx = end[0];
        endy = map_w - 1 - end[1];
        var startNodeNum = tile_num(beginx, beginy);
        var targetNodeNum = tile_num(endx, endy);

        if (arr_map[targetNodeNum] && arr_map[targetNodeNum][0] == 0) {
//            showError("目的地无法到达");
            time = getTime(startTime);
            return { path: [], time: time, info: "目的地无法到达" };
        }
        if (arr_map[startNodeNum][0] == 0) {
//            showError("起始点不可用");
            time = getTime(startTime);
            return { path: [], time: time, info: "起始点不可用" };
        }

        if (arr_map[targetNodeNum] && arr_map[targetNodeNum][0] * arr_map[startNodeNum][0] == 1) {
            arr_map[startNodeNum] = [arr_map[startNodeNum][0], startNodeNum, arr_map[startNodeNum][2], arr_map[startNodeNum][3], arr_map[startNodeNum][4]];//起始点的父节点为自己
            setH(targetNodeNum);
            setOpenList(startNodeNum); //把开始节点加入到openlist中
            //就要开始那个令人发指的循环了，==！！A*算法主体

            while (open_list.length != 0) {
                var bestNodeNum = selectFmin(open_list);
                stopn = 0;
                open_list.shift();
                setCloseList(bestNodeNum);

                if (bestNodeNum == targetNodeNum) {
                    showPath(close_list, arr_path, arr_path_out);
                    break;
                }
                var i = 0, j = 0;
                //当目标为孤岛时的判断
                var tmp0 = new Array();
                var k;
                tmp0 = setSuccessorNode(targetNodeNum, map_w);
                for (j; j < 9; j++) {
                    if (j == 8) {
                        k = 0;
                        break;
                    }
                    if (tmp0[j][0] == 1) {
                        k = 1;
                        break;
                    }
                }
                //当目标为孤岛时的判断语句结束
                if (k == 0) {
//                    showError("目标成孤岛!");
                    time = getTime(startTime);
                    return { path: [], time: time, info: "目标成孤岛"  };
                }
                else {
                    tmp = setSuccessorNode(bestNodeNum, map_w);
                    for (i; i < 8; i++) {
                        if ((tmp[i][0] == 0) || (findInCloseList(tmp[i][4]))) continue;

                        if (findInOpenList(tmp[i][4]) == 1) {
                            if (tmp[i][2] >= (arr_map[bestNodeNum][2] + cost(tmp[i], bestNodeNum))) {
                                setG(tmp[i][4], bestNodeNum); //算g值，修改arr_map中[2]的值
                                arr_map[tmp[i][4]] = tmp[i] = [arr_map[tmp[i][4]][0], bestNodeNum, arr_map[tmp[i][4]][2], arr_map[tmp[i][4]][3], arr_map[tmp[i][4]][4]]; //修改tmp和arr_map中父节点的值，并修改tmp中g值，是之和arr_map中对应节点的值统一
                            }
                        }
                        if (findInOpenList(tmp[i][4]) == 0) {
                            setG(tmp[i][4], bestNodeNum); //算g值，修改arr_map中[2]的值
                            arr_map[tmp[i][4]] = tmp[i] = [arr_map[tmp[i][4]][0], bestNodeNum, arr_map[tmp[i][4]][2], arr_map[tmp[i][4]][3], arr_map[tmp[i][4]][4]]; //修改tmp和arr_map中父节点的值，并修改tmp中g值，是之和arr_map中对应节点的值统一
                            setOpenList(tmp[i][4]); //存进openlist中

                        }
                    }
                }

                stopn++;
                //if (stopn == map_w * map_w - 1) {     //2013.5.27修改
                if (stopn == map_w * map_w * 1000) {
//                    showError("找不到路径!");
                    time = getTime(startTime);
                    return { path: [], time: time, info: "找不到路径"  };

                    //                break;
                }
            }


            if (open_list.length == 0 && bestNodeNum != targetNodeNum) {
//                showError("没有找到路径！！");   //对于那种找不到路径的点的处理
                time = getTime(startTime);
                return { path: [], time: time, info: "找不到路径" };
            }
        }

        time = getTime(startTime);

        return { path: arr_path_out, time: time };

    }

    function getTime(startTime) {
        /***显示运行时间********/
        var endTime = new Date().getTime();
        return (endTime - startTime) / 1000;
    };


    function showError(error) {
        console.log(error);
    };


    /**********************************************************************
     *function setMap(n)
     *功能：把外部的地图数据抽象成该算法中可操作数组的形式来输入算法
     *参数：n为地图的宽度，生成方阵地图
     ************************************************************************/
    function setMap(mapData) {
//        var map_w = mapData.length;
        var m = map_w * map_w;

        var arr_map0 = new Array(); //该函数对地图数据转换的操作数组
        var a = m - 1;
        for (a; a >= 0; a--) {
            var xTmp = tile_x(a); //把ID 编号值转换为x坐标值，用来对应读入地图数据
            var yTmp = map_w - 1 - tile_y(a); //把ID 编号值转换为y坐标值，用来对应读入地图数据,对应数组标号和我自定义xoy坐标位置

            //[cost,parent,g,h,id]
            if (mapData[yTmp][xTmp] == pass)
                arr_map0[a] = [1, 0, 0, 0, a];
            else
                arr_map0[a] = [0, 0, 0, 0, a];


        }

        return arr_map0;
    }

    /*********************************************************************
     *以下三个函数是地图上的编号与数组索引转换
     *function tile_num(x,y)
     *功能：将 x,y 坐标转换为地图上块的编号
     *function tile_x(n)
     *功能：由块编号得出 x 坐标
     *function tile_y(n)
     *功能：由块编号得出 y 坐标
     ******************************************************************/
    function tile_num(x, y) {
        return ((y) * map_w + (x));
    }

    function tile_x(n) {
        return (parseInt((n) % map_w));
    }

    function tile_y(n) {
        return (parseInt((n) / map_w));
    }

    /*********************************************************************
     *function setH(targetNode)
     *功能：初始化所有点H的值
     *参数：targetNode目标节点
     **********************************************************************/
    function setH(targetNode) {

        var x0 = tile_x(targetNode);
        var y0 = tile_y(targetNode);
        var i = 0;
        for (i; i < arr_map.length; i++) {
            var x1 = tile_x(i);
            var y1 = tile_y(i);
            /*****欧几里德距离********************************/
            // var h = (Math.sqrt((parseInt(x0) - parseInt(x1)) * (parseInt(x0) - parseInt(x1))) + Math.sqrt((parseInt(y0) - parseInt(y1)) * (parseInt(y0) - parseInt(y1))));
            /*****对角线距离********************************/
            var h = Math.max(Math.abs(parseInt(x0) - parseInt(x1)), Math.abs(parseInt(y0) - parseInt(y1)));
            /*****曼哈顿距离********************************/
                // var h=Math.abs(parseInt(x0) - parseInt(x1))+Math.abs(parseInt(y0) - parseInt(y1));
            arr_map[i][3] = h * parseInt(10);
        }
    }

    /*********************************************************************
     *function setG(nowNode,bestNode)
     *功能：计算现节点G的值
     *参数：nowNode现节点，bestNode其父节点
     **********************************************************************/
    function setG(nowNode, bestNode) {
        var x0 = tile_x(bestNode);
        var y0 = tile_y(bestNode);
        var x1 = tile_x(nowNode);
        var y1 = tile_y(nowNode);
        if (((x0 - x1) == 0) || ((y0 - y1) == 0)) {
            arr_map[nowNode] = [arr_map[nowNode][0], arr_map[nowNode][1], arr_map[nowNode][2] + parseInt(10), arr_map[nowNode][3], arr_map[nowNode][4]];

        }
        else {

            arr_map[nowNode] = [arr_map[nowNode][0], arr_map[nowNode][1], arr_map[nowNode][2] + parseInt(14), arr_map[nowNode][3], arr_map[nowNode][4]];
        }
    }

    /*********************************************************************
     *function selectFmin(open_list)
     *功能：在openlist中对f值进行排序(冒泡排序)，并选择一个f值最小的节点返回
     *参数：openlist
     ***********************************************************************/
    function selectFmin(open_list) {
        var i, j, min, temp;
        for (i = 0; i < open_list.length; i++) {
            for (j = i + 1; j < open_list.length; j++) {
                if ((open_list[i][2] + open_list[i][3]) > (open_list[j][2] + open_list[j][3])) {
                    temp = open_list[i];
                    open_list[i] = open_list[j];
                    open_list[j] = temp;
                }
            }
        }
        var min = open_list[0];
        return min[4];
    }

    /***********************************************************************
     *function setOpenList(NodeNum)
     *功能：把节点加入open表中
     *参数：待加入openlist的节点的编号
     ************************************************************************/
    function setOpenList(NodeNum) {
        var n = open_list.length;
        open_list[n] = [arr_map[NodeNum][0], arr_map[NodeNum][1], arr_map[NodeNum][2], arr_map[NodeNum][3], arr_map[NodeNum][4]];
    }

    /***********************************************************************
     *function setCloseList(NodeNum)
     *功能：把节点加入close表中
     *参数：待加入closelist的节点的编号
     ************************************************************************/
    function setCloseList(NodeNum) {
        var n = close_list.length;
        close_list[n] = [arr_map[NodeNum][0], arr_map[NodeNum][1], arr_map[NodeNum][2], arr_map[NodeNum][3], arr_map[NodeNum][4]];
    }

    /***********************************************************************
     *function findInOpenList(nowNodeNum)
     *功能：查询当前节点是否在openlist中，找到返回1，找不到返回0
     *参数：待查询的节点的编号
     ************************************************************************/
    function findInOpenList(nowNodeNum) {
        var i;
        for (i = 0; i < open_list.length; i++) {

            if (open_list[i][4] == nowNodeNum)
                return 1;
        }
        return 0;
    }

    /***********************************************************************
     *function findInCloseList(nowNodeNum)
     *功能：查询当前节点是否在closelist中，找到返回1，找不到返回0
     *参数：待查询的节点的编号
     ************************************************************************/
    function findInCloseList(nowNodeNum) {
        var i;
        for (i = 0; i < close_list.length; i++) {
            if (close_list[i][4] == nowNodeNum)
                return 1;
            else return 0;
        }
    }

    /***********************************************************************
     *function cost(SuccessorNodeNum,bestNodeNum)
     *功能：现节点到达周围节点的代价
     *参数：SuccessorNodeNum周围节点编号，bestNodeNum现节点
     ************************************************************************/
    function cost(SuccessorNodeNum, bestNodeNum) {
        var x0 = tile_x(bestNodeNum);
        var y0 = tile_y(bestNodeNum);
        var x1 = tile_x(SuccessorNodeNum);
        var y1 = tile_y(SuccessorNodeNum);
        if (((x0 - x1) == 0) || ((y0 - y1) == 0)) {
            return 10;
        }
        else
            return 14;
    }

    /**********************************************************************
     *function setSuccessorNode(bestNodeNum,map_w)
     *功能：把现节点的周围8个节点放入预先准备好的临时arr中以备检察
     *参数：现节点的编号
     035
     1 6
     247
     周围八个点的排序
     ***********************************************************************/
    function setSuccessorNode(bestNodeNum, n) {
        var x0 = tile_x(bestNodeNum);
        var y0 = tile_y(bestNodeNum);
        var m = n - 1;
        var tmp = [];

        if ((x0 - 1) >= 0 && (y0) >= 0 && (x0 - 1) <= m && (y0) <= m) tmp[1] = [arr_map[tile_num(x0 - 1, y0)][0], arr_map[tile_num(x0 - 1, y0)][1], arr_map[tile_num(x0 - 1, y0)][2], arr_map[tile_num(x0 - 1, y0)][3], arr_map[tile_num(x0 - 1, y0)][4]]; else {
            tmp[1] = [0, 0, 0, 0, 0];
        }
        if ((x0) >= 0 && (y0 + 1) >= 0 && (x0) <= m && (y0 + 1) <= m) tmp[3] = [arr_map[tile_num(x0, y0 + 1)][0], arr_map[tile_num(x0, y0 + 1)][1], arr_map[tile_num(x0, y0 + 1)][2], arr_map[tile_num(x0, y0 + 1)][3], arr_map[tile_num(x0, y0 + 1)][4]]; else {
            tmp[3] = [0, 0, 0, 0, 0];
        }
        if ((x0) >= 0 && (y0 - 1) >= 0 && (x0) <= m && (y0 - 1) <= m) tmp[4] = [arr_map[tile_num(x0, y0 - 1)][0], arr_map[tile_num(x0, y0 - 1)][1], arr_map[tile_num(x0, y0 - 1)][2], arr_map[tile_num(x0, y0 - 1)][3], arr_map[tile_num(x0, y0 - 1)][4]]; else {
            tmp[4] = [0, 0, 0, 0, 0];
        }
        if ((x0 + 1) >= 0 && (y0) >= 0 && (x0 + 1) <= m && (y0) <= m) tmp[6] = [arr_map[tile_num(x0 + 1, y0)][0], arr_map[tile_num(x0 + 1, y0)][1], arr_map[tile_num(x0 + 1, y0)][2], arr_map[tile_num(x0 + 1, y0)][3], arr_map[tile_num(x0 + 1, y0)][4]]; else {
            tmp[6] = [0, 0, 0, 0, 0];
        }
        if (DIRECTION == 8) {
            if ((x0 - 1) >= 0 && (y0 + 1) >= 0 && (x0 - 1) <= m && (y0 + 1) <= m) tmp[0] = [arr_map[tile_num(x0 - 1, y0 + 1)][0], arr_map[tile_num(x0 - 1, y0 + 1)][1], arr_map[tile_num(x0 - 1, y0 + 1)][2], arr_map[tile_num(x0 - 1, y0 + 1)][3], arr_map[tile_num(x0 - 1, y0 + 1)][4]]; else {
                tmp[0] = [0, 0, 0, 0, 0];
            }

            if ((x0 - 1) >= 0 && (y0 - 1) >= 0 && (x0 - 1) <= m && (y0 - 1) <= m) tmp[2] = [arr_map[tile_num(x0 - 1, y0 - 1)][0], arr_map[tile_num(x0 - 1, y0 - 1)][1], arr_map[tile_num(x0 - 1, y0 - 1)][2], arr_map[tile_num(x0 - 1, y0 - 1)][3], arr_map[tile_num(x0 - 1, y0 - 1)][4]]; else {
                tmp[2] = [0, 0, 0, 0, 0];
            }

            if ((x0 + 1) >= 0 && (y0 + 1) >= 0 && (x0 + 1) <= m && (y0 + 1) <= m) tmp[5] = [arr_map[tile_num(x0 + 1, y0 + 1)][0], arr_map[tile_num(x0 + 1, y0 + 1)][1], arr_map[tile_num(x0 + 1, y0 + 1)][2], arr_map[tile_num(x0 + 1, y0 + 1)][3], arr_map[tile_num(x0 + 1, y0 + 1)][4]]; else {
                tmp[5] = [0, 0, 0, 0, 0];
            }

            if ((x0 + 1) >= 0 && (y0 - 1) >= 0 && (x0 + 1) <= m && (y0 - 1) <= m) tmp[7] = [arr_map[tile_num(x0 + 1, y0 - 1)][0], arr_map[tile_num(x0 + 1, y0 - 1)][1], arr_map[tile_num(x0 + 1, y0 - 1)][2], arr_map[tile_num(x0 + 1, y0 - 1)][3], arr_map[tile_num(x0 + 1, y0 - 1)][4]]; else {
                tmp[7] = [0, 0, 0, 0, 0];
            }

        }
        if (DIRECTION == 4) {
            tmp[0] = [0, 0, 0, 0, 0];
            tmp[2] = [0, 0, 0, 0, 0];
            tmp[5] = [0, 0, 0, 0, 0];
            tmp[7] = [0, 0, 0, 0, 0];
        }

        return tmp;
    }

    /*******************************************************************
     *function showPath(close_list)
     *功能：把结果路径存入arr_path输出
     *参数：close_list
     ********************************************************************/
    function showPath(close_list, arr_path, arr_path_out) {
        var n = close_list.length;
        var i = n - 1;
        var ii = 0;
        var nn = 0;
        var mm = 0;


        var arr_path_tmp = new Array();
        var target = null;

        /**********把close_list中有用的点存入arr_path_tmp中*************/

        for (ii; ; ii++) {
            arr_path_tmp[ii] = close_list[n - 1][4];
            if (close_list[n - 1][1] == close_list[i][4]) {
                break;
            }
            for (i = n - 1; i >= 0; i--) {
                if (close_list[i][4] == close_list[n - 1][1]) {
                    n = i + 1;
                    break;
                }
            }
        }

        var w = arr_path_tmp.length - 1;
        var j = 0;
        for (var i = w; i >= 0; i--) {
            arr_path[j] = arr_path_tmp[i];
            j++;
        }
        for (var k = 0; k <= w; k++) {
            target = [
                tile_x(arr_path[k]),
                map_w - 1 - tile_y(arr_path[k])
            ];
            arr_path_out.push(target);
        }
        arr_path_out.shift();
    }

    function _reset() {
        arr_map = [];
        map_w = null;

        open_list = []; //创建OpenList
        close_list = []; //创建CloseList
    };


    namespace("YE").AStar = {
        aCompute: function (terrainData, begin, end) {
            _reset();
            return aCompute(terrainData, begin, end);
        },
        /**
         * 设置寻路方向
         * @param direction 4或者8
         */
        setDirection: function (direction) {
            DIRECTION = direction;
        }
    };
}());

YE.collision = (function () {
    //获得精灵的碰撞区域,
    function _getCollideRect(obj) {
        return {
            x1: obj.origin.x,
            y1: obj.origin.y,
            x2: obj.origin.x + obj.size.width,
            y2: obj.origin.y + obj.size.height
        }
    }

    return {
        /**
         *矩形间的碰撞检测
         **/
        col_Between_Rects: function (rect1, rect2) {
            var rect1 = _getCollideRect(rect1);
            var rect2 = _getCollideRect(rect2);

            //如果碰撞，则返回true
            if (rect1 && rect2 &&
                !(rect1.x1 >= rect2.x2 || rect1.y1 >= rect2.y2 || rect1.x2 <= rect2.x1 || rect1.y2 <= rect2.y1)) {
                return true;
            }
            return false;
        }
    };
}());


(function () {
    YE.Animation = YYC.Class(YE.Entity, {
        Init: function (frames, config) {
            this.base();

            this.ye_frames = frames;
            this.ye_config = config;
        },
        Private: {
            ye_frames: null,
            ye_config: null
        },
        Public: {
            initWhenCreate: function () {
                var bitmap = this.ye_frames[0].getBitmap(),
                    pixelOffsetX = this.ye_config.pixelOffsetX || 0,
                    pixelOffsetY = this.ye_config.pixelOffsetY || 0;

                if (this.ye_config.flipX) {
                    bitmap.setFlipX();
                }
                if (this.ye_config.flipY) {
                    bitmap.setFlipY();
                }
                bitmap.setAnchor(pixelOffsetX, pixelOffsetY);

                this.ye_frames.forEach(function (frame) {
                    frame.setBitmap(bitmap);
                });
            },
            copy: function () {
                var frames = [];

                this.ye_frames.forEach(function (frame) {
                    frames.push(frame.copy());
                });

                return YE.Animation.create(frames, YE.Tool.extend.extend({}, this.ye_config));
            },
            getFrames: function () {
                return this.ye_frames;
            },
            getDurationPerFrame: function () {
                return this.ye_config.duration;
            },
            getAnimSize: function () {
                return  this.ye_config.size;
            },
            setFrameIndex: function (frames) {
                frames.forEach(function (frame, index) {
                    frame.index = index;
                });
            }
        },
        Static: {
            create: function (frames, config) {
                var animation = new this(frames, config);

                animation.initWhenCreate();

                return animation;
            }
        }
    });
}());
(function () {
    var _instance = null;

    YE.AnimationCache = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();

            this.ye_animations = YE.Hash.create();
        },
        Private: {
            ye_animations: null,


            ye_buildFrameName: function (animPrex, numberLen, index) {
                index = index.toString();

                while (index.length < numberLen) {
                    index = "0" + index;
                }
                return animPrex + index;
            }
        },
        Public: {
            createAnim: function (startFrameName, endFrameName, animData) {
                var startIndex = null,
                    endIndex = null,
                    animPrex = null,
                    numberLen = 0,
                    animFrames = [],
                    animation = null,
                    animate = null,
                    frames = null,
                    _animData = {
                        duration: 0.1,
                        flipX: false,
                        flipY: false,
                        pixelOffsetX: 0,
                        pixelOffsetY: 0,
                        repeatNum: -1,
                        width: null,
                        height: null
                    } ,
                    i = 0;

                if (arguments.length === 1) {
                    frames = arguments[0].frames;
                    YE.Tool.extend.extendExist(_animData, arguments[0]);

                    frames.forEach(function (frame) {
                        animFrames.push(YE.FrameCache.getInstance().getFrame(frame));
                    });
                }
                else if (arguments.length === 2) {
                    animFrames = [YE.FrameCache.getInstance().getFrame(arguments[0])];
                    YE.Tool.extend.extendExist(_animData, arguments[1]);
                }
                else if (arguments.length === 3) {
                    startIndex = startFrameName.substring(startFrameName.search(/\d+$/), startFrameName.length);
                    endIndex = endFrameName.substring(endFrameName.search(/\d+$/), endFrameName.length);
                    animPrex = startFrameName.substring(0, startFrameName.search(/\d+$/));
                    numberLen = startIndex.length;


                    startIndex = Number(startIndex);
                    endIndex = Number(endIndex);

                    for (i = startIndex; i <= endIndex; i++) {
                        animFrames.push(YE.FrameCache.getInstance().getFrame(this.ye_buildFrameName(animPrex, numberLen, i)));
                    }

                    YE.Tool.extend.extendExist(_animData, animData);
                }

                animation = YE.Animation.create(animFrames, {
                    duration: _animData.duration,
                    flipX: _animData.flipX,
                    flipY: _animData.flipY,
                    pixelOffsetX: _animData.pixelOffsetX,
                    pixelOffsetY: _animData.pixelOffsetY,
                    size: {width: _animData.width, height: _animData.height }
                });

                if (_animData.repeatNum === -1) {
                    animate = YE.RepeatForever.create(YE.Animate.create(animation));
                }
                else {
                    animate = YE.Repeat.create(YE.Animate.create(animation), _animData.repeatNum);
                }

                return animate;
            },
            addAnim: function (animName, anim) {
                this.ye_animations.addChild(animName, anim);
            },
            addAnimWithFile: function (jsonFilePath) {
                var jsonData = null,
                    i = null;

                jsonData = YE.JsonLoader.getInstance().get(jsonFilePath);

                for (i in jsonData) {
                    if (jsonData.hasOwnProperty(i)) {
                        this.addAnim(i, this.createAnim(jsonData[i]));
                    }
                }
            },
            removeAnim: function (animName) {
                this.ye_animations.removeChild(animName);
            },
            getAnim: function (animName) {
                return this.ye_animations.getValue(animName);
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    YE.AnimationFrame = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();

            this.ye_spriteFrames = YE.Hash.create();
        },
        Private: {
            ye_spriteFrames: null
        },
        Public: {
            getAnims: function () {
                return this.ye_spriteFrames.getChilds();
            },
            getAnim: function (animName) {
                return this.ye_spriteFrames.getValue(animName);
            },
            addAnim: function (animName, anim) {
//                YE.assert(this.ye_spriteFrames[animName] === undefined, "该动画已存在");
                this.ye_spriteFrames.addChild(animName, anim);
            }
        },
        Static: {
            create: function () {
                return new this();
            }
        }
    });
}());
YE.AnimationFrameManager = YYC.Class(YE.Entity, {
    Init: function () {
        this.ye_animationFrame = YE.AnimationFrame.create();
    },
    Private: {
        ye_animationFrame: null
    },
    Public: {
        initAndReturnAnim: function (animName, tag) {
            var anim = null;

            if (YE.Tool.judge.isString(arguments[0])) {
                anim = this.getAnim(arguments[0]);
            }
            else {
                anim = arguments[0];
            }

            if (tag) {
                anim.setTag(tag);
            }

            anim.start();

            return anim;
        },
        stopAnim: function (animName) {
            this.getAnim(animName).stop();
        },
        startAnim: function (animName) {
            this.getAnim(animName).start();
        },
        getAnim: function (animName) {
            return this.ye_animationFrame.getAnim(animName);
        },
        getAnims: function () {
            return this.ye_animationFrame.getAnims();
        },
        addAnim: function (animName, anim) {
            anim.setTag(animName);
            this.ye_animationFrame.addAnim(animName, anim);
        },
        resetAnim: function (animName) {
            this.getAnim(animName).reset();
        }
    },
    Static: {
        create: function () {
            return new this();
        }
    }
});

YE.AnimationManager = YYC.Class(YE.CollectionManager, {
    Init: function () {
        this.base();
    },
    Public: {
    },
    Static: {
        create: function () {
            return new this();
        }
    }
});

(function () {
    YE.Frame = YYC.Class(YE.Entity, {
        Init: function (bitmap, rect) {
            this.base();

            this.ye_bitmap = bitmap;
            this.ye_rect = rect;
        },
        Private: {
            ye_bitmap: null,
            ye_rect: {}
        },
        Public: {
            index: -1,

            getImg: function () {
                return this.getBitmap().img;
            },
            getBitmap: function () {
                return this.ye_bitmap;
            },
            setBitmap: function (bitmap) {
                this.ye_bitmap = bitmap;
            },
            getPixelOffsetX: function () {
                return this.getBitmap().pixelOffsetX;
            },
            getPixelOffsetY: function () {
                return this.getBitmap().pixelOffsetY;
            },
            setAnchor: function (pixelOffsetX, pixelOffsetY) {
                this.getBitmap().setAnchor(pixelOffsetX, pixelOffsetY);
            },
            setFlipX: function () {
                this.getBitmap().setFlipX();
            },
            setFlipY: function () {
                this.getBitmap().setFlipY();
            },
            isFlipX: function () {
                return this.getBitmap().isFlipX();
            },
            isFlipY: function () {
                return this.getBitmap().isFlipY();
            },
            getX: function () {
                return this.ye_rect.origin.x;
            },
            getY: function () {
                return this.ye_rect.origin.y;
            },
            getWidth: function () {
                return this.ye_rect.size.width;
            },
            getHeight: function () {
                return this.ye_rect.size.height;
            },
            copy: function () {
                return YE.Frame.create(this.getBitmap().copy(), this.ye_rect);
            }
        },
        Static: {
            create: function (bitmap, rect) {
                return new this(bitmap, rect);
            }
        }
    });
}());

(function () {
    var _instance = null;

    YE.FrameCache = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();

            this._frames = YE.Hash.create();
            this._flags = YE.Hash.create();
        },
        Private: {
            _frames: null,
            _flags: null,

            _createFrameAndAddToDict: function (img, frames) {
                var frameData = null,
                    frame = null,
                    bitmap = YE.Bitmap.create(img);

                for (var key in frames) {
                    if (frames.hasOwnProperty(key)) {
                        if (this._frames.hasChild(key)) {
                            continue;
                        }
                        frameData = frames[key];
                        frame = YE.Frame.create(bitmap, YE.rect(frameData[0], frameData[1], frameData[2], frameData[3]));

                        this._frames.addChild(key, frame);
                    }
                }
            },
            _hasFrameData: function (jsonFilePath, imgPath) {
                var key = jsonFilePath + "_" + imgPath;
                if (this._flags.hasChild(key)) {
                    return true;
                }

                this._flags.addChild(key, 1);
                return false;
            }
        },
        Public: {
            addFrameData: function (jsonFilePath, imgPath) {
                var img = null,
                    jsonData = null;

                if (this._hasFrameData(jsonFilePath, imgPath)) {
                    return YE.returnForTest;
                }

                img = YE.ImgLoader.getInstance().get(imgPath);
                jsonData = YE.JsonLoader.getInstance().get(jsonFilePath);

                YE.error(img === undefined, imgPath + "不存在");
                YE.error(jsonData === undefined, jsonFilePath + "不存在");

                this._createFrameAndAddToDict(img, jsonData.frames);
            },
            getFrame: function (imgName) {
                var frame = this._frames.getValue(imgName);

                if (frame) {
                    return frame.copy();
                }
                return null;
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var _instance = null;

    var GameStatus = {
        NORMAL: 0,
        PAUSE: 1,
        END: 2
    };

    var LoopType = {
        NONE: 0,
        REQUESTANIMATIONFRAME: 1,
        INTERVAL: 2
    };

    YE.Director = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();
        },
        Private: {
            ye_STARTING_FPS: 60,

            ye_startTime: 0,
            ye_lastTime: 0,

            ye_fps: 0,
            ye_loopInterval: 0,
            ye_lastLoopInterval: 0,

            ye_currentScene: null,

            ye_loopId: null,
            //主循环类型
            ye_loopType: null,

            ye_isRequestAnimFrameLoopAdded: false,

            //内部游戏状态
            ye_gameStatus: null,
            //计时器序号
            ye_timerIndex: 0,

            ye_endLoop: false,


            ye_getTimeNow: function () {
                return +new Date();
            },
            ye_loopBody: function (time) {
                this.ye_tick(time);

                this.ye_currentScene.startLoop();
                this.ye_currentScene.run();
                this.ye_currentScene.endLoop();
            },
            ye_tick: function (time) {
                this.ye_updateFps(time);
                this.gameTime = (this.ye_getTimeNow() - this.ye_startTime) / 1000;
                this.ye_lastTime = time;
            },
            ye_updateFps: function (time) {
                if (this.ye_loopType === LoopType.INTERVAL) {
                    this.ye_fps = 1 / this.ye_loopInterval;
                    return;
                }

                if (this.ye_lastTime === 0) {
                    this.ye_fps = this.ye_STARTING_FPS;
                }
                else {
                    this.ye_fps = 1000 / (time - this.ye_lastTime);
                }
            },
            ye_isToUseIntervalLoop: function () {
                return this.ye_loopInterval !== 1 / this.ye_STARTING_FPS;
            },
            ye_startLoop: function () {
                var self = this,
                    mainLoop = null;

                if (this.ye_isToUseIntervalLoop()) {
                    this.ye_loopId = window.setInterval(function mainLoop() {
                        self.ye_loopBody(self.ye_getTimeNow());
                    }, this.ye_loopInterval * 1000);

                    this.ye_loopType = LoopType.INTERVAL;
                }
                else {
                    this.ye_endLoop = false;

                    if (this.ye_isRequestAnimFrameLoopAdded) {
                        return YE.returnForTest;
                    }

                    mainLoop = function (time) {
                        self.ye_loopBody(time);

                        if (self.ye_endLoop) {
                            self.ye_isRequestAnimFrameLoopAdded = false;
                            return;
                        }

                        self.ye_loopId = window.requestNextAnimationFrame(mainLoop);
                    };
                    this.ye_loopId = window.requestNextAnimationFrame(mainLoop);
                    this.ye_loopType = LoopType.REQUESTANIMATIONFRAME;
                }

                this.ye_isRequestAnimFrameLoopAdded = true;
            },
            ye_endNextLoop: function () {
                window.clearInterval(this.ye_loopId);
                this.ye_endLoop = true;
            },
            ye_restart: function () {
                this.ye_endNextLoop();
                this.ye_startLoop();
            }
        },
        Public: {
            //游戏运行时间，单位为秒
            gameTime: 0,

            initWhenCreate: function () {
                this.ye_loopInterval = 1 / this.ye_STARTING_FPS;
            },
            runWithScene: function (scene) {
                scene.init(this);
                this.setCurrentScene(scene);

                this.ye_startTime = this.ye_getTimeNow();
                this.ye_gameStatus = GameStatus.NORMAL;

                this.ye_startLoop();
            },
            setCurrentScene: function (scene) {
                if (this.ye_currentScene) {
                    this.ye_currentScene.onExit();
                }

                this.ye_currentScene = scene;
                scene.onEnter();
            },
            getCurrentScene: function () {
                return this.ye_currentScene;
            },
            getFps: function () {
                return this.ye_fps;
            },
            getPixPerFrame: function (speed) {
                if (YE.main.getConfig().isDebug) {
                    return speed / this.ye_STARTING_FPS;
                }

                return speed / this.ye_fps;
            },
            end: function () {
                this.ye_endNextLoop();
                this.ye_gameStatus = GameStatus.END;
                YE.Tool.asyn.clearAllTimer(this.ye_timerIndex);
            },
            pause: function () {
                if (this.ye_gameStatus === GameStatus.PAUSE) {
                    return YE.returnForTest;
                }

                ////降低cpu消耗
                //this.setLoopIntervalAndRestart(1);

                this.ye_lastLoopInterval = this.ye_loopInterval;
                this.ye_endNextLoop();
                this.ye_gameStatus = GameStatus.PAUSE;
            },
            resume: function () {
                if (this.ye_gameStatus !== GameStatus.PAUSE) {
                    return YE.returnForTest;
                }

                this.ye_loopInterval = this.ye_lastLoopInterval;
                this.ye_restart();
                this.ye_gameStatus = GameStatus.NORMAL;
            },
            /**
             * 设置主循环间隔时间
             * @param interval 间隔时间（单位为秒）
             */
            setLoopIntervalAndRestart: function (interval) {
                this.ye_loopInterval = interval;
                this.ye_restart();
            },
            resumeRequestAnimFrameLoop: function () {
                this.ye_loopInterval = 1 / this.ye_STARTING_FPS;
                this.ye_restart();
            },
            /**
             * 设置定时器起始序号，用于stop中清除所有定时器
             * @param index
             */
            setTimerIndex: function (index) {
                this.ye_timerIndex = index;
            },

            //*供测试使用
            forTest_getGameStatus: function () {
                return GameStatus;
            },
            forTest_getLoopType: function () {
                return LoopType;
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                    _instance.initWhenCreate();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var State = {
        NORMAL: 0,
        CHANGE: 1
    };

    YE.Layer = YYC.AClass(YE.NodeContainer, {
        Init: function (id, position) {
            this.base();

            id && this.setCanvasById(id);
            position && this.setPosition(position.x, position.y);

            if (!id && position) {
                YE.error("请传入画布id");
            }

            if (this.isChange()) {
                this.ye___state = State.CHANGE;
            }
            else {
                this.ye___state = State.NORMAL;
            }
        },
        Private: {
            ye___graphics: null,
            ye___state: null,
            ye___context: null,
            ye___canvas: null,
            ye___runInterval: -1,
            ye___lastTime: 0,

            ye___getContext: function () {
                this.ye___context = this.ye___canvas.getContext("2d");
            },
            ye___isChange: function () {
                return this.ye___state === State.CHANGE;
            },
            ye___isNormal: function () {
                return this.ye___state === State.NORMAL;
            },
            ye___clearCanvas: function () {
                var canvasData = this.getCanvasData();

                this.ye___context.clearRect(0, 0, canvasData.width, canvasData.height);
            },
            ye___getDurationFromLastLoop: function () {
                return this.ye___getTimeNow() - this.ye___lastTime;
            },
            ye___getTimeNow: function () {
                return +new Date();
            },
            ye___isTimeToRun: function () {
                return this.ye___getDurationFromLastLoop() >= this.ye___runInterval * 1000;
            }
        },
        Protected: {
            ye_P_run: function () {
                this.iterate("update");

                if (this.ye___isChange()) {
                    this.clear();
                    this.iterate("onBeforeDraw", [this.getContext()]);
                    this.draw(this.getContext());
                    this.iterate("onAfterDraw", [this.getContext()]);
                    this.setStateNormal();
                }

                this.change();
            }
        },
        Public: {
            setStateNormal: function () {
                this.ye___state = State.NORMAL;
            },
            setStateChange: function () {
                this.ye___state = State.CHANGE;
            },
            setZIndex: function (zIndex) {
                this.ye___canvas.style.zIndex = zIndex;
            },
            getZIndex: function () {
                return Number(this.ye___canvas.style.zIndex);
            },
            setCanvasById: function (canvasID) {
                var canvas = document.getElementById(canvasID);

                YE.error(!canvas, "没有找到" + canvasID);

                this.ye___canvas = canvas;
                this.ye___getContext();
            },
            setWidth: function (width) {
                this.ye___canvas.width = width;
            },
            setHeight: function (height) {
                this.ye___canvas.height = height;
            },
            setPosition: function (x, y, position) {
                this.ye___canvas.style.position = position || "absolute";
                this.ye___canvas.style.top = y.toString() + "px";
                this.ye___canvas.style.left = x.toString() + "px";
            },
            getContext: function () {
                return this.ye___context;
            },
            getGraphics: function () {
                if (!this.ye___graphics) {
                    this.ye___graphics = YE.Graphics.create(this.getContext());
                }
//                else {
//                    this.ye___graphics.setContext(this.getContext());
//                }

                return this.ye___graphics;
            },
            change: function () {
                if (this.isChange() === true) {
                    this.setStateChange();
                }
                else {
                    this.setStateNormal();
                }
            },
            getCanvasData: function () {
                return {
                    width: this.ye___canvas.width,
                    height: this.ye___canvas.height
                }
            },
            isSetRunInterval: function () {
                return this.ye___runInterval !== -1;
            },
            /**
             * 设置调用run的间隔时间
             * @param interval 间隔时间（单位为秒）
             */
            setRunInterval: function (interval) {
                this.ye___runInterval = interval;
                this.ye___lastTime = this.ye___getTimeNow();
            },
            changeRunInterval: function (interval) {
                this.ye___runInterval = interval;
            },
            /**
             * 恢复为每次主循环都调用run
             */
            resumeRunInterval: function () {
                this.ye___runInterval = -1;
            },
            run: function () {
                if (this.isSetRunInterval()) {
                    if (!this.ye___isTimeToRun()) {
                        return YE.returnForTest;
                    }
                    this.ye___lastTime = this.ye___getTimeNow();
                }

                this.base();
            },
            startLoop: function () {
                this.onStartLoop();
                this.iterate("onStartLoop");
            },
            endLoop: function () {
                this.iterate("onEndLoop");
                this.onEndLoop();
            },
            Virtual: {
                clear: function () {
                    this.ye___clearCanvas();
                },
                isChange: function () {
                    return true;
                },
                draw: function (context) {
                    this.iterate("draw", [context || this.getContext()]);
                }
            },

            //*供测试使用

            forTest_getState: function () {
                return State;
            }
        },
        Static: {
            create: function (id, position) {
                var T = YYC.Class(YE.Layer, {
                    Init: function () {
                        this.base(id, position);
                    }
                });
                return new T();
            }
        }
    });
}());
(function () {
    YE.Scene = YYC.AClass(YE.NodeContainer, {
        Protected: {
            ye_P_run: function () {
                this.iterate("run");
            }
        },
        Public: {
            addChilds: function (childs, zOrder, tag) {
                this.base(childs, zOrder, tag);

                if (zOrder) {
                    childs.map("setZIndex", zOrder);
                }
            },
            addChild: function (child, zOrder, tag) {
                this.base(child, zOrder, tag);

                if (zOrder) {
                    child.setZIndex(zOrder);
                }
            },
            startLoop: function () {
                this.onStartLoop();
                this.iterate("startLoop");
            },
            endLoop: function () {
                this.iterate("endLoop");
                this.onEndLoop();
            }
        },
        Static: {
            create: function () {
                var T = YYC.Class(YE.Scene, {
                    Init: function () {
                        this.base();
                    },
                    Public: {
                    }
                });

                return new T();
            }
        }
    });
}());
(function () {
    YE.Sprite = YYC.AClass(YE.Node, {
        Init: function (displayTarget) {
            this.base();

            this.setDisplayTarget(displayTarget);

            this.ye___actionManager = YE.ActionManager.create();
            this.ye___animationManager = YE.AnimationManager.create();
            this.ye___animationFrameManager = YE.AnimationFrameManager.create();
        },
        Private: {
            ye___displayTarget: null,
            ye___actionManager: null,
            ye___animationManager: null,
            ye___animationFrameManager: null,
            ye___displayFrame: null,
            ye___x: 0,
            ye___y: 0,
            //精灵在画布中显示的图片大小
            ye___width: 0,
            ye___height: 0,

            ye___context: null,
            ye___canvasData: null,
            ye___offsetX: 0,
            ye___offsetY: 0,
            ye___clipRange: null,

            ye___setContextAndReturnDrawData: function (displayTarget, data, context) {
                var pixelOffsetX = 0,
                    pixelOffsetY = 0,
                    x = 0,
                    y = 0,
                    width = 0,
                    height = 0,
                    canvasWidth = this.getCanvasData().width,
                    canvasHeight = this.getCanvasData().height,
                    posX = 0,
                    posY = 0,
                    isChangeX = false,
                    isChangeY = false;

                x = data[0] || this.ye___x;
                y = data[1] || this.ye___y;
                width = data[2] || this.ye___width;
                height = data[3] || this.ye___height;

                if (displayTarget.isInstanceOf(YE.Frame)) {
                    pixelOffsetX = displayTarget.getPixelOffsetX();
                    pixelOffsetY = displayTarget.getPixelOffsetY();
                }
                else if (displayTarget.isInstanceOf(YE.Bitmap)) {
                    pixelOffsetX = displayTarget.pixelOffsetX;
                    pixelOffsetY = displayTarget.pixelOffsetY;
                }

                if (this.ye___clipRange) {
                    this.ye___clip(context);
                }

                if (displayTarget.isFlipX()) {
                    context.translate(canvasWidth, 0);
                    context.scale(-1, 1);

                    posX = canvasWidth - width - this.ye___computeX(x, pixelOffsetX);
                    isChangeX = true;
                }
                if (displayTarget.isFlipY()) {
                    context.translate(0, canvasHeight);
                    context.scale(1, -1);

                    posY = canvasHeight - height - this.ye___computeY(y, pixelOffsetY);
                    isChangeY = true;
                }

                posX = isChangeX ? posX : this.ye___computeX(x, pixelOffsetX);
                posY = isChangeY ? posY : this.ye___computeY(y, pixelOffsetY);

                return [posX, posY, width, height];
            },
            ye___computeX: function (x, pixelOffsetX) {
                return x - this.ye___offsetX - pixelOffsetX;
            },
            ye___computeY: function (y, pixelOffsetY) {
                return y - this.ye___offsetY - pixelOffsetY;
            },
            ye___clip: function (context) {
                var beginPoint = null;

                context.beginPath();
                beginPoint = this.ye___clipRange.shift();
                context.moveTo(beginPoint.x, beginPoint.y);

                this.ye___clipRange.forEach(function (point) {
                    context.lineTo(point.x, point.y);
                });

                context.lineTo(beginPoint.x, beginPoint.y);

                context.closePath();
                context.clip();

                this.ye___clipRange = null;
            },
            ye___drawDisplayTarget: function (context) {
                var bitmap = null,
                    frame = null,
                    spriteData = [],
                    data = null;

                context.save();

                data = this.ye___setContextAndReturnDrawData(this.ye___displayTarget, spriteData, context);

                if (this.ye___displayTarget.isInstanceOf(YE.Bitmap)) {
                    bitmap = this.ye___displayTarget;

                    context.drawImage(bitmap.img, data[0], data[1], data[2], data[3]);
                }
                else if (this.ye___displayTarget.isInstanceOf(YE.Frame)) {
                    frame = this.ye___displayTarget;

                    context.drawImage(
                        frame.getImg(),
                        frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(),
                        data[0], data[1], data[2], data[3]
                    );
                }

                context.restore();
            },
            ye___drawAnim: function (context) {
                var frame = null,
                    data = null;

                frame = this.getDisplayFrame();

                if (!frame) {
                    return "no frame";
                }

                context.save();

                data = this.ye___setContextAndReturnDrawData(frame, this.ye___getAnimData(frame), context);
                this.ye___setSize(data[2], data[3]);

                context.drawImage(
                    frame.getImg(),
                    frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(),
                    data[0], data[1], data[2], data[3]
                );

                context.restore();
            },
            ye___getAnimData: function (frame) {
                var spriteData = [],
                    animSize = null;

                animSize = frame.getCacheData("animSize");

                spriteData = [this.ye___x, this.ye___y];
                if (animSize) {
                    spriteData[2] = animSize.width !== undefined ? animSize.width : this.ye___width;
                    spriteData[3] = animSize.height !== undefined ? animSize.height : this.ye___height;
                }
                else {
                    spriteData[2] = this.ye___width;
                    spriteData[3] = this.ye___height;
                }

                return spriteData;
            },
            ye___setSize: function (width, height) {
                this.ye___width = width;
                this.ye___height = height;
            },
            ye___runOnlyOneChild: function (child, tag, container, func) {
                if (container.getCount() === 1 &&
                    (container.hasChild(child) || (tag && container.hasChild(tag)))) {
                    return YE.returnForTest;
                }

                container.removeAllChilds();
                func.call(this, null);
            }
        },
        Public: {
            init: function (parent) {
                this.base(parent);

                this.ye___context = parent.getContext();
                this.ye___graphics = parent.getGraphics();
                this.ye___canvasData = parent.getCanvasData();
            },
            getContext: function () {
                return this.ye___context;
            },
            getGraphics: function () {
                return this.ye___graphics;
            },
            getCanvasData: function () {
                return this.ye___canvasData;
            },
            runAction: function (action, tag) {
                if (tag) {
                    action.setTag(tag);
                }

                if (this.ye___actionManager.hasChild(action) || (tag && this.ye___actionManager.hasChild(tag))) {
                    return YE.returnForTest;
                }

                this.ye___actionManager.addChild(action, this);
            },
            update: function () {
                this.ye___actionManager.update();
                this.ye___animationManager.update();
            },
            setPosition: function (x, y) {
                this.ye___x = x;
                this.ye___y = y;
            },
            setPositionX: function (x) {
                this.ye___x = x;
            },
            setPositionY: function (y) {
                this.ye___y = y;
            },
            getPositionX: function () {
                return this.ye___x;
            },
            getPositionY: function () {
                return this.ye___y;
            },
            getAnimationFrameManager: function () {
                return this.ye___animationFrameManager;
            },
            getActionManager: function () {
                return this.ye___actionManager;
            },
            setDisplayFrame: function (frame) {
                this.ye___displayFrame = frame;
            },
            getDisplayFrame: function () {
                return this.ye___displayFrame;
            },
            /**
             * 播放动画
             * @param arg 可以为动画名，也可以为动画动作
             * @returns {undefined}
             */
            runOnlyOneAnim: function (anim, tag) {
                return this.ye___runOnlyOneChild(anim, tag, this.ye___animationManager, function () {
                    this.ye___animationManager.addChild(this.ye___animationFrameManager.initAndReturnAnim(anim, tag), this);
                });
            },
            runOnlyOneAction: function (action, tag) {
                return this.ye___runOnlyOneChild(action, tag, this.ye___actionManager, function () {
                    this.runAction(action, tag);
                });
            },
            getCurrentAnim: function () {
                return this.ye___animationManager.getChilds()[0];
            },
            getCurrentActions: function () {
                return this.ye___actionManager.getChilds();
            },
            getCurrentAction: function () {
                var actions = this.getCurrentActions();

                YE.error(actions.length === 0, "没有运行的动作");

                YE.assert(actions.length === 1, "当前运行的动作不止一个");

                return actions[actions.length - 1];
            },
            removeAllActions: function (isReset) {
                this.ye___actionManager.removeAllChilds(isReset);
            },
            removeAllAnims: function (isReset) {
                this.ye___animationManager.removeAllChilds(isReset);
            },
            isCurrentAnimExactly: function (animName) {
                return this.ye___animationManager.hasChild(animName);
            },
            isCurrentAnim: function (animName) {
                var anim = null;

                anim = this.getCurrentAnim();
                if (!anim) {
                    return false;
                }

                return anim.containTag(animName)
            },
            getWidth: function () {
                return this.ye___width;
            },
            getHeight: function () {
                return this.ye___height;
            },
            setWidth: function (width) {
                this.ye___width = width;
            },
            setHeight: function (height) {
                this.ye___height = height;
            },
            setDisplayTarget: function (displayTarget) {
                this.ye___displayTarget = displayTarget;
            },
            setOffsetX: function (offsetX) {
                this.ye___offsetX = offsetX;
            },
            setOffsetY: function (offsetY) {
                this.ye___offsetY = offsetY;
            },
            getOffsetX: function () {
                return this.ye___offsetX;
            },
            getOffsetY: function () {
                return this.ye___offsetY;
            },
            /**
             * 设置画布剪辑区域
             * @param range 剪辑区域
             */
            setClipRange: function (range) {
                this.ye___clipRange = range;
            },

            Virtual: {
                draw: function (context) {
                    var returnvalueForTest = null;

                    if (this.ye___displayTarget) {
                        this.ye___drawDisplayTarget(context);
                        return YE.returnForTest;
                    }

                    returnvalueForTest = this.ye___drawAnim(context);

                    return returnvalueForTest;
                },
                clear: function (context) {
                    context.clearRect(this.ye___x, this.ye___y, this.ye___width, this.ye___height);
                },
                onBeforeDraw: function (context) {
                },
                onAfterDraw: function (context) {
                }
            }
        },
        Static: {
            create: function (bitmap) {
                var T = YYC.Class(YE.Sprite, {
                    Init: function (bitmap) {
                        this.base(bitmap);
                    },
                    Public: {
                    }
                });

                return new T(bitmap);
            }
        }
    });
}());
namespace("YE").Event = {
    //事件枚举值
    KEY_DOWN: 0,
    KEY_UP: 1,
    KEY_PRESS: 2,

    MOUSE_MOVE: 3,
    MOUSE_OUT: 4,
    MOUSE_OVER: 5,
    MOUSE_DOWN: 6,
    MOUSE_UP: 7,
    CLICK: 8,
    CONTEXTMENU: 9,

    //按键枚举值
    KeyCodeMap: {
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        SPACE: 32
    }
};
(function () {
    var _keyListeners = {};

    YE.EventManager = {
        _getEventType: function (event) {
            var eventType = "",
                e = YE.Event;

            switch (event) {
                case e.KEY_DOWN:
                    eventType = "keydown";
                    break;
                case e.KEY_UP:
                    eventType = "keyup";
                    break;
                case e.KEY_PRESS:
                    eventType = "keypress";
                    break;
                case e.MOUSE_MOVE:
                    eventType = "mousemove";
                    break;
                case e.MOUSE_OVER:
                    eventType = "mouseover";
                    break;
                case e.MOUSE_OUT:
                    eventType = "mouseout";
                    break;
                case e.MOUSE_DOWN:
                    eventType = "mousedown";
                    break;
                case e.MOUSE_UP:
                    eventType = "mouseup";
                    break;
                case e.CLICK:
                    eventType = "click";
                    break;
                case e.CONTEXTMENU:
                    eventType = "contextmenu";
                    break;
                default:
                    YE.error(true, "事件类型错误");
            }

            return eventType;
        },
        addListener: function (event, handler, eventContext, handlerContext) {
            var eventType = "",
                _handler = null;

            eventType = this._getEventType(event);

            if (handlerContext) {
                _handler = YE.Tool.event.bindEvent(handlerContext, handler);
            }
            else {
                _handler = handler;
            }

            YE.Tool.event.addEvent(eventContext || window, eventType, _handler);
            this._registerEvent(eventType, _handler, eventContext || window);
        },
        _registerEvent: function (eventType, handler, eventContext) {
            if (_keyListeners[eventType] === undefined) {
                _keyListeners[eventType] = [
                    [handler, eventContext]
                ];
            }
            else {
                _keyListeners[eventType].push([handler, eventContext]);
            }
        },
        removeListener: function (event) {
            var eventType = "";

            eventType = this._getEventType(event);

            if (_keyListeners[eventType]) {
                _keyListeners[eventType].forEach(function (e, i) {
                    YE.Tool.event.removeEvent(e[1], eventType, e[0]);
                });
                _keyListeners[eventType] = undefined;
            }
        },
        removeAllListener: function () {
            var eventType = null;

            for (eventType in _keyListeners) {
                _keyListeners[eventType].forEach(function (e, i) {
                    YE.Tool.event.removeEvent(e[1], eventType, e[0]);
                });
            }
            _keyListeners = {};
        }
    };
}());

(function () {
    var _instance = null;

    YE.ImgLoader = YYC.Class(YE.Loader, {
        Init: function () {
            this.base();
        },
        Protected: {
            ye_P_load: function (imgPath, key) {
                var img = null,
                    self = this;

                img = new Image();
                /*!
                 经过对多个浏览器版本的测试，发现ie、opera下，当图片加载过一次以后，如果再有对该图片的请求时，由于浏览器已经缓存住这张图

                 片了，不会再发起一次新的请求，而是直接从缓存中加载过来。对于 firefox和safari，它们试图使这两种加载方式对用户透明，同样

                 会引起图片的onload事件，而ie和opera则忽略了这种同一性，不会引起图片的onload事件，因此上边的代码在它们里边不能得以实现效果。

                 确实，在ie，opera下，对于缓存图片的初始状态，与firefox和safari，chrome下是不一样的（有兴趣的话，可以在不同浏览器下，测试一下在给img的src赋值缓存图片的url之前，img的状态），
                 但是对onload事件的触发，却是一致的，不管是什么浏览器。

                 产生这个问题的根本原因在于，img的src赋值与 onload事件的绑定，顺序不对（在ie和opera下，先赋值src，再赋值onload，因为是缓存图片，就错过了onload事件的触发）。
                 应该先绑定onload事件，然后再给src赋值。
                 */
                img.onload = function () {
                    this.onload = null;     //解决ie内存泄露
                    self.ye_P_container.addChild(key, this);
                    YE.LoaderManager.getInstance().onResLoaded();
                };
                img.onerror = function () {
                    YE.LoaderManager.getInstance().onResError(imgPath);
                };

                img.src = imgPath;
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var _instance = null;

    YE.JsonLoader = YYC.Class(YE.Loader, {
        Init: function () {
            this.base();
        },
        Protected: {
            ye_P_load: function (jsonFilePath, key) {
                var self = this;

                YE.$.ajax({
                    type: "get",
                    //async: true,
                    url: jsonFilePath,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    //cache: false,
                    success: function (data) {
                        self.ye_P_container.addChild(key, data);
                        YE.LoaderManager.getInstance().onResLoaded();
                    },
                    error: function (XMLHttpRequest, errorThrown) {
                        YE.LoaderManager.getInstance().onResError(jsonFilePath,
                            "readyState:" + XMLHttpRequest.readyState + "\nstatus:" + XMLHttpRequest.status
                                + "\nmessage:" + errorThrown.message
                                + "\nresponseText:" + XMLHttpRequest.responseText);
                    }
                });
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var _instance = null;

    YE.LoaderManager = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();
        },
        Private: {
            ye_resCount: 0,
            ye_currentLoadedCount: 0,

            ye_isFinishLoad: function () {
                var self = this;

                if (this.getCurrentLoadedCount() === this.getResourceCount()) {
                    if (this.onload) {
                        this.onload();
                    }
                    else {
                        YE.assert(false, "没有定义onload");
                    }
                }
                else {
                    if (this.onloading) {
                        setTimeout(function () {
                            self.onloading(self.getCurrentLoadedCount(), self.getResourceCount())
                        }, 16);
                    }
                    setTimeout(function () {
                        self.ye_isFinishLoad.call(self);
                    }, 16);
                }
            }
        },
        Public: {
            getResourceCount: function () {
                return this.ye_resCount;
            },
            getCurrentLoadedCount: function () {
                return this.ye_currentLoadedCount;
            },
            preload: function (resources) {
                var self = this;

                resources.forEach(function (res) {
                    switch (res.type) {
                        case "image":
                            YE.ImgLoader.getInstance().load(res.url, res.id);
                            self.ye_resCount += 1;
                            break;
                        case "json":
                            YE.JsonLoader.getInstance().load(res.url, res.id);
                            self.ye_resCount += 1;
                            break;
                        case "sound":
                            YE.SoundLoader.getInstance().load(res.url, res.id);
                            self.ye_resCount += 1;
                            break;
                        default:
                            YE.error(true, "type错误");
                            break;
                    }
                });

                this.ye_isFinishLoad();
            },
            reset: function () {
                this.ye_resCount = 0;
                this.ye_currentLoadedCount = 0;
            },
            onResLoaded: function () {
                this.ye_currentLoadedCount += 1;
            },
            onResError: function (path, err) {
                YE.log("加载" + path + "资源失败");
                if(err){
                    YE.log(err);
                }
            },
            //*钩子
            onloading: undefined,
            onload: undefined
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var _instance = null;

    YE.SoundLoader = YYC.Class(YE.Loader, {
        Init: function () {
            this.base();
        },
        Protected: {
            ye_P_load: function (urlArr, key) {
                var self = this;

                YE.SoundManager.getInstance().createSound(urlArr, function () {
                    YE.LoaderManager.getInstance().onResLoaded();
                    self.ye_P_container.appendChild(key, this);

                }, function (code) {
                    YE.LoaderManager.getInstance().onResError(urlArr, "错误原因：code" + code);
                });
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    var _instance = null;

    YE.SoundManager = YYC.Class(YE.Entity, {
        Init: function () {
            this.base();
        },
        Private: {
            ye_counter: 0
        },
        Public: {
            createSound: function (urlArr, onload, onerror) {
                YE.YSoundEngine.create({
                    urlArr: urlArr,
                    onload: onload,
                    onerror: onerror
                });
            },
            play: function (soundId) {
                var sound = YE.SoundLoader.getInstance().get(soundId),
                    audioObject = null;

                if (!sound || sound.length === 0) {
                    return YE.returnForTest;
                }

                if (this.ye_counter >= sound.length) {
                    this.ye_counter = 0;
                }

                audioObject = sound[this.ye_counter];
                this.ye_counter++;
                audioObject.play();
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            }
        }
    });
}());
(function () {
    YE.Bitmap = YYC.Class(YE.Entity, {
        Init: function (img) {
            this.base();

            this.img = img;
            this.width = this.img.width;
            this.height = this.img.height;
        },
        Private: {
            ye_isFlipX: false,
            ye_isFlipY: false
        },
        Public: {
            img: null,
            width: 0,
            height: 0,
            pixelOffsetX: 0,
            pixelOffsetY: 0,

            setFlipX: function () {
                this.ye_isFlipX = true;

                return this;
            },
            setFlipY: function () {
                this.ye_isFlipY = true;

                return this;
            },
            isFlipX: function () {
                return this.ye_isFlipX;
            },
            isFlipY: function () {
                return this.ye_isFlipY;
            },
            setAnchor: function (pixelOffsetX, pixelOffsetY) {
                this.pixelOffsetX = pixelOffsetX;
                this.pixelOffsetY = pixelOffsetY;

                return this;
            },
            copy: function () {
                var bitmap = YE.Bitmap.create(this.img);

                YE.Tool.extend.extend(bitmap, this);

                return bitmap;
            }
        },
        Static: {
            create: function (img) {
                return new this(img);
            }
        }
    });
}());


(function () {
    YE.Collection = YYC.Class({
        Init: function () {
            this.ye_childs = [];
        },
        Private: {
            ye_childs: null
        },
        Public: {
            getCount: function () {
                return this.ye_childs.length;
            },
            sort: function (func) {
                this.ye_childs.sort(func);
            },
            hasChild: function (child) {
                var func = null;

                if (YE.Tool.judge.isFunction(arguments[0])) {
                    func = arguments[0];

                    return this.ye_childs.contain(function (c, i) {
                        return func(c, i);
                    });
                }

                return this.ye_childs.contain(function (c, i) {
                    if (c === child ||
                        (c.getUid && child.getUid && c.getUid() === child.getUid())) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            },
            getChilds: function () {
                return this.ye_childs;
            },
            getChildAt: function (index) {
                return this.ye_childs[index];
            },
            addChild: function (child) {
                this.ye_childs.push(child);

                return this;
            },
            addChilds: function (childs) {
                var i = 0,
                    len = 0;

                if (!YE.Tool.judge.isArray(childs)) {
                    this.addChild(childs);
                }
                else {
                    for (i = 0, len = childs.length; i < len; i++) {
                        this.addChild(childs[i]);
                    }
                }

                return this;
            },
            removeAllChilds: function () {
                this.ye_childs = [];
            },
            forEach: function (fn, context) {
                this.ye_childs.forEach.apply(this.ye_childs, arguments);
            },
            map: function (handlerName, argArr) {
                this.ye_childs.map.apply(this.ye_childs, arguments);
            },
            filter: function (func) {
                return this.ye_childs.filter(func, this.ye_childs);
            },
            removeChildAt: function (index) {
                YE.error(index < 0, "序号必须大于等于0");

                this.ye_childs.splice(index, 1);
            },
            copy: function () {
                return YE.Tool.extend.extendDeep(this.ye_childs);
            },
            reverse: function () {
                this.ye_childs.reverse();
            },
            removeChild: function (obj, target) {
                if (YE.Tool.judge.isFunction(obj)) {
                    return this.ye_childs.removeChild(obj, target);
                }
                else if (obj.isInstanceOf && obj.isInstanceOf(YE.Entity)) {
                    return this.ye_childs.removeChild(function (e) {
                        return e.getUid() === obj.getUid();
                    });
                }
                else {
                    return this.ye_childs.removeChild(function (e) {
                        return e === obj;
                    });
                }
            }
        },
        Static: {
            create: function () {
                return new this();
            }
        }
    });
}());
(function () {
    YE.rect = function (x, y, w, h) {
        return { origin: {x: x, y: y}, size: {width: w, height: h} };
    };
}());

(function () {
    YE.Hash = YYC.Class({
        Init: function () {
            this.ye_childs = {};
        },
        Private: {
            ye_childs: null
        },
        Public: {
            getChilds: function () {
                return this.ye_childs;
            },
            getValue: function (key) {
                return this.ye_childs[key];
            },
            addChild: function (key, value) {
                this.ye_childs[key] = value;

                return this;
            },
            appendChild: function (key, value) {
                if (YE.Tool.judge.isArray(this.ye_childs[key])) {
                    this.ye_childs[key].push(value);
                }
                else {
                    this.ye_childs[key] = [value];
                }

                return this;
            },
            removeChild: function (key) {
                this.ye_childs[key] = undefined;
            },
            hasChild: function (key) {
                return !!this.ye_childs[key];
            },
            forEach: function (fn, context) {
                var i = null,
                    layers = this.getChilds();

                for (i in layers) {
                    if (layers.hasOwnProperty(i)) {
                        if (fn.call(context, layers[i], i) === $break) {
                            break;
                        }
                    }
                }
            },
            map: function (handlerName, argArr) {
                var i = null,
                    layers = this.getChilds();

                for (i in layers) {
                    if (layers.hasOwnProperty(i)) {
                        layers[i][handlerName].apply(layers[i], argArr);
                    }
                }
            }
        },
        Static: {
            create: function () {
                return new this();
            }
        }
    });
}());
(function () {
    //*全局方法
    (function () {
        /**
         * 来自《HTML5 Canvas 核心技术》
         * 不能写到global中，否则会报错“illegal invocation”！
         */
        window.requestNextAnimationFrame = (function () {
            var originalRequestAnimationFrame = undefined,
                wrapper = undefined,
                callback = undefined,
                geckoVersion = 0,
                userAgent = navigator.userAgent,
                index = 0,
                self = this;

            wrapper = function (time) {
                time = +new Date();
                self.callback(time);
            };

            // Workaround for Chrome 10 bug where Chrome
            // does not pass the time to the animation function

            if (window.webkitRequestAnimationFrame) {
                // Define the wrapper

                // Make the switch

                originalRequestAnimationFrame = window.webkitRequestAnimationFrame;

                window.webkitRequestAnimationFrame = function (callback, element) {
                    self.callback = callback;

                    // Browser calls the wrapper and wrapper calls the callback

                    return originalRequestAnimationFrame(wrapper, element);
                }
            }

            //修改time参数
            if (window.msRequestAnimationFrame) {
                originalRequestAnimationFrame = window.msRequestAnimationFrame;

                window.msRequestAnimationFrame = function (callback) {
                    self.callback = callback;

                    return originalRequestAnimationFrame(wrapper);
                }
            }

            // Workaround for Gecko 2.0, which has a bug in
            // mozRequestAnimationFrame() that restricts animations
            // to 30-40 fps.

            if (window.mozRequestAnimationFrame) {
                // Check the Gecko version. Gecko is used by browsers
                // other than Firefox. Gecko 2.0 corresponds to
                // Firefox 4.0.

                index = userAgent.indexOf('rv:');

                if (userAgent.indexOf('Gecko') != -1) {
                    geckoVersion = userAgent.substr(index + 3, 3);

                    if (geckoVersion === '2.0') {
                        // Forces the return statement to fall through
                        // to the setTimeout() function.

                        window.mozRequestAnimationFrame = undefined;
                    }
                }
            }

//            return  window.requestAnimationFrame ||  //传递给callback的time不是从1970年1月1日到当前所经过的毫秒数！
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||

                function (callback, element) {
                    var start,
                        finish;

                    window.setTimeout(function () {
                        start = +new Date();
                        callback(start);
                        finish = +new Date();

                        self.timeout = 1000 / 60 - (finish - start);

                    }, self.timeout);
                };
        }());

        window.cancelNextRequestAnimationFrame = window.cancelRequestAnimationFrame
            || window.webkitCancelAnimationFrame
            || window.webkitCancelRequestAnimationFrame
            || window.mozCancelRequestAnimationFrame
            || window.oCancelRequestAnimationFrame
            || window.msCancelRequestAnimationFrame
            || clearTimeout;
    }());

    //*工具类
    (function () {
        var Tool = {};

        /**
         * 继承
         */
        Tool.extend = (function () {
            return {
                /**
                 * 浅拷贝
                 */
                extend: function (destination, source) {
                    var property = "";

                    for (property in source) {
                        destination[property] = source[property];
                    }
                    return destination;
                },
                extendExist: function (destination, source) {
                    var property = "";

                    for (property in source) {
                        if (destination[property] !== undefined) {    //destination中没有的属性不拷贝
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                },
                extendNoExist: function (destination, source) {
                    var property = "";

                    for (property in source) {
                        if (destination[property] === undefined) {
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                },
                /**
                 * 浅拷贝(不包括source的原型链)
                 */
                extendNoPrototype: function (destination, source) {
                    //            var temp = {};
                    var property = "";

                    for (property in source) {
                        if (source.hasOwnProperty(property)) {
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                },
                /**
                 * 深拷贝
                 *
                 * 示例：
                 * 如果拷贝对象为数组，能够成功拷贝（不拷贝Array原型链上的成员）
                 * expect(extend.extendDeep([1, { x: 1, y: 1 }, "a", { x: 2 }, [2]])).toEqual([1, { x: 1, y: 1 }, "a", { x: 2 }, [2]]);
                 *
                 * 如果拷贝对象为对象，能够成功拷贝（能拷贝原型链上的成员）
                 * var result = null;
                 function A() {
	            };
                 A.prototype.a = 1;

                 function B() {
	            };
                 B.prototype = new A();
                 B.prototype.b = { x: 1, y: 1 };
                 B.prototype.c = [{ x: 1 }, [2]];

                 var t = new B();

                 result = extend.extendDeep(t);

                 expect(result).toEqual(
                 {
                     a: 1,
                     b: { x: 1, y: 1 },
                     c: [{ x: 1 }, [2]]
                 });
                 * @param parent
                 * @param child
                 * @returns
                 */
                extendDeep: function (parent, child) {
                    var i = null,
                        len = 0,
                        toStr = Object.prototype.toString,
                        sArr = "[object Array]",
                        sOb = "[object Object]",
                        type = "",
                        _child = null;

                    //数组的话，不获得Array原型上的成员。
                    if (toStr.call(parent) === sArr) {
                        _child = child || [];

                        for (i = 0, len = parent.length; i < len; i++) {
                            type = toStr.call(parent[i]);
                            if (type === sArr || type === sOb) {    //如果为数组或object对象
                                _child[i] = type === sArr ? [] : {};
                                arguments.callee(parent[i], _child[i]);
                            } else {
                                _child[i] = parent[i];
                            }
                        }
                    }
                    //对象的话，要获得原型链上的成员。因为考虑以下情景：
                    //类A继承于类B，现在想要拷贝类A的实例a的成员（包括从类B继承来的成员），那么就需要获得原型链上的成员。
                    else if (toStr.call(parent) === sOb) {
                        _child = child || {};

                        for (i in parent) {
                            type = toStr.call(parent[i]);
                            if (type === sArr || type === sOb) {    //如果为数组或object对象
                                _child[i] = type === sArr ? [] : {};
                                arguments.callee(parent[i], _child[i]);
                            } else {
                                _child[i] = parent[i];
                            }
                        }
                    }
                    else {
                        _child = parent;
                    }

                    return _child;
                }
            }
        }());

        /**
         * 判断类型
         */
        Tool.judge = (function () {
            return {
                /**
                 * 判断浏览器类型
                 */
                browser: {
                    //ie: +[1, ],   //有问题！在ie下“+[1, ]”居然为false！！！！？？？
                    isIE: function () {
                        return !!(document.all && navigator.userAgent.indexOf('Opera') === -1);
                    },
                    //不能用===，因为navigator.appVersion.match(/MSIE\s\d/i)为object类型，不是string类型
                    isIE7: function () {
                        return navigator.appVersion.match(/MSIE\s\d/i) == "MSIE 7";
                    },
                    isIE8: function () {
                        return navigator.appVersion.match(/MSIE\s\d/i) == "MSIE 8";
                    },
                    isIE9: function () {
                        return navigator.appVersion.match(/MSIE\s\d/i) == "MSIE 9";
                    },
                    isFF: function () {
                        return navigator.userAgent.indexOf("Firefox") >= 0 && true;
                    },
                    isOpera: function () {
                        return  navigator.userAgent.indexOf("Opera") >= 0 && true;
                    },
                    isChrome: function () {
                        return navigator.userAgent.indexOf("Chrome") >= 0 && true;
                    }
                },
                /**
                 * 判断是否为jQuery对象
                 */
                isjQuery: function (ob) {
                    if (!window.jQuery) {
                        return false;
                    }

                    return ob instanceof window.jQuery;
                },
                isFunction: function (func) {
                    return Object.prototype.toString.call(func) === "[object Function]";
                },
                isArray: function (val) {
                    return Object.prototype.toString.call(val) === "[object Array]";
                },
                isDate: function (val) {
                    return Object.prototype.toString.call(val) === "[object Date]";
                },
                isString: function (str) {
                    return Object.prototype.toString.call(str) === "[object String]";
                },
                /**
                 * 检测对象是否是空对象(不包含任何可读属性)。
                 * 方法只检测对象本身的属性，不检测从原型继承的属性。
                 */
                isOwnEmptyObject: function (obj) {
                    var name = "";

                    for (name in obj) {
                        if (obj.hasOwnProperty(name)) {
                            return false;
                        }
                    }
                    return true;
                },
                /**
                 * 检测对象是否是空对象(不包含任何可读属性)。
                 * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使hasOwnProperty)。
                 */
                isEmptyObject: function (obj) {
                    var name = "";

                    for (name in obj) {
                        return false;
                    }
                    return true;
                },
                /**
                 * 判断是否为奇数
                 * @param num
                 * @returns
                 */
                isOdd: function (num) {
                    return num % 2 !== 0;
                },
                /**
                 * 判断是否为对象字面量（{}）
                 */
                isDirectObject: function (obj) {
                    if (Object.prototype.toString.call(obj) === "[object Object]") {
                        return true;
                    }

                    return false;
                },
                isHTMLImg: function (img) {
                    return Object.prototype.toString.call(img) === "[object HTMLImageElement]";
                },
                isDom: function (obj) {
                    return obj instanceof HTMLElement;
                },
                isNumber: function (obj) {
                    return Object.prototype.toString.call(obj) === "[object Number]";
                },
                isBool: function (obj) {
                    return Object.prototype.toString.call(obj) === "[object Boolean]";
                },
                /**
                 * 检查宿主对象是否可调用
                 *
                 * 任何对象，如果其语义在ECMAScript规范中被定义过，那么它被称为原生对象；
                 环境所提供的，而在ECMAScript规范中没有被描述的对象，我们称之为宿主对象。

                 该方法用于特性检测，判断对象是否可用。用法如下：

                 MyEngine addEvent():
                 if (Tool.judge.isHostMethod(dom, "addEventListener")) {    //判断dom是否具有addEventListener方法
            dom.addEventListener(sEventType, fnHandler, false);
            }
                 */
                isHostMethod: (function () {
                    function isHostMethod(object, property) {
                        var type = typeof object[property];

                        return type === "function" ||
                            (type === "object" && !!object[property]) ||
                            type === "unknown";
                    };

                    return isHostMethod;
                }()),
                /**
                 判断一个元素是否为另一个元素的子元素
                 * @param children  被判断的元素。可以为dom或jquery对象
                 * @param parentSelector    父元素选择器。如“"#parent"”
                 * @returns

                    示例：
                 <div id="parent">
                 <span id="chi"></span>
                 <div>

                 isChildOf($("#chi"), "#parent");    //true
                 */
                isChildOf: function (children, parentSelector) {
                    return $(children).parents(parentSelector).length >= 1
                }
            }
        }() );

        /**
         * 异步操作
         */
        Tool.asyn = (function () {
            return {
                /**
                 * 清空"所有"的定时器
                 * @param index 其中一个定时器序号（不一定为第一个计时器序号）
                 */
                clearAllTimer: function (index) {
                    var i = 0,
                        num = 0,
                        timerNum = 250, //最大定时器个数
                        firstIndex = 0;

                    //获得最小的定时器序号
                    firstIndex = (index - timerNum >= 1) ? (index - timerNum) : 1;
                    num = firstIndex + timerNum * 2;    //循环次数

                    //以第一个计时器序号为起始值（计时器的序号会递加，但是ie下每次刷新浏览器后计时器序号会叠加，
                    //且最初的序号也不一定从1开始（可能比1大），也就是说ie下计时器序号的起始值可能很大；chrome和firefox计时器每次从1开始）
                    for (i = firstIndex; i < num; i++) {
                        window.clearTimeout(i);
                    }
                    //for (i = firstIndex.timer_firstIndex; i < num; i++) {
                    for (i = firstIndex; i < num; i++) {
                        window.clearInterval(i);
                    }
                }
            }
        }());

        /**
         * 事件
         */
        Tool.event = (function () {
            return {
                //注意！bindEvent传的参数与BindWithArguments类似，只是第一个参数为event！
                bindEvent: function (object, fun) {
                    var args = Array.prototype.slice.call(arguments, 2);
                    var self = this;

                    return function (event) {
                        return fun.apply(object, [self.wrapEvent(event)].concat(args)); //对事件对象进行包装
                    }
                },
                /* oTarget既可以是单个dom元素，也可以使jquery集合。
                 如：
                 Tool.event.addEvent(document.getElementById("test_div"), "mousedown", _Handle);
                 Tool.event.addEvent($("div"), "mousedown", _Handle);
                 */
                addEvent: function (oTarget, sEventType, fnHandler) {
                    //            var oTarget = $(oTarget)[0];    //转换为dom对象
                    var dom = null,
                        i = 0,
                        len = 0,
                        temp = null;

                    if (Tool.judge.isjQuery(oTarget)) {
                        oTarget.each(function () {
                            dom = this;

                            if (Tool.judge.isHostMethod(dom, "addEventListener")) {
                                dom.addEventListener(sEventType, fnHandler, false);
                            }
                            else if (Tool.judge.isHostMethod(dom, "attachEvent")) {
                                dom.attachEvent("on" + sEventType, fnHandler);
                            }
                            else {
                                dom["on" + sEventType] = fnHandler;
                            }
                        });
                    }
                    else {
                        dom = oTarget;

                        if (Tool.judge.isHostMethod(dom, "addEventListener")) {
                            dom.addEventListener(sEventType, fnHandler, false);
                        }
                        else if (Tool.judge.isHostMethod(dom, "attachEvent")) {
                            dom.attachEvent("on" + sEventType, fnHandler);
                        }
                        else {
                            dom["on" + sEventType] = fnHandler;
                        }
                    }
                },
                removeEvent: function (oTarget, sEventType, fnHandler) {
                    var dom = null;


                    if (Tool.judge.isjQuery(oTarget)) {
                        oTarget.each(function () {
                            dom = this;
                            if (Tool.judge.isHostMethod(dom, "removeEventListener")) {
                                dom.removeEventListener(sEventType, fnHandler, false);
                            }
                            else if (Tool.judge.isHostMethod(dom, "detachEvent")) {
                                dom.detachEvent("on" + sEventType, fnHandler);
                            }
                            else {
                                dom["on" + sEventType] = null;
                            }
                        });
                    }
                    else {
                        dom = oTarget;
                        if (Tool.judge.isHostMethod(dom, "removeEventListener")) {
                            dom.removeEventListener(sEventType, fnHandler, false);
                        }
                        else if (Tool.judge.isHostMethod(dom, "detachEvent")) {
                            dom.detachEvent("on" + sEventType, fnHandler);
                        }
                        else {
                            dom["on" + sEventType] = null;
                        }
                    }
                },
                /*!
                 包装event对象   -待补充

                 event.type:返回事件名。返回没有“on”作为前缀的事件名，比如，onclick事件返回的type是click
                 event.target: 返回事件源，就是发生事件的元素
                 event.preventDefault: 阻止默认事件动作
                 event.stopBubble: 阻止冒泡
                 //event.offsetLeft:为匹配的元素集合中获取第一个元素的当前坐标的left，相对于文档（document）。
                 //event.offsetTop:为匹配的元素集合中获取第一个元素的当前坐标的top，相对于文档（document）。
                 //event.positionLeft:获取匹配元素中第一个元素的当前坐标的left，相对于offset parent的坐标。( offset parent指离该元素最近的而且被定位过的祖先元素 )
                 //event.positionTop:获取匹配元素中第一个元素的当前坐标的top，相对于offset parent的坐标。( offset parent指离该元素最近的而且被定位过的祖先元素 )
                 event.pageX: 鼠标相对于文档的左边缘的位置。
                 event.pageY: 鼠标相对于文档的上边缘的位置。
                 event.relatedTarget: 发生mouseover和mouseout事件时，相关的dom元素。
                 （mouseover：鼠标来之前的元素；mouseout：鼠标将要去的那个元素）
                 event.mouseButton: 鼠标按键。
                 左键： 0
                 右键： 1
                 中键： 2

                 */
                wrapEvent: function (oEvent) {
                    var e = oEvent ? oEvent : global.event,
                        target = e.srcElement || e.target;

                    //ie
                    if (Tool.judge.browser.isIE()) {
                        e.pageX = e.clientX + document.body.scrollLeft || document.documentElement.scrollLeft;
                        e.pageY = e.clientY + document.body.scrollTop || document.documentElement.scrollTop;

                        e.stopBubble = function () {
                            e.cancelBubble = true;
                        };

                        if (Tool.judge.browser.isIE7() || Tool.judge.browser.isIE8()) {
                            e.preventDefault = function () {
                                e.returnValue = false;
                            };

                            if (e.type == "mouseout") {
                                e.relatedTarget = e.toElement;
                            }
                            else if (e.type == "mouseover") {
                                e.relatedTarget = e.fromElement;
                            }

                            switch (e.button) {
                                case 1:
                                    e.mouseButton = 0;
                                    break;
                                case 4:
                                    e.mouseButton = 1;
                                    break;
                                case 2:
                                    e.mouseButton = 2;
                                    break;
                                default:
                                    e.mouseButton = e.button;
                                    break;
                            }
                        }
                        else {
                            e.mouseButton = e.button;
                        }
                    }
                    else {
                        e.stopBubble = e.stopPropagation;

                        e.keyCode = e.which;
                        //注意：firefox没有多个键一起按的事件
                        e.mouseButton = e.button;
                    }
                    e.target = target;

                    return e;
                },
                getEvent: function () {
                    //this.getEvent.caller为调用了getEvent方法的函数的引用
                    return this.getEvent.caller.arguments[0];
                },
                /*! 手动触发事件

                 默认为不冒泡，不进行默认动作。

                 2012-12-03

                 网上资料：http://hi.baidu.com/suchen36/item/fb3eefbb8125c0a4eaba93e2


                 为大家介绍js下的几个方法：
                 1. createEvent（eventType）
                 参数：eventType 共5种类型：
                 Events ：包括所有的事件.

                 HTMLEvents：包括 'abort', 'blur', 'change', 'error', 'focus', 'load', 'reset', 'resize', 'scroll', 'select',
                 'submit', 'unload'. 事件

                 UIEevents ：包括 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'keydown', 'keypress', 'keyup'.
                 间接包含 MouseEvents.

                 MouseEvents：包括 'click', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup'.

                 MutationEvents:包括 'DOMAttrModified', 'DOMNodeInserted', 'DOMNodeRemoved',
                 'DOMCharacterDataModified', 'DOMNodeInsertedIntoDocument',
                 'DOMNodeRemovedFromDocument', 'DOMSubtreeModified'.

                 2. 在createEvent后必须初始化，为大家介绍5种对应的初始化方法

                 HTMLEvents 和 通用 Events：
                 initEvent( 'type', bubbles, cancelable )

                 UIEvents ：
                 initUIEvent( 'type', bubbles, cancelable, windowObject, detail )

                 MouseEvents：
                 initMouseEvent( 'type', bubbles, cancelable, windowObject, detail, screenX, screenY,
                 clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget )

                 MutationEvents ：
                 initMutationEvent( 'type', bubbles, cancelable, relatedNode, prevValue, newValue,
                 attrName, attrChange )

                 3. 在初始化完成后就可以随时触发需要的事件了，为大家介绍targetObj.dispatchEvent(event)
                 使targetObj对象的event事件触发
                 需要注意的是在IE 5.5+版本上请用fireEvent方法，还是浏览兼容的考虑

                 4. 例子
                 //例子1 立即触发鼠标被按下事件
                 var fireOnThis = document.getElementById('someID');
                 var evObj = document.createEvent('MouseEvents');
                 evObj.initMouseEvent( 'click', true, true, global, 1, 12, 345, 7, 220, false, false, true, false, 0, null );
                 fireOnThis.dispatchEvent(evObj);

                 //例子2 考虑兼容性的一个鼠标移动事件
                 var fireOnThis = document.getElementById('someID');
                 if( document.createEvent )
                 {
                 var evObj = document.createEvent('MouseEvents');
                 evObj.initEvent( 'mousemove', true, false );
                 fireOnThis.dispatchEvent(evObj);
                 }
                 else if( document.createEventObject )
                 {
                 fireOnThis.fireEvent('onmousemove');
                 }

                 */
                triggerEvent: function (oTarget, type) {
                    var evObj = null,
                        dom = null;

                    if (Tool.judge.isHostMethod(document, "createEvent")) {
                        /*! 判断事件类型
                         switch (type) {
                         case 'abort':
                         case 'blur':
                         case 'change':
                         case 'error':
                         case 'focus':
                         case 'load':
                         case 'reset':
                         case 'resize':
                         case 'scroll':
                         case 'select':
                         case 'submit':
                         case 'unload':
                         evObj = document.createEvent('HTMLEvents');
                         evObj.initEvent(type, false, true);
                         break;
                         case 'DOMActivate':
                         case 'DOMFocusIn':
                         case 'DOMFocusOut':
                         case 'keydown':
                         case 'keypress':
                         case 'keyup':
                         evObj = document.createEvent('UIEevents');
                         evObj.initUIEvent(type, false, true);     //出错：参数过少
                         break;
                         case 'click':
                         case 'mousedown':
                         case 'mousemove':
                         case 'mouseout':
                         case 'mouseover':
                         case 'mouseup':
                         evObj = document.createEvent('MouseEvents');
                         evObj.initMouseEvent(type, false, true);  //出错：参数过少
                         break;
                         case 'DOMAttrModified':
                         case 'DOMNodeInserted':
                         case 'DOMNodeRemoved':
                         case 'DOMCharacterDataModified':
                         case 'DOMNodeInsertedIntoDocument':
                         case 'DOMNodeRemovedFromDocument':
                         case 'DOMSubtreeModified':
                         evObj = document.createEvent('MutationEvents');
                         evObj.initMutationEvent(type, false, true);   //出错：参数过少
                         break;
                         default:
                         throw new Error("超出范围！");
                         break;

                         }
                         */

                        //此处使用通用事件
                        evObj = document.createEvent('Events');
                        evObj.initEvent(type, false, true);
                        if (Tool.judge.isjQuery(oTarget)) {
                            oTarget.each(function () {
                                dom = this;
                                dom.dispatchEvent(evObj);
                            });
                        }
                        else {
                            dom = oTarget;
                            dom.dispatchEvent(evObj);
                        }
                    }
                    else if (Tool.judge.isHostMethod(document, "createEventObject")) {
                        if (Tool.judge.isjQuery(oTarget)) {
                            oTarget.each(function () {
                                dom = this;
                                dom.fireEvent('on' + type);
                            });
                        }
                        else {
                            dom = oTarget;
                            dom.fireEvent('on' + type);
                        }
                    }
                }
            }
        }());

        /**
         * 路径操作
         */
        Tool.path = (function () {
            /*!
             location.pathname： 返回URL的域名（域名IP）后的部分。

             例如 http://www.example.com/wordpress/返回/wordpress/，
             又或则 http://127.0.0.1/index.html 返回/index.html，
             注意是带url的域名或域名IP

             在磁盘上随便建个Html文件进行location.pathname测试，如浏览器上的路径是： C:\Documents and Settings\Administrator\桌面\testjs.html， 这样，得到的结果是: /C:\Documents and Settings\Administrator\桌面\testjs.html

             既然提到这了，那我们就分析下下面的URL：

             http://www.example.com:8080/test.php?user=admin&pwd=admin#login
             想得到整个如上的完整url，我们用：location.href;
             得到传输协议http:,我们用：location.protocol;
             得到主机名连同端口www.example.com:8080，我们用：location.host;
             得到主机名www.joymood.cn，我们用：location.hostname;
             得到主机后部分不包括问号?后部分的/test.php，就用我们刚才讲的：location.pathname;
             得到url中问号?之后井号#之前的部分?user=admin&pwd=admin，我们就用： location.search;
             得到#之前的部分#login，我们就用location.hash

             如上，我们可以通过location对象的某些属性得到一个完整URL的各个部分。
             */
            return {
                /**
                 获得指定的js文件的加载目录

                 @param jsName   js文件名
                 */
                getJsDir: function (jsName) {
                    //var path = $("script").eq(-1).attr("src");
                    var path = $("script[src*='" + jsName + "']").attr("src");

                    return path.substring(0, path.lastIndexOf("/") + 1);
                }
            };
        }());

        Tool.collection = (function () {
            return {
                getChildByTag: function (childs, tag) {
                    var childTag = null,
                        tags = YE.Tool.judge.isArray(tag) ? tag : [tag],
                        result = null,
                        breakOuter = {};

                    try {
                        childs.forEach(function (child) {
                            childTag = child.getTag();

                            if (!childTag) {
                                return;
                            }

                            tags.forEach(function (tag) {
                                childTag.forEach(function (t) {
                                    if (t === tag) {
                                        result = child;
                                        throw breakOuter;
                                    }
                                });
                            });
                        });
                    }
                    catch (e) {
                        if (e !== breakOuter) {
                            throw  e;
                        }
                    }

                    return result;
                },
                getChildsByTag: function (childs, tag) {
                    var childTag = null,
                        result = false,
                        tags = YE.Tool.judge.isArray(tag) ? tag : [tag],
                        breakOuter = {};

                    return childs.filter(function (child) {
                        result = false;
                        childTag = child.getTag();

                        if (!childTag) {
                            return;
                        }

                        try {
                            tags.forEach(function (tag) {
                                childTag.forEach(function (t) {
                                    if (t === tag) {
                                        result = true;
                                        throw breakOuter;
                                    }
                                });
                            });
                        }
                        catch (e) {
                            if (e !== breakOuter) {
                                throw  e;
                            }
                        }

                        return result;
                    });
                },
                removeChildByTag: function (childs, tag, func) {
                    var childTag = null,
                        result = false,
                        tags = YE.Tool.judge.isArray(tag) ? tag : [tag],
                        breakOuter = {};

                    childs.removeChild(function (child) {
                        result = false;
                        childTag = child.getTag();

                        if (!childTag) {
                            return false;
                        }

                        try {
                            tags.forEach(function (tag) {
                                childTag.forEach(function (t) {
                                    if (t === tag) {
                                        result = true;
                                        func && func(child);
                                        throw breakOuter;
                                    }
                                });
                            });
                        }
                        catch (e) {
                            if (e !== breakOuter) {
                                throw  e;
                            }
                        }

                        return result;
                    });
                },
                removeChildsByTag: function (childs, tag, func) {
                    var childTag = null,
                        tags = YE.Tool.judge.isArray(tag) ? tag : [tag],
                        arr = [],
                        breakOuter = {};

                    childs.forEach(function (child) {
                        childTag = child.getTag();

                        if (!childTag) {
                            arr.push(child);
                            return;
                        }

                        try {
                            tags.forEach(function (tag) {
                                childTag.forEach(function (t) {
                                    if (t === tag) {
                                        func&&func(child);
                                        throw breakOuter;
                                    }
                                });
                            });
                            arr.push(child);
                        }
                        catch (e) {
                            if (e !== breakOuter) {
                                throw  e;
                            }
                        }
                    });

                    childs.removeAllChilds();
                    childs.addChilds(arr);
                }
            }
        }());

        YE.Tool = Tool;
    }());
}());

(function () {
    YE.Graphics = YYC.Class(YE.Entity, {
        Init: function (context) {
            this.base();

            this.ye_context = context;
        },
        Private: {
            ye_context: null,

            ye_buildDiamondBox: function (originPoint, leftHalfAngle, size) {
                var p1 = originPoint,
                    p2 = [originPoint[0] + size * Math.cos(leftHalfAngle),
                        originPoint[1] - size * Math.sin(leftHalfAngle)
                    ],
                    p3 = [originPoint[0] + size * Math.cos(leftHalfAngle) * 2,
                        originPoint[1]
                    ],
                    p4 = [originPoint[0] + size * Math.cos(leftHalfAngle),
                        originPoint[1] + size * Math.sin(leftHalfAngle)
                    ];

                return [p1, p2, p3, p4];
            }
        },
        Public: {
            setContext: function (context) {
                this.ye_context = context;
            },
            drawPolygon: function (style, lineWidth, polygon) {
                var i = 0,
                    len = polygon.length;

                this.ye_context.strokeStyle = style;
                this.ye_context.lineWidth = lineWidth;

                this.ye_context.beginPath();

                this.ye_context.moveTo(polygon[0][0], polygon[0][1]);

                for (i = 1; i < len; i++) {
                    this.ye_context.lineTo(polygon[i][0], polygon[i][1]);
                }

                this.ye_context.lineTo(polygon[0][0], polygon[0][1]);

                this.ye_context.closePath();

                this.ye_context.stroke();
            },
            fillPolygon: function (style, polygon) {
                var i = 0,
                    len = polygon.length;

                this.ye_context.fillStyle = style;

                this.ye_context.beginPath();

                this.ye_context.moveTo(polygon[0][0], polygon[0][1]);

                for (i = 1; i < len; i++) {
                    this.ye_context.lineTo(polygon[i][0], polygon[i][1]);
                }

                this.ye_context.lineTo(polygon[0][0], polygon[0][1]);

                this.ye_context.closePath();

                this.ye_context.fill();
            },
            fillMultiplePolygon: function (style, polygonArr) {
                var i = 0,
                    self = this;

                this.ye_context.fillStyle = style;

                this.ye_context.beginPath();

                polygonArr.forEach(function (polygon) {
                    self.ye_context.moveTo(polygon[0][0], polygon[0][1]);

                    polygon.forEach(function (point) {
                        self.ye_context.lineTo(point[0], point[1]);
                    });

                    self.ye_context.lineTo(polygon[0][0], polygon[0][1]);
                });

                this.ye_context.closePath();
                this.ye_context.fill();
            },
            drawCircle: function (style, lineWidth, x, y, radius) {
                this.ye_context.strokeStyle = style;
                this.ye_context.lineWidth = lineWidth;
                this.ye_context.beginPath();
                this.ye_context.arc(x, y, radius, 0, Math.PI * 2, false);
                this.ye_context.stroke();
            },
            fillCircle: function (style, x, y, radius) {
                this.ye_context.fillStyle = style;
                this.ye_context.beginPath();
                this.ye_context.arc(x, y, radius, 0, Math.PI * 2, false);
                this.ye_context.fill();
            },
            drawDiamondBox: function (style, lineWidth, originPoint, leftHalfAngle, size) {
                this.drawPolygon(style, lineWidth, this.ye_buildDiamondBox(originPoint, leftHalfAngle, size));
            },
            fillDiamondBox: function (style, originPoint, leftHalfAngle, size) {
                this.fillPolygon(style, this.ye_buildDiamondBox(originPoint, leftHalfAngle, size));
            },
            fillMultipleDiamondBox: function (style, originPointArr, leftHalfAngle, size) {
                var pointArr = [],
                    self = this;

                originPointArr.forEach(function (originPoint) {
                    pointArr.push(self.ye_buildDiamondBox(originPoint, leftHalfAngle, size));
                });

                this.fillMultiplePolygon(style, pointArr);
            },
            /**
             * 绘制血条
             * @param rangeArr [左上角X,左上角Y,血条边框宽度,血条边框高度]
             * @param lineWidth
             * @param fillWidth
             * @param frameStyle
             * @param fillStyle
             */
            drawLifeBar: function (rangeArr, lineWidth, fillWidth, frameStyle, fillStyle) {
                this.ye_context.strokeStyle = frameStyle;
                this.ye_context.lineWidth = lineWidth;
                this.ye_context.strokeRect(rangeArr[0], rangeArr[1], rangeArr[2], rangeArr[3]);

                this.ye_context.fillStyle = fillStyle;
                this.ye_context.fillRect(rangeArr[0], rangeArr[1], fillWidth, rangeArr[3]);
            }
        },
        Static: {
            create: function (context) {
                return new this(context);
            }
        }
    });
}());
(function () {
    YE.YSoundEngine = YYC.Class({
        Init: function (config) {
            this.ye_urlArr = config.urlArr;
            this.ye_onload = config.onload;
            this.ye_onerror = config.onerror;
        },
        Private: {
            ye_audio: null,
            ye_urlArr: null,
            ye_onload: null,
            ye_onerror: null,

            ye_load: function () {
                //应该在绑定了事件后再设置src
                //因为设置src后，即会开始加载声音，所以事件handle越早有效越好。
                this.ye_audio.src = this.ye_getCanPlayUrl();
            },
            ye_getCanPlayUrl: function () {
                var self = this,
                    canPlayUrl = null;

                this.ye_urlArr.forEach(function (url) {
                    var result = url.match(/\.(\w+)$/);

                    if (result === null) {
                        YE.error(true, "声音url错误，必须加上类型后缀名");
                        return $break;
                    }

                    if (self.ye_canplay(result[1])) {
                        canPlayUrl = url;
                        return $break;
                    }
                });

                if (canPlayUrl === null) {
                    YE.error(true, "浏览器不支持该声音格式");
                    return;
                }

                return canPlayUrl;
            },
            ye_canplay: function (mimeType) {
                var audio = new Audio(),
                    mimeStr = null;

                switch (mimeType) {
                    case 'mp3':
                        mimeStr = "audio/mpeg";
                        break;
//                    case 'vorbis':
//                        mimeStr = "audio/ogg; codecs='vorbis'";
//                        break;
//                    case 'opus':
//                        mimeStr = "audio/ogg; codecs='opus'";
////                        break;
//                    case 'webm':
//                        mimeStr = "audio/webm; codecs='vorbis'";
//                        break;
//                    case 'mp4':
//                        mimeStr = "audio/mp4; codecs='mp4a.40.5'";
//                        break;
                    case 'wav':
                        mimeStr = "audio/wav";
                        break;
                    default :
                        YE.error(true, "声音类型错误");
                        break;
                }

                if (mimeType == 'mp3' && YE.Tool.judge.browser.isFF()) {
                    return false;
                }

                return !!audio.canPlayType && audio.canPlayType(mimeStr) !== "";
            }
        },
        Public: {
            initWhenCreate: function () {
                var self = this;

                if (!Audio) {
                    YE.log("浏览器不支持Audio对象");
                    return YE.returnForTest;
                }

                this.ye_audio = new Audio();

                this.ye_audio.addEventListener("canplaythrough", function () {
                    self.ye_onload.call(self, null);
                }, false);
                this.ye_audio.addEventListener("error", function () {
                    self.ye_onerror.call(self, self.ye_audio.error.code);
                }, false);
//
//                audio.autoplay = false;
//                audio.preload = 'auto';
//                audio.autobuffer = true;

                /*!
                 Audio still doesn't work consistently across all browsers, as of right now:

                 An element must be reloaded in Chrome or it will only play once
                 An element must not be reloaded in Firefox or there will be a delay
                 */
                this.ye_audio.addEventListener("ended", function () {
                    if (YE.Tool.judge.browser.isChrome()) {
                        this.load();
                    }
                    else if (YE.Tool.judge.browser.isFF()) {
                        this.currentTime = 0;
                    }
                    else {
                        YE.error(true, "目前仅支持chrome、firefox浏览器");
                    }
                }, false);

                this.ye_load();
//
                setTimeout(function () {
                }, 50);
            },
            play: function () {
                this.ye_audio.play();
            }
        },
        Static: {
            create: function (config) {
                var engine = new this(config);

                engine.initWhenCreate();

                return engine;
            }
        }
    });
}());
