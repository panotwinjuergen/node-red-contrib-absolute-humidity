module.exports = function(RED) {
    function AbsoluteHumidityNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
	    r   = msg.relativeHumidity;	// relative Luftfeuchte [%]
	    T   = msg.temperature;	// Temperatur [°C]
	    //console.log('r=' + r + ', T=' + T);
	    TK  = T + 273.15;		// Temperatur [K]
	    a   = 7.5; b = 237.3;	// Parameter bei T >= 0
	    //a   = 7.6; b = 240.7;	// Parameter bei T < 0 über Wasser
	    SDD = 6.1078 * Math.pow(10,a*T/(b+T));	// Sättigungsdampfdruck [hPa]	    
	    DD  = r/100 * SDD;		// augenblicklicher Dampfdruck [hPa]	    
	    v   = Math.log10(DD/6.1078);
	    TD  = b*v/(a-v);		// Taupunkttemperatur [°C]
	    AF  = Math.pow(10,5) * 18.016/8314.3 * DD/TK; // absolute Feuchte [g/m³]
	    //console.log("TD=" + TD + ", AF=" + AF);
	    msg.absoluteHumidity = Math.round(AF*10)/10.0;
	    msg.dewPoint = Math.round(TD*10)/10.0;
	    //console.log("msg.absoluteHumidity=" + msg.absoluteHumidity + ", msg.dewPoint=" + msg.dewPoint);
	    node.send(msg);
        });
    }
    RED.nodes.registerType("absolute-humidity",AbsoluteHumidityNode);
}
