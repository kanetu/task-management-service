import {Body, Controller, Get, NotFoundException, Param, Post, Put, Req, UnauthorizedException, UseGuards} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Request} from "express";
import {AuthService} from "src/auth/auth.service";
import {hasPermissions} from "src/auth/decorators/permission.decorator";
import {JwtAuthGuard} from "src/auth/guards/jwt-auth.guard";
import {PermissionGuard} from "src/auth/guards/permission.guard";
import {Exception} from "src/constants/error";
import {ScheduleService} from "./schedule.service";




@Controller("schedule")
export class ScheduleController {
   constructor(
        private readonly scheduleService: ScheduleService,
        private readonly jwtService: JwtService,
        private readonly authService: AuthService
   ){} 

   @hasPermissions("VIEW_SCHEDULE")
   @UseGuards(JwtAuthGuard, PermissionGuard)
   @Get()
   async getAll(){
    try{
        return await this.scheduleService.getAllSchedule({});
    }catch(err){
        console.log(err)
    }
   }

   @hasPermissions("CREATE_SCHEDULE")
   @UseGuards(JwtAuthGuard, PermissionGuard)
   @Post()
   async createSchedule(
       @Req() request: Request,
        @Body("title") title: string,
        @Body("description") description: string,
        @Body("place") place: string,
        @Body("timeStart") timeStart: Date,
        @Body("timeEnd") timeEnd: Date,

   ) {

        try{
            const cookie = request.cookies["auth"];
            const data = this.jwtService.decode(cookie);
            if(!data){
                return new UnauthorizedException(Exception.INVALID_CREDENTIAL);
            }
            const user = await this.authService.findOne({
                relations: ["schedules"],
                where: {
                    id: data["id"]
                }
            })
            
            if(!user){
                return new NotFoundException(Exception.USER_NOT_FOUND)
            }

            const schedule = await this.scheduleService.saveSchedule({
                title,
                description,
                place,
                timeStart,
                timeEnd,
            })

            if (!user.schedules){
                user.schedules = [schedule]
            } else {
                user.schedules.push(schedule)
            }
                
            
            const {password, ...rest} = await this.authService.save(user)
                        
            return rest;
        } catch(err){
            console.log(err)
        }
   }

   @hasPermissions("EDIT_SCHEDULE")
   @UseGuards(JwtAuthGuard, PermissionGuard)
   @Put(":scheduleId")
   async updateSchedule(
       @Param("scheduleId") scheduleId: string,
        @Body("title") title: string,
        @Body("description") description: string,
        @Body("place") place: string,
        @Body("timeStart") timeStart: Date,
        @Body("timeEnd") timeEnd: Date,
        @Body("addUserId") addUserId: string
   ) {

        try{
            const schedule = await this.scheduleService.getSchedule({
                relations: ["users"],
                where: {
                    id: scheduleId
                }
            })

            if(!schedule){
                return new NotFoundException(Exception.SCHEDULE_NOT_FOUND)
            }

            
            schedule.title = title ? title: schedule.title;
            schedule.description = description ? description: schedule.description;
            schedule.place = place ? place: schedule.place;
            schedule.timeStart = timeStart ? timeStart : schedule.timeStart;
            schedule.timeEnd = timeEnd ? timeEnd : schedule.timeEnd;

            if(addUserId){
                const user = await this.authService.findOne({id: addUserId}) 
                if (!user) {
                    return new NotFoundException(Exception.USER_NOT_FOUND)
                }
                
                if (!schedule.users.some(u => u.id === user.id)){
                    schedule.users.push(user)
                } else {
                    schedule.users = schedule.users.filter(u => u.id!== user.id)
                }
              
                
            } 
            
            const afterSaveSchedule = await this.scheduleService.saveSchedule(schedule)
            const listUser = afterSaveSchedule.users.map(u => {
                    const {password, ...rest} = u;
                    return rest
                })
            const {users, ...rest} = afterSaveSchedule;
            return {...rest, listUser}
        }catch(err) {
            console.log(err)
        }
   }
    
}
