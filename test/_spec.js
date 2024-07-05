var should = require("should");
var helper = require("node-red-node-test-helper");
var hummyNode = require("../src/absolute-humidity.js");

var flow = [{ id: "n1", type: "absolute-humidity", name: "test name",wires:[["n2"]] },
	    { id: "n2", type: "helper" }];

//helper.init(require.resolve('node-red'));

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
		    console.log("FAIL: " + err);
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
		    console.log("FAIL: " + err);
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
		    console.log("FAIL: " + err);
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
		    console.log("FAIL: " + err);
		}		    
	    });
	    n1.receive({ temperature: -10, relativeHumidity: 50 });
	});
    });

    it('should create correct results with two separate input messages', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");
	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint');
		    msg.should.have.property('absoluteHumidity');
		    done();
		} catch(err) {
		    console.log("FAIL: " + err);
		}		    
	    });
	    n1.receive({ relativeHumidity: 75 });
	    n1.receive({ temperature: 20 });
	});
    });
    

    it('should create correct results with two separate input messages', function (done) {
	helper.load(hummyNode, flow, function () {
	    var n2 = helper.getNode("n2");
	    var n1 = helper.getNode("n1");
	    n2.on("input", function (msg) {
		try {
		    msg.should.have.property('dewPoint');
		    msg.should.have.property('absoluteHumidity');
		    done();
		} catch(err) {
		    console.log("FAIL: " + err);
		}		    
	    });
	    n1.receive({ topic: 'relativeHumidity', payload: 75 });
	    n1.receive({ topic: 'temperature',      payload: 20 });
	});
    });
    

});

