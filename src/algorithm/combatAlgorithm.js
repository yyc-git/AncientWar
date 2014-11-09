/**古代战争 战斗算法类
 * 作者：YYC
 * 日期：2014-03-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var combatAlgorithm = (function () {
    function _isValidTarget(relative, target) {
        return relative.getUid() !== target.getUid() &&
            relative.team !== target.team && !target.isDead();
    }

    function _sortTargetsByDistanceAndCanAttack(targets, attacker) {
        shadeAlgorithm.bubbleSort(function (a, b) {
            return (Math.pow(a.gridX - attacker.gridX, 2) + Math.pow(a.gridY - attacker.gridY, 2))
                - (Math.pow(b.gridX - attacker.gridX, 2) + Math.pow(b.gridY - attacker.gridY, 2));
        }, targets);

        shadeAlgorithm.bubbleSort(function (a, b) {
            if (!a.canAttack && b.canAttack) {
                return 1;
            }
            else {
                return -1;
            }
        }, targets);
    }

    function _sortTargetsByDistance(targets, attacker) {
        shadeAlgorithm.bubbleSort(function (a, b) {
            return (Math.pow(a.gridX - attacker.gridX, 2) + Math.pow(a.gridY - attacker.gridY, 2))
                - (Math.pow(b.gridX - attacker.gridX, 2) + Math.pow(b.gridY - attacker.gridY, 2));
        }, targets);
    }

    return {
        findTargetsInAttackRange: function (attacker, distanceIncrement) {
            var targets = [],
                items = window.entityLayer.getChilds(),
                isBuildingSprite = tool.isBuildingSprite,
                isUnitSprite = tool.isUnitSprite,
                self = this,
                distanceIncrement = distanceIncrement || 0;

            targets = items.filter(function (item) {
                return  (isBuildingSprite(item) || isUnitSprite(item))
                    && _isValidTarget(attacker, item) && self.isInAttackRange(attacker, item, distanceIncrement)
            });

            _sortTargetsByDistanceAndCanAttack(targets, attacker);

            return targets;
        },
        findTargetsCanAttackInAttackRange: function (attacker) {
            var targets = [],
                items = window.entityLayer.getChilds(),
                isBuildingSprite = tool.isBuildingSprite,
                isUnitSprite = tool.isUnitSprite,
                self = this;

            targets = items.filter(function (item) {
                return   (isBuildingSprite(item) || isUnitSprite(item))
                    && _isValidTarget(attacker, item) && item.canAttack && self.isInAttackRange(attacker, item)
            });


            _sortTargetsByDistance(targets, attacker);

            return targets;
        },
        findTargetsCanAttackMe: function (me) {
            var attackers = [],
                items = window.entityLayer.getChilds(),
                isBuildingSprite = tool.isBuildingSprite,
                isUnitSprite = tool.isUnitSprite,
                self = this;

            attackers = items.filter(function (attacker) {
                return   (isBuildingSprite(attacker) || isUnitSprite(attacker))
                    && _isValidTarget(me, attacker) && attacker.canAttack
                    && self.isInAttackRange(attacker, me);
            });

            _sortTargetsByDistance(attackers, me);

            return attackers;
        },
        findTargetsCanAttackMeOrInAttackRange: function (me, distanceIncrement) {
            var targets = [],
                items = window.entityLayer.getChilds(),
                isBuildingSprite = tool.isBuildingSprite,
                isUnitSprite = tool.isUnitSprite,
                self = this,
                distanceIncrement = distanceIncrement || 0;

            targets = items.filter(function (item) {
                return   (isBuildingSprite(item) || isUnitSprite(item))
                    && _isValidTarget(me, item) &&
                    (self.isInAttackRange(me, item, distanceIncrement) ||
                        (item.canAttack && self.isInAttackRange(item, me)));
            });

            _sortTargetsByDistanceAndCanAttack(targets, me);

            return targets;
        },
        findTargetsCanAttackMeOrCanAttackInAttackRange: function (me, distanceIncrement) {
            var targets = [],
                items = window.entityLayer.getChilds(),
                isBuildingSprite = tool.isBuildingSprite,
                isUnitSprite = tool.isUnitSprite,
                self = this,
                distanceIncrement = distanceIncrement || 0;

            targets = items.filter(function (item) {
                return (isBuildingSprite(item) || isUnitSprite(item))
                    && _isValidTarget(me, item) && item.canAttack &&
                    (self.isInAttackRange(me, item, distanceIncrement) ||
                        (self.isInAttackRange(item, me)));
            });

            _sortTargetsByDistanceAndCanAttack(targets, me);

            return targets;
        },
        isInAttackRange: function (attacker, target, distanceIncrement) {
            var targetGridPos = null,
                attackerGridPos = [attacker.gridX, attacker.gridY],
                distanceIncrement = distanceIncrement || 0,
                distance = attacker.attackDistance + distanceIncrement;

            if (tool.isBuildingSprite(target)) {
                targetGridPos = moveAlgorithm.findNearestGrid(attacker, target);

                return moveAlgorithm.isInBuildableSpriteRange(attackerGridPos, targetGridPos, distance);
            }
            else {
                targetGridPos = target.getAttackedPoint();

                return tool.isInCircleRange(attackerGridPos, targetGridPos, distance + tool.convertToGridSize(target.radius));
            }
        },
        //现在先直接调用findDirection
        findFireDirection: function (from, to, directions) {
            return moveAlgorithm.findAccurateDirection(from, to, directions);
        },
        remoteAttack: function (target, attackPoint, damage) {
            var arrow = this._createArrow(target, attackPoint, damage);

            arrow.setDestination(this._computeArrowDest(arrow, target));

            this._addArrow(arrow);
        },
        _createArrow: function (target, attackPoint, damage) {
            var attackerGridPos = attackPoint;

            return ArrowSprite.create({
                gridX: attackerGridPos[0],
                gridY: attackerGridPos[1],
                target: target,
                damage: damage
            });
        },
        _addArrow: function (arrow) {
            window.bulletLayer.addChild(arrow);
        },
        _computeArrowDest: function (arrow, target) {
            var destination = moveAlgorithm.computeInterceptPos(arrow, target);

            destination = tool.convertToGrid(destination[0], destination[1]);

            if (tool.isDestOutOfMap(destination)) {
                destination = target.getAttackedPoint();
            }

            return destination;
        },
        meleeAttack: function (target, damage) {
            target.life -= damage;
            if (target.isDead()) {
                target.runDeadAction();
            }
            target.showInfo();
        }
    }
}());