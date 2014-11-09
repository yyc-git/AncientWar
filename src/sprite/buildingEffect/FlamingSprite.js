/**古代战争
 * 作者：YYC
 * 日期：2014-10-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var FlamingSprite = YYC.Class(Sprite, {
    Init: function (data) {
        this.base(data);

        this.__type = data.type;
        this.getAnimationFrameManager().addAnim("flaming", AnimPool.getInstance().getAnim(this.changeToAnimNameInAnimPool("flaming")));
    },
    Private: {
        __type: null
    },
    Public: {
        runFlamingAction: function () {
            this.runOnlyOneAction(this.getAnimationFrameManager().getAnim("flaming"));
        },
        changeToAnimNameInAnimPool: function (animNameInSprite) {
            var animName = "";

            switch (this.__type) {
                case "large":
                    animName = "large_" + animNameInSprite;
                    break;
                case  "middle":
                    animName = "middle_" + animNameInSprite;
                    break;
                case "singleGrid":
                    animName = "singleGrid_" + animNameInSprite;
                    break;
                default :
                    throw new Error("精灵大小类型错误");
            }

            return animName;
        }
    }
});