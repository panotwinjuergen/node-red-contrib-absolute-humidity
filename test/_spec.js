var should = require("should");
var helper = require("node-red-node-test-helper");
var hummyNode = require("../absolute-humidity.js");

//helper.init(require.resolve('node-red'));

describe('absolute-humidity Node', function () {
    
    afterEach(function () {
	helper.unload();
    });
    
    it('should be loaded', function (done) {
	var flow = [{ id: "n1", type: "absolute-humidity", name: "test name" }];
	helper.load(hummyNode, flow, function () {
	    var n1 = helper.getNode("n1");
	    n1.should.have.property('name', 'test name');
	    done();
	});
    });
    
    it('should make payload lower case', function (done) {
	var flow =
	    [{ id: "n1", type: "absolute-humidity", name: "test name",wires:[["n2"]] },
	     { id: "n2", type: "helper" }];
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
    
});

