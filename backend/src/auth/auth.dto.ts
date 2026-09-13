import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Arin" }) @IsString() @Length(2, 40) name: string;
  @ApiProperty({ example: "arin@example.com" })
  @IsEmail()
  @MaxLength(320)
  email: string;
  @ApiProperty({ minLength: 12, writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}
export class LoginDto {
  @ApiProperty({ example: "arin@example.com" })
  @IsEmail()
  @MaxLength(320)
  email: string;
  @ApiProperty({ writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() @MaxLength(320) email: string;
}
