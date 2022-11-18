import * as fs from "fs";
import { TeamsChannelAccount, TeamsInfo, TeamsPagedMembersResult, TurnContext } from "botbuilder";
import path = require("path");
import { ILogger } from "../domain/ILogger";

const maxVersionsOfUsers = Number.parseInt(process.env.MAX_VERSIONS_OF_USERS || '5');

interface Diff {
  added: TeamsChannelAccount[],
  removed: TeamsChannelAccount[]
}

interface UserExport {
  exportDate: string,
  id: number,
  users: TeamsChannelAccount[]
}

interface UserFile {
  teamId: string,
  exports: UserExport[]
}

export interface UserProcessDeps {
  logger: ILogger
}

export class UserProcessor {
  constructor(private deps: UserProcessDeps, private store: string) {
    if (!fs.existsSync(store)) {
      fs.mkdirSync(store)
    }
  }

  public async processUsers(context: TurnContext) {
    const teamId = context.activity.channelData.team.id;
    this.deps.logger.debug(`Snitching for team ${teamId}`)
    const users = await this.siphonUsers(context);
    this.addExport(users, teamId);
    const diff = this.diffUsers(teamId);
    this.printDiff(diff);
  }

  private printDiff(diff: Diff | null) {
    this.deps.logger.output(`\n=====`);
    if (!diff)
    {
      this.deps.logger.output(`That's the first export\n=====\n`);
      return;
    }
    if (!diff.added.length && !diff.removed.length) {
      this.deps.logger.output(`No changes in users\n=====\n`);
      return;
    }
    if (diff.added.length) {
      this.deps.logger.output(`Added\n=====\n\n${this.userListToString(diff.added)}\n`)
    } else {
      this.deps.logger.output(`No new users\n=====\n`)
    }
    if (diff.removed.length) {
      this.deps.logger.output(`Removed\n=====\n\n${this.userListToString(diff.removed)}\n`)
    } else {
      this.deps.logger.output(`No removed users\n=====\n`)
    }
  }

  private async siphonUsers(context: TurnContext){
    let accounts: TeamsChannelAccount[] = [];
    let token: string | undefined = undefined;
    while(true) {
      const pagedMembers: TeamsPagedMembersResult = await TeamsInfo.getPagedMembers(context, 100, token);
      accounts.push(...pagedMembers.members);
      if (!pagedMembers.continuationToken) {
        return accounts
      } else {
        token = pagedMembers.continuationToken;
      }
    }
  }

  private addExport(accounts: TeamsChannelAccount[], teamId: string) {
    let file: UserFile = this.openTeamFile(teamId);
    const expo: UserExport = {
      exportDate: new Date().toString(),
      id: file.exports.length,
      users: accounts
    }
    file.exports.push(expo);
    while(file.exports.length > maxVersionsOfUsers) {
      file.exports.shift();
    }
    fs.writeFileSync(this.getFilePath(teamId), JSON.stringify(file));
  }

  private openTeamFile(teamId: string) {
    const filePath = this.getFilePath(teamId);
    let file: UserFile;
    if (fs.existsSync(filePath)) {
      file = JSON.parse(fs.readFileSync(filePath).toString());
    } else {
      file = {
        exports: [],
        teamId: teamId
      };
    }
    return file;
  }

  private getFilePath(teamId: string) {
    return path.join(this.store, `export-${teamId.replace(":", "")}.json`);
  }

  private diffUsers(teamId: string): Diff | null {
    const file = this.openTeamFile(teamId);
    if (file.exports.length <= 1) {
      return null;
    }
    const current = file.exports[file.exports.length - 1];
    const prev = file.exports[file.exports.length - 2];
    const added = current.users.filter(currentUser => prev.users.findIndex((prevUser: TeamsChannelAccount) => prevUser.aadObjectId === currentUser.aadObjectId) < 0)
    const removed = prev.users.filter(prevUser => current.users.findIndex((currentUser: TeamsChannelAccount) => prevUser.aadObjectId === currentUser.aadObjectId) < 0)
    return {
      added,
      removed
    };
  }

  private userListToString(users: TeamsChannelAccount[]){
    return users.map(user => `${user.name} (${user.email})`).join("\n");
  }
}