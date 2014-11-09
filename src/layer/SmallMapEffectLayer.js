/**古代战争
 * 作者：YYC
 * 日期：2014-05-17
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var SmallMapEffectLayer = YYC.Class(SmallMapLayer, {
        Private: {
            __computeViewPointSize: function () {
                var bigMapData = window.mapLayer.getCanvasData();

                return {width: bigMapData.width / config.map.scale, height: bigMapData.height / config.map.scale};
            },
            __computeViewPointPos: function () {
                var bigMapOffsetX = window.mapLayer.getOffsetX(),
                    bigMapOffsetY = window.mapLayer.getOffsetY();

                return  [bigMapOffsetX / config.map.scale, bigMapOffsetY / config.map.scale];
            },
            __drawViewPoint: function () {
                var viewPointPixPos = this.__computeViewPointPos(),
                    viewPointData = this.__computeViewPointSize(),
                    context = this.getContext();

                context.strokeStyle = 'white';
                context.strokeRect(viewPointPixPos[0], viewPointPixPos[1], viewPointData.width, viewPointData.height);
            },
            __jumpToViewPoint: function (e) {
                var viewPointPixPos = tool.computeRelativeMousePixPos(e),
                    bigMapOffset = null;

                viewPointPixPos = this.__setViewPointToCenter(viewPointPixPos);

                if (this.__isViewPointOutOfMap(viewPointPixPos)) {
                    return;
                }

                bigMapOffset = [viewPointPixPos[0] * config.map.scale, viewPointPixPos[1] * config.map.scale];

                window.mapLayer.setOffsetX(bigMapOffset[0]);
                window.mapLayer.setOffsetY(bigMapOffset[1]);

                window.mapLayer.setStateChange();

                // 小地图跳转视口时，要恢复fogLayer的调用频率（每次主循环调用），
                // 这样可解决“跳转后大地图迷雾还没刷新（<0.5s后调用fogLayer->draw后，才会刷新）”的问题。
                // 不在此处直接调用“fogLayer.resumeRunInterval()”，
                // 因为会与此处的MapLayer->_handleRoll中调用“fogLayer.setRunInterval(0.5);”冲突！
                // 所以将判断的逻辑都交给fogLayer.adjustRunInterval，此处仅进行触发即可
                YE.Director.getInstance().getCurrentScene().subject.publishAll(fogLayer, "jumpToViewPoint");
            },
            __setViewPointToCenter: function (viewPointPixPos) {
                var viewPointData = this.__computeViewPointSize();

                return [viewPointPixPos[0] - viewPointData.width / 2, viewPointPixPos[1] - viewPointData.height / 2];
            },
            __isViewPointOutOfMap: function (viewPointPixPos) {
                var viewPointData = this.__computeViewPointSize(),
                    canvasData = this.getCanvasData();

                return viewPointPixPos[0] < 0 || viewPointPixPos[1] < 0 ||
                    viewPointPixPos[0] + viewPointData.width > canvasData.width ||
                    viewPointPixPos[1] + viewPointData.height > canvasData.height;
            }
        },
        Public: {
            draw: function (context) {
                this.__drawViewPoint();
            },
            onclick: function (e) {
                if (window.smallMapBackgroundLayer.isMoveAndAttackCommand) {
                    window.smallMapBackgroundLayer.isMoveAndAttackCommand = false;
                    return;
                }

                this.__jumpToViewPoint(e);
            }
        }
    });

    window.SmallMapEffectLayer = SmallMapEffectLayer;
}());