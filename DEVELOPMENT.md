# Development instructions

All commits to the git repo that must be signed, we use iz-keyvault to generate the keys.

When you are working with multiple modules, ie welshman, iz-nostrlib and iz-stream

you use this to start a patch (bugfix):

    npm version prepatch --preid snapshot

you use this to step internal releases:

    npm version prerelease --preid snapshot

to create new version of the package, and the you use to push it to your local repo:

    npm publish --registry http://localhost:4873

alt you put the package in .npmrc

    @red-token:registry=http://localhost:4873

When the task you are working on is finished you do a patch release.

    npm version patch 

We should consider using our own npmrepo for stuff that are not yet ready for release.

## Branching strategy

I would advice that we suse task based branching.

So when you start your work you make a branch with a task in it

you then work on your code, with snapshots, when you feel it's done you then merge in what is on main. and publish. 

Now the cool thing would be if you would track the issues by moving the to ongoing when you create the branches.

### Scenario

We have task-1 in module A, and we will also modify module B, task-2.

First we branch module A 

    git branch task-1; git checkout task-1; 

We update .npmrc

    module-A:registry=http://localhost:4873
    module-B:registry=http://localhost:4873

Then we step the version of the module into a snapshot

    npm version prepatch --preid snapshot

Then we checkout module B

    git branch task-2; git checkout task-2;
    module-B:registry=http://localhost:4873
    npm version prepatch --preid snapshot

Now we develop our modules from this code base: For every time we need to sync we do

in module B:

    npm publish
    npm version prerelease --preid snapshot

in module A:

    npm install module-B@latest

Now we are done, everything works, we therefor merge with main rel

    git fetch; git merge origin/main

Retest, if everything goes fine make a release of module-B (signed commit)

    npm version patch
    git checkout main; git pull; git merge -S task-1 -m "Closes #task-2"

We can now make an official update to module-B

    git push; npm publish 

We update npmrc in module-A to pull module-B from official repo and retest

    git fetch; git merge origin/main
    npm install module-B@latest
    npm version patch
    git checkout main; git pull; git merge -S task-1 -m "Closes #task-1"

We now publish module-A

    git push




    



