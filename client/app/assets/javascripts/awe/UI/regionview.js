/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  module.MAP_MODE_TERRAIN   = 1;
  module.MAP_MODE_STRATEGIC = 2;
  module.MAP_MODE_REAL      = 3;


	if (AWE.Config.MAP_USE_GOOGLE || AWE.Config.MAP_USE_OSM) {
		module.imageQueue = [];
	
		module.queueImage = function(image, src, callback) {
			module.imageQueue.push({ image: image, src: src, callback: callback });
		};
	
		module.queueImageZoom = function(image, src, zoom, leaf, callback, failure) {
			var queue = [];
			
			AWE.Ext.applyFunction(module.imageQueue, function(element) {
				if (element.zoom === zoom || (leaf && element.zoom >= zoom)|| element.leaf) { // filter other zoom levels
					queue.push(element);
				}
				else {
				  if (element.failure) {
				    element.failure();
				  }
				}
			});
			module.imageQueue = queue;
			
			module.imageQueue.push({ image: image, src: src, zoom: zoom, leaf: leaf, callback: callback, failure: failure });
		};
	
		module.nextImage = function() {
			if (module.imageQueue.length > 0) {
				var entry = module.imageQueue.shift();
				$(entry.image).load(function(e) {
				  return function() {
				    e.callback();
			    }
				}(entry));
				entry.image.src = entry.src;
			}
		};
	
		setInterval("AWE.UI.nextImage()", 50);
	}
	
  
  /*** AWE.UI.View ***/

  module.createVillageSpotsManager = function(_node, _view) {
    
    var that = {};

    var _node = _node;
    var _view = _view;
    var _container = module.createContainer();
    _container.initWithController(_view.controller());
    
    var _villiageSpotsShapes = [];
    for (var i = 0; i < 8; i++) {
      var s = new Shape();
      _villiageSpotsShapes.push(s);
      _container.displayObject().addChild(s);
    }

    that.container = function() { return _container; };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(frame);
      return AWE.Geometry.createPoint(
        (position.x - frame.origin.x)*transformedFrame.size.width/frame.size.width,
        (position.y - frame.origin.y)*transformedFrame.size.height/frame.size.height
      );
    };

    /** generates a DisplayObject for a given villageSpot **/
    var _generateGraphics = function(location, color) {
      var p = _globalToLocalCooridnates(location.position());
      var g = new Graphics();
      g.setStrokeStyle(1);
      g.beginFill(color);
      g.drawEllipse(p.x - AWE.Config.MAP_LOCATION_SPOT_WIDTH/2, p.y - AWE.Config.MAP_LOCATION_SPOT_HEIGHT/2, AWE.Config.MAP_LOCATION_SPOT_WIDTH, AWE.Config.MAP_LOCATION_SPOT_HEIGHT);
      return g;
    };

    var _generateDebugCross = function(spot, color) {
      var length = 10;
      var g = new Graphics()
      g.setStrokeStyle(2);
      g.beginStroke(color);
      g.moveTo(spot.x-length, spot.y);
      g.lineTo(spot.x+length, spot.y);
      g.moveTo(spot.x, spot.y-length);
      g.lineTo(spot.x, spot.y+length);
      return new Shape(g);
    }

    /** Updates all village spot locations and generates new DisplayObjects in the container **/
    that.update = function(hidden) {
      return ;
      if (_node.isLeaf() && !hidden && _node.region() != null && _node.region().locations() != null) {
        _container.displayObject().visible = true;
        var locations = _node.region().locations();
        for (var i = 1; i < locations.length; i++) {
          if (i > 8) {
            console.error("there were more locations than expected");
          }
          if (AWE.Config.MAP_LOCATION_TYPE_CODES[locations[i].typeId()] === "empty") {  // create view for empty spots, so that there's something to register a handler to
            _villiageSpotsShapes[i-1].graphics = _generateGraphics(locations[i], AWE.Config.MAP_LOCATION_SPOT_COLOR);
          }
        }
      } else{
        _container.displayObject().visible = false;
      } 
    };

    return that;
  };

  module.createStreetsManager = function(_node, _view) {

    var that = {};

    var createStreet = function (from, to, color, stroke) {
      var that = {};

      that.from = from;
      that.to = to;
      that.color = color;
      that.stroke = stroke;
      that.shape = new Shape();

      that.getDirectionVector = function() {
        return {x:that.to.x - that.from.x, y:that.to.y - that.from.y};
      };

      that.update = function() {
        that.shape.graphics = new Graphics();
        that.shape.graphics.setStrokeStyle(stroke)
              .beginStroke(color)
              .moveTo(that.from.x, that.from.y)
              .lineTo(that.to.x, that.to.y)
              .endStroke()
              .closePath();
      }
      return that;
    };
    
    var _container = module.createContainer();
    _container.initWithController(_view.controller());
    
    var _regionStreetsContainer = new Container();
    _container.displayObject().addChild(_regionStreetsContainer);
    var _villageStreetsContainer = new Container();
    _container.displayObject().addChild(_villageStreetsContainer);

    var _regionStreets = [];
    var _villageStreets = [];

    that.container = function() { return _container; };
    that.regionStreets = function() {return _regionStreets; };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(frame);
      var trans = _view.controller().mc2vc(position);
      return AWE.Geometry.createPoint(
        trans.x - _view.frame().origin.x,
        trans.y - _view.frame().origin.y
      );
    };

    var _updateRegionStreets = function(hidden) {

      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(_node.frame());

      if (_node.isLeaf() && !hidden) {
        _regionStreetsContainer.visible = true;

        var neighbours = _node.getNeighbourNodes();

        var start = AWE.Geometry.createPoint(
          _view.frame().size.width / 2,
          _view.frame().size.height / 2
        );
        
        
        //generate the region streets if the don't exist yet
        if (_regionStreets.length == 0) {
          var numStreets = 0;
          for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i].level() == _node.level() && !neighbours[i].isLeaf()) {
              numStreets++;
            }
            numStreets++;
          }
          for (var i = 0; i < numStreets; i++) {
            var s = createStreet(start, start, AWE.Config.MAP_REGION_STREETS_COLOR, AWE.Config.MAP_REGION_STREETS_WIDTH);
            _regionStreets.push(s);
            _regionStreetsContainer.addChild(s.shape);
          }
        }

        //update the start and end of the streets
        var streetI = 0;
        for (var i = 0; i < neighbours.length; i++) {
          //get direction
          var iFrame = neighbours[i].frame();
          var dir = {
            x: iFrame.origin.x + iFrame.size.width/2 - frame.origin.x - frame.size.width/2,
            y: iFrame.origin.y + iFrame.size.height/2 - frame.origin.y - frame.size.height/2
          };

          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            if (dir.x > 0) dir.x = transformedFrame.size.width / 2;
            if (dir.x < 0) dir.x = transformedFrame.size.width / -2;
            dir.y = 0;
          } else {
            if (dir.y > 0) dir.y = transformedFrame.size.height / 2;
            if (dir.y < 0) dir.y = transformedFrame.size.height / -2;
            dir.x = 0;
          }

          if (neighbours[i].level() == _node.level() && !neighbours[i].isLeaf()) {
            var extraDir = {
              x: dir.y/2,
              y: dir.x/2
            };
            if (_regionStreets[streetI]) {

              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x + extraDir.x, start.y + dir.y + extraDir.y);
              _regionStreets[streetI].update();
            }
            streetI++;

            if (_regionStreets[streetI]) {
              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x - extraDir.x, start.y + dir.y - extraDir.y);
              _regionStreets[streetI].update();
            }
            streetI++;

          } else {
            if (_regionStreets[streetI]) {
              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x, start.y + dir.y);
              _regionStreets[streetI].update();
            }
            streetI++;
          }
        }
      } else {
        _regionStreetsContainer.visible = false;
      }
    };

    var _updateVillageStreets = function(hidden) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(_node.frame());

      if (!hidden && _node.region() != null && _node.region().locations() != null) {
        _villageStreetsContainer.visible = true;

        var locations = _node.region().locations();
        var start = AWE.Geometry.createPoint(
          transformedFrame.size.width / 2,
          transformedFrame.size.height / 2
        );
        
      
        
        //generate new streets if none exist
        if (_villageStreets.length == 0) {
          for (var i = 1; i < locations.length; i++) {
            var s = createStreet(start, start, AWE.Config.MAP_LOCATION_STREETS_COLOR, AWE.Config.MAP_LOCATION_STREETS_WIDTH);
            _villageStreets.push(s);
            _villageStreetsContainer.addChild(s.shape);
          }
        }
        //update the positions of the streets
        for (var i = 1; i < locations.length; i++) {
          _villageStreets[i-1].from = start;
          _villageStreets[i-1].to = _globalToLocalCooridnates(locations[i].position());
          _villageStreets[i-1].update();
        }

      } else {
        _villageStreetsContainer.visible = false;
      }
    };

    that.update = function(streetsHidden, villagesHidden) {
      if (_node.isLeaf()) { 
        _container.visible = true;
        _updateRegionStreets(streetsHidden);
        //_updateVillageStreets(villagesHidden);
      } else {
        _container.visible = false;
      }
    };

    return that;
  };

  module.createRegionView = function(spec, my) {
    
    // private attributes and methods ////////////////////////////////////////

    var that;

    var _node = null;
    var _scaledContainer = null;
    var _nonScaledContainer = null;    
    var _backgroundImage = null;  
    var _backgroundShapeView = null;  
    var streetsManager = null;
    var villageSpotsManager = null;  
		var _scheduledImage = false;
		
		var _neutralBackgroundColor = 'rgb(255,255,255)';
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};

    my.streetsHidden = true;
    my.VillagesHidden = true;
		my.mapMode = module.MAP_MODE_TERRAIN;

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);

    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, 'updateView'),
    }
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _node = node;

      _scaledContainer = module.createContainer();
      _scaledContainer.initWithController(controller, frame);

      _nonScaledContainer = module.createContainer();      
      _nonScaledContainer.initWithController(controller, frame);
        
      _scaledContainer.name = _node.id();
      
      this.setAutoscales(true);
      selectBackgroundImage(0);
      
      streetsManager = module.createStreetsManager(_node, this);
      villageSpotsManager = module.createVillageSpotsManager(_node, this);  
      
      _nonScaledContainer.addChild(streetsManager.container());
      _nonScaledContainer.addChild(villageSpotsManager.container()); 
      
      _super.initWithController(controller, frame);
    }

		that.setMapMode = function(mode) {
		  if (mode === module.MAP_MODE_REAL && 
		      !(AWE.Config.MAP_USE_GOOGLE || AWE.Config.MAP_USE_OSM)) {
		    mode = my.mapMode;  // don't accept map-real, iff turned off in config
		  }
			if (mode !== my.mapMode) {
				my.mapMode = mode;
				this.setNeedsUpdate();
				this.setNeedsLayout();
			}
		};
    
    that.node = function() { return _node; }

    that.setFrame = function(frame) { //log('set frame');
      _super.setFrame(frame);
      _scaledContainer.setFrame(frame);
      _nonScaledContainer.setFrame(frame);
    }
    
    /** model has changed, need to upate state of view */
    that.updateView = function() {
      _super.updateView();
      this.layoutSubviews();
    };




    var selectBackgroundImage = function(detail) {
      var newImage = null;
      
      var borderWidth = 12 / that.scaleX();
      var borderLineWidth = 3 / that.scaleX();
      var size = '128';
      if (detail > 0) {
        size = '256';
      }
      if (detail > 1) {
        size = '512';
      }
      
      // remove the unecessary backround-view;
      // strategic mode uses a shapeview
      // all other modes use an imageview
      if (my.mapMode === module.MAP_MODE_STRATEGIC) {
	      if (_backgroundImage) {
	        _scaledContainer.removeChild(_backgroundImage);
	        _backgroundImage = null;
	      }	
      }
      else {
	      if (_backgroundShapeView) {
	        _scaledContainer.removeChild(_backgroundShapeView);
	        _backgroundShapeView = null;
	      }		        
      }
      
      // create the background that is needed for the present view
			if (my.mapMode === module.MAP_MODE_TERRAIN) {			  
			  
	      if (!_node.isLeaf()) {       // not a leaf node, splits further
	        newImage = AWE.UI.ImageCache.getImage("map/tiles/split"+size);
	      }
	      else if (_node.region()) {   // terrain available, select appropriate tile
	        if (_node.region().terrainId() == 1) {
	          newImage = AWE.UI.ImageCache.getImage("map/tiles/forest"+size);      
	        }
	        else if (_node.region().terrainId() == 2) {
	          newImage = AWE.UI.ImageCache.getImage("map/tiles/mountains"+size);      
	        }
	        else if (_node.region().terrainId() == 3) {
	          newImage = AWE.UI.ImageCache.getImage("map/tiles/desert"+size);      
	        }
	        else if (_node.region().terrainId() == 4) {
	          newImage = AWE.UI.ImageCache.getImage("map/tiles/swamp"+size);      
	        }
	        else {
	          newImage = AWE.UI.ImageCache.getImage("map/tiles/plain"+size);              
	        }
	      }
	      else {                       // don't know terrain, yet. thus, select base tile
	        newImage = AWE.UI.ImageCache.getImage("map/tiles/base"+size);
	      }
	
	      if (!_backgroundImage) {
        	_backgroundImage = module.createImageView();
	        _backgroundImage.initWithControllerAndImage(that.controller(), newImage);
	        _backgroundImage.setContentMode(module.ViewContentModeNone);
	        // link to encircling view for click events
	        _backgroundImage.displayObject().view = that;
	        _scaledContainer.addChild(_backgroundImage);			
	      }
	      else if (_backgroundImage.image() !== newImage) {
	        _backgroundImage.setImage(newImage);
	        _backgroundImage.setFrame(AWE.Geometry.createRect(0,0,newImage.width, newImage.height));
	      }	
			}	
		  else if (my.mapMode === module.MAP_MODE_STRATEGIC) {

        if (_backgroundShapeView) {
          _scaledContainer.removeChild(_backgroundShapeView);
          _backgroundShapeView = null;
        }

		    if (!_backgroundShapeView) {
		      var shape = new Graphics();
          //shape.setStrokeStyle(1);
          //shape.beginStroke('rgb(255, 255, 255)');
		      
		      if (!_node.isLeaf()) {       // not a leaf node, splits further
            shape.beginFill(_neutralBackgroundColor);
          	shape.drawRect(0,0,256,256);
	        }
	        else if (_node.region()) {   // terrain available, select appropriate tile
	          var allianceId = _node.region().allianceId();
	          if (allianceId) {
              var color = AWE.GS.AllianceManager.colorForNumber(allianceId);
              shape.beginFill('rgb('+Math.floor((color.r+1024)/5)+','+Math.floor((color.g+1024)/5)+','+Math.floor((color.b+1024)/5)+')');
	            shape.drawRect(0,0,256,256);
	            
	            var drawBorderBg = function(shape, x,y,width,height) {
                shape.beginFill('rgb('+Math.floor((color.r))+','+Math.floor((color.g))+','+Math.floor((color.b))+')');  
	              shape.drawRect(x,y,width,height);
	            }
	            
	            var drawBorder = function(shape, x,y,width,height) {
                shape.beginFill('rgb(96,96,96)');  
	              shape.drawRect(x,y,width,height);	              
	            }
	            
	            var neighboursLeft = _node.getNeighbourLeafsOnSide(3);   // left
	            var neighboursRight = _node.getNeighbourLeafsOnSide(1);  // right
              var neighboursTop = _node.getNeighbourLeafsOnSide(2);    // top (inverted y axis)
	            var neighboursBottom = _node.getNeighbourLeafsOnSide(0); // bottom (inveerted y axis)
	            
	            if (neighboursLeft && neighboursLeft.length == 0 || 
	                (neighboursLeft.length == 1 && neighboursLeft[0].isLeaf() && neighboursLeft[0].region() &&  neighboursLeft[0].region().allianceId() !== allianceId)) {
	              drawBorderBg(shape, 0,0,borderWidth,256);
              }
              else if (neighboursLeft && neighboursLeft.length == 2) {
                if (neighboursLeft[0].isLeaf() && neighboursLeft[0].region() &&  neighboursLeft[0].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 0,0,borderWidth,128);
                }
                if (neighboursLeft[1].isLeaf() && neighboursLeft[1].region() &&  neighboursLeft[1].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 0,128,borderWidth,128);
                }
              }
	            if (neighboursRight && neighboursRight.length == 0 || 
	                (neighboursRight.length == 1 && neighboursRight[0].isLeaf() && neighboursRight[0].region() &&  neighboursRight[0].region().allianceId() !== allianceId)) {
	              drawBorderBg(shape, 256-borderWidth,0,borderWidth,256);
              }
              else if (neighboursRight && neighboursRight.length == 2) {
                if (neighboursRight[0].isLeaf() && neighboursRight[0].region() &&  neighboursRight[0].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 256-borderWidth,0,borderWidth,128);
                }
                if (neighboursRight[1].isLeaf() && neighboursRight[1].region() &&  neighboursRight[1].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 256-borderWidth,128,borderWidth,128);
                }
              }              
	            if (neighboursTop && neighboursTop.length == 0 || 
	                (neighboursTop.length == 1 && neighboursTop[0].isLeaf() && neighboursTop[0].region() &&  neighboursTop[0].region().allianceId() !== allianceId)) {
	              drawBorderBg(shape, 0,0,256,borderWidth);
              }
              else if (neighboursTop && neighboursTop.length == 2) {
                if (neighboursTop[0].isLeaf() && neighboursTop[0].region() &&  neighboursTop[0].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 0,0,128,borderWidth);
                }
                if (neighboursTop[1].isLeaf() && neighboursTop[1].region() &&  neighboursTop[1].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 128,0,128,borderWidth);
                }
              }
	            if (neighboursBottom && neighboursBottom.length == 0 || 
	                (neighboursBottom.length == 1 && neighboursBottom[0].isLeaf() && neighboursBottom[0].region() &&  neighboursBottom[0].region().allianceId() !== allianceId)) {
	              drawBorderBg(shape, 0,256-borderWidth,256,borderWidth);
              }
              else if (neighboursBottom && neighboursBottom.length == 2) {
                if (neighboursBottom[0].isLeaf() && neighboursBottom[0].region() &&  neighboursBottom[0].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 0,256-borderWidth,128,borderWidth);
                }
                if (neighboursBottom[1].isLeaf() && neighboursBottom[1].region() &&  neighboursBottom[1].region().allianceId() !== allianceId) {
	                drawBorderBg(shape, 128,256-borderWidth,128,borderWidth);
                } 
              }     

              if (neighboursLeft && neighboursLeft.length == 0 || 
	                (neighboursLeft.length == 1 && neighboursLeft[0].isLeaf() && neighboursLeft[0].region() &&  neighboursLeft[0].region().allianceId() !== allianceId)) {
	              drawBorderBg(shape, 0,0,borderWidth,256);
	              drawBorder(shape, 0,0, borderLineWidth, 256);
              }
              else if (neighboursLeft && neighboursLeft.length == 2) {
                if (neighboursLeft[0].isLeaf() && neighboursLeft[0].region() &&  neighboursLeft[0].region().allianceId() !== allianceId) {
	                drawBorder(shape, 0,0, borderLineWidth, 128);
                }
                if (neighboursLeft[1].isLeaf() && neighboursLeft[1].region() &&  neighboursLeft[1].region().allianceId() !== allianceId) {
	                drawBorder(shape, 0,128, borderLineWidth, 128);
                }
              }
	            if (neighboursRight && neighboursRight.length == 0 || 
	                (neighboursRight.length == 1 && neighboursRight[0].isLeaf() && neighboursRight[0].region() &&  neighboursRight[0].region().allianceId() !== allianceId)) {
	        	    drawBorder(shape, 256-borderLineWidth,0, borderLineWidth, 256);
              }
              else if (neighboursRight && neighboursRight.length == 2) {
                if (neighboursRight[0].isLeaf() && neighboursRight[0].region() &&  neighboursRight[0].region().allianceId() !== allianceId) {
	        	      drawBorder(shape, 256-borderLineWidth,0, borderLineWidth, 128);
                }
                if (neighboursRight[1].isLeaf() && neighboursRight[1].region() &&  neighboursRight[1].region().allianceId() !== allianceId) {
	            	  drawBorder(shape, 256-borderLineWidth,128, borderLineWidth, 128);
                }
              }              
	            if (neighboursTop && neighboursTop.length == 0 || 
	                (neighboursTop.length == 1 && neighboursTop[0].isLeaf() && neighboursTop[0].region() &&  neighboursTop[0].region().allianceId() !== allianceId)) {
	            	drawBorder(shape, 0,0, 256, borderLineWidth);
              }
              else if (neighboursTop && neighboursTop.length == 2) {
                if (neighboursTop[0].isLeaf() && neighboursTop[0].region() &&  neighboursTop[0].region().allianceId() !== allianceId) {
	            	  drawBorder(shape, 0,0, 128, borderLineWidth);
                }
                if (neighboursTop[1].isLeaf() && neighboursTop[1].region() &&  neighboursTop[1].region().allianceId() !== allianceId) {
  	            	drawBorder(shape, 128,0, 128, borderLineWidth);
                }
              }
	            if (neighboursBottom && neighboursBottom.length == 0 || 
	                (neighboursBottom.length == 1 && neighboursBottom[0].isLeaf() && neighboursBottom[0].region() &&  neighboursBottom[0].region().allianceId() !== allianceId)) {
	            	drawBorder(shape, 0,256-borderLineWidth, 256, borderLineWidth);	              
              }
              else if (neighboursBottom && neighboursBottom.length == 2) {
                if (neighboursBottom[0].isLeaf() && neighboursBottom[0].region() &&  neighboursBottom[0].region().allianceId() !== allianceId) {
	            	  drawBorder(shape, 0,256-borderLineWidth, 128, borderLineWidth);	              
                }
                if (neighboursBottom[1].isLeaf() && neighboursBottom[1].region() &&  neighboursBottom[1].region().allianceId() !== allianceId) {
	            	  drawBorder(shape, 128,256-borderLineWidth, 128, borderLineWidth);	              
                } 
              }                
                       
	          }
	          else {
              shape.beginFill(_neutralBackgroundColor);
          	  shape.drawRect(0,0,256,256);
            }
            
            
	        }
	        else {                       // don't know terrain, yet. thus, select base tile
            shape.beginFill(_neutralBackgroundColor);
	        }
          _backgroundShapeView = AWE.UI.createShapeView();
          _backgroundShapeView.initWithControllerAndGraphics(that.controller(), shape);
          _backgroundShapeView.setAutoscales(true);
          _backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 256, 256));

	        _scaledContainer.addChildAt(_backgroundShapeView, 0);			
        }
		  }
			else if (AWE.Config.MAP_USE_OSM) {
				var path = _node.path();
				var tms = AWE.Mapping.GlobalMercator.QuadTreeToTMSTileCode(path);
				tms = AWE.Mapping.GlobalMercator.TMSToGoogleTileCode(tms.x, tms.y, tms.zoom);

		  	var src = "http://a.tile.openstreetmap.org/"+tms.zoom+"/"+tms.x+"/"+tms.y+".png";
				log(tms, src);

				newImage = new Image();
			
	      if (!_scheduledImage && !_backgroundImage) {
					log('schedule');
					_scheduledImage = true;
					module.queueImageZoom(newImage, src, tms.zoom, _node.isLeaf(), function() {
						_scheduledImage = false;
	        	_backgroundImage = module.createImageView();
						log('set background image')
		        _backgroundImage.initWithControllerAndImage(that.controller(), newImage);
		        _backgroundImage.setContentMode(module.ViewContentModeNone);
		        // link to encircling view for click events
		        _backgroundImage.displayObject().view = that;
		        _scaledContainer.addChild(_backgroundImage);			
						that.autoscaleIfNeeded();
						that.setNeedsDisplay();

						log('done')		
					}, function() {
					  _scheduledImage = false;
					});
				}		
				else if (!_scheduledImage && _backgroundImage.image().src !== src) {
					_scheduledImage = true;
          _backgroundImage.setImage(new Image());

					module.queueImageZoom(newImage, src, tms.zoom, _node.isLeaf(), function() {
						_scheduledImage = false;
	          _backgroundImage.setImage(newImage);
	          _backgroundImage.setFrame(AWE.Geometry.createRect(0,0,newImage.width, newImage.height));
	        	that.autoscaleIfNeeded();
						that.setNeedsDisplay();
          }, function() {
					  _scheduledImage = false;
					});
	      }			
			}
			else { //GOOGLE

				var frame = _node.frame();
				var lc = AWE.Mapping.GlobalMercator.MetersToLatLon(cx, cy);

				var level = _node.level();
		  	var src = "https://maps.googleapis.com/maps/api/staticmap?center="+lat+","+lon+"&zoom="+level+"&size=256x256&sensor=false";
				newImage = new Image();
			
	      if (!_scheduledImage && !_backgroundImage) {
					log('schedule');
					_scheduledImage = true;
					module.queueImage(newImage, src, function() {

	        	_backgroundImage = module.createImageView();
						log('set background image')
		        _backgroundImage.initWithControllerAndImage(that.controller(), newImage);
		        _backgroundImage.setContentMode(module.ViewContentModeNone);
		        // link to encircling view for click events
		        _backgroundImage.displayObject().view = that;
		        _scaledContainer.addChild(_backgroundImage);			
						log('done')		
					});
				}
			}
    };
    


    var _debugText = null;
    var _settlementsIcon = null;
    var _settlementsText = null;
    var _armyStrengthIcon = null;
    var _armyStrengthText = null;
    var _regionNameText = null;

    var updateInformation = function(detail) { 
            
      if (!_debugText && detail > -1 && AWE.Config.MAP_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG && _node.region()) {
        _debugText = new Text();
        _debugText.font = "10px Arial";
        _debugText.text = "id " + _node.region().id().toString() + "\nqt" + _node.path();
        _nonScaledContainer.displayObject().addChild(_debugText);
      }
      if (_debugText && detail < 0) {
        _nonScaledContainer.displayObject().removeChild(_debugText);
        _debugText = null;
      } 
      if (_debugText) {
        _debugText.x = 4;
        _debugText.y = my.frame.size.height / 2.0;
      }
      /*
      if (!_settlementsIcon && !my.realMap) {  // add information on game map
        _settlementsIcon = module.createImageView();
        _settlementsIcon.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScaledContainer.addChild(_settlementsIcon);
        
        _settlementsText = new Text();
        _settlementsText.font = "12px Arial";
        _settlementsText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _settlementsText.text = _node.region() ? _node.region().countSettlements().toString() : _node.countSettlements().toString();
        _nonScaledContainer.displayObject().addChild(_settlementsText);
        
        _armyStrengthIcon =  module.createImageView();
        _armyStrengthIcon.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScaledContainer.addChild(_armyStrengthIcon);
        
        _armyStrengthText = new Text();
        _armyStrengthText.font = "12px Arial";
        _armyStrengthText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _armyStrengthText.text = _node.totalArmyStrength().toString();
        _nonScaledContainer.displayObject().addChild(_armyStrengthText);
        
      }
      else if (_settlementsIcon && my.realMap) {  // remove information on real world map
        _nonScaledContainer.displayObject().removeChild(_armyStrengthText);
        _armyStrengthText = null;
        _nonScaledContainer.removeChild(_armyStrengthIcon);
        _armyStrengthIcon = null;
        _nonScaledContainer.displayObject().removeChild(_settlementsText);
        _settlementsText = null;
        _nonScaledContainer.removeChild(_settlementsIcon);
        _settlementsIcon = null;
      }
      if (_settlementsIcon) {
        if (detail < 1) {
          _settlementsIcon.setOrigin(AWE.Geometry.createPoint(0,0));
          _armyStrengthIcon.setOrigin(AWE.Geometry.createPoint(0,28));
        }
        else {
          _settlementsIcon.setOrigin(AWE.Geometry.createPoint(0,my.frame.size.height - 30));
          _armyStrengthIcon.setOrigin(AWE.Geometry.createPoint(my.frame.size.width / 2.0, my.frame.size.height - 30));                
        }
        
        _settlementsText.x = _settlementsIcon.frame().origin.x + _settlementsIcon.image().width;
        _settlementsText.y = _settlementsIcon.frame().origin.y + _settlementsIcon.image().height/2 - _settlementsText.getMeasuredLineHeight()/2;        
        _armyStrengthText.x = _armyStrengthIcon.frame().origin.x + _armyStrengthIcon.image().width;
        _armyStrengthText.y = _armyStrengthIcon.frame().origin.y + _armyStrengthIcon.image().height/2 - _armyStrengthText.getMeasuredLineHeight()/2;        
      }     */
      
      if (!_regionNameText && detail >= 1 && _node.region() && !my.realMap) {
        _regionNameText = new Text();
        _regionNameText.font = "12px Arial";
        _regionNameText.text = _node.region().name();
        _regionNameText.textBaseline = "top";
        _nonScaledContainer.displayObject().addChild(_regionNameText);
      }
      if (_regionNameText && (detail < 1 || my.realMap)) {
        _nonScaledContainer.displayObject().removeChild(_regionNameText);
        _regionNameText = null;
      } 
      if (_regionNameText) {
        _regionNameText.x = 4;
        _regionNameText.y = 4;
      } 
    } 
    
    that.hideStreets = function() {
      if (!my.streetsHidden) {
        my.streetsHidden = true; 
        this.setNeedsLayout();
      }
    }
    
    that.showStreets = function() { 
      if (my.streetsHidden) {
        my.streetsHidden = false; 
        this.setNeedsLayout();
      }
    }

    that.hideVillages = function() {
      if (!my.villagesHidden) {
        my.villagesHidden = true; 
        this.setNeedsLayout();
      }
    }
    
    that.showVillages = function() { 
      if (my.villagesHidden) {
        my.villagesHidden = false; 
        this.setNeedsLayout();
      }
    }

    that.detailLevel = function() {
      if (my.frame.size.width < 128) {
        return 0;
      }
      else if (my.frame.size.width < 420) {
        return 1;
      }
      else if (my.frame.size.width < 512) {
        return 2;
      }
      else {
        return 3;
      }
    }

    that.autoscaleIfNeeded = function() {
      if (this.autoscales() && (_backgroundImage || _backgroundShapeView)) {
				var dimension = my.mapMode !== module.MAP_MODE_TERRAIN ? 256. : _backgroundImage.width();
        _scaledContainer.setScaleX(my.frame.size.width / dimension);
        _scaledContainer.setScaleY(my.frame.size.width / dimension);
      }
    }
    
    that.layoutSubviews = function() {
      selectBackgroundImage(this.detailLevel());
      updateInformation(this.detailLevel());
      streetsManager.update(my.streetsHidden || my.realMap, my.villagesHidden);
      villageSpotsManager.update(my.villagesHidden);

      _super.layoutSubviews();
    }
    
    that.displayObject = function() {
      return  [ _scaledContainer.displayObject(), _nonScaledContainer.displayObject() ] ;
    }
    
    that.onClick = function() {
      log('onClick in Region');
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




