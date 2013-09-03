/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
_144 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};


AWE.Config = (function(module) { 
  
  //image cache
  module.IMAGE_CACHE_LOAD_LIST = {
    "map/tiles/split128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base128.jpg',
    "map/tiles/base128":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base128.jpg',
    "map/tiles/forest128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest128.jpg',
    "map/tiles/plain128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain128.jpg',
    "map/tiles/mountains128": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains128.jpg',
    "map/tiles/desert128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert128.jpg',
    "map/tiles/swamp128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp128.jpg',
    
    
    "map/tiles/split256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
    "map/tiles/base256":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
    "map/tiles/forest256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest256.jpg',
    "map/tiles/plain256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain256.jpg',
    "map/tiles/mountains256": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains256.jpg',
    "map/tiles/desert256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert256.jpg',
    "map/tiles/swamp256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp256.jpg',

    "map/tiles/split512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
    "map/tiles/base512":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
    "map/tiles/forest512":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest512.jpg',
    "map/tiles/plain512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain512.jpg',
    "map/tiles/mountains512": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains512.jpg',
    "map/tiles/desert512":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert512.jpg',
    "map/tiles/swamp512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp512.jpg',
    
    
    "map/fortress/small":     AWE.Config.RAILS_ASSET_PATH + 'settlements/fortresssmall.png',
    "map/fortress/middle":    AWE.Config.RAILS_ASSET_PATH + 'settlements/fortressmiddle.png',
    "map/fortress/large":     AWE.Config.RAILS_ASSET_PATH + 'settlements/fortresslarge.png',

    "map/colony/small":       AWE.Config.RAILS_ASSET_PATH + 'settlements/colonysmall.png',
    "map/colony/middle":      AWE.Config.RAILS_ASSET_PATH + 'settlements/colonymiddle.png',
    "map/colony/big":         AWE.Config.RAILS_ASSET_PATH + 'settlements/colonybig.png',
    
    "map/icon/bubble":         AWE.Config.RAILS_ASSET_PATH + 'icons/bubble.png',

    "map/outpost/small":      AWE.Config.RAILS_ASSET_PATH + 'settlements/outpostsmall.png',
    "map/outpost/middle":     AWE.Config.RAILS_ASSET_PATH + 'settlements/outpostmiddle.png',
    "map/outpost/big":        AWE.Config.RAILS_ASSET_PATH + 'settlements/outpostlarge.png',
    "map/emptyslot" :         AWE.Config.RAILS_ASSET_PATH + 'white_icon.png',

    "map/army":               AWE.Config.RAILS_ASSET_PATH + 'army.png',

    "map/army/animation":     AWE.Config.RAILS_ASSET_PATH + 'army/warrior_animation_final_128.png',
    "map/army/animation/amazon": AWE.Config.RAILS_ASSET_PATH + 'army/amazon_animation_montage.png',
    "map/army/animation/chef":   AWE.Config.RAILS_ASSET_PATH + 'army/chef_animation_montage.png',
    
    "map/army/stanceAggressive": AWE.Config.RAILS_ASSET_PATH + 'army/warrior_pose_2_144.png',
    "map/army/stanceDefensive":  AWE.Config.RAILS_ASSET_PATH + 'army/warrior_pose_1_144.png',
    "map/army/stanceNeutral":    AWE.Config.RAILS_ASSET_PATH + 'army/warrior_pose_1_144.png',

    "map/army/amazon/stanceAggressive": AWE.Config.RAILS_ASSET_PATH + 'army/amazon_pose_2_144.png',
    "map/army/amazon/stanceDefensive":  AWE.Config.RAILS_ASSET_PATH + 'army/amazon_pose_1_144.png',
    "map/army/amazon/stanceNeutral":    AWE.Config.RAILS_ASSET_PATH + 'army/amazon_pose_1_144.png',

    "map/army/chef/stanceAggressive": AWE.Config.RAILS_ASSET_PATH + 'army/chef_pose_2_144.png',
    "map/army/chef/stanceDefensive":  AWE.Config.RAILS_ASSET_PATH + 'army/chef_pose_1_144.png',
    "map/army/chef/stanceNeutral":    AWE.Config.RAILS_ASSET_PATH + 'army/chef_pose_1_144.png',

    "map/army/npc/stanceSmall":     AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size1_144.png',
    "map/army/npc/stanceMedium":    AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size2_144.png',
    "map/army/npc/stanceLarge":     AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size3_144.png',


    "map/army/npc/small":     AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size1.png',
    "map/army/npc/medium":    AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size2.png',
    "map/army/npc/large":     AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_size3.png',


    "map/army/base/own":      AWE.Config.RAILS_ASSET_PATH + 'army/base_own.png',
    "map/army/base/other":    AWE.Config.RAILS_ASSET_PATH + 'army/base.png',
    
    "map/army/rank1":         AWE.Config.RAILS_ASSET_PATH + 'army/rank1.png',
    "map/army/rank2":         AWE.Config.RAILS_ASSET_PATH + 'army/rank2.png',
    "map/army/rank3":         AWE.Config.RAILS_ASSET_PATH + 'army/rank3.png',
    "map/army/rank4":         AWE.Config.RAILS_ASSET_PATH + 'army/rank4.png',
    "map/army/rank5":         AWE.Config.RAILS_ASSET_PATH + 'army/rank4.png',

    "map/army/target":        AWE.Config.RAILS_ASSET_PATH + 'army/target.png',
    "map/army/target_background": AWE.Config.RAILS_ASSET_PATH + 'white_background.png',

    "map/army/battle":        AWE.Config.RAILS_ASSET_PATH + 'battle.png',
    "map/army/suspended":     AWE.Config.RAILS_ASSET_PATH + 'suspension.png',
    "map/army/protected":     AWE.Config.RAILS_ASSET_PATH + 'verbot.png',
    "map/army/sandglass":     AWE.Config.RAILS_ASSET_PATH + 'icons/sandglass.png',

    "map/artifact/0":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_tnt.png',
    "map/artifact/1":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_steinrad.png',
    "map/artifact/2":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_streitaxt.png',
    "map/artifact/3":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_monolith.png',
    "map/artifact/4":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_osterei.png',
    "map/artifact/5":         AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_hammer.png',

    "map/artifactinitiated/0": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_tnt_aktiviert.png',
    "map/artifactinitiated/1": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_steinrad_aktiviert.png',
    "map/artifactinitiated/2": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_streitaxt_aktiviert.png',
    "map/artifactinitiated/3": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_monolith_aktiviert.png',
    "map/artifactinitiated/4": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_osterei_aktiviert.png',
    "map/artifactinitiated/5": AWE.Config.RAILS_ASSET_PATH + 'artifact/artefakt_hammer_aktiviert.png',

    "map/easement/yes":       AWE.Config.RAILS_ASSET_PATH + 'ok.png',
    "map/easement/no":        AWE.Config.RAILS_ASSET_PATH + 'verbot.png',

    "map/display/icon":       AWE.Config.RAILS_ASSET_PATH + 'white_icon.png',

    "map/region/icon":        AWE.Config.RAILS_ASSET_PATH + 'dot.png',
    
    "map/button1":            AWE.Config.RAILS_ASSET_PATH + 'green_button.png',
    "map/button1highlighted": AWE.Config.RAILS_ASSET_PATH + 'red_button.png',
    "map/button1disabled":    AWE.Config.RAILS_ASSET_PATH + 'green_button_disabled.png',
    "map/button2":            AWE.Config.RAILS_ASSET_PATH + 'red_button.png',
    "map/button3":            AWE.Config.RAILS_ASSET_PATH + 'blue_button.png',

    "ui/button/newarmy":           AWE.Config.RAILS_ASSET_PATH + 'newarmybutton.png',
    "ui/button/settlement":        AWE.Config.RAILS_ASSET_PATH + 'settlementbutton.png',
    "ui/button/attacknpc":         AWE.Config.RAILS_ASSET_PATH + 'attacknpc.png',

    "ui/button/standard/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/button_standard_normal.png',
    "ui/button/standard/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/button_standard_hover.png',
    "ui/button/standard/disabled": AWE.Config.RAILS_ASSET_PATH + 'ui/button_standard_disabled.png',
    "ui/button/standard/pressed":  AWE.Config.RAILS_ASSET_PATH + 'ui/button_standard_pressed.png',

    "ui/button/orange/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/orange_button-normal.png',
    "ui/button/orange/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/orange_button-hovered.png',

    "ui/button/mapstrategy/normal":  AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_strategy.png',
    "ui/button/mapstrategy/hover":   AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_strategy_hover.png',
    "ui/button/mapterrain/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_terrain.png',
    "ui/button/mapterrain/hover":    AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_terrain_hover.png',
    "ui/button/mapency/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_ency.png',
    "ui/button/mapency/hover":       AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_ency_hover.png',
    "ui/button/visibility/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_visibility.png',
    "ui/button/visibility/hover":    AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_visibility_hover.png',
    "ui/button/map/background":      AWE.Config.RAILS_ASSET_PATH + 'ui/map_buttons/map_buttons_background.png',
    
    "map/icon/owner":         AWE.Config.RAILS_ASSET_PATH + 'icons/heads.png',
    "map/icon/home":          AWE.Config.RAILS_ASSET_PATH + 'icons/house.png',
    "map/icon/actionpoints":  AWE.Config.RAILS_ASSET_PATH + 'icons/magnifier.png',
    "map/icon/rank":          AWE.Config.RAILS_ASSET_PATH + 'icons/star.png',
    "map/icon/army/strength": AWE.Config.RAILS_ASSET_PATH + 'icons/flash.png',
    "map/icon/army/size":     AWE.Config.RAILS_ASSET_PATH + 'icons/heads.png',
    "map/icon/army/size1":    AWE.Config.RAILS_ASSET_PATH + 'icons/gearwheel.png',
    "map/icon/army/size2":    AWE.Config.RAILS_ASSET_PATH + 'icons/gearwheel.png',
    "map/icon/army/size3":    AWE.Config.RAILS_ASSET_PATH + 'icons/gearwheel.png',
    "map/icon/army/cavalry":  AWE.Config.RAILS_ASSET_PATH + 'icons/cavalry.png',
    "map/icon/army/infantry": AWE.Config.RAILS_ASSET_PATH + 'icons/infantry.png',
    "map/icon/army/artillery":AWE.Config.RAILS_ASSET_PATH + 'icons/artillery.png',
    "map/icon/fist":          AWE.Config.RAILS_ASSET_PATH + 'icons/fist.png',
    "map/icon/greenCheckMark":AWE.Config.RAILS_ASSET_PATH + 'ok.png',

    "activityindicator/small": AWE.Config.RAILS_ASSET_PATH + 'icons/activityindicator_small.svg',
    
    // heads.png, eye.png, flash.png, gearwheel.png, heads.png, house.png, magnifier.png, sandglass.png, star.png
    
    "hud/head/male/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_character_male.png',
    "hud/head/male/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_character_male.png',
    "hud/head/female/normal": AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_character_female.png',
    "hud/head/female/hovered":AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_character_female.png',

    "hud/settlement/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/hud_settlement_inlay.png',
    "hud/settlement/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/hud_settlement_hover.png',

    "ui/settlement/switch/right/normal":  AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_right.png',
    "ui/settlement/switch/right/hovered": AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_right-hovered.png',
    "ui/settlement/switch/left/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_left.png',
    "ui/settlement/switch/left/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_left-hovered.png',
    "ui/settlement/info/normal":          AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/info_box.png',
    "ui/settlement/info/hovered":         AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/info_box-hovered.png',

    "ui/marker/up":              AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/up_arrow.png',
    "ui/marker/right":           AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/right_arrow.png',
    "ui/marker/down":            AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/down_arrow.png',
    "ui/marker/left":            AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/left_arrow.png',

    "hud/main/background":       AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_background.png',
    "hud/main/body":             AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_body.png',
    "hud/main/inset":            AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_inset.png',
    "hud/main/decoration":       AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_teeth.png',
    "hud/main/shop/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_shop_button.png',
    "hud/main/shop/hovered":     AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_shop_button-hovered.png',
    "hud/main/banner/large":     AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_alliance_banner.png',
    "hud/main/glass/normal":     AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_glass.png',
    "hud/main/glass/hovered":    AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_glass-hovered.png',
    "hud/main/name/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_name_button.png',
    "hud/main/name/hovered":     AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_name_button-hovered.png',
    "hud/main/messages/normal":  AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_messages_button.png',
    "hud/main/messages/hovered": AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_messages_button-hovered.png',
    "hud/main/ranking/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_ranking_button.png',
    "hud/main/ranking/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_ranking_button-hovered.png',
    "hud/main/quests/normal":    AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_quests_button.png',
    "hud/main/quests/hovered":   AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_quests_button-hovered.png',

    "hud/callout":               AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_callout.png',

    "hud/frog/face":             AWE.Config.RAILS_ASSET_PATH + 'kopfkroete40.png',
    "hud/banner/large":          AWE.Config.RAILS_ASSET_PATH + 'ui/bannerframe.png',
    "hud/banner/small":          AWE.Config.RAILS_ASSET_PATH + 'ui/bannerframe_small.png',

    "hud/inspector/body":                 AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_body.png',
    "hud/inspector/inset":                AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_inset.png',
    "hud/inspector/glass/normal":         AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_glass.png',
    "hud/inspector/glass/hovered":        AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_glass-hovered.png',
    "hud/inspector/button/info/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_info_button.png',
    "hud/inspector/button/info/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_info_button-hovered.png',
    "hud/inspector/button/next/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_next_button.png',
    "hud/inspector/button/next/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_next_button-hovered.png',
    "hud/inspector/button/prev/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_prev_button.png',
    "hud/inspector/button/prev/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_prev_button-hovered.png',

    "hud/inspector/button/reinforce/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_reinforce_button.png',
    "hud/inspector/button/reinforce/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/inspector/inspector_reinforce_button-hovered.png',

    "hud/annotation/panel1":                     AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_panel_1_button.png',
    "hud/annotation/panel3":                     AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_panel_3_buttons.png',
    "hud/annotation/panel4":                     AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_panel_4_buttons.png',
    "hud/annotation/panel5":                     AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_panel_5_buttons.png',
    "hud/annotation/button/attack/normal":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_attack.png',
    "hud/annotation/button/attack/active":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_attack_active.png',
    "hud/annotation/button/attack/hover":        AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_attack_hover.png',
    "hud/annotation/button/battleinfo/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_battleinfo.png',
    "hud/annotation/button/battleinfo/active":   AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_battleinfo_active.png',
    "hud/annotation/button/battleinfo/hover":    AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_battleinfo_hover.png',
    "hud/annotation/button/defense/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_defense.png',
    "hud/annotation/button/defense/active":      AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_defense_active.png',
    "hud/annotation/button/defense/hover":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_defense_hover.png',
    "hud/annotation/button/enter/normal":        AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_enter.png',
    "hud/annotation/button/enter/active":        AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_enter_active.png',
    "hud/annotation/button/enter/hover":         AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_enter_hover.png',
    "hud/annotation/button/info/normal":         AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_info.png',
    "hud/annotation/button/info/active":         AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_info_active.png',
    "hud/annotation/button/info/hover":          AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_info_hover.png',
    "hud/annotation/button/move/normal":         AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_move.png',
    "hud/annotation/button/move/active":         AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_move_active.png',
    "hud/annotation/button/move/hover":          AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_move_hover.png',
    "hud/annotation/button/moving/normal":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_move_active.png',
    "hud/annotation/button/moving/hover":        AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_move_active_hover.png',
    "hud/annotation/button/reinforce/normal":    AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_reinforce.png',
    "hud/annotation/button/reinforce/active":    AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_reinforce_active.png',
    "hud/annotation/button/reinforce/hover":     AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_reinforce_hover.png',
    "hud/annotation/button/settle/normal":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_settle.png',
    "hud/annotation/button/settle/active":       AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_settle_active.png',
    "hud/annotation/button/settle/hover":        AWE.Config.RAILS_ASSET_PATH + 'ui/annotation/hud_button_settle_hover.png',


    "hud/bubble/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble.png',
    "hud/bubble/hovered":     AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble_hover.png',
    "hud/bubble/pressed":     AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble_hover.png',
    
    "resource/icon/wood" :    AWE.Config.RAILS_ASSET_PATH + 'icons/wood.png',
    "resource/icon/stone":    AWE.Config.RAILS_ASSET_PATH + 'icons/stone.png',
    "resource/icon/fur"  :    AWE.Config.RAILS_ASSET_PATH + 'icons/fur.png',
    "resource/icon/cash" :    AWE.Config.RAILS_ASSET_PATH + 'icons/toad.png',

    "resource/icon/wood/middle" :    AWE.Config.RAILS_ASSET_PATH + 'icons/wood-middle.png',
    "resource/icon/stone/middle":    AWE.Config.RAILS_ASSET_PATH + 'icons/stone-middle.png',
    "resource/icon/fur/middle"  :    AWE.Config.RAILS_ASSET_PATH + 'icons/fur-middle.png',
    "resource/icon/cash/middle" :    AWE.Config.RAILS_ASSET_PATH + 'icons/toad-middle.png',

    "resource/icon/wood/large" :    AWE.Config.RAILS_ASSET_PATH + 'icons/wood-large.png',
    "resource/icon/stone/large":    AWE.Config.RAILS_ASSET_PATH + 'icons/stone-large.png',
    "resource/icon/fur/large"  :    AWE.Config.RAILS_ASSET_PATH + 'icons/fur-large.png',
    "resource/icon/cash/large" :    AWE.Config.RAILS_ASSET_PATH + 'icons/toad-large.png',
    
    "avatar/female/chains/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_chain_0.png',
    "avatar/female/chains/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_chain_premium.png',
    "avatar/female/eyes/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_eyes_0.png',
    "avatar/female/eyes/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_eyes_1.png',
    "avatar/female/eyes/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_eyes_2.png',
    "avatar/female/eyes/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_eyes_premium.png',
    "avatar/female/hairs/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_0.png',
    "avatar/female/hairs/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_1.png',
    "avatar/female/hairs/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_2.png',
    "avatar/female/hairs/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_3.png',
    "avatar/female/hairs/5"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_4.png',
    "avatar/female/hairs/6"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_5.png',
    "avatar/female/hairs/7"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_6.png',
    "avatar/female/hairs/8"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_7.png',
    "avatar/female/hairs/9"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_premium.png',
    "avatar/female/hairs/10"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_premium1.png',
    "avatar/female/hairs/11"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_hair_premium2.png',
    "avatar/female/heads/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_head_0.png',
    "avatar/female/mouths/1"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_mouth_0.png',
    "avatar/female/mouths/2"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_mouth_1.png',
    "avatar/female/mouths/3"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_mouth_2.png',
    "avatar/female/mouths/4"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_mouth_3.png',
    "avatar/female/mouths/5"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_mouth_premium.png',
    "avatar/female/tattoos/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_tattoo_0.png',
    "avatar/female/tattoos/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_tattoo_1.png',
    "avatar/female/tattoos/3"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_amazone_tattoo_premium.png',

    "avatar/male/beards/1"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_0.png',
    "avatar/male/beards/2"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_1.png',
    "avatar/male/beards/3"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_2.png',
    "avatar/male/beards/4"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_3.png',
    "avatar/male/beards/5"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_4.png',
    "avatar/male/beards/6"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_beard_5.png',
    "avatar/male/eyes/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_eyes_0.png',
    "avatar/male/eyes/2"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_eyes_1.png',
    "avatar/male/eyes/3"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_eyes_premium.png',
    "avatar/male/hairs/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_hair_0.png',
    "avatar/male/hairs/2"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_hair_1.png',
    "avatar/male/hairs/3"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_hair_2.png',
    "avatar/male/hairs/4"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_hair_3.png',
    "avatar/male/hairs/5"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_hair_premium.png',
    "avatar/male/heads/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_head.png',
    "avatar/male/mouths/1"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_mouth_0.png',
    "avatar/male/mouths/2"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_mouth_1.png',
    "avatar/male/mouths/3"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_mouth_2.png',
    "avatar/male/mouths/4"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_mouth_premium.png',
    "avatar/male/tattoos/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_tattoo_0.png',
    "avatar/male/tattoos/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_tattoo_1.png',
    "avatar/male/tattoos/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_tattoo_2.png',
    "avatar/male/tattoos/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_tattoo_premium.png',
    "avatar/male/veilchens/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_veilchen_rechts_0.png',
    "avatar/male/veilchens/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_veilchen_rechts_1.png',
    "avatar/male/veilchens/3"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_veilchen_links_0.png',
    "avatar/male/veilchens/4"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/hg_warrior_veilchen_links_1.png',

    "avatar/ranking/female/chains/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_chain_0.png',
    "avatar/ranking/female/chains/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_chain_premium.png',
    "avatar/ranking/female/eyes/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_eyes_0.png',
    "avatar/ranking/female/eyes/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_eyes_1.png',
    "avatar/ranking/female/eyes/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_eyes_2.png',
    "avatar/ranking/female/eyes/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_eyes_premium.png',
    "avatar/ranking/female/hairs/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_0.png',
    "avatar/ranking/female/hairs/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_1.png',
    "avatar/ranking/female/hairs/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_2.png',
    "avatar/ranking/female/hairs/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_3.png',
    "avatar/ranking/female/hairs/5"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_4.png',
    "avatar/ranking/female/hairs/6"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_5.png',
    "avatar/ranking/female/hairs/7"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_6.png',
    "avatar/ranking/female/hairs/8"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_7.png',
    "avatar/ranking/female/hairs/9"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_premium.png',
    "avatar/ranking/female/hairs/10"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_premium1.png',
    "avatar/ranking/female/hairs/11"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_hair_premium2.png',
    "avatar/ranking/female/heads/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_head_0.png',
    "avatar/ranking/female/mouths/1"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_mouth_0.png',
    "avatar/ranking/female/mouths/2"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_mouth_1.png',
    "avatar/ranking/female/mouths/3"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_mouth_2.png',
    "avatar/ranking/female/mouths/4"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_mouth_3.png',
    "avatar/ranking/female/mouths/5"      :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_mouth_premium.png',
    "avatar/ranking/female/tattoos/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_tattoo_0.png',
    "avatar/ranking/female/tattoos/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_tattoo_1.png',
    "avatar/ranking/female/tattoos/3"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_amazone_tattoo_premium.png',

    "avatar/ranking/male/beards/1"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_0.png',
    "avatar/ranking/male/beards/2"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_1.png',
    "avatar/ranking/male/beards/3"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_2.png',
    "avatar/ranking/male/beards/4"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_3.png',
    "avatar/ranking/male/beards/5"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_4.png',
    "avatar/ranking/male/beards/6"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_beard_5.png',
    "avatar/ranking/male/eyes/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_eyes_0.png',
    "avatar/ranking/male/eyes/2"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_eyes_1.png',
    "avatar/ranking/male/eyes/3"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_eyes_premium.png',
    "avatar/ranking/male/hairs/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_hair_0.png',
    "avatar/ranking/male/hairs/2"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_hair_1.png',
    "avatar/ranking/male/hairs/3"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_hair_2.png',
    "avatar/ranking/male/hairs/4"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_hair_3.png',
    "avatar/ranking/male/hairs/5"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_hair_premium.png',
    "avatar/ranking/male/heads/1"         :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_head.png',
    "avatar/ranking/male/mouths/1"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_mouth_0.png',
    "avatar/ranking/male/mouths/2"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_mouth_1.png',
    "avatar/ranking/male/mouths/3"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_mouth_2.png',
    "avatar/ranking/male/mouths/4"        :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_mouth_premium.png',
    "avatar/ranking/male/tattoos/1"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_tattoo_0.png',
    "avatar/ranking/male/tattoos/2"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_tattoo_1.png',
    "avatar/ranking/male/tattoos/3"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_tattoo_2.png',
    "avatar/ranking/male/tattoos/4"       :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_tattoo_premium.png',
    "avatar/ranking/male/veilchens/1"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_veilchen_links_0.png',
    "avatar/ranking/male/veilchens/2"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_veilchen_links_1.png',
    "avatar/ranking/male/veilchens/3"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_veilchen_rechts_0.png',
    "avatar/ranking/male/veilchens/4"     :    AWE.Config.RAILS_ASSET_PATH + 'avatar/ranking/hg_warrior_veilchen_rechts_1.png',
  };
  
  module.MAP_STANCE_IMAGES = [
    "map/army/stanceNeutral",
    "map/army/stanceAggressive",
    "map/army/stanceDefensive",
  ];
  
  module.MAP_STANCE_IMAGES_AMAZON = [
    "map/army/amazon/stanceNeutral",
    "map/army/amazon/stanceAggressive",
    "map/army/amazon/stanceDefensive",
  ];  

  module.MAP_STANCE_IMAGES_CHEF = [
    "map/army/chef/stanceNeutral",
    "map/army/chef/stanceAggressive",
    "map/army/chef/stanceDefensive",
  ];
  
  return module;
  
}(AWE.Config || {}));
