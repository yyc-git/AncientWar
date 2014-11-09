/**古代战争 总的资源对应表
 * 作者：YYC
 * 日期：2014-02-25
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var resourceTable = {
    common: [
    ],
    map: [
        {type: "image", url: "content/image/map/terrain_grass.png", id: "grass" },
        {type: "image", url: "content/image/map/terrain_desert.png", id: "desert" },
        {type: "image", url: "content/image/map/terrain_road.png", id: "road" },
        {type: "image", url: "content/image/map/terrain_water.png", id: "water" }
    ],
    interface: {
        main: [
            {type: "image", url: "content/image/interface/main.png" }  ,
            {type: "image", url: "content/image/interface/progress.png" },
            {type: "sound", url: ["content/sound/game/lose.mp3", "content/sound/game/lose.wav"], id: "lose" },
            {type: "sound", url: ["content/sound/game/win.mp3", "content/sound/game/win.wav"], id: "win" }
        ]
    },
    building: {
        common: [
            {type: "image", url: "content/image/sprite/building/building.png", id: "building_image" },
            {type: "image", url: "content/image/sprite/effect/buildingEffect.png", id: "buildingEffect_image" } ,
            {type: "json", url: "src/data/building.json", id: "building_json" },
            {type: "json", url: "src/data/buildingEffect.json", id: "buildingEffect_json" }   ,
            {type: "json", url: "src/data/animation/buildingEffect.json", id: "anim_buildingEffect_json"},

            {type: "sound", url: ["content/sound/game/building/command_dead1.mp3", "content/sound/game/building/command_dead1.wav"], id: "building_command_dead" }  ,
            {type: "sound", url: ["content/sound/game/building/command_dead2.mp3", "content/sound/game/building/command_dead2.wav"], id: "building_command_dead" }  ,
            {type: "sound", url: ["content/sound/game/building/fire.mp3", "content/sound/game/building/fire.wav"], id: "building_flaming" }  ,
            {type: "sound", url: ["content/sound/game/building/produce_ready.mp3", "content/sound/game/building/produce_ready.wav"], id: "building_produce_ready" }
        ],
        base: [
            {type: "sound", url: ["content/sound/game/building/base/select_base.mp3", "content/sound/game/building/base/select_base.wav"], id: "base_select" }
        ],
        shootingRange: [
            {type: "sound", url: ["content/sound/game/building/shootingRange/select_shootingRange.mp3", "content/sound/game/building/shootingRange/select_shootingRange.wav"], id: "shootingRange_select" }
        ],
        tower: [
            {type: "sound", url: ["content/sound/game/building/tower/attack1.mp3", "content/sound/game/building/tower/attack1.wav"], id: "tower_attack" },
            {type: "sound", url: ["content/sound/game/building/tower/attack2.mp3", "content/sound/game/building/tower/attack2.wav"], id: "tower_attack" },
            {type: "sound", url: ["content/sound/game/building/tower/attack3.mp3", "content/sound/game/building/tower/attack3.wav"], id: "tower_attack" } ,
            {type: "sound", url: ["content/sound/game/building/tower/select_tower.mp3", "content/sound/game/building/tower/select_tower.wav"], id: "tower_select" }
        ]
    },
    unit: {
        common: [
            {type: "sound", url: ["content/sound/game/unit/command_move1.mp3", "content/sound/game/unit/command_move1.wav"], id: "command_move" },
            {type: "sound", url: ["content/sound/game/unit/command_move2.mp3", "content/sound/game/unit/command_move2.wav"], id: "command_move" },

            {type: "sound", url: ["content/sound/game/unit/command_attack.mp3", "content/sound/game/unit/command_attack.wav"], id: "command_attack" },

            {type: "sound", url: ["content/sound/game/unit/select1.mp3", "content/sound/game/unit/select1.wav"], id: "select" },
            {type: "sound", url: ["content/sound/game/unit/select2.mp3", "content/sound/game/unit/select2.wav"], id: "select" }
        ],
        archer: [
            {type: "image", url: "content/image/sprite/soldier/archer.png", id: "archer_image"},
            {type: "json", url: "src/data/archer.json", id: "archer_json"}   ,
            {type: "json", url: "src/data/animation/archer.json", id: "anim_archer_json"},

            {type: "sound", url: ["content/sound/game/unit/archer/attack1.mp3", "content/sound/game/unit/archer/attack1.wav"], id: "archer_attack" },
            {type: "sound", url: ["content/sound/game/unit/archer/attack2.mp3", "content/sound/game/unit/archer/attack2.wav"], id: "archer_attack" },
            {type: "sound", url: ["content/sound/game/unit/archer/attack3.mp3", "content/sound/game/unit/archer/attack3.wav"], id: "archer_attack" } ,

            {type: "sound", url: ["content/sound/game/unit/archer/command_dead1.mp3", "content/sound/game/unit/archer/command_dead1.wav"], id: "archer_command_dead" },
            {type: "sound", url: ["content/sound/game/unit/archer/command_dead2.mp3", "content/sound/game/unit/archer/command_dead2.wav"], id: "archer_command_dead" }
        ],
        farmer: [
            {type: "image", url: "content/image/sprite/farmer/farmer.png", id: "farmer_image"},
            {type: "json", url: "src/data/farmer.json", id: "farmer_json"} ,
            {type: "json", url: "src/data/animation/farmer.json", id: "anim_farmer_json"},

            {type: "sound", url: ["content/sound/game/unit/farmer/build_ready.mp3", "content/sound/game/unit/farmer/build_ready.wav"], id: "farmer_build_ready" },

            {type: "sound", url: ["content/sound/game/unit/farmer/attack1.mp3", "content/sound/game/unit/farmer/attack1.wav"], id: "farmer_attack" },
            {type: "sound", url: ["content/sound/game/unit/farmer/attack2.mp3", "content/sound/game/unit/farmer/attack2.wav"], id: "farmer_attack" },
            {type: "sound", url: ["content/sound/game/unit/farmer/attack3.mp3", "content/sound/game/unit/farmer/attack3.wav"], id: "farmer_attack" },

            {type: "sound", url: ["content/sound/game/unit/farmer/command_build.mp3", "content/sound/game/unit/farmer/command_build.wav"], id: "farmer_command_build" },
            {type: "sound", url: ["content/sound/game/unit/farmer/command_gather.mp3", "content/sound/game/unit/farmer/command_gather.wav"], id: "farmer_command_gather" },
            {type: "sound", url: ["content/sound/game/unit/farmer/command_attack.mp3", "content/sound/game/unit/farmer/command_attack.wav"], id: "farmer_command_attack" },

            {type: "sound", url: ["content/sound/game/unit/farmer/command_move1.mp3", "content/sound/game/unit/farmer/command_move1.wav"], id: "farmer_command_move" },
            {type: "sound", url: ["content/sound/game/unit/farmer/command_move2.mp3", "content/sound/game/unit/farmer/command_move2.wav"], id: "farmer_command_move" },

            {type: "sound", url: ["content/sound/game/unit/farmer/gather1.mp3", "content/sound/game/unit/farmer/gather1.wav"], id: "farmer_gather" },
            {type: "sound", url: ["content/sound/game/unit/farmer/gather2.mp3", "content/sound/game/unit/farmer/gather2.wav"], id: "farmer_gather" },

            {type: "sound", url: ["content/sound/game/unit/farmer/command_dead1.mp3", "content/sound/game/unit/farmer/command_dead1.wav"], id: "farmer_command_dead" },
            {type: "sound", url: ["content/sound/game/unit/farmer/command_dead2.mp3", "content/sound/game/unit/farmer/command_dead2.wav"], id: "farmer_command_dead" },

            {type: "sound", url: ["content/sound/game/unit/farmer/select1.mp3", "content/sound/game/unit/farmer/select1.wav"], id: "farmer_select" },
            {type: "sound", url: ["content/sound/game/unit/farmer/select2.mp3", "content/sound/game/unit/farmer/select2.wav"], id: "farmer_select" }
        ]
    },
    bullet: {
        arrow: [
            {type: "image", url: "content/image/sprite/bullet/arrow.png", id: "arrow_image" } ,
            {type: "json", url: "src/data/arrow.json", id: "arrow_json" },
            {type: "json", url: "src/data/animation/arrow.json", id: "anim_arrow_json"}
        ]
    },
    terrain: [
        {type: "image", url: "content/image/sprite/terrain/terrain.png", id: "terrain_image" },
        {type: "json", url: "src/data/terrain.json", id: "terrain_json"}
    ],
    resource: [
        {type: "image", url: "content/image/sprite/resource/resource.png", id: "resource_image" },
        {type: "json", url: "src/data/resource.json", id: "resource_json" }
    ]
};