/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Util = (function(module) {

  module.ObjectUnclutterer = Ember.Object.extend({
    
    views:         null,
    clusters:      null,
    scaleFactor:   1.0,
    numIterations: 4,

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
      dir.scale(((armyId*2) % 3 === 0 ? 8.0 : 4.0) * scaleFactor); 
      
      view.setCenter(AWE.Geometry.createPoint(pos.x + dir.x, pos.y + dir.y));
    },
    
    /** Idee: Die Objekte stossen sich gegenseitig ab, je näher sie einander sind.
              Das ganze in mehreren Iterationen. Ergebnisse sind ok, Objekte werden
              teilweise recht weit bewegt. Anordnung scheint zudem recht stabil zu sein. */
    unclutterGroup: function(group) {
      // Idee: zuerst alle Objekte entsprechend Ihrer Id leicht in eine von 8 Richtungen bewegen (Zuffall geht nicht). Dies soll helfen, Objekte, die auf dem exakt gleichen Fleck sind, etwas auseinander zu bekommen.
  
      var self          = this;
      var scaleFactor   = this.get('scaleFactor')   || 1.0;
      var numIterations = this.get('numIterations') || 4;
  
      if (group.length > 2) {  // move in "random" direction to initiate a spreading in all directions
        group.forEach(function(view) {
          self.jitterPosition(view);
        });
      }
      else if (group.length === 2) {  // just to be sure...
        var view1 = group[0];
        var view2 = group[1];
    
        if (view1.center().x == view2.center().x &&
            view1.center().y == view2.center().y) { // objects at exact same position
         
         // if (mop1.moveable) { // move object one
            view1.setCenter(AWE.Geometry.createPoint(view1.center().x + 2*scaleFactor,
                                                     view1.center().y));
        /*  } else if (mop2.moveable) {
            mop2.position = CGPointMake(mop2.position.x + 5*impscale,
                                        mop2.position.y);
          }
          else {
            return ; // no object is moveable!
          }*/
        }
      }
      
      console.log('UNCLUTTER GROUP ', group.length, 'SCALE', scaleFactor);
  
      var minBounceStart = Math.min(5.0  * scaleFactor,  20.0);
      var maxBounceStart = Math.min(20.0 * scaleFactor,  60.0);
  
      for (var i=0; i < 1; i++) { // 
    
        var minBounce = minBounceStart * Math.pow(0.8, i);
        var maxBounce = maxBounceStart * Math.pow(0.8, i);
    
        group.forEach(function(view, index1) {
          view.tmpMovement = AWE.Geometry.createPoint(0.0, 0.0);
          
          group.forEach(function(view2, index2) {
            if (view !== view2) {
              var doIntersect = false; // self.intersects(view, view2);
              // if (!doIntersect) continue;     // better (closer) distribution, but causes jitter
              
              var dir = AWE.Geometry.createPoint(view.center().x - view2.center().x, 
                                                 view.center().y - view2.center().y);
                              
              var length = dir.length();
              if (length === 0.0) {
                if (index1 < index2) {  // there are really two armies on exactly the same spot! move the first one
                  dir.x = 1.0;
                  length = 1.0;
                  console.log('WARNING: two armies share the exact same position.', view.army().getId(), view2.army().getId())
                }
              }
              else {            
                dir.scale(1.0/length); 
              }
                            
              var push = (maxBounce / Math.max(1.0, length)) * scaleFactor;
              push = doIntersect ? push : push * 0.5; 
              
              var pos = view.tmpMovement;
              
           //   console.log(dir.x, dir.y, scaleFactor, push, maxBounce, length)
              
              view.tmpMovement = AWE.Geometry.createPoint(
                pos.x + dir.x * push, pos.y + dir.y * push
              );  
            }
          });
          
          var pos     = view.tmpMovement;
          var length  = pos.length();

          if (length > maxBounce) {
            view.tmpMovement = pos.scale(1.0/(length*maxBounce));
          }
          else if (length > 0.000001 && length < minBounce) {
            view.tmpMovement = pos.scale(1.0/(length*minBounce));
          }
        });
    
        group.forEach(function(view) {
          var center = view.center();
          var dir    = view.tmpMovement;
          
          view.setCenter(AWE.Geometry.createPoint(
            center.x + dir.x, center.y + dir.y
          )); 
        });
      } 
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