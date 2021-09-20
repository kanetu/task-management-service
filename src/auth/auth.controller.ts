import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Put, Req, Res, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import {JwtService} from '@nestjs/jwt';
import { Request, Response } from 'express';
import {AuthService} from './auth.service';
import {RoleService} from 'src/role/role.service';

@Controller("auth")
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private jwtService: JwtService,
      private roleService: RoleService
  ) {}
  private saltOrRounds = 12;

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
        throw new BadRequestException("Invalid Credentials")
      }

      if(!await bcrypt.compare(password, user.password)){
        throw new BadRequestException("Invalid Credentials")
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

  @Get("user")
  async user(@Req() request: Request) {
    try {
        const cookie = request.cookies["auth"];
        const data = await this.jwtService.verifyAsync(cookie);
        
        if(!data) {
            throw new UnauthorizedException();
        }

        const user = await this.authService.findOne({id: data["id"]})
        const {password: _, ...rest} = user;

        return rest;

    }catch(e) {
        throw new UnauthorizedException()
    }
  }

  @Put("user")
  async updateUser(
      @Body("userId") userId: string,
      @Body("name") name: string,
      @Body("email") email: string,
      @Body("roleId") roleId: string,
  ){
    try{
        const user = await this.authService.findOne({id: userId})
        if (!user){
            throw new NotFoundException("No user was found")
        }
        user.name = name ? name: user.name;
        user.email = email ? email: user.email;
        
        if(roleId){
            const role = await this.roleService.getRole({id: roleId})
            if (!role){
                throw new NotFoundException("No role was found")
            }
            user.role = role;  
        }
        
        const updatedUser = await this.authService.save(user);
        return updatedUser;
    }catch(e) {
        console.log(e)
    }
  }
  
}
