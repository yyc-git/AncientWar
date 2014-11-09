/**古代战争
 * 作者：YYC
 * 日期：2014-03-11
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var ArrowSprite = YYC.Class(Sprite, {
    Init: function (data) {
        this.base(data);

        this.__target = data.target;
        this.__damage = data.damage;
    },
    Private: {
        __destGridPos: null,
        __target: null,

        __prepareAnim: function (actionName) {
            var animationFrameManager = this.getAnimationFrameManager(),
                cache = AnimPool.getInstance();

            animationFrameManager.addAnim(actionName + "_0", cache.getAnim(actionName + "_0"));
            animationFrameManager.addAnim(actionName + "_1", cache.getAnim(actionName + "_1"));
            animationFrameManager.addAnim(actionName + "_2", cache.getAnim(actionName + "_2"));
            animationFrameManager.addAnim(actionName + "_3", cache.getAnim(actionName + "_3"));
            animationFrameManager.addAnim(actionName + "_4", cache.getAnim(actionName + "_4"));
            animationFrameManager.addAnim(actionName + "_5", cache.getAnim(actionName + "_5"));
            animationFrameManager.addAnim(actionName + "_6", cache.getAnim(actionName + "_6"));
            animationFrameManager.addAnim(actionName + "_7", cache.getAnim(actionName + "_7"));
            animationFrameManager.addAnim(actionName + "_8", cache.getAnim(actionName + "_8"));
            animationFrameManager.addAnim(actionName + "_9", cache.getAnim(actionName + "_9"));
            animationFrameManager.addAnim(actionName + "_10", cache.getAnim(actionName + "_10"));
            animationFrameManager.addAnim(actionName + "_11", cache.getAnim(actionName + "_11"));
            animationFrameManager.addAnim(actionName + "_12", cache.getAnim(actionName + "_12"));
            animationFrameManager.addAnim(actionName + "_13", cache.getAnim(actionName + "_13"));
            animationFrameManager.addAnim(actionName + "_14", cache.getAnim(actionName + "_14"));
            animationFrameManager.addAnim(actionName + "_15", cache.getAnim(actionName + "_15"));
        },
        __isReacheDestination: function (destination) {
            return moveAlgorithm.isReachDestPoint([this.gridX, this.gridY], destination);
        }
    },
    Protected: {
    },
    Public: {
        name: "arrow",

        runFlyAnim: function (direction) {
            this.runOnlyOneAnim("fly_" + direction);
        },
        getAttackPoint: function () {
            return [this.gridX, this.gridY];
        },
        setDestination: function (destGridPos) {
            this.__destGridPos = destGridPos;
        },
        getFireAction: function () {
            return YE.Sequence.create(YE.RepeatCondition.create(Parabola.create(this.__destGridPos), this, function () {
                return !this.__isReacheDestination(this.__destGridPos);
            }), YE.CallFunc.create(function (sprite, dataArr) {
                var target = dataArr[0],
                    damage = dataArr[1];

                if (this.isHitTarget() && !target.isDead()) {
                    target.life -= damage;
                    if (target.isDead()) {
                        target.runDeadAction();
                    }
                    target.showInfo();
                }

                this.removeSprite();
            }, this, this.__target, this.__damage));
        },
        fire: function () {
            this.runOnlyOneAction(this.getFireAction());
        },
        isHitTarget: function () {
            var result = false,
                attackedDest = this.__target.getAttackedPoint();

            if (tool.isUnitSprite(this.__target)) {
                result = tool.isInCircleRange(attackedDest, [this.gridX, this.gridY], tool.convertToGridSize(this.__target.radius + 10));
            }
            else if (tool.isBuildingSprite(this.__target)) {
                result = this.__isReacheDestination(attackedDest);
            }
            else {
                throw new Error("target类型错误");
            }

            return result;
        },
        onEnter: function () {
            this.__prepareAnim("fly");

            this.fire();
        }
    },
    Static: {
        create: function (data) {
            return new ArrowSprite(data);
        }
    }
});