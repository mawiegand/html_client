/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
_144 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};


AWE.Config = (function(module) { 
  
  module.IMAGE_CACHE_LOAD_LIST = {

/* === TILES SECTION === */
    //========== TILES SMALL
    "map/tiles/split128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base128.jpg',
    "map/tiles/base128":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base128.jpg',
    "map/tiles/lake128":      AWE.Config.RAILS_ASSET_PATH + 'tiles/lake128.jpg',
    "map/tiles/plain128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain128.jpg',
    "map/tiles/mountains128": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains128.jpg',
    "map/tiles/desert128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert128.jpg',
    "map/tiles/swamp128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp128.jpg',
    
    //========== TILES MIDDLE
    "map/tiles/split256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
    "map/tiles/base256":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
    "map/tiles/lake256":      AWE.Config.RAILS_ASSET_PATH + 'tiles/lake256.jpg',
    "map/tiles/plain256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain256.jpg',
    "map/tiles/mountains256": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains256.jpg',
    "map/tiles/desert256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert256.jpg',
	  "map/tiles/swamp256":   AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp256.jpg',
	
	//========== TILES LARGE
    "map/tiles/split512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
    "map/tiles/base512":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
    "map/tiles/lake512":      AWE.Config.RAILS_ASSET_PATH + 'tiles/lake512.jpg',
    "map/tiles/plain512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain512.jpg',
    "map/tiles/mountains512": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains512.jpg',
    "map/tiles/desert512":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert512.jpg',
    "map/tiles/swamp512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp512.jpg',

    //========== MAP ASSETS
    "map/fortress/small":     AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/fortresssmall.png',
    "map/fortress/middle":    AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/fortressmiddle.png',
    "map/fortress/large":     AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/fortresslarge.png',

    "map/fortress/2/small":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/2/fortresssmall.png',
    "map/fortress/2/middle":  AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/2/fortressmiddle.png',
    "map/fortress/2/large":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/2/fortresslarge.png',

    "map/fortress/3/small":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/3/fortresssmall.png',
    "map/fortress/3/middle":  AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/3/fortressmiddle.png',
    "map/fortress/3/large":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/3/fortresslarge.png',

    "map/fortress/4/small":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/4/fortresssmall.png',
    "map/fortress/4/middle":  AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/4/fortressmiddle.png',
    "map/fortress/4/large":   AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/4/fortresslarge.png',

    "map/colony/small":       AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/colonysmall.png',
    "map/colony/middle":      AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/colonymiddle.png',
    "map/colony/large":       AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/colonylarge.png',

    "map/colony/1/small":     AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/1/colonysmall.png',
    "map/colony/1/middle":    AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/1/colonymiddle.png',
    "map/colony/1/large":     AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/1/colonylarge.png',

    "map/outpost/small":      AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/outpostsmall.png',
    "map/outpost/middle":     AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/outpostmiddle.png',
    "map/outpost/large":      AWE.Config.RAILS_ASSET_PATH + 'settlements/image_sets/0/outpostlarge.png',

/* === ARMY SECTION === */
    "map/army/animation":               AWE.Config.RAILS_ASSET_PATH + 'army/warrior_animation_final_128.png',
    "map/army/animation/amazon":        AWE.Config.RAILS_ASSET_PATH + 'army/amazon_animation_montage.png',
    "map/army/animation/chef":          AWE.Config.RAILS_ASSET_PATH + 'army/chef_animation_montage.png',
    "map/army/animation/neanderthal":   AWE.Config.RAILS_ASSET_PATH + 'army/neandertaler_animation_montage.png',

    "map/army/base/own":                AWE.Config.RAILS_ASSET_PATH + 'army/base_own.png',
    "map/army/base/other":              AWE.Config.RAILS_ASSET_PATH + 'army/base.png',
    
    "map/army/rank1":                   AWE.Config.RAILS_ASSET_PATH + 'army/rank1.png',
    "map/army/rank2":                   AWE.Config.RAILS_ASSET_PATH + 'army/rank2.png',
    "map/army/rank3":                   AWE.Config.RAILS_ASSET_PATH + 'army/rank3.png',
    "map/army/rank4":                   AWE.Config.RAILS_ASSET_PATH + 'army/rank4.png',
    "map/army/rank5":                   AWE.Config.RAILS_ASSET_PATH + 'army/rank4.png',

    "map/army/target":                  AWE.Config.RAILS_ASSET_PATH + 'army/target_green.png',
    "map/army/target/attack":           AWE.Config.RAILS_ASSET_PATH + 'army/target_red.png',
    "map/army/target_background":       AWE.Config.RAILS_ASSET_PATH + 'white_background.png',

    "map/army/battle":                  AWE.Config.RAILS_ASSET_PATH + 'battle.png',
    "map/army/suspended":               AWE.Config.RAILS_ASSET_PATH + 'suspension.png',
    "map/army/protected":               AWE.Config.RAILS_ASSET_PATH + 'verbot.png',
    "map/army/sandglass":               AWE.Config.RAILS_ASSET_PATH + 'icons/sandglass.png',
    "map/army/actionpoints/background": AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_background.png',
    "map/army/actionpoints/1":          AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_1.png',
    "map/army/actionpoints/2":          AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_2.png',
    "map/army/actionpoints/3":          AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_3.png',
    "map/army/actionpoints/4":          AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_full.png',
    "map/army/actionpoints/cover":      AWE.Config.RAILS_ASSET_PATH + 'army/actionpoints/actionpoints_cover.png',

/* === ARTIFACT SECTION === */
    "map/artifact/0":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_tnt_inactive.png',
    "map/artifact/1":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_stonewheel_inactive.png',
    "map/artifact/2":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_axe_inactive.png',
    "map/artifact/3":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_monolith_inactive.png',
    "map/artifact/4":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_easteregg_inactive.png',
    "map/artifact/5":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_hammer_inactive.png',
    "map/artifact/6":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_head_inactive.png',
    "map/artifact/7":          AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_figure_inactive.png',

    "map/artifactinitiated/0": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_tnt_active.png',
    "map/artifactinitiated/1": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_stonewheel_active.png',
    "map/artifactinitiated/2": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_axe_active.png',
    "map/artifactinitiated/3": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_monolith_active.png',
    "map/artifactinitiated/4": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_easteregg_active.png',
    "map/artifactinitiated/5": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_hammer_active.png',
    "map/artifactinitiated/6": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_head_active.png',
    "map/artifactinitiated/7": AWE.Config.RAILS_ASSET_PATH + 'artifact/artifact_figure_active.png',

/* === POACHER TREASURE SECTION == */
    "map/poachertreasure": AWE.Config.RAILS_ASSET_PATH + 'poacher_treasures/poacher_treasure.png',

/* === MAP SECTION === */
    "map/icon/bubble":        AWE.Config.RAILS_ASSET_PATH + 'icons/bubble.png',
    "map/easement/yes":       AWE.Config.RAILS_ASSET_PATH + 'ok.png',
    "map/easement/no":        AWE.Config.RAILS_ASSET_PATH + 'verbot.png',
    "map/region/icon":        AWE.Config.RAILS_ASSET_PATH + 'dot.png',

    "ui/button/settlement":        AWE.Config.RAILS_ASSET_PATH + 'settlementbutton.png',

    "ui/button/orange/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/orange_button-normal.png',
    "ui/button/orange/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/orange_button-hovered.png',
    
    "map/icon/owner":         AWE.Config.RAILS_ASSET_PATH + 'icons/heads.png',
    "map/icon/home":          AWE.Config.RAILS_ASSET_PATH + 'icons/house.png',
    "map/icon/rank":          AWE.Config.RAILS_ASSET_PATH + 'icons/star.png',
    "map/icon/army/strength": AWE.Config.RAILS_ASSET_PATH + 'icons/flash.png',
    "map/icon/army/size":     AWE.Config.RAILS_ASSET_PATH + 'icons/heads.png',
    "map/icon/army/cavalry":  AWE.Config.RAILS_ASSET_PATH + 'icons/cavalry.png',
    "map/icon/army/infantry": AWE.Config.RAILS_ASSET_PATH + 'icons/infantry.png',
    "map/icon/army/artillery":AWE.Config.RAILS_ASSET_PATH + 'icons/artillery.png',
    "map/icon/fist":          AWE.Config.RAILS_ASSET_PATH + 'icons/fist.png',

    "activityindicator/small": AWE.Config.RAILS_ASSET_PATH + 'icons/activityindicator_small.svg',
    
    "hud/settlement/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/hud_settlement_inlay.png',
    "hud/settlement/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/hud_settlement_hover.png',

    "ui/settlement/switch/right/normal":  AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_right.png',
    "ui/settlement/switch/right/hovered": AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_right-hovered.png',
    "ui/settlement/switch/left/normal":   AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_left.png',
    "ui/settlement/switch/left/hovered":  AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/switch_left-hovered.png',
    "ui/settlement/info/normal":          AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/info_box.png',
    "ui/settlement/info/hovered":         AWE.Config.RAILS_ASSET_PATH + 'ui/settlement/info_box-hovered.png',

    "ui/marker/up":              AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/tutorial_arrow_up.png',
    "ui/marker/right":           AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/tutorial_arrow_right.png',
    "ui/marker/down":            AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/tutorial_arrow_down.png',
    "ui/marker/left":            AWE.Config.RAILS_ASSET_PATH + 'ui/arrow/tutorial_arrow_left.png',

/* === HUD SECTION === */
    "hud/callout":               AWE.Config.RAILS_ASSET_PATH + 'ui/hud/hud_callout.png',
    
    "hud/annotation/button/attack/normal":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_attack/icon_attack.png',
    "hud/annotation/button/attack/hover":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_attack/icon_attack_hover.png',
    "hud/annotation/button/defense/normal":      AWE.Config.RAILS_ASSET_PATH + 'hud/icon_defense/icon_defense.png',
    "hud/annotation/button/defense/hover":      AWE.Config.RAILS_ASSET_PATH + 'hud/icon_defense/icon_defense_hover.png',
    "hud/annotation/button/enter/normal":        AWE.Config.RAILS_ASSET_PATH + 'hud/icon_enter/icon_enter.png',
    "hud/annotation/button/enter/hover":        AWE.Config.RAILS_ASSET_PATH + 'hud/icon_enter/icon_enter_hover.png',
    "hud/annotation/button/move/normal":         AWE.Config.RAILS_ASSET_PATH + 'hud/icon_move/icon_move.png',
    "hud/annotation/button/move/hover":         AWE.Config.RAILS_ASSET_PATH + 'hud/icon_move/icon_move_hover.png',
    "hud/annotation/button/settle/normal":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_flag/icon_settle.png',
    "hud/annotation/button/settle/hover":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_flag/icon_settle_hover.png',

    "hud/annotation/button/cancel/normal":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_cancel/icon_cancel.png',
    "hud/annotation/button/cancel/hover":       AWE.Config.RAILS_ASSET_PATH + 'hud/icon_cancel/icon_cancel_hover.png',
    
    "hud/annotation/button/background/blue":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_blue/button_blue.png',
    "hud/annotation/button/background/red":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_red/button_red.png',
    "hud/annotation/button/background/green":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_green/button_green.png',
    "hud/annotation/button/background/purple":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_purple/button_purple.png',
    "hud/annotation/button/background/yellow":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_yellow/button_yellow.png',

    "hud/annotation/button/background/blue/active":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_blue/button_blue_active.png',
    "hud/annotation/button/background/red/active":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_red/button_red_active.png',
    "hud/annotation/button/background/green/active":        AWE.Config.RAILS_ASSET_PATH + 'hud/button_green/button_green_active.png',

    "hud/annotation/activestate":        AWE.Config.RAILS_ASSET_PATH + 'hud/annotation_button_active_state.png',

    "hud/bubble/normal":      AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble.png',
    "hud/bubble/hovered":     AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble_hover.png',
    "hud/bubble/pressed":     AWE.Config.RAILS_ASSET_PATH + 'ui/resource_bubble_hover.png',
    
    "hud/resourcebars/empty"          :   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_empty.png',
    "hud/resourcebars/background"     :   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_background.png',
    
    "hud/resourcebars/fur/item"  :   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_fur/resourcebar_fur_item.png',
    "hud/resourcebars/stone/item":   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_stone/resourcebar_stone_item.png',
    "hud/resourcebars/cash/item":   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_toads/resourcebar_toads_item.png',
    "hud/resourcebars/wood/item" :   AWE.Config.RAILS_ASSET_PATH + 'hud/resourcebars/resourcebar_wood/resourcebar_wood_item.png',
          
    
    "hud/button/army/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/army_button/army_button.png',
    "hud/button/army_menu/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/army_menu_button/army_menu_button.png',
    "hud/button/count_indicator" :    AWE.Config.RAILS_ASSET_PATH + 'hud/count_indicator/count_indicator.png',
    "hud/button/map/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/map_button/map_button.png',
    "hud/button/map_mountains/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/map_mountains_button/map_mountains_button.png',
    "hud/button/menu/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/menu_button/menu_button.png',
    "hud/button/menu/hover" :    AWE.Config.RAILS_ASSET_PATH + 'hud/menu_button/menu_button_hovered.png',
    "hud/button/message/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/message_button/message_button.png',
    "hud/button/plus_button" :    AWE.Config.RAILS_ASSET_PATH + 'hud/plus_button/plus_button.png',
    "hud/button/quest_list/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/quest_list_button/quest_list_button.png',
    "hud/button/ranking/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/ranking_button/ranking_button.png',
    "hud/button/settlement/normal" :    AWE.Config.RAILS_ASSET_PATH + 'hud/settlement_button/settlement_button.png',

    "hud/icon/upgrade"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_upgrade/icon_upgrade.png',
    "hud/icon/info"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_info/icon_info.png',
    "hud/icon/info/hover"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_info/icon_info_hover.png',
    "hud/icon/army"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_army/icon_army.png',
    "hud/icon/army/hover"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_army/icon_army_hover.png',
    
    "hud/profile/levelbutton/background"    :    AWE.Config.RAILS_ASSET_PATH + 'hud/avatar_background/avatar_background.png',
    "hud/profile/levelbutton/foreground"    :    AWE.Config.RAILS_ASSET_PATH + 'hud/avatar_level_background/avatar_level_background.png',
    "hud/profile/namelabel/background"    :    AWE.Config.RAILS_ASSET_PATH + 'hud/avatar_label_background/avatar_label_background.png',
    "hud/profile/ranklabel/rankicon"    :    AWE.Config.RAILS_ASSET_PATH + 'hud/icon_rank/icon_rank.png',
    
    "hud/icon/trophy"       :                  AWE.Config.RAILS_ASSET_PATH + 'hud/icon_trophy/icon_trophy.png',
    
    "hud/profile/alliance/button"  : AWE.Config.RAILS_ASSET_PATH + 'hud/alliance_button/alliance_button.png',
    "hud/profile/alliance/icon"    : AWE.Config.RAILS_ASSET_PATH + 'hud/alliance_flag/alliance_flag.png',
    
    "hud/top/background"    : AWE.Config.RAILS_ASSET_PATH + 'hud/topbar/topbar.png',
    "hud/top/arrow/left"    : AWE.Config.RAILS_ASSET_PATH + 'hud/topbar/topbar_arrow_left.png',
    "hud/top/arrow/right"   : AWE.Config.RAILS_ASSET_PATH + 'hud/topbar/topbar_arrow_right.png',
    "hud/top/center"        : AWE.Config.RAILS_ASSET_PATH + 'hud/topbar/topbar_center.png',
    "hud/top/info"          : AWE.Config.RAILS_ASSET_PATH + 'hud/topbar/topbar_info.png',
    
    "hud/mapmode/icon_strategic_all/inactive" : AWE.Config.RAILS_ASSET_PATH + 'hud/map_mountains_button/strategic_all_inactive.png',
    "hud/mapmode/icon_normal/inactive" : AWE.Config.RAILS_ASSET_PATH + 'hud/map_mountains_button/normal_all_inactive.png',
    "hud/mapmode/icon_normal_only/inactive" : AWE.Config.RAILS_ASSET_PATH + 'hud/map_mountains_button/normal_only_inactive.png',
    "hud/mapmode/icon_strategic_only/inactive" : AWE.Config.RAILS_ASSET_PATH + 'hud/map_mountains_button/strategic_only_inactive.png',

/* === AVATAR SECTION === */
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

    "advisor/quest-dialog-girl"           :    AWE.Config.RAILS_ASSET_PATH + 'advisors/quest-dialog/quest-dialog-girl.png',

/* === Backgrounds === */
    "backgrounds/background/settlement":       AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement.jpg',
    "backgrounds/background/settlement/right": AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement_repetition_right.jpg',
    "backgrounds/background/settlement/left":  AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement_repetition_left.jpg',

    "backgrounds/background/grass":       AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement_grass.jpg',
    "backgrounds/background/grass/right": AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement_grass_right.jpg',
    "backgrounds/background/grass/left":  AWE.Config.RAILS_ASSET_PATH + 'backgrounds/background_settlement_grass_left.jpg',

/* === Buildings === */
    "building/base/alliance_hall/big":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_alliance_hall/building_alliance_hall_big.jpg',
    "building/base/altar/big":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_altar/building_altar_big.jpg',
    "building/base/artifact_stand/big":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_artifact_stand/building_artifact_stand_big.jpg',
    "building/base/barracks/big":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks/building_barracks_big.jpg',
    "building/base/barracks_copper/big":     AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks_copper/building_barracks_copper_big.jpg',
    "building/base/campfire/big":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_campfire/building_campfire_big.jpg',
    "building/base/chief_cottage/big":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_chief_cottage/building_chief_cottage_big.jpg',
    "building/base/command_post/big":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_command_post/building_command_post_big.jpg',
    "building/base/copper_smelter/big":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_copper_smelter/building_copper_smelter_big.jpg',
    "building/base/cottage/big":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_cottage/building_cottage_big.jpg',
    "building/base/field_camp/big":          AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_field_camp/building_field_camp_big.jpg',
    "building/base/firing_range/big":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range/building_firing_range_big.jpg',
    "building/base/firing_range_copper/big": AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range_copper/building_firing_range_copper_big.jpg',
    "building/base/furrier/big":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_furrier/building_furrier_big.jpg',
    "building/base/garrison/big":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_garrison/building_garrison_big.jpg',
    "building/base/gatherer/big":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_gatherer/building_gatherer_big.jpg',
    "building/base/haunt/big":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_haunt/building_haunt_big.jpg',
    "building/base/logger/big":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_logger/building_logger_big.jpg',
    "building/base/quarry/big":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry/building_quarry_big.jpg',
    "building/base/quarry_copper/big":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry_copper/building_quarry_copper_big.jpg',
    "building/base/special_gatherer/big":    AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_special_gatherer/building_special_gatherer_big.jpg',
    "building/base/storage/big":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_storage/building_storage_big.jpg',
    "building/base/stud/big":                AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud/building_stud_big.jpg',
    "building/base/stud_copper/big":         AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud_copper/building_stud_copper_big.jpg',
    "building/base/tavern/big":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_tavern/building_tavern_big.jpg',
    "building/base/training_cave/big":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_training_cave/building_training_cave_big.jpg',

    "building/base/alliance_hall/medium":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_alliance_hall/building_alliance_hall_medium.jpg',
    "building/base/altar/medium":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_altar/building_altar_medium.jpg',
    "building/base/artifact_stand/medium":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_artifact_stand/building_artifact_stand_medium.jpg',
    "building/base/barracks/medium":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks/building_barracks_medium.jpg',
    "building/base/barracks_copper/medium":     AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks_copper/building_barracks_copper_medium.jpg',
    "building/base/campfire/medium":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_campfire/building_campfire_medium.jpg',
    "building/base/chief_cottage/medium":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_chief_cottage/building_chief_cottage_medium.jpg',
    "building/base/command_post/medium":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_command_post/building_command_post_medium.jpg',
    "building/base/copper_smelter/medium":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_copper_smelter/building_copper_smelter_medium.jpg',
    "building/base/cottage/medium":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_cottage/building_cottage_medium.jpg',
    "building/base/field_camp/medium":          AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_field_camp/building_field_camp_medium.jpg',
    "building/base/firing_range/medium":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range/building_firing_range_medium.jpg',
    "building/base/firing_range_copper/medium": AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range_copper/building_firing_range_copper_medium.jpg',
    "building/base/furrier/medium":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_furrier/building_furrier_medium.jpg',
    "building/base/garrison/medium":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_garrison/building_garrison_medium.jpg',
    "building/base/gatherer/medium":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_gatherer/building_gatherer_medium.jpg',
    "building/base/haunt/medium":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_haunt/building_haunt_medium.jpg',
    "building/base/logger/medium":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_logger/building_logger_medium.jpg',
    "building/base/quarry/medium":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry/building_quarry_medium.jpg',
    "building/base/quarry_copper/medium":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry_copper/building_quarry_copper_medium.jpg',
    "building/base/special_gatherer/medium":    AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_special_gatherer/building_special_gatherer_medium.jpg',
    "building/base/storage/medium":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_storage/building_storage_medium.jpg',
    "building/base/stud/medium":                AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud/building_stud_medium.jpg',
    "building/base/stud_copper/medium":         AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud_copper/building_stud_copper_medium.jpg',
    "building/base/tavern/medium":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_tavern/building_tavern_medium.jpg',
    "building/base/training_cave/medium":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_training_cave/building_training_cave_medium.jpg',


    "building/base/alliance_hall/small":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_alliance_hall/building_alliance_hall_small.jpg',
    "building/base/altar/small":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_altar/building_altar_small.jpg',
    "building/base/artifact_stand/small":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_artifact_stand/building_artifact_stand_small.jpg',
    "building/base/barracks/small":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks/building_barracks_small.jpg',
    "building/base/barracks_copper/small":     AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_barracks_copper/building_barracks_copper_small.jpg',
    "building/base/campfire/small":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_campfire/building_campfire_small.jpg',
    "building/base/chief_cottage/small":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_chief_cottage/building_chief_cottage_small.jpg',
    "building/base/command_post/small":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_command_post/building_command_post_small.jpg',
    "building/base/copper_smelter/small":      AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_copper_smelter/building_copper_smelter_small.jpg',
    "building/base/cottage/small":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_cottage/building_cottage_small.jpg',
    "building/base/field_camp/small":          AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_field_camp/building_field_camp_small.jpg',
    "building/base/firing_range/small":        AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range/building_firing_range_small.jpg',
    "building/base/firing_range_copper/small": AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_firing_range_copper/building_firing_range_copper_small.jpg',
    "building/base/furrier/small":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_furrier/building_furrier_small.jpg',
    "building/base/garrison/small":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_garrison/building_garrison_small.jpg',
    "building/base/gatherer/small":            AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_gatherer/building_gatherer_small.jpg',
    "building/base/haunt/small":               AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_haunt/building_haunt_small.jpg',
    "building/base/logger/small":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_logger/building_logger_small.jpg',
    "building/base/quarry/small":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry/building_quarry_small.jpg',
    "building/base/quarry_copper/small":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_quarry_copper/building_quarry_copper_small.jpg',
    "building/base/special_gatherer/small":    AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_special_gatherer/building_special_gatherer_small.jpg',
    "building/base/storage/small":             AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_storage/building_storage_small.jpg',
    "building/base/stud/small":                AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud/building_stud_small.jpg',
    "building/base/stud_copper/small":         AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_stud_copper/building_stud_copper_small.jpg',
    "building/base/tavern/small":              AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_tavern/building_tavern_small.jpg',
    "building/base/training_cave/small":       AWE.Config.RAILS_ASSET_PATH + 'buildings/base/building_training_cave/building_training_cave_small.jpg',
}

/* === MAP STANCES === */
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
