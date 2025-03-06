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
