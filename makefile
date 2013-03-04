MOCHA=node_modules/.bin/mocha
REPORTER=spec
test:
	$(MOCHA) $(shell find test/ -maxdepth 1 -name "*test.js") --reporter $(REPORTER)
config:
	$(MOCHA) test/config-test.js --reporter $(REPORTER)