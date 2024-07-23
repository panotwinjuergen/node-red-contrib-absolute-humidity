.PHONY: install
install:
	( cd ~/.node-red; npm install ~/node-red-contrib-absolute-humidity )

.PHONY: test
test:	test/_spec.js src/absolute-humidity.js
	npm test

.PHONY: restart
restart:
	sudo systemctl restart nodered.service
