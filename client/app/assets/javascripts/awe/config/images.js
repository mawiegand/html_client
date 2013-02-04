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
//  "map/tiles/forest128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest128.png',
//  "map/tiles/plain128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain128.png',
    "map/tiles/forest128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest128.jpg',
    "map/tiles/plain128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain128.jpg',
    "map/tiles/mountains128": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains128.jpg',
    "map/tiles/desert128":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert128.jpg',
    "map/tiles/swamp128":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp128.jpg',
    
    
    "map/tiles/split256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
    "map/tiles/base256":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base256.jpg',
//  "map/tiles/forest256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest256.png',
//  "map/tiles/plain256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain256.png',
    "map/tiles/forest256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest256.jpg',
    "map/tiles/plain256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain256.jpg',
    "map/tiles/mountains256": AWE.Config.RAILS_ASSET_PATH + 'tiles/mountains256.jpg',
    "map/tiles/desert256":    AWE.Config.RAILS_ASSET_PATH + 'tiles/desert256.jpg',
    "map/tiles/swamp256":     AWE.Config.RAILS_ASSET_PATH + 'tiles/swamp256.jpg',

    "map/tiles/split512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
    "map/tiles/base512":      AWE.Config.RAILS_ASSET_PATH + 'tiles/base512.jpg',
//  "map/tiles/forest512":    AWE.Config.RAILS_ASSET_PATH + 'tiles/forest512.png',
//  "map/tiles/plain512":     AWE.Config.RAILS_ASSET_PATH + 'tiles/plain512.png',
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

    "map/army":               AWE.Config.RAILS_ASSET_PATH + 'army.png',

    "map/army/animation":     AWE.Config.RAILS_ASSET_PATH + 'army/warrior_animation_final_128.png',
    "map/army/animation/amazon": AWE.Config.RAILS_ASSET_PATH + 'army/amazon_animation_128.png',
    "map/army/animation/chef":   AWE.Config.RAILS_ASSET_PATH + 'army/chef_animation_128.png',
    
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
    "map/army/sandglass":     AWE.Config.RAILS_ASSET_PATH + 'icons/sandglass.png',

    "map/artifact":           AWE.Config.RAILS_ASSET_PATH + 'artifact.png',

    "map/outpost":            AWE.Config.RAILS_ASSET_PATH + 'settlements/outpost.png',
    "map/emptyslot" :         AWE.Config.RAILS_ASSET_PATH + 'white_icon.png',

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
