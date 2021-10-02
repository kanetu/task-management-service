import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Put, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import {JwtService} from '@nestjs/jwt';
import { Request, Response } from 'express';
import {AuthService} from './auth.service';
import {RoleService} from 'src/role/role.service';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {PermissionGuard} from './guards/permission.guard';
import {hasPermissions} from './decorators/permission.decorator';

@Controller("auth")
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private jwtService: JwtService,
      private roleService: RoleService
  ) {}
  private saltOrRounds = 12;
  private INVALID_CREDENTIAL = "Invalid Credentials";
  private USER_NOT_FOUND = "No user was found";
  private ROLE_NOT_FOUND = "No role was found";

  @Post("register")
  async register(
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("password") password: string
  ) {

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds)

    const user = await this.authService.save({
        name,
        email,
        password: hashedPassword
    });

    const {password: _, ...result} = user;
    return result;
  }

  @Post("login")
  async login(
    @Body("email") email: string,
    @Body("password") password: string,
    @Res({passthrough: true}) response: Response
  ){
      const user = await this.authService.findOne({email})

      if(!user){
        return new BadRequestException(this.INVALID_CREDENTIAL)
      }

      if(!await bcrypt.compare(password, user.password)){
        return new BadRequestException(this.INVALID_CREDENTIAL)
      }

      const jwt = await this.jwtService.signAsync({id: user.id})

      response.cookie("auth",jwt, {httpOnly: true})

      return {
        message: "success"
      }
  }
 
  @Get("logout")
  async logout(@Res({passthrough: true}) response: Response) {
    response.clearCookie("auth")
    return {
        message: "success"
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("user")
  async user(@Req() request: Request) {
    try {
        const cookie = request.cookies["auth"];
        const data = await this.jwtService.verifyAsync(cookie);
        
        if(!data) {
            return new UnauthorizedException(this.INVALID_CREDENTIAL);
        }

        const user = await this.authService.authPermissions(data["id"])
        const {password: _, ...rest} = user;

        return rest;

    }catch(e) {
        return new UnauthorizedException(this.INVALID_CREDENTIAL)
    }
  }

  @hasPermissions("EDIT_USER")
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Put("grantRole")
  async grandRole(
    @Body("userId") userId: string,
    @Body("roleId") roleId: string
  ) {
    try{
        const user = await this.authService.findOne({id: userId});
        if (!user){
            return new NotFoundException(this.USER_NOT_FOUND)
        }
        
        if(roleId){
            const role = await this.roleService.getRole({id: roleId})
            if (!role){
                return new NotFoundException(this.ROLE_NOT_FOUND)
            }
            user.role = role;  
        }
        
        const {password, ...updatedUser} = await this.authService.save(user);
        return updatedUser;  
    } catch(err){
        console.log(err)    
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put("user")
  async updateUser(
      @Req() request: Request,
      @Body("name") name: string,
  ){
    try{

        const cookie = request.cookies["auth"];
        const data = await this.jwtService.verifyAsync(cookie);
        if(!data) {
            return new UnauthorizedException(this.INVALID_CREDENTIAL)
        }
        const user = await this.authService.findOne({id: data["id"]})
        if (!user){
            return new NotFoundException(this.USER_NOT_FOUND)
        }

        user.name = name ? name: user.name;
       
        const {password, ...rest}= await this.authService.save(user);
        return rest;

    }catch(e) {
        return new BadRequestException(this.INVALID_CREDENTIAL);
    }
  }
  
}
