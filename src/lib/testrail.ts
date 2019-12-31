const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;

  constructor(private options: TestRailOptions) {
    this.base = `https://${options.domain}/index.php?/api/v2`;
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

  public publishResults(results: TestRailResult[]) {

    if (this.options.createTestRun == "false") {
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
        if(response.status == 200){
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
  }
}
