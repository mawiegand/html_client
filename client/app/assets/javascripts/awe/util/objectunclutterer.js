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
      var start = new Date();
      if (views != this.get('views')) {
        this.set('views', views);
        this.recalcClusters();
      };
      log('RECALC CLUSTERS: duration in ms:', ((new Date()).getTime() - start.getTime()) );
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
                if (self.intersects(view.view, view2.view)) {
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
      if (view.moveable) {
        var scaleFactor = this.get('scaleFactor') || 1.0;
      
        var frac = ((view.id % 8) / 8.0) * 2*Math.PI;
        var dir  = AWE.Geometry.createPoint(Math.sin(frac), Math.cos(frac));
        var pos  = view.view.center(); 
        dir.scale(((view.id*2) % 3 === 0 ? 8.0 : 4.0) * scaleFactor); 
      
        view.view.setCenter(AWE.Geometry.createPoint(pos.x + dir.x, pos.y + dir.y));
      }
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
    
        if (view1.view.center().x === view2.view.center().x &&
            view1.view.center().y === view2.view.center().y) { // objects at exact same position
         
          if (view1.moveable) { // move object one
            view1.view.setCenter(AWE.Geometry.createPoint(view1.view.center().x + 2*scaleFactor,
                                                          view1.view.center().y));
          }
          else if (view2.moveable) {
            view2.view.setCenter(AWE.Geometry.createPoint(view2.view.center().x + 2*scaleFactor,
                                                          view2.view.center().y));
          }
          else {
            return ; // no object is moveable!
          }
        }
      }
      
    //  log('UNCLUTTER GROUP ', group.length, 'SCALE', scaleFactor);
  
      var minBounceStart = Math.min( 4.0 * scaleFactor,  20.0);
      var maxBounceStart = Math.min(10.0 * scaleFactor,  80.0);
  
  
      // idea: faster algorithm with just 1 or 2 loops and larger movement
      for (var i=0; i < 4; i++) { // 
    
        var minBounce = minBounceStart * Math.pow(0.8, i);
        var maxBounce = maxBounceStart * Math.pow(0.8, i);
    
        group.forEach(function(view, index1) {
          if (view.moveable) {
            view.tmpMovement = AWE.Geometry.createPoint(0.0, 0.0);
          
            group.forEach(function(view2, index2) {
              if (view !== view2) {
                var doIntersect = self.intersects(view.view, view2.view);
                // if (!doIntersect) continue;     // better (closer) distribution, but causes jitter
              
                var dir = AWE.Geometry.createPoint(view.view.center().x - view2.view.center().x, 
                                                   view.view.center().y - view2.view.center().y);
                              
                var length = dir.length();
                if (length === 0.0) {
                  if (index1 < index2) {  // there are really two armies on exactly the same spot! move the first one
                    dir.x = 1.0;
                    length = 1.0;
                    //log('WARNING: two models share the exact same position.', view.id, view2.id)
                  }
                }
                else {            
                  dir.scale(1.0/length); 
                }
                            
                var push = (maxBounce * (1.00001-Math.min(1.0, length/120.0))) ;
                push = doIntersect ? push : push * 0.5; 
              
                var pos = view.tmpMovement;
   
                view.tmpMovement = AWE.Geometry.createPoint(
                  pos.x + dir.x * push, pos.y + dir.y * push
                );  
              }
            });
          
            var pos     = view.tmpMovement;
            var length  = pos.length();

           if (length > maxBounce) {
              view.tmpMovement = pos.scale((1.0/length)*maxBounce);
            }
            else if (length > 0.000001 && length < minBounce) {
              view.tmpMovement = pos.scale((1.0/length)*minBounce);
            }
          }
        });
    
        group.forEach(function(view) {
          if (view.moveable) {
            var center = view.view.center();
            var dir    = view.tmpMovement;
          
            // log("(", center.x, center.y, ") + ", dir.x, dir.y)
          
            view.view.setCenter(AWE.Geometry.createPoint(
              center.x + dir.x, center.y + dir.y
            )); 
          }
        });
      } 
    },   


    unclutter: function() {
      var start = new Date();
      var clusters = this.get('clusters');
      var self = this;
      clusters.forEach(function(cluster) {
        if (cluster.length > 1) {
          self.unclutterGroup(cluster);
        }
      });
      
      log('UNCLUTTER: Number of Clusters (+1): ', clusters.length, 'duration in ms:', ((new Date()).getTime() - start.getTime()));
      
    },

    intersects: function(view1, view2) {
      // Achtung: y-Koordinaten gehen nach UNTEN
  
      // Basis: Volle Breite, 1/2 Höhe
      var frame1 = view1.frame();
      var frame2 = view2.frame();
      
      if (!frame1 || !frame2) {
        log("ERROR: tried to intersect null frame:", frame1, frame2);
        return false;
      }
  
      return frame1.intersects(frame2);
    },
        
  });
  
  return module;
  
}(AWE.Util || {}));