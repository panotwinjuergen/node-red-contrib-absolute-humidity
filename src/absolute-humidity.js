module.exports = function(RED) {

    function validateTemperature(T, formula) {
        if (formula === 'lawrence') {
            if (T < -40 || T > 50) {
                return {
                    valid: false,
                    message: `${T}°C not valid for Lawrence (-40-50°C)`
                };
            }
        } else { // Wetterochs
            if (T < -45 || T > 60) {
                return {
                    valid: false,
                    message: `${T}°C not valid for Wetterochs (-45-60°C)`
                };
            }
        }
        return { valid: true };
    }

    function calculateWetterochs(T, r) {
        // Temperatur [K]
        const TK = T + 273.15;
        
        // Parameters based on temperature
        const a = T >= 0 ? 7.5 : 7.6;
        const b = T >= 0 ? 237.3 : 240.7;
        
        // SDD: Sättigungsdampfdruck [hPa]
        const SDD = 6.1078 * Math.pow(10, (a*T)/(b+T));

        // DD: augenblicklicher Dampfdruck [hPa]   
        const DD = r/100 * SDD;

        // TD: Taupunkttemperatur [°C]
        const v = Math.log10(DD/6.1078);
        const TD = b*v/(a-v);

        // AF = absolute Feuchte [g/m³]
        const AF = Math.pow(10,5) * 18.016/8314.3 * DD/TK;

        return {
            dewPoint: Math.round(TD*100)/100.0,
            absoluteHumidity: Math.round(AF*100)/100.0
        };
    }

    function calculateLawrence(T, r) {
        // Constants from Mark G. Lawrence's formula
        const a = 17.625;
        const b = 243.04;
        
        // Calculate gamma parameter
        const gamma = Math.log(r/100) + (a * T)/(b + T);
        
        // Calculate dew point
        const TD = (b * gamma)/(a - gamma);
        
        // Calculate vapor pressure
        const vaporPressure = 6.1078 * Math.exp((a * T)/(b + T));
        const actualVaporPressure = (r/100) * vaporPressure;
        
        // Calculate absolute humidity using the ideal gas law
        // R* = 8.31447 J/(mol·K), Mw = 18.016 g/mol
        const TK = T + 273.15;
        const AF = (actualVaporPressure * 18.016)/(8.31447 * TK) * 100;

        return {
            dewPoint: Math.round(TD*100)/100.0,
            absoluteHumidity: Math.round(AF*100)/100.0
        };
    }

    function AbsoluteHumidityNode(config) {
        RED.nodes.createNode(this,config);
        this.temperatureTopic = config.temperatureTopic;
        this.humidityTopic = config.humidityTopic;
        this.formula = config.formula || 'wetterochs';

        const context = this.context();
        
        this.on('input', function(msg, send, done) {
            let humidityValue;
            
            // Get humidity value from various input methods
            if (typeof msg.relativeHumidity == 'number')
                humidityValue = msg.relativeHumidity;
            else {
                if (msg.topic === this.humidityTopic && typeof msg.payload === 'number')
                    humidityValue = msg.payload;
                else if (msg.datapoint === 'HUMIDITY' && typeof msg.payload === 'number')
                    humidityValue = msg.payload;
            }

            let temperatureValue;

            // Get temperature value from various input methods
            if (typeof msg.temperature == 'number')
                temperatureValue = msg.temperature;
            else {
                if (msg.topic === this.temperatureTopic && typeof msg.payload === 'number')
                    temperatureValue = msg.payload;
                else if (msg.datapoint === 'ACTUAL_TEMPERATURE' && typeof msg.payload === 'number')
                    temperatureValue = msg.payload;
            }

            // Validate humidity range
            if (humidityValue !== undefined) {
                if (humidityValue < 0 || humidityValue > 100) {
                    this.status({fill:"red",shape:"dot",text:"Invalid humidity: " + humidityValue + "% (OK: 0-100%)"});
                    if (done) {
                        done("Invalid humidity: " + humidityValue + "% (OK: 0-100%)");
                    }
                    return;
                }
                context.set('r', humidityValue);
            }

            // Validate temperature if present
            if (temperatureValue !== undefined) {
                const tempValidation = validateTemperature(temperatureValue, this.formula);
                if (!tempValidation.valid) {
                    this.status({fill:"red",shape:"dot",text:tempValidation.message});
                    if (done) {
                        done(tempValidation.message);
                    }
                    return;
                }
                context.set('T', temperatureValue);
            }
            
            // Get stored values
            const r = context.get('r');
            const T = context.get('T');

            const statustext = "rel.hum=" + (r !== undefined ? r : "?") + ", temp=" + (T !== undefined ? T : "?");

            if (typeof r === 'undefined' || typeof T === 'undefined') {
                this.status({fill:"yellow",shape:"ring",text:statustext});
                if (done) {
                    done();
                }
                return;  // Don't send a message until we have both values
            }
            
            this.status({fill:"green",shape:"dot",text:statustext});

            // Calculate using selected formula
            let result;
            if (this.formula === 'lawrence') {
                result = calculateLawrence(T, r);
            } else {
                result = calculateWetterochs(T, r);
            }
            
            msg.dewPoint = result.dewPoint;
            msg.absoluteHumidity = result.absoluteHumidity;
            
            const descr = "AH: " + result.absoluteHumidity.toFixed(2) + " g/m³, DP: " + result.dewPoint.toFixed(2) + " °C";
            this.status({fill:"green",shape:"dot",text:descr});

            send(msg);
            if (done) {
                done();
            }
        });
    }
    
    RED.nodes.registerType("absolute-humidity",AbsoluteHumidityNode);
}
