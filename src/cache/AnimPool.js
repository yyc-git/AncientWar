/**古代战争 动画实例池
 * 作者：YYC
 * 日期：2014-05-06
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
//
(function () {
    var _instance = null;


    var AnimPool = YYC.Class({
        Init: function () {
            this._poolContainer = {};
        },
        Private: {
            _poolContainer: null,

            _addAnimsToPool: function (animName) {
                var funcArr = [],
                    i = 0,
                    len = this.size,
                    self = this;

                for (i = 0; i < len; i++) {
                    funcArr.push(function (args) {
                        self.addAnim.apply(self, arguments);
                    });
                }

                //因为需要在同一时间调用多次getAnim获得不同动画实例（如新增一个农民时，需要getAnim农民的移动、攻击等相关动画），会造成线程阻塞。
                //因此，时间为[200,2000]区间内的随机值，分散执行getAnim的时间
                YYC.Tool.optimize.multiStep(funcArr, [animName], [200, 2000]);
            }
        },
        Public: {
            minInstanceNum: 5,
            size: 20,

            getAnim: function (animName) {
                var anim = null,
                    cache = YE.AnimationCache.getInstance();

                if (!this._poolContainer[animName] || this._poolContainer[animName].length === 0) {
                    anim = cache.getAnim(animName).copy();

                    if (!anim) {
                        return null;
                    }

                    this._poolContainer[animName] = [];
                }
                else {
                    anim = this._poolContainer[animName].pop();
                }

                if (this._poolContainer[animName].length < this.minInstanceNum) {
                    this._addAnimsToPool(animName);
                }

                return anim;
            },
            addAnim: function (arg) {
                var animName = null,
                    anim = null;

                if (arguments.length === 1) {
                    var cache = YE.AnimationCache.getInstance();

                    animName = arguments[0];
                    anim = cache.getAnim(animName).copy();
                }
                else {
                    animName = arguments[0];
                    anim = arguments[1];
                }

                if (!this._poolContainer[animName]) {
                    this._poolContainer[animName] = [anim];
                    return;
                }
                this._poolContainer[animName].push(anim);
            },
            initWithFile: function (jsonFilePath) {
                var jsonData = null,
                    animName = null,
                    j = 0,
                    len = this.size;

                jsonData = YE.JsonLoader.getInstance().get(jsonFilePath);

                for (animName in jsonData) {
                    if (jsonData.hasOwnProperty(animName)) {
                        if (!this._poolContainer[animName]) {
                            this._poolContainer[animName] = [];
                        }

                        for (j = 0; j < len; j++) {
                            this.addAnim(animName);
                        }
                    }
                }
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

    window.AnimPool = AnimPool;
}());