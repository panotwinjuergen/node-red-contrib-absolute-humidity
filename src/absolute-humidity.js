module.exports = function(RED) {

    function AbsoluteHumidityNode(config) {
	
        RED.nodes.createNode(this,config);
        this.temperatureTopic = config.temperatureTopic;
        this.humidityTopic = config.humidityTopic;

	context = this.context();
	
        this.on('input', function(msg, send, done) {
	    // --------------------------------------------------------------
	    // persist data
	    //
	    let humidityValue;
	    
	    // the incoming message shall either have the property 'relativeHumidity'...
	    if (typeof msg.relativeHumidity == 'number')
		humidityValue = msg.relativeHumidity;
	    else {
		// ...or the appropriate topic and payload
		if (msg.topic === this.humidityTopic && typeof msg.payload === 'number')
		    humidityValue = msg.payload;
		// ...or the datapoint HUMIDITY and payload
		else if (msg.datapoint === 'HUMIDITY' && typeof msg.payload === 'number')
		    humidityValue = msg.payload;
	    }

            // validate humidity range
            if (humidityValue !== undefined) {
                if (humidityValue < 0 || humidityValue > 100) {
                    this.status({fill:"red",shape:"dot",text:"Invalid humidity: " + humidityValue + "% (must be 0-100%)"});
                    if (done) {
                        done("Relative humidity must be between 0% and 100%, got: " + humidityValue + "%");
                    }
                    return;
                }
                context.set('r', humidityValue);
            }

	    // the incoming message shall either have the property 'temperature'
	    if (typeof msg.temperature == 'number')
		context.set('T',msg.temperature);
	    else
	    {
		// ...or the appropriate topic and payload
		if (msg.topic === this.temperatureTopic && typeof msg.payload === 'number')
		    context.set('T',msg.payload);
		// ...or the datapoint ACTUAL_TEMPERATURE and payload
		else if (msg.datapoint === 'ACTUAL_TEMPERATURE' && typeof msg.payload === 'number')
		    context.set('T',msg.payload);
	    }
	    
	    // --------------------------------------------------------------
	    // get input
	    //
	    
	    // relative humidity [%]
	    r = context.get('r');
	    
	    // temperature [°C]
	    T = context.get('T');

	    //console.log("r=" + r + ", T=" + T);

	    const statustext = "rel.hum=" + (r !== undefined ? r : "?") + ", temp=" + (T !== undefined ? T : "?");

	    if (typeof r === 'undefined' || typeof T === 'undefined') {
		this.status({fill:"yellow",shape:"ring",text:statustext});
		if (done) {
                    done();
                }
		return;  // Don't send a message until we have both values
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
	    
	    msg.dewPoint = TD;
	    msg.absoluteHumidity = AF;
	    
	    //console.log("msg.absoluteHumidity=" + msg.absoluteHumidity + ", msg.dewPoint=" + msg.dewPoint);

	    descr = "AH: " + AF + " g/m³, DP: " + TD + " °C";
	    this.status({fill:"green",shape:"dot",text:descr});

	    send(msg);
            if (done) {
	        done();
            }
        });
    }
    
    RED.nodes.registerType("absolute-humidity",AbsoluteHumidityNode);
}
