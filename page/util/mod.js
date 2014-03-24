// modifies the standard js runtime env


function getStyle(oElm, strCssRule){
  var strValue = "";
  if(document.defaultView && document.defaultView.getComputedStyle){
    strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
  }
  else if(oElm.currentStyle){
    strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
      return p1.toUpperCase();
    });
    strValue = oElm.currentStyle[strCssRule];
  }
  return strValue;
}




HSBToRGB = function (hsb) {
  var rgb = {};
  var h = Math.round(hsb.h);
  var s = Math.round(hsb.s * 255 / 100);
  var v = Math.round(hsb.b * 255 / 100);
  if (s == 0) {
    rgb.r = rgb.g = rgb.b = v;
  } else {
    var t1 = v;
    var t2 = (255 - s) * v / 255;
    var t3 = (t1 - t2) * (h % 60) / 60;
    if (h == 360) h = 0;
    if (h < 60) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3 }
    else if (h < 120) { rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3 }
      else if (h < 180) { rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3 }
        else if (h < 240) { rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3 }
          else if (h < 300) { rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3 }
            else if (h < 360) { rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3 }
              else { rgb.r = 0; rgb.g = 0; rgb.b = 0 }
  }
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

function expmod( base, exp, mod ){
  if (exp == 0) return 1;
  if (exp % 2 == 0){
    return Math.pow( expmod( base, (exp / 2), mod), 2) % mod;
  }
  else {
    return (base * expmod( base, (exp - 1), mod)) % mod;
  }
}

if ( typeof module !== "undefined" ){
  module.exports.getStyle = getStyle;
  module.exports.HSBToRGB = HSBToRGB;
  module.exports.expmod = expmod;
}
else
{
  window.getStyle = getStyle;
  window.HSBToRGB = HSBToRGB;
  window.expmod = expmod;
}

