var TowerSprite = YYC.Class(BuildingSprite, {
    Init: function (data) {
        this.base(data);
    },
    Private: {
        _____getAttackBasePoint: function () {
            return [this.getPositionX() + config.map.gridWidth / 2, this.getPositionY() - this.getHeight() * 0.5];
        }
    },
    Protected: {
        P___showBasicInfo: function () {
            this.base();

            ui.showSpriteInfo("攻击力：" + this.damage);
        }
    },
    Public: {
        name: "tower",
        reloadTimeLeft: 0,

        runGuardAction: function () {
            this.runOnlyOneAction(this.getGuardAction());
        },
        runAttackAction: function (target) {
            this.runOnlyOneAction(this.getAttackAction(target));
        },
        getGuardAction: function () {
            return TowerGuard.create();
        },
        getAttackAction: function (target) {
            return CommonTowerAttack.create(target);
        },
        attack: function (target) {
            this.runAttackAction(target);
        },
        getAttackPoint: function (target) {
            var currentPixPos = this._____getAttackBasePoint(), //攻击基准点在方格中心，箭塔上方
                targetPixPos = [target.getPositionX(), target.getPositionY()];

            var direction = moveAlgorithm.findAccurateDirectionInPix(currentPixPos, targetPixPos);
            var directionSide = moveAlgorithm.judgeDirectionSide(direction);

            var leftAttackPoint = [currentPixPos[0] - 50, currentPixPos[1] ],
                rightAttackPoint = [currentPixPos[0] + 50, currentPixPos[1]],
                upAttackPoint = [currentPixPos[0], currentPixPos[1] - 60 ],
                downAttackPoint = [currentPixPos[0], currentPixPos[1] + 30],
                leftUpAttackPoint = [currentPixPos[0] - 40, currentPixPos[1] - 20],
                leftDownAttackPoint = [currentPixPos[0] - 40, currentPixPos[1] + 10],
                rightUpAttackPoint = [currentPixPos[0] + 40, currentPixPos[1] - 20],
                rightDownAttackPoint = [currentPixPos[0] + 40 , currentPixPos[1] + 10];

            return this.P___getAttackPointWithEightDire(directionSide, [leftAttackPoint, rightAttackPoint,
                upAttackPoint, downAttackPoint, leftUpAttackPoint, leftDownAttackPoint, rightUpAttackPoint, rightDownAttackPoint]);
        },
        onEnter: function () {
            this.base();

            if(!this.isBuildState()){
                this.runGuardAction();
            }
        }
    }
});