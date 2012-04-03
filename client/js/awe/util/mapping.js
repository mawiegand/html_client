/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

// Some parts are based on code from the GDAL2Tile - project:

/*****************************************************************************
*
* Project:  GDAL2Tiles, Google Summer of Code 2007 & 2008
*           Global Map Tiles Classes
* Purpose:  Convert a raster into TMS tiles, create KML SuperOverlay EPSG:4326,
*           generate a simple HTML viewers based on Google Maps and OpenLayers
* Author:   Klokan Petr Pridal, klokan at klokan dot cz
* Web:      http://www.klokan.cz/projects/gdal2tiles/
*
******************************************************************************
* Copyright (c) 2008 Klokan Petr Pridal. All rights reserved.
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*****************************************************************************/


 
var AWE = window.AWE || {};

AWE.Mapping = (function(module) {
  
  /** singleton for transforming coordinates to global mercator (spheric) as 
   * used by mapping services. */
  module.GlobalMercator = (function(tileSize) {
    
    var _tileSize = tileSize;
    var _initialResolution = 2.0 * Math.PI * 6378137.0 / _tileSize;
    var _originShift = 2.0 * Math.PI * 6378137.0 / 2.0;
        
    return {
      /** transforms a xyz coordinate in TMS format (origin in lower left 
       * corner) to google's XYZ format (origin in upper left corner). */
      TMSToGoogleTileCode: function(tx, ty, zoom) {
        return { x: tx, y: ((1 << zoom) - ty -1), zoom: zoom };
      },
      /** transforms a xyz coordinate in google's format to TMS format */
      googleToTMSTileCode: function(tx, ty, zoom) {
        return { x: tx, y: ((1 << zoom) - ty -1), zoom: zoom };
      },
      /** transforms a xyz TMS coordinate to microsofts quad tree code. */
      TMSToQuadTreeTileCode: function (tx, ty, zoom) {
        var path = ""
        var ty = (1<<zoom)-ty-1; // change origin
        for (var i=zoom; i > 0; i--) {
          var digit = 0;
          var mask = 1 << (i-1);
          if ((tx & mask) != 0) {
            digit+= 1;
          }
          if ((ty & mask) != 0) {
            digit+= 2;
          }
          path = path+digit;
        }
        return path;
      },
      /** transforms a quad tree path to an xyz coordinate in TMS format. */
      QuadTreeToTMSTileCode: function(path) {
        var zoom = path.length;
        var tx = 0;
        var ty = 0;
		    for(var i = zoom; i >= 1; i--) {
		      var digit = parseInt(path[zoom-i]);
			    var mask = 1 << (i-1);
			    if ((digit & 1) != 0) {
				    tx += mask;
			    }
			    if ((digit & 2) != 0) {
				    ty += mask;
			    }
        }
		    ty = (1 << zoom) - 1 - ty;
		    return { x: tx, y: ty, zoom: zoom };
      }
    };
    
  }(AWE.Config.MAPPING_TILE_SIZE));
  
  return module;
  
}(AWE.Mapping || {}));

// inlined test code

$(document).ready(function() {
  
  if (!AWE.Config.MAP_RUN_TESTS) return ;
  
  var gtc = AWE.Mapping.GlobalMercator.TMSToGoogleTileCode(4,4,10);
  console.log("google x: " + gtc.x + " y: " + gtc.y + " zoom: " + gtc.zoom); 

  var tms = AWE.Mapping.GlobalMercator.googleToTMSTileCode(gtc.x,gtc.y,gtc.zoom);
  console.log("tms x: " + tms.x + " y: " + tms.y + " zoom: " + tms.zoom); 
  console.log("should be x: 4 y: 4 zoom: 10"); 

  var qtc = AWE.Mapping.GlobalMercator.TMSToQuadTreeTileCode(7,8,4);
  console.log("qtc: " + qtc); 
  console.log("should be: 0333");
  
  var tms2 = AWE.Mapping.GlobalMercator.QuadTreeToTMSTileCode(qtc);
  console.log("tms x: " + tms2.x + " y: " + tms2.y + " zoom: " + tms2.zoom); 
  console.log("should be x: 7 y: 8 zoom: 4"); 
  
});

