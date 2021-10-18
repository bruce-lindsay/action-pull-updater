import * as github from "@actions/github";
import { RequestInterface } from "@octokit/types";
import { components } from "@octokit/openapi-types";
import { FilteredRandomChooser } from "./FilteredRandomChooser";

type IssueResponse = components['schemas']['issue'];

interface PullUpdaterOptions {
  repository: string;
  owner: string;
  label: string;
  auth: string;
}

const filterToPulls = (data: IssueResponse[]) =>  {
  return data.filter(o => o.pull_request && o.pull_request.url);
};

export class PullUpdater {
  private requester: RequestInterface<object>;
  constructor(private opts: PullUpdaterOptions) {
    this.requester = github.getOctokit(opts.auth).request.defaults({ repo: opts.repository, owner: opts.owner });
  }

  async readPullRequestsByLabel() {
    return this.requester('GET /repos/{owner}/{repo}/issues',
      <any>{ state: 'open', labels: this.opts.label, per_page: 100 })
      .then(f => ({...f, data: filterToPulls(f.data)}));
  }

  async choosePullRequest(pullNumber: number[]) {
    // todo: replace with some pull request evaluatation here (eliminate PR with merge issues or failing tests)
    const chooser = new FilteredRandomChooser(pullNumber, n => Promise.resolve(true));
    return chooser.Choose()
  }

  async performUpdate(): Promise<number> {
    const response = await this.readPullRequestsByLabel();

    if (response.data.length === 0) {
      return Promise.resolve(0);
    }

    const chosen = await this.choosePullRequest(response.data.map(n => n.number));
    const updateResponse = await this.requester('PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch',
      <any>{ pull_number: chosen });

    console.log(updateResponse);
    return chosen;
  }
}
