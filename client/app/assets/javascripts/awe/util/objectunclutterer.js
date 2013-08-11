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
      if (view.moveable) {
        var scaleFactor = this.get('scaleFactor') || 1.0;
      
        var frac = ((view.id % 8) / 8.0) * 2*Math.PI;
        var dir  = AWE.Geometry.createPoint(Math.sin(frac), Math.cos(frac));
        dir.scale(((view.id*2) % 3 === 0 ? 8.0 : 4.0) * scaleFactor); 
      
        view.centerX += dir.x;
        view.centerY += dir.y;
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
    
        if (view1.centerX === view2.centerX &&
            view1.centerY === view2.centerY) { // objects at exact same position
         
          if (view1.moveable) { // move object one
            view1.centerX += 2*scaleFactor;
          }
          else if (view2.moveable) {
            view2.centerX += 2*scaleFactor;
          }
          else {
            return ; // no object is moveable!
          }
        }
      }
      
    //  log('UNCLUTTER GROUP ', group.length, 'SCALE', scaleFactor);
    
      var simplify = group.length > 10;
  
      var minBounceStart = Math.min( 4.0 * scaleFactor,  20.0) * (simplify ? 2 : 1);
      var maxBounceStart = Math.min(10.0 * scaleFactor,  80.0) * (simplify ? 2 : 1);
  
  
      // idea: faster algorithm with just 1 or 2 loops and larger movement
      
      var repetitions = simplify ? 2 : 4;
      
      for (var i=0; i < repetitions; i++) { // 
    
        var minBounce = minBounceStart * Math.pow(0.8, i);
        var maxBounce = maxBounceStart * Math.pow(0.8, i);
        
        minBounce = minBounce;
        maxBounce = maxBounce;
    
        group.forEach(function(view, index1) {
          if (view.moveable) {
            view.tmpMovementX = 0.0;
            view.tmpMovementY = 0.0;
          
            group.forEach(function(view2, index2) {
              if (view !== view2) {
                var doIntersect = simplify || self.intersects(view, view2);
                // if (!doIntersect) continue;     // better (closer) distribution, but causes jitter
              
                var dirX = view.centerX - view2.centerX; 
                var dirY = view.centerY - view2.centerY;
                              
                var length2 = dirX*dirX+dirY*dirY;
                var length  = Math.sqrt(length2);
                
                if (length2 === 0.0) {
                  if (index1 < index2) {  // there are really two armies on exactly the same spot! move the first one
                    dirX = 1.0;
                    length2 = 1.0;
                    //log('WARNING: two models share the exact same position.', view.id, view2.id)
                  }
                }
                else {   
                  var length  = Math.sqrt(length2);
                  dirX /= length;
                  dirY /= length;         
                }
                            
                var push = (maxBounce * (1.00001-Math.min(1.0, length2/(120.0*120.0)))) ;
                push = doIntersect ? push : push * 0.5; 
                 
                view.tmpMovementX += dirX * push;
                view.tmpMovementY += dirY * push;
              }
            });
          
          
            if (simplify) {
              if (view.tmpMovementX > maxBounce) {
                view.tmpMovementX = maxBounce;
              }
              if (view.tmpMovementX > 0.00001 && view.tmpMovementX < minBounce) {
                view.tmpMovementX = minBounce;
              }
              if (view.tmpMovementY > maxBounce) {
                view.tmpMovementY = maxBounce;
              }
              if (view.tmpMovementY > 0.00001 && view.tmpMovementY < minBounce) {
                view.tmpMovementY = minBounce;
              }
            }
            else {
              var pos     = AWE.Geometry.createPoint(view.tmpMovementX, view.tmpMovementY);
              var length  = pos.length();
              var npos    = null;
              
              if (length > maxBounce) {
                npos = pos.scale((1.0/length)*maxBounce);
                view.tmpMovementX = npos.x;
                view.tmpMovementY = npos.y;
              }
              else if (length > 0.000001 && length < minBounce) {
                npos = pos.scale((1.0/length)*minBounce);
                view.tmpMovementX = npos.x;
                view.tmpMovementY = npos.y;
              }
            }
          }
        });
    
        group.forEach(function(view) {
          if (view.moveable) {
            view.centerX += view.tmpMovementX;
            view.centerY += view.tmpMovementY;          
          }
        });
      } 
      
      group.forEach(function(view) {
        if (view.moveable) {
          var center = AWE.Geometry.createPoint(view.centerX, view.centerY);
          view.view.setCenter(center);
        }
      });
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
      
      var min_x = Math.max(view1.centerX-view1.width/2, view2.centerX-view2.width/2);
      var min_y = Math.max(view1.centerY-view1.height/2, view2.centerY-view2.height/2);
      var max_x = Math.min(view1.centerX+view1.width/2, view2.centerX+view2.width/2);
      var max_y = Math.min(view1.centerX+view1.width/2, view2.centerX+view2.width/2);
      
      return max_x-min_x > 0 && max_y-min_y;
    },
        
  });
  
  return module;
  
}(AWE.Util || {}));