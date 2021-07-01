import { TaskModuleResponse, CardFactory, TaskModuleRequest } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { taskModuleCard } from "../cards/taskModuleCard";

export class ChainedTaskModulesHandler {
  constructor(private deps: IDependencies) { }

  fetchTaskModule(): TaskModuleResponse | PromiseLike<TaskModuleResponse> {
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the task module title",
          height: 500,
          width: "medium",
          card: CardFactory.adaptiveCard(taskModuleCard(1)),
        },
      },
    };
  }

  processTaskModuleRequest(taskModuleRequest: TaskModuleRequest): TaskModuleResponse {
    const i = taskModuleRequest.data.i;
    if (taskModuleRequest.data?.button === "close") {
      return {
        task: { type: "message", value: taskModuleRequest.data.theValue },
      };
    } else {
      // If you clicked on continue, display another task module.
      return {
        task: {
          type: "continue",
          value: {
            title: "This is the task module title",
            height: 500,
            width: "medium",
            card: CardFactory.adaptiveCard(taskModuleCard(i + 1)),
          },
        },
      };
    }
  }
}