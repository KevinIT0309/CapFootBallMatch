# Getting Started

Welcome to CAP FootBall Match project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.


## Linux command
- Kill a port running
    + step 1: lsof -i :<port running>
    + step 2: kill <PID>

## Rule Testing at local
- move folder /data/ from asset directory to folder db for test, when done remove from db.

## Undeploy mta
cf undeploy capfootballmatch --delete-services --delete-service-keys --delete-service-brokers