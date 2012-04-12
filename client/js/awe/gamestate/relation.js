/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Army class, manager and helpers. */
AWE.GS = (function(module) {
    

  // ///////////////////////////////////////////////////////////////////////
  //
  //   RELATION
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.RELATION_TYPE_UNKNOWN       =  0;  
  module.RELATION_TYPE_AT_WAR        =  5;  
  module.RELATION_TYPE_NEUTRAL       = 10;  
  module.RELATION_TYPE_ALLIED        = 15;  
  module.RELATION_TYPE_SAME_ALLIANCE = 20;  
  module.RELATION_TYPE_SELF          = 30;  
    
  /** singleton object that can be asked for relations of current character
   * to other characters and alliances. When querrying for relations you
   * should use inequalities in your code (results > RELATION_TYPE_NEUTRAL)
   * or use the ...AtLeast methods in order to be prepared for later extensions
   * of the relations. Try to avoid direct comparisons with ==, != and
   * === wherever possible! 
   * 
   * Ordering of type: UNKNOWN is special (0), despite from this, larger numbers
   * indicate closer, more friendly relations. */
  module.Relation = module.Entity.create({
    
    relationToAlliance: function(other_alliance_id) {
      if (!other_alliance_id) {
        return module.RELATION_TYPE_UNKNOWN;
      }
      return this.relationTo(null, other_alliance_id);
    },
    
    isRelationToAllianceAtLeast: function(other_alliance_id, relationType, orUnknown) {
      if (orUnknown === undefined) {
        orUnknown = false;
      }
      var rel = this.relationToAlliance(other_alliance_id);
      return rel >= relationType || (orUnknown && rel == module.RELATION_TYPE_UNKNOWN);
    },
    
    relationToCharacter: function(other_character_id) {
      if (!other_character_id) {
        return module.RELATION_TYPE_UNKNOWN;
      }
      var otherCharacter = module.CharacterManager.getCharacter(other_character_id);
      if (! otherCharacter) {
        return module.RELATION_TYPE_UNKNOWN;
      }
      return this.relationTo(other_character_id, otherCharacter.get('alliance_id'));
    },    
    
    isRelationToCharacterAtLeast: function(other_character_id, relationType, orUnknown) {
      if (orUnknown === undefined) {
        orUnknown = false;
      }
      var rel = this.relationToCharacter(other_character_id);
      return rel >= relationType || (orUnknown && rel == module.RELATION_TYPE_UNKNOWN);
    },    
    
    /** calculates the relation of another character / alliance with the 
     * current character. Can be extended later for realizing more complex
     * relations and treaties. */
    relationTo: function(other_character_id, other_alliance_id) {
      
      if (!module.CharacterManager.currentCharacter) {
        return module.RELATION_TYPE_UNKNOWN;
      }
      var own_character_id = module.CharacterManager.currentCharacter.getId();
      var own_alliance_id = module.CharacterManager.currentCharacter.get('alliance_id');
      
      if (own_character_id === other_character_id) {
        return module.RELATION_TYPE_SELF;
      }
      else if (!own_alliance_id) {
        return module.RELATION_TYPE_NEUTRAL; ///< I'm not in an alliance? -> cannot have relations to other players / alliances
      }
      else if (!other_alliance_id) {
        return module.RELATION_TYPE_NEUTRAL; ///< no other alliance
      }
      else if (own_alliance_id === other_alliance_id) {
        return module.RELATION_TYPE_SAME_ALLIANCE;
      }
      else {
        return module.RELATION_TYPE_UNKNOWN;
      }
      
    },
    
    isRelationToAtLeast: function(other_character_id, other_alliance_id, relationType, orUnknown) {
      if (orUnknown === undefined) {
        orUnknown = false;
      }
      var rel = this.relationTo(other_character_id, other_alliance_id);
      return rel >= relationType || (orUnknown && rel == module.RELATION_TYPE_UNKNOWN);
    },   
    
  });    

    
  
  return module;
  
}(AWE.GS || {}));




