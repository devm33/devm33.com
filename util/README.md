## utility files

### Deployment moved

I am now using the shell script `ln/_deploy` to build and deploy over rsync

### `post-receive` and `post-update`

git hooks for deployment on server and local apache

notes to self:

- local apache should be symlinked to development folder so no worries

- to sync server hooks just use scp right to where they are

        scp post-receive post-update devm33:~/devm33.git/hooks/


