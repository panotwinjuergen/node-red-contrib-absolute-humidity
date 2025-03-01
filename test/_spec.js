var should = require("should");
var helper = require("node-red-node-test-helper");
var hummyNode = require("../src/absolute-humidity.js");

var flow = [{ id: "n1", type: "absolute-humidity", name: "test name", temperatureTopic: "temp", humidityTopic: "hum", wires:[["n2"]] },
	    { id: "n2", type: "helper" }];

helper.init(require.resolve('node-red'));

describe('absolute-humidity Node', function () {
    
    afterEach(function () {
	helper.unload();
    });
    
    it('should be loaded', function (done) {
	helper.load(hummyNode, [{ id: "n1", type: "absolute-humidity", name: "test name" }], function () {
	    var n1 = helper.getNode("n1");
	    n1.should.have.property('name', 'test name');
	    done();
	});
    });
    
    it('should preserve original message properties', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('originalValue', 42);
                    msg.should.have.property('dewPoint', 15.4);
                    msg.should.have.property('absoluteHumidity', 13);
                    done();
                } catch(err) {
                    done(err);
                }
            });
            n1.receive({ temperature: 20.0, relativeHumidity: 75, originalValue: 42 });
        });
    });

    it('should not output with only temperature input', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ temperature: 20.0 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should not output with only humidity input', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.receive({ relativeHumidity: 75 });
            
            setTimeout(function() {
                msgReceived.should.be.false();
                done();
            }, 50);
        });
    });

    it('should reject humidity values below 0%', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Relative humidity must be between 0% and 100%, got: -5%");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: -5 });
        });
    });

    it('should reject humidity values above 100%', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Relative humidity must be between 0% and 100%, got: 120%");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ temperature: 20.0, relativeHumidity: 120 });
        });
    });

    it('should reject invalid humidity via topic', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Relative humidity must be between 0% and 100%, got: 101%");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ topic: "hum", payload: 101 });
        });
    });

    it('should reject invalid humidity via datapoint', function (done) {
        helper.load(hummyNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");
            var msgReceived = false;

            n2.on("input", function (msg) {
                msgReceived = true;
            });

            n1.error = function(msg) {
                msg.should.equal("Relative humidity must be between 0% and 100%, got: -1%");
                msgReceived.should.be.false();
                done();
            };

            n1.receive({ datapoint: "HUMIDITY", payload: -1 });
        });
    });
    
    it('should create correct result for T=20°C  and r=75%', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.4);
		    msg.should.have.property('absoluteHumidity', 13);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 20.0, relativeHumidity: 75 });
	});
    });

    it('should create correct result for T=10°C  and r=20%', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', -11.9);
		    msg.should.have.property('absoluteHumidity', 1.9);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 10.0, relativeHumidity: 20 });
	});
    });
    
    it('should create correct result for T=0°C   and r=100%', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 0);
		    msg.should.have.property('absoluteHumidity', 4.8);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: 0, relativeHumidity: 100 });
	});
    });

    it('should create correct result for T=-10°C and r=50%', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', -18.4);
		    msg.should.have.property('absoluteHumidity', 1.2);
		    done();
		} catch(err) {
		    done(err);
		}
	    });
	    n1.receive({ temperature: -10, relativeHumidity: 50 });
	});
    });

    // Test topic-based input
    it('should handle topic-based input correctly and preserve properties', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");
            var msgCount = 0;

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.4);
		    msg.should.have.property('absoluteHumidity', 13);
                    msg.should.have.property('originalValue', 42);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature and humidity with configured topics
	    n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
	    n1.receive({ topic: "hum", payload: 75, originalValue: 42 });
	});
    });

    // Test datapoint-based input
    it('should handle datapoint-based input correctly and preserve properties', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.4);
		    msg.should.have.property('absoluteHumidity', 13);
                    msg.should.have.property('originalValue', 42);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature and humidity with datapoint identifiers
	    n1.receive({ datapoint: "ACTUAL_TEMPERATURE", payload: 20.0, originalValue: 42 });
	    n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 42 });
	});
    });

    // Test mixed input methods
    it('should handle mixed input methods correctly and preserve properties', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");

	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint', 15.4);
		    msg.should.have.property('absoluteHumidity', 13);
                    msg.should.have.property('originalValue', 42);
		    done();
		} catch(err) {
		    done(err);
		}
	    });

	    // Send temperature via topic and humidity via datapoint
	    n1.receive({ topic: "temp", payload: 20.0, originalValue: 42 });
	    n1.receive({ datapoint: "HUMIDITY", payload: 75, originalValue: 42 });
	});
    });
});
