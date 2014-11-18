/**古代战争
 * 作者：YYC
 * 日期：2014-02-11
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var CharacterSprite = YYC.Class(EntitySprite, {
    Init: function (data) {
        this.base(data);
        if (data.anim) {
            this.direction = Number(data.anim.substr(-1));
        }
        else {
            this.direction = 4;
        }

        this.radiusGrid = tool.convertToGridSize(this.radius);
        this.smallMapRadius = tool.convertToSmallMapPixSize(this.radius * 2);

        this.P____steer = new Steer();
    },
    Private: {
        ____command: null,

        ____last_dest: null,
        ____last_nextDirection: null,
        ____last_nextPos: null,
        ____path: null,
        ____waitingBeginTime: 0,
        ____isWaitingFlag: false,
        ____isMovingFlag: false,
        ____isPrepareForFindNewPathWithUnit: false,

        ____continueLastMove: function () {
            var moveData = {
                nextPos: this.____last_nextPos,
                nextDirection: this.____last_nextDirection
            };

            this.____move(moveData, this.____last_dest);
        },
        ____makeGridReachable: function (passableGridData, destination) {
            passableGridData[destination[1]][destination[0]] = 0;

            return passableGridData;
        },
        ____wait: function (nextPos, nextDirection) {
            this.____isMovingFlag = false;
            this.____isWaitingFlag = true;
            this.____waitingBeginTime = new Date().getTime();
            this.____last_nextDirection = nextDirection;
            this.____last_nextPos = nextPos;
        },
        ____isWaitingForMove: function () {
            return this.____isWaitingFlag;
        },
        ____isWaitingMaxTime: function () {
            var maxTime = 0.5;
            var ms = new Date().getTime() - this.____waitingBeginTime;

            return ms / 1000 >= maxTime;
        },
        ____waitAndPollingMove: function (destGrid) {
            var collisionData = null;

            if (this.____canMove(this.____last_nextPos)) {
                this.____continueLastMove();

                return;
            }

            if (this.____isWaitingMaxTime()) {
                collisionData = this.____handleCollision(this.____last_nextPos, this.____last_nextDirection,
                    this.____getCollisionObjects(this.____last_nextPos), destGrid);

                this.____move(collisionData, this.____last_dest);

                return;
            }

            this.____keepWait();
        },
        ____keepWait: function () {
            this.____isMovingFlag = false;
        },
        ____getNextPathGrid: function (now) {
            if (tool.isEqualGrid(now, this.____path[0])) {
                this.____path.shift();

            }
            return this.____path[0];
        },
        ____move: function (collisionData, dest_floorGrid) {
            if (this.____isWaitingForMove() && !collisionData) {
                this.____isMovingFlag = false;
                return;
            }
            var nextPos = collisionData.nextPos,
                nextDirection = moveAlgorithm.getDirectionRoundNumber(collisionData.nextDirection);

            this.setPosition(nextPos[0], nextPos[1]);

            this.runMoveAnim();

            this.direction = collisionData.nextDirection;

            this.____last_dest = dest_floorGrid;

            this.____isMovingFlag = true;
            this.____isWaitingFlag = false;

            if (this.canAttack) {
                this.____reloadWhenMoving();
            }
        },
        ____prepareForFindNewPathWithUnit: function () {
            this.____path = null;
            this.isCollisionMove = false;
            this.____isPrepareForFindNewPathWithUnit = true;
        },
        ____isChangeDest: function (newDest, oldDest) {
            return !tool.isEqualGrid(newDest, oldDest);
        },
        ____canMove: function (nextPos) {
            return this.____getCollisionObjects(nextPos).length === 0;
        },
        ____isOutOfDistance: function () {
            var current = [this.gridX, this.gridY];
            var distance = null;
            var highestPriorityCollisionObject = this.P____steer.last_highestPriorityCollisionObject;

            if (this.P____steer.isTerrainCollision(highestPriorityCollisionObject)) {
                distance = this.radiusGrid;
                return !tool.isInPointToDiamondBoxEdgeDistance(current, highestPriorityCollisionObject.gridPos, distance);
            }

            distance = this.radiusGrid * 2.5 + highestPriorityCollisionObject.with.radiusGrid;

            return !tool.isInCircleRange(current, highestPriorityCollisionObject.gridPos, distance);
        },
        ____isNotBuildPassGrid: function () {
            return window.mapLayer.passableGridData.length === 0;
        },
        ____getNextPos: function (current, destination) {
            if (arguments.length === 1) {
                var direction = arguments[0];

                var movement = moveAlgorithm.computeMovement(direction, this.speed);

                return [(this.getPositionX() + movement[0]), (this.getPositionY() + movement[1])];
            }
            else {
                var movement = moveAlgorithm.computeMovement(current, destination, this.speed);

                return  [this.getPositionX() + movement[0], this.getPositionY() + movement[1]];
            }
        },
        ____handleCollision: function (nextPos, nextDirection, collisionObjects, destGrid) {
            var newNextDirection = 0 ,
                nextGrid = null,
                current = null,
                self = this,
                newNextPos = null;

            nextGrid = tool.convertToGrid(nextPos[0], nextPos[1]);
            current = [this.gridX, this.gridY];

            if (collisionObjects.length > 0) {
                if (this.P____steer.highestPriorityCollisionObject &&
                    this.____isHighestPriorityCollisionObjectUnit() &&
                    this.____isHighestPriorityCollisionUnitMoving() &&
                    this.____isHighestPriorityCollisionUnitToSameDest()
                    ) {
                    this.____wait(nextPos, nextDirection);
                    return null;
                }

                newNextDirection = this.P____steer.calculateDirection(collisionObjects, nextGrid, current, nextDirection, destGrid);
                newNextPos = this.____getNextPos(newNextDirection);

                this.isCollisionMove = true;

                if (moveAlgorithm.isDestCanNotPass(tool.convertToGrid(newNextPos))) {
                    this.runGuardAction();
                }
            }
            else {
                this.P____steer.resetFlag();
                this.____isWaitingFlag = false;
                this.isCollisionMove = false;
                newNextDirection = nextDirection;
                newNextPos = nextPos;
            }


            this.____last_nextDirection = newNextDirection;
            this.____last_nextPos = newNextPos;

            return {nextDirection: newNextDirection, nextPos: newNextPos};
        },
        ____isHighestPriorityCollisionObjectUnit: function () {
            return this.P____steer.isCollisionUnit(this.P____steer.highestPriorityCollisionObject);
        },
        ____isHighestPriorityCollisionUnitMoving: function () {
            return this.P____steer.highestPriorityCollisionObject.with.isMoving();
        },
        ____isHighestPriorityCollisionUnitToSameDest: function () {
            return tool.isEqualGrid(this.getMoveDest(), this.P____steer.highestPriorityCollisionObject.with.getMoveDest());
        },
        ____reloadWhenMoving: function () {
            if (this.reloadTimeLeft > 0) {
                this.reloadTimeLeft -= 1;
            }
        },
        ____collisionMove: function (destGrid) {
            var nextDirection = this.____last_nextDirection,
                nextPos = this.____getNextPos(nextDirection),
                collisionData = null,
                dest_floorGrid = tool.roundDownGrid(destGrid);

            collisionData = this.____handleCollision(nextPos, nextDirection, this.____getCollisionObjects(nextPos), destGrid);

            /*!
             此处要设置isCollisionMove为true。
             这样可保证“发生碰撞后会一直判断____isOutOfDistance，如果没有outOf，则碰撞移动；
             如果outOf，再重新寻路，并置isCollisionMove为false（即下一次循环不再判断____isOutOfDistance）”

             这样可保证精灵发生碰撞后，会沿着碰撞方向碰撞移动一段距离后，再重新寻路！
             */
            this.isCollisionMove = true;

            this.____move(collisionData, dest_floorGrid);
        },
        ____getCollisionObjects: function (nextPos) {
            var passableGridData = null,
                nextGrid = null,
                units = null;

            passableGridData = window.mapLayer.passableGridData;
            nextGrid = tool.convertToGrid(nextPos[0], nextPos[1]);
            units = this.getParent().getChildsByTag("unit");

            return this.P____steer.getCollisionObjects(passableGridData, nextGrid, units, this.getUid(), this.radiusGrid);
        },
        ____findPath: function (passableGridData, current_floorGrid, dest_floorGrid) {
            var gridData = passableGridData;

            if (moveAlgorithm.isDestCanNotPass(dest_floorGrid)) {
                gridData = this.____makeGridReachable(YE.Tool.extend.extendDeep(passableGridData), dest_floorGrid);
            }

            return YE.AStar.aCompute(gridData, current_floorGrid, dest_floorGrid).path;
        },
        ____getPassableGridData: function () {
            var passableGridData = null;

            if (this.____isPrepareForFindNewPathWithUnit) {
                passableGridData = window.mapLayer.getUnitPassableGridData(this.getUid());
                this.____isPrepareForFindNewPathWithUnit = false;
            }
            else {
                passableGridData = window.mapLayer.passableGridData;
            }

            return passableGridData;
        }
    },
    Protected: {
        //选中判定范围高度
        P____rangeHeight: 0,
        P____steer: null,

        P_createSelectRange: function (x, y) {
            return [
                [ x - this.radius, y],
                [x - this.radius, y - this.P____rangeHeight],
                [x + this.radius, y - this.P____rangeHeight],
                [x + this.radius, y]
            ];
        },
        P___showBasicInfo: function () {
            ui.showSpriteInfo(this.cName);
            ui.showSpriteInfo("生命值：" + this.life + "/" + this.hitPoints);
            ui.showSpriteInfo("攻击力：" + this.damage);
        },
        P___showMoreInfo: function () {
            ui.show("command");
        },
        P___initAnim: function (actionName) {
            var animationFrameManager = this.getAnimationFrameManager(),
//                cache = YE.AnimationCache.getInstance(),
                cache = AnimPool.getInstance(),
                cacheAnimName = this.changeToAnimNameInAnimPool(actionName);

            animationFrameManager.addAnim(actionName + "_0", cache.getAnim(cacheAnimName + "_0"));
            animationFrameManager.addAnim(actionName + "_1", cache.getAnim(cacheAnimName + "_1"));
            animationFrameManager.addAnim(actionName + "_2", cache.getAnim(cacheAnimName + "_2"));
            animationFrameManager.addAnim(actionName + "_3", cache.getAnim(cacheAnimName + "_3"));
            animationFrameManager.addAnim(actionName + "_4", cache.getAnim(cacheAnimName + "_4"));
            animationFrameManager.addAnim(actionName + "_5", cache.getAnim(cacheAnimName + "_5"));
            animationFrameManager.addAnim(actionName + "_6", cache.getAnim(cacheAnimName + "_6"));
            animationFrameManager.addAnim(actionName + "_7", cache.getAnim(cacheAnimName + "_7"));

        }
    },
    Public: {
        radiusGrid: null,   //半径（单位为方格大小）
        smallMapRadius: null,   //半径（单位为小地图pix大小）

        changeToAnimNameInAnimPool: function (animNameInSprite) {
            return this.name + "_" + this.team + "_" + animNameInSprite;
        },
        runAttackAnim: function () {
            var anim = this.getAnimationFrameManager().getAnim("attack_" + moveAlgorithm.getDirectionRoundNumber(this.direction));

            anim.reset();

            this.runOnlyOneAnim(anim);
        },
        runPrepareAttackAnim: function () {
            this.runOnlyOneAnim("prepareAttack_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runMoveToAction: function (destination) {
            this.runOnlyOneAction(this.getMoveToAction(destination));
        },
        runGuardAction: function () {
            this.runOnlyOneAction(this.getGuardAction());
        },
        runAttackAction: function (target) {
            this.runOnlyOneAction(this.getAttackAction(target));
        },
        runMoveAndAttackAction: function (destGrid) {
            this.runOnlyOneAction(this.getMoveAndAttackAction(destGrid));
        },
        runDeadAction: function () {
            this.base();

            this.playSoundWhenInViewPoint(this.name + "_command_dead");
        },
        getMoveToAction: function (destination) {
            return MoveTo.create(destination);
//          return  YE.Sequence.create(
//                YE.RepeatCondition.create(MoveToDest.create(destination), this, function () {
//                    return !this.countCollision(destination);
//                }),
//                this.getGuardAction());
        },
        getMoveAndAttackAction: function (destGrid) {
            return MoveAndAttack.create(destGrid);
        },
        getDeadAction: function () {
            return YE.Sequence.create(
                this.getAnimationFrameManager().getAnim("dead_" + moveAlgorithm.getDirectionRoundNumber(this.direction)),
                YE.DelayTime.create(5),
                this.getAnimationFrameManager().getAnim("disappear_" + moveAlgorithm.getDirectionRoundNumber(this.direction)),
                YE.DelayTime.create(3),
                YE.CallFunc.create(this.removeSprite, this));
        },
        getGuardAction: function () {
            return UnitGuard.create();
        },
        getAttackAction: function (target) {
            return CommonUnitAttack.create(target);
        },
        moveTo: function (destination) {
            this.runMoveToAction(destination);
        },
        moveToDest: function (destination) {
            var nextDirection = null,
                nextPos = null,
                current_floorGrid = null,
                dest_floorGrid = null,
                current = null,
                collisionData = null;

            current_floorGrid = [Math.floor(this.gridX), Math.floor(this.gridY)];
            dest_floorGrid = [Math.floor(destination[0]), Math.floor(destination[1])];
            current = [this.gridX, this.gridY];

            if (this.____isWaitingForMove()) {
                this.____waitAndPollingMove(destination);
                return;
            }

            if (this.____isNotBuildPassGrid()) {
                window.mapLayer.buildPassableGrid();
            }

            this.countCollision(destination);

            if (this.isCollisionMove) {
                if (this.____isOutOfDistance()) {
                    this.____prepareForFindNewPathWithUnit();
                }
                else {
                    this.____collisionMove(destination);
                    return;
                }
            }

            if (moveAlgorithm.isReachDestGrid(current_floorGrid, dest_floorGrid)) {
                if (moveAlgorithm.isReachDestPoint(current, destination)) {
                    this.runGuardAction();
                    return;
                }

                nextPos = this.____getNextPos(current, destination);
                nextDirection = moveAlgorithm.findAccurateDirection(current, destination);
            }
            else {
                if (this.isNeedFindPath(dest_floorGrid)) {
                    this.____path = this.____findPath(this.____getPassableGridData(), current_floorGrid, dest_floorGrid);
                }

                if (!this.isFindPath()) {
                    nextPos = this.____getNextPos(current, destination);
                    nextDirection = moveAlgorithm.findAccurateDirection(current, destination);
                    this.____wait(nextPos, nextDirection);

                    return;
                }

                var nextGrid = this.____getNextPathGrid(current_floorGrid);

                nextDirection = moveAlgorithm.findAccurateDirection(current_floorGrid, nextGrid);
                nextPos = this.____getNextPos(nextDirection);
//                // 此处调用getPathDirection方法取整，可保证无论菱形地图四个角的大小如何（菱形方块四个角大小），
//                // 当精灵沿路径斜方向移动时显示正确的方向
//                nextDirection = moveAlgorithm.getPathDirection(nextDirection);
            }

            collisionData = this.____handleCollision(nextPos, nextDirection, this.____getCollisionObjects(nextPos), destination);

            this.____move(collisionData, dest_floorGrid);
        },
        isNeedStopWhileNearDest: function (destination) {
            return this.isCollisionTooMuch()
                || (this.isNearDestination(destination)
                && !this.isNeedFindPath(destination)
                && !this.isFindPath());
        },
        isFindPath: function () {
            return this.____path.length > 0;
        },
        isNeedFindPath: function (dest) {
            return !this.____path || this.____isChangeDest(dest, this.____last_dest) || !this.isFindPath();
        },
        isMoving: function () {
            return this.____isMovingFlag;
        },
        getMoveDest: function () {
            return this.____last_dest;
        },
        countCollision: function (destination) {
            if (this.P____steer.colliding) {
                if (this.isNearDestination(destination)) {
                    this.P____steer.AddCollisionCount();
                }
                else {
                    this.P____steer.resetCollisionCount();
                }
            }
        },
        isCollisionTooMuch: function () {
            if (this.P____steer.isCollisionTooMuch()) {
                this.P____steer.resetCollisionCount();
                return true;
            }

            return false;
        },
        isNearDestination: function (destination) {
            var current = [this.gridX, this.gridY],
                range = this.radiusGrid * 10;

            return tool.isInCircleRange(destination, current, range);
        },
        drawLifeBar: function (context) {
            var mapLayer = window.mapLayer;
            var lifeBarHeight = mapLayer.getLifeBarHeight();
            var x = this.drawingX - this.radius;
            var y = this.drawingY - 2 * lifeBarHeight - this.P____rangeHeight;
            var fillStyle = this.isHealthy() ? mapLayer.getHealthBarHealthyFillColor() : mapLayer.getHealthBarDamagedFillColor(),
                fillWidth = this.radius * 2 * this.life / this.hitPoints,
                strokeStyle = mapLayer.getHealthBarHealthyFillColor(),
                strokeWidth = this.radius * 2,
                strokeHeight = lifeBarHeight,
                lineWidth = 1;

            this.getGraphics().drawLifeBar([x, y, strokeWidth, strokeHeight], lineWidth, fillWidth, strokeStyle, fillStyle);
        },
        drawSelection: function (context) {
            var x = this.drawingX;
            var y = this.drawingY;
            var mapLayer = window.mapLayer;

            this.getGraphics().drawCircle(mapLayer.getSelectionBorderColor(), 1, x, y, this.radius);
        },
        stopMove: function () {
            this.____waitingBeginTime = 0;
            this.____isMovingFlag = false;
            this.____isWaitingFlag = false;
            this.____last_dest = null;
            this.isCollisionMove = false;
            this.____path = null;
        },
        attack: function (target) {
            this.runAttackAction(target);
        },
        moveAndAttack: function (destGrid) {
            this.runMoveAndAttackAction(destGrid);
        },
        getAttackedPoint: function () {
            return [this.gridX, this.gridY];
        },
        getSightPoint: function () {
            return [this.gridX, this.gridY];
        },
        onEnter: function () {
            YE.AStar.setDirection(8);

            this.base();

            this.runGuardAction();
        },
        onStartLoop: function () {
            this.base();

            //为了保证每个动画动作的精灵选中范围不同，这里简单的直接在每次主循环中更新选中范围（不同动画动作的精灵大小不同）。
            //如果要更精确的设置，可以在每个动画动作执行时，设置精灵选中范围。
            this.selectRange = this.P_createSelectRange(this.getPositionX(), this.getPositionY());
        }
    }
});