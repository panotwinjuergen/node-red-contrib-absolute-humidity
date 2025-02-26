
module.exports = function(RED) {

    function AbsoluteHumidityNode(config) {
	
        RED.nodes.createNode(this,config);

	context = this.context();
	
        this.on('input', function(msg, send, done) {
	    
	    // --------------------------------------------------------------
	    // persist data
	    //
	    
	    // the incoming message shall either have the property 'relativeHumidity'...
	    if (typeof msg.relativeHumidity == 'number')
		context.set('r',msg.relativeHumidity);
	    else
	    {
		// ...or the appropriate topic and payload
		//console.log(typeof msg.payload);
		if (msg.topic === 'relativeHumidity' && typeof msg.payload === 'number')
		    context.set('r',msg.payload);
	    }

	    // same for the temperature
	    if (typeof msg.temperature == 'number')
		context.set('T',msg.temperature);
	    else
	    {
		if (msg.topic === 'temperature' && typeof msg.payload === 'number')
		    context.set('T',msg.payload);
	    }
	    
	    // --------------------------------------------------------------
	    // get input
	    //
	    
	    // relative Luftfeuchte [%]
	    r = context.get('r');
	    
	    // Temperatur [°C]
	    T = context.get('T');

	    //console.log("r=" + r + ", T=" + T);

	    const statustext = "rel.hum=" + r + ", temp=" + T;

	    if (typeof r === 'undefined' || typeof T === 'undefined') {
		this.status({fill:"red",shape:"dot",text:statustext});
		done();
		return;
	    }
	    
	    this.status({fill:"green",shape:"dot",text:statustext});
	    
	    // --------------------------------------------------------------
	    // calculation from https://www.wetterochs.de/wetter/feuchte.html
	    //
	    
	    // Temperatur [K]
	    TK  = T + 273.15;
	    
	    if (T >= 0) {
		a   = 7.5; b = 237.3;	// Parameter bei T >= 0
	    } else {
		a   = 7.6; b = 240.7;	// Parameter bei T < 0 über Wasser
	    }
	    
	    // SDD: Sättigungsdampfdruck [hPa]
	    SDD = 6.1078 * Math.pow(10,a*T/(b+T));

	    // DD:  augenblicklicher Dampfdruck [hPa]	   
	    DD  = r/100 * SDD;

	    // TD: Taupunkttemperatur [°C]
	    v   = Math.log10(DD/6.1078);
	    TD  = b*v/(a-v);

	    // AF = absolute Feuchte [g/m³]
	    AF  = Math.pow(10,5) * 18.016/8314.3 * DD/TK;	    

	    TD = Math.round(TD*10)/10.0;
	    AF = Math.round(AF*10)/10.0;
	    
	    msg.dewPoint = TD
	    msg.absoluteHumidity = AF
	    
	    //console.log("msg.absoluteHumidity=" + msg.absoluteHumidity + ", msg.dewPoint=" + msg.dewPoint);

	    descr = "AH: " + AF + "g/m³, DP: " + TD + "°C";
	    this.status({fill:"green",shape:"dot",text:descr});

	    send(msg);
        });
    }
    
    RED.nodes.registerType("absolute-humidity",AbsoluteHumidityNode);
}
