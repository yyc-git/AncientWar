/**古代战争
 * 作者：YYC
 * 日期：2014-02-04
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var ArcherSprite = YYC.Class(CharacterSprite, {
    Init: function (data) {
        this.base(data);
    },
    Private: {
        _____prepareAnim: function () {
            this.P___initAnim("stand");
            this.P___initAnim("move");
            this.P___initAnim("prepareAttack");
            this.P___initAnim("attack");
            this.P___initAnim("dead");
            this.P___initAnim("disappear");
        }
    },
    Protected: {
    },
    Public: {
        name: "archer",
        direction: 0,
        reloadTimeLeft: 0,

        runMoveAnim: function () {
            this.runOnlyOneAnim("move_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runStandAnim: function () {
            this.runOnlyOneAnim("stand_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runHuntAction: function () {
            this.runOnlyOneAction(this.getHuntAction());
        },
        getHuntAction: function () {
            return Hunt.create();
        },
        attackDamage: function (target) {
            combatAlgorithm.remoteAttack(target, this.getAttackPoint(target), this.damage);
        },
        getAttackPoint: function () {
            var currentPixPos = [this.getPositionX(), this.getPositionY()];
            var directionSide = moveAlgorithm.judgeDirectionSide(this.direction);

            var leftAttackPoint = [currentPixPos[0] - this.radius - 30, currentPixPos[1] - this.getHeight() * 0.8],
                rightAttackPoint = [currentPixPos[0] + this.radius + 50, currentPixPos[1] - this.getHeight() * 0.8],
                upAttackPoint = [currentPixPos[0], currentPixPos[1] - this.getHeight() ],
                downAttackPoint = [currentPixPos[0] - 30, currentPixPos[1] + 30],
                leftUpAttackPoint = [currentPixPos[0] - this.radius - 30, currentPixPos[1] - this.getHeight() * 1],
                leftDownAttackPoint = [currentPixPos[0] - this.radius - 30, currentPixPos[1] - this.getHeight() * 0.6],
                rightUpAttackPoint = [currentPixPos[0] + this.radius + 30, currentPixPos[1] - this.getHeight() * 1],
                rightDownAttackPoint = [currentPixPos[0] + this.radius + 40, currentPixPos[1] - this.getHeight() * 0.4];

            return this.P___getAttackPointWithEightDire(directionSide, [leftAttackPoint, rightAttackPoint,
                upAttackPoint, downAttackPoint, leftUpAttackPoint, leftDownAttackPoint, rightUpAttackPoint, rightDownAttackPoint]);
        },
        hunt: function () {
            this.runHuntAction();
        },
        onStartLoop: function () {
            this.base();

            this.P____rangeHeight = this.getHeight() - 15;
        },
        onEnter: function () {
            this._____prepareAnim();

            this.base();
        }
    }
});


