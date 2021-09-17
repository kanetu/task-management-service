import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import {JwtService} from '@nestjs/jwt';
import { Request, Response } from 'express';
import {AuthService} from './auth.service';

@Controller("auth")
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private jwtService: JwtService
  ) {}
  private saltOrRounds = 12;

  @Post("register")
  async register(
    @Body("name") name: string,
    @Body("email") email: string,
    @Body("password") password: string
  ) {

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds)

    const user = await this.authService.createUser({
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

  @Get("logout")
  async logout(@Res({passthrough: true}) response: Response) {
    response.clearCookie("auth")
    return {
        message: "success"
    }
  }
}
