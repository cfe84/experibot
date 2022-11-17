import * as fs from "fs";
import { TeamsChannelAccount, TeamsInfo, TeamsPagedMembersResult, TurnContext } from "botbuilder";
import path = require("path");
import { fileURLToPath } from "url";

export interface Diff {
  added: TeamsChannelAccount[],
  removed: TeamsChannelAccount[]
}

export interface UserExport {
  exportDate: string,
  id: number,
  users: TeamsChannelAccount[]
}

export interface UserFile {
  teamId: string,
  exports: UserExport[]
}

export class UserProcessor {
  constructor(private store: string) {
    if (!fs.existsSync(store)) {
      fs.mkdirSync(store)
    }
  }

  static async siphonUsers(context: TurnContext){
    let accounts: TeamsChannelAccount[] = [];
    let token: string | undefined = undefined;
    while(true) {
      const pagedMembers: TeamsPagedMembersResult = await TeamsInfo.getPagedMembers(context, 10, token);
      accounts.push(...pagedMembers.members);
      if (!pagedMembers.continuationToken) {
        return accounts
      } else {
        token = pagedMembers.continuationToken;
      }
    }
  }

  addExport(accounts: TeamsChannelAccount[], teamId: string) {
    let file: UserFile = this.openTeamFile(teamId);
    const expo: UserExport = {
      exportDate: new Date().toString(),
      id: file.exports.length,
      users: accounts
    }
    file.exports.push(expo);
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

  diffUsers(teamId: string): Diff | null {
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

  userListToString(users: TeamsChannelAccount[]){
    return users.map(user => `${user.name} (${user.email})`).join("\n");
  }
}