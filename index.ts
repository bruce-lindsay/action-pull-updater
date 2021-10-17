import { context } from "@actions/github";
import { getInput } from "@actions/core";
import { PullUpdater } from './PullUpdater';

const updater = new PullUpdater({
  repository: context.repo.repo,
  owner: context.repo.owner,
  label: getInput('label'),
  auth: getInput('token')
});

updater
  .performUpdate()
  .then(pullNumber => {
    if (pullNumber == 0) {
      console.log('no pull updated');
    } else {
      console.log('updated pull', pullNumber);
    }
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
