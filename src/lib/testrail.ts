const axios = require('axios');
const chalk = require('chalk');
const deasync = require('deasync');
const fs = require('fs');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private resultId: Number;
  private res;
  private screenshot;
  private video;

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
    //  urls need to be properly defined
    //  var filename = __dirname+req.url;
    this.screenshot = 'screenshots' + 'cypress';
    this.video = 'videos' + 'cypress';
    this.res = undefined;
    this.resultId = 0;
  }

  public createRun(name: string, description: string) {
    axios({
      method: 'post',
      url: `${this.base}/add_run/${this.options.projectId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({
        suite_id: this.options.suiteId,
        name,
        description,
        milestone_id: this.options.milestoneId,
        include_all: true,
      }),
    })
      .then(response => {
        console.log('Creating test run... ---> run id is:  ', response.data.id);
        this.runId = response.data.id;
      })
      .catch(error => console.error(error));
  }

  public deleteRun() {

    if (!(this.options.createTestRun)) {
      this.runId = this.options.runId;
    }

    if (typeof this.runId === "undefined") {
      console.error("runId is undefined.")
      return
    }

    axios({
      method: 'post',
      url: `${this.base}/delete_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).catch(error => console.error(error));
  }

  private waitResponse(delay) {
    if (typeof this.res === "undefined" && delay > 0) {
        deasync.sleep(1000)
        this.waitResponse(delay - 1000)
    }
  }

  public publishResults(results: TestRailResult[]) {

    if (!(this.options.createTestRun)) {
      this.runId = this.options.runId;
    }

    if (typeof this.runId === "undefined") {
      console.error("runId is undefined.")
      return
    }

    axios({
      method: 'post',
      url: `${this.base}/add_results_for_cases/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
      data: JSON.stringify({ results }),
    })
      .then(response => {
        this.res = response;
        if(response.status == 200){
          this.resultId = response.id;
          console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
          console.log(
            '\n',
            ` - Results are published to ${chalk.magenta(
              `https://${this.options.domain}/index.php?/runs/view/${this.runId}`
              )}`,
            '\n'
          );
        }
      })
      .catch(error => console.error(error));

    if (this.options.addScreenshot) {

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

    if (this.options.addVideo) {

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

  }
}
