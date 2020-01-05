"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');
var chalk = require('chalk');
var deasync = require('deasync');
var fs = require('fs');
var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.base = "https://" + options.domain + "/index.php?/api/v2";
        //  urls need to be properly defined
        //  var filename = __dirname+req.url;
        this.screenshot = 'screenshots' + 'cypress';
        this.video = 'videos' + 'cypress';
        this.res = undefined;
        this.resultId = 0;
    }
    TestRail.prototype.createRun = function (name, description) {
        var _this = this;
        axios({
            method: 'post',
            url: this.base + "/add_run/" + this.options.projectId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({
                suite_id: this.options.suiteId,
                name: name,
                description: description,
                milestone_id: this.options.milestoneId,
                include_all: true,
            }),
        })
            .then(function (response) {
                console.log('Creating test run... ---> run id is:  ', response.data.id);
                _this.runId = response.data.id;
        })
            .catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.deleteRun = function () {

        if (this.options.createTestRun == 'false') {
            this.runId = this.options.runId;
        }
        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.");
            return;
        }

        axios({
            method: 'post',
            url: this.base + "/delete_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) { return console.error(error); });
    };
    TestRail.prototype.waitResponse = function (delay) {
        if (typeof this.res === "undefined" && delay > 0) {
            deasync.sleep(1000);
            this.waitResponse(delay - 1000);
        }
    };
    TestRail.prototype.publishResults = function (results) {
        var _this = this;
        if (!(this.options.createTestRun)) {
            this.runId = this.options.runId;
        }
        if (typeof this.runId === "undefined") {
            console.error("runId is undefined.");
            return;
        }
        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),
        }).then(function (response) {
            _this.res = response;
            if (response.status == 200) {
                this.resultId = response.id;
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.log('\n', " - Results are published to " + chalk.magenta("https://" + this.options.domain + "/index.php?/runs/view/" + this.runId), '\n');
            }
        }).catch(function (error) { return console.error(error); });

        if (this.options.addScreenshot == 'true') {

            this.waitResponse(5000)
      
            axios({
              method: 'post',
              url: `${this.base}/add_attachment_to_result/${this.resultId}`,
              headers: { 'Content-Type': 'multipart/form-data' },
              auth: {
                username: this.options.username,
                password: this.options.password,
              },
              formData: { attachment: [fs.createReadStream(this.screenshot)] },
            })
              .then(response => {
                this.res = response;
                if(response.status == 200){
                  console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                  console.log(
                    '\n',
                    ` - Screenshots are published to ${chalk.magenta(
                      `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
                      )}`,
                    '\n'
                  );
                }
              })
              .catch(error => console.error(error));
      
          }
      
          if (this.options.addVideo == 'true') {
      
            this.waitResponse(5000)
          
            axios({
              method: 'post',
              url: `${this.base}/add_attachment_to_result/${this.resultId}`,
              headers: { 'Content-Type': 'multipart/form-data' },
              auth: {
                username: this.options.username,
                password: this.options.password,
              },
              formData: { attachment: [fs.createReadStream(this.video)] },
            })
              .then(response => {
                this.res = response;
                if(response.status == 200){
                  console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                  console.log(
                    '\n',
                    ` - Videos are published to ${chalk.magenta(
                      `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
                      )}`,
                    '\n'
                  );
                }
              })
              .catch(error => console.error(error));
          }

    };
    return TestRail;
}());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map