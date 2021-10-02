import {Body, Controller, Get, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common";
import {hasPermissions} from "src/auth/decorators/permission.decorator";
import {JwtAuthGuard} from "src/auth/guards/jwt-auth.guard";
import {PermissionGuard} from "src/auth/guards/permission.guard";
import {Exception} from "src/constants/error";
import {ProjectService} from "src/project/project.service";
import {TaskService} from "./task.service";


@Controller("task")
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly projectService: ProjectService,
    ){}

    @hasPermissions("VIEW_TASK")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Get(":taskId")
    async getTask(
        @Param("taskId") taskId: string
    ){
        try{
            const task = await this.taskService.getTask({id: taskId});
            if(!task){
                return new NotFoundException(Exception.TASK_NOT_FOUND)
            }
            return task;

        }catch(err){
            console.log(err)
        }
    }

    @hasPermissions("CREATE_TASK")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Post(":projectId")
    async createTask(
        @Param("projectId") projectId: string,
        @Body("title") title: string,
        @Body("desciption") description: string,
        @Body("remaining") remaining: string,
        @Body("estimate") estimate: string,
        @Body("complete") complete: string
    ){
       try{
           const project = await this.projectService.findProject({id: projectId})
           if (!project){
                return new NotFoundException(Exception.PROJECT_NOT_FOUND)
           }
           const task = await this.taskService.saveTask({                     
                title,
                description,
                remaining,
                estimate,
                complete,
                project: projectId
            })

            return task;
       } catch(err){ 
            console.log(err);
       } 
    }

    @hasPermissions("EDIT_TASK")
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Put(":taskId")
    async updateTask(
        @Param("taskId") taskId: string,
        @Body("title") title: string,
        @Body("desciption") description: string,
        @Body("status") status: string,
        @Body("remaining") remaining: number,
        @Body("estimate") estimate: number,
        @Body("complete") complete: number
    ){
        try{
            const task = await this.taskService.getTask({id: taskId});
            if(!task){
                return new NotFoundException(Exception.TASK_NOT_FOUND)
            }
            task.title = title ? title : task.title;
            task.description = description ? description : task.description;
            task.status = status ? status: task.status;
            task.remaining = remaining ? remaining : task.remaining;
            task.estimate = estimate ? estimate : task.estimate;
            task.complete = complete ? complete : task.complete;
            
            const afterSaveTask = await this.taskService.saveTask(task)
            return afterSaveTask;
        }catch(err){
            console.log(err)
        }
    }
}
