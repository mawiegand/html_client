/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Util = (function(module) {

  module.ObjectUnclutterer = Ember.Object.extend({
    
    views:       null,
    clusters:    null,
    scaleFactor: 1.0,

    setViews: function(views) {
      if (views != this.get('views')) {
        this.set('views', views);
        this.recalcClusters();
      };
    },
    
    getViews: function() {
      return this.get('views');
    },
    
    recalcClusters: function() {
      var allViews = this.getViews();
      var clusters = [];
      
      // prepare clusters
      if (allViews.length < 2) { 
        clusters.push(allViews);
      }
      else {
        var self = this;
        allViews.forEach(function(view, index, enumerable) { // start with an empty set of clusters and group all views
          var numClusters = clusters.length;
          var hitIndex = -1;
          
          for (var i=numClusters-1; i >= 0; i--) {  // start from behind so it's possible to merge clusters.
            var cluster    = clusters[i];
            var intersects = false;
            
            if (cluster !== null) {                 // this cluster has been merged with another cluster.
              for (var j=0; j < cluster.length && !intersects; j++) {
                var view2 = cluster[j];
                if (self.intersects(view, view2)) {
                  intersects = true;
                }
              }
              if (intersects) {
                if (hitIndex > 0) {  // there was already another hit, thus merge the clusters
                  cluster.concat(clusters[hitIndex]);
                  clusters[hitIndex] = null; // mark as "deleted", will later compact clusters-array again!
                }
                else {
                  cluster.push(view);
                }
                hitIndex = i;
              }
            }
          }
          if (hitIndex < 0) { // no cluster found, thus create a new cluster
            clusters.push([ view ]);  // cluster with just the view object
          }
        });
      }
      this.set('clusters', clusters.compact());
    },
    
    jitterPosition: function(view) {
      var scaleFactor = this.get('scaleFactor') || 1.0;
      var armyId = view.army !== undefined ? view.army().getId() : 0; // TODO: generalize this for other views than army views
      
      var frac = ((armyId % 8) / 8.0) * 2*Math.PI;
      var dir  = AWE.Geometry.createPoint(Math.sin(frac), Math.cos(frac));
      var pos  = view.center(); 
      dir.scale(((armyId*2) % 3 === 0 ? 2 : 1) * scaleFactor); 
      
      view.setCenter(AWE.Geometry.createPoint(pos.x + dir.x, pos.y + dir.y));
    },
    
    /** Idee: Die Objekte stossen sich gegenseitig ab, je näher sie einander sind.
              Das ganze in mehreren Iterationen. Ergebnisse sind ok, Objekte werden
              teilweise recht weit bewegt. Anordnung scheint zudem recht stabil zu sein. */
    unclutterGroup: function(group) {
      // Idee: zuerst alle Objekte entsprechend Ihrer Id leicht in eine von 8 Richtungen bewegen (Zuffall geht nicht). Dies soll helfen, Objekte, die auf dem exakt gleichen Fleck sind, etwas auseinander zu bekommen.
  
      var self = this;
  
      if (group.length > 2) {  // move in "random" direction to initiate a spreading in all directions
        group.forEach(function(view) {
          self.jitterPosition(view);
        });
      }
  
/*    

  else if ([cluster count] == 2) {  // just to be sure...
    MapObject* mop1 = [cluster objectAtIndex:0];
    MapObject* mop2 = [cluster objectAtIndex:1];
    
    if (mop1.position.x == mop2.position.x &&
        mop1.position.y == mop2.position.y) { // objects at exact same position
      if (mop1.moveable) { // move object one
        mop1.position = CGPointMake(mop1.position.x + 5*impscale,
                                    mop1.position.y);
      } else if (mop2.moveable) {
        mop2.position = CGPointMake(mop2.position.x + 5*impscale,
                                    mop2.position.y);
      }
      else {
        return ; // no object is moveable!
      }
    }
  }
  
  double minBounceStart = 10.  * impscale;
  double maxBounceStart = 50.  * impscale;
  
  for (int i=0; i < 4; i++) { // 4
    
    double minBounce = minBounceStart * pow(0.7, i);
    double maxBounce = maxBounceStart * pow(0.7, i);
    
    // now move the armies away
    for (MapObject* mop in cluster) {
      
      if (! mop.moveable) continue; // don't move garrisson
      
      mop.tmpPosition = CGPointMake(0., 0.);
      
      for (MapObject* mop2 in cluster) {  // bounce away from every other army.
        if (mop == mop2) continue; 
        
        
        BOOL doIntersect = intersect_points_scaled(mop.position, mop.blockedArea, mop2.position, mop2.blockedArea, impscale);
         
        
        // if (!doIntersect) continue;     // better (closer) distribution, but causes jitter
        
        CGPoint dir = CGPointMake(mop.position.x-mop2.position.x, 
                                  mop.position.y-mop2.position.y);
        
        double length = CGLength(dir);
        dir.x /= length; dir.y /= length;  //normalize
        
        double push = maxBounce / (length * impscale);
        if (!doIntersect) push *= .5;
        
        mop.tmpPosition = CGPointMake(mop.tmpPosition.x + dir.x * push,
                                      mop.tmpPosition.y + dir.y * push);
        
      }
      
      double length = CGLength(mop.tmpPosition); 
      if (length > maxBounce) {
        
        // LogDebug(@"Push hit maxBounce: %lf, %lf", army.tmpPosition.x, army.tmpPosition.y);
        
        mop.tmpPosition = 
        CGPointMake(mop.tmpPosition.x / length * maxBounce,
                    mop.tmpPosition.y / length * maxBounce);
        
      }
      else if (length > 0.001 && length < minBounce) {
        
        // LogDebug(@"Push hit minBounce: %lf, %lf : %f", mop.tmpPosition.x, mop.tmpPosition.y, length);
        
        mop.tmpPosition = 
        CGPointMake(mop.tmpPosition.x / length * minBounce,
                    mop.tmpPosition.y / length * minBounce);        
      }
    }
    
    for (MapObject* mop in cluster) {
      mop.position = 
      CGPointMake(mop.position.x + mop.tmpPosition.x, 
                  mop.position.y + mop.tmpPosition.y);
    } 
  }*/
    },   


    unclutter: function() {
      var clusters = this.get('clusters');
      var self = this;
      clusters.forEach(function(cluster) {
        if (cluster.length > 1) {
          self.unclutterGroup(cluster);
        }
      });
    },

    intersects: function(view1, view2) {
      // Achtung: y-Koordinaten gehen nach UNTEN
  
      // Basis: Volle Breite, 1/2 Höhe
      var frame1 = view1.frame();
      var frame2 = view2.frame();
      
      if (!frame1 || !frame2) {
        console.log("ERROR: tried to intersect null frame:", frame1, frame2);
        return false;
      }
  
      return frame1.intersects(frame2);
    },
        
  });
  
  return module;
  
}(AWE.Util || {}));