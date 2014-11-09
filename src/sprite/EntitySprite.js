/**古代战争
 * 作者：YYC
 * 日期：2014-02-11
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var EntitySprite = YYC.AClass(SelectableSprite, {
    Init: function (data) {
        this.base(data);

        //默认生命值为最大生命值
        this.life = data && data.life ? data.life : this.hitPoints;

        this.team = data.team || "blue";

        this.reloadTimeLeft = this.reloadTime;

        if (data.tag) {
            this.addTag(data.tag);
        }
    },
    Private: {
        ___afterDraw: function (context) {
            if (this.selected) {
                this.drawLifeBar(context);
            }
        }
    },
    Protected: {
        P___showBasicInfo: function () {
        },
        P___showMoreInfo: function () {
        },
        P___getAttackPointWithEightDire: function (directionSide, attackPointArr) {
            var attackPoint = null,
                leftAttackPoint = attackPointArr[0],
                rightAttackPoint = attackPointArr[1],
                upAttackPoint = attackPointArr[2],
                downAttackPoint = attackPointArr[3],
                leftUpAttackPoint = attackPointArr[4],
                leftDownAttackPoint = attackPointArr[5],
                rightUpAttackPoint = attackPointArr[6],
                rightDownAttackPoint = attackPointArr[7];

            if (directionSide.isLeft) {
                attackPoint = leftAttackPoint;
            }
            else if (directionSide.isRight) {
                attackPoint = rightAttackPoint;
            }
            else if (directionSide.isUp) {
                attackPoint = upAttackPoint;
            }
            else if (directionSide.isDown) {
                attackPoint = downAttackPoint;
            }
            else if (directionSide.isLeftUp) {
                attackPoint = leftUpAttackPoint;
            }
            else if (directionSide.isLeftDown) {
                attackPoint = leftDownAttackPoint;
            }
            else if (directionSide.isRightUp) {
                attackPoint = rightUpAttackPoint;
            }
            else {
                attackPoint = rightDownAttackPoint;
            }

            return tool.convertToGrid(attackPoint[0], attackPoint[1]);
        }
    },
    Public: {
        team: null,

        runDeadAction: function () {
            this.removeAllAnims();
            this.runOnlyOneAction(this.getDeadAction());
        },
        findFirstTarget: function (targets) {
            return targets[0];
        },
        draw: function (context) {
            this.base(context);
            this.___afterDraw(context);
        },
        showInfo: function () {
            if (!this.selected) {
                return;
            }

            ui.clearInfo();
            if (this.isDead()) {
                return;
            }

            if (tool.isEnemySprite(this)) {
                this.P___showBasicInfo();
                return;
            }

            this.P___showBasicInfo();
            this.P___showMoreInfo();
        },
        isDead: function () {
            return this.life <= 0;
        },
        isHealthy: function () {
            return this.life > this.hitPoints * 0.4;
        },
        isDamaged: function () {
            return this.life <= this.hitPoints * 0.4 && this.life > 0;
        },
        onStartLoop: function () {
            this.base();

            if (this.isDead()) {
                window.mapLayer.notSelectItem(this);
            }
        }
    },
    Abstract: {
        drawLifeBar: function (context) {
        },
        getAttackedPoint: function () {
        },
        getSightPoint: function () {
        }
    }
});