/**古代战争
 * 作者：YYC
 * 日期：2014-02-06
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var Sprite = YYC.AClass(YE.Sprite, {
    Init: function (data) {
        var positionPix = null;

        this.P_getSettingFromConfig();

        this.base(null);

        if (data) {
            positionPix = tool.convertToPix(data.gridX, data.gridY);

            this.setPosition(positionPix[0], positionPix[1]);

            this.gridX = data.gridX;
            this.gridY = data.gridY;
        }

        this.width && this.setWidth(this.width);
        this.height && this.setHeight(this.height);
    },
    Private: {
        _collectAnimsToAnimPool: function () {
            var anims = this.getAnimationFrameManager().getAnims(),
                i = null,
                pool = window.AnimPool.getInstance();

            for (i in anims) {
                if (anims.hasOwnProperty(i)) {
                    anims[i].reset();   //重置动画
                    pool.addAnim(this.changeToAnimNameInAnimPool(i), anims[i]);
                }
            }
        }
    },
    Protected: {
        P_getSettingFromConfig: function () {
            if (config.spriteConfig[this.name]) {
                YYC.Tool.extend.extendDeep(config.spriteConfig[this.name], this);
            }
        },
        P_createAndSetDisplayTarget: function (jsonId, imgId, frameName, pixelOffsetX, pixelOffsetY) {
            YE.FrameCache.getInstance().addFrameData(jsonId, imgId);

            var frame = YE.FrameCache.getInstance().getFrame(frameName);
            frame.setAnchor(pixelOffsetX, pixelOffsetY);
            this.setDisplayTarget(frame);
        }
    },
    Public: {
        removeSprite: function () {
            this._collectAnimsToAnimPool();

            this.getParent().removeChild(this);
        },
        playSoundWhenInViewPoint: function (soundId) {
            if (window.mapLayer.isInViewPoint(this.getPositionX(), this.getPositionY())) {
                YE.SoundManager.getInstance().play(soundId);
            }
        },
        isDead: function () {
            return false;
        },
        onStartLoop: function () {
            var mapLayer = window.mapLayer,
                offsetX = mapLayer.getOffsetX(),
                offsetY = mapLayer.getOffsetY();

            this.setOffsetX(offsetX);
            this.setOffsetY(offsetY);

            var gridPos = null;

            gridPos = tool.convertToGrid(this.getPositionX(), this.getPositionY());

            this.gridX = gridPos[0];
            this.gridY = gridPos[1];

            this.gridX = this.gridX < 0 ? 0 : this.gridX;
            this.gridY = this.gridY < 0 ? 0 : this.gridY;
        },
        Virtual: {
            changeToAnimNameInAnimPool: function (animNameInSprite) {
                return animNameInSprite;
            }
        }
    }
});