interface PullUpdaterOptions {
  repository: string;
  owner: string;
  label: string;
  auth: string;
}

export class PullUpdater {
  constructor(opts: PullUpdaterOptions) {}
  performUpdate(): Promise<number> {
    return Promise.reject('todo');
  }
}
