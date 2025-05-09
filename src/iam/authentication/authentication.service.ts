import {
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
  
@Injectable()
export class AuthenticationService {
    constructor(
      @InjectRepository(User) private readonly usersRepository: Repository<User>,
      @Inject(jwtConfig.KEY)
      private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
      private readonly hashingService: HashingService,
      private readonly jwtService: JwtService,
      private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage
    ) {}
  
    async signUp(signUpDto: SignUpDto) {
      try {
        const user = new User();
        user.email = signUpDto.email;
        user.password = await this.hashingService.hash(signUpDto.password);
        user.data = signUpDto.data;
  
        await this.usersRepository.save(user);
      } catch (err) {
        const pgUniqueViolationErrorCode = '23505';
        if (err.code === pgUniqueViolationErrorCode) {
          throw new ConflictException();
        }
        throw err; 
      }
    }
    
    async signIn(signInDto: SignInDto) {
        const user = await this.usersRepository.findOneBy({
            email: signInDto.email,
        });
        if (!user) {
            throw new UnauthorizedException({
                field: 'email',
                message: 'This email is not connected to any account'
            });
        }
        const isEqual = await this.hashingService.compare(
            signInDto.password,
            user.password,
        );
        if (!isEqual) {
            throw new UnauthorizedException({
                field: 'password',
                message: 'Incorrect password'
            });
        }
        const tokens = await this.generateTokens(user);

        return {
            user: {
                email: user.email,
                id: user.id,
                data: user.data
            },
            ...tokens
        }
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        try {
            const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
                Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
            >(refreshTokenDto.refreshToken, {
                secret: this.jwtConfiguration.secret,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
            });
            const user = await this.usersRepository.findOneByOrFail({
                id: sub,
            });

            const isValid = await this.refreshTokenIdsStorage.validate(
                user.id,
                refreshTokenId,
            );
            if (isValid) {
                await this.refreshTokenIdsStorage.invalidate(user.id);
            } else {
                throw new Error('Refresh token is invalid');
            }
            return this.generateTokens(user);
        } catch (err) {
            if (err instanceof InvalidatedRefreshTokenError) {
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException();
        }
    }

    async generateTokens(user: User) {
        const refreshTokenId = randomUUID()

        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                { email: user.email },
            ),
            this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
                refreshTokenId,
            }),
        ]);

        await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId)
        return {
            accessToken: {
                token: accessToken,
                ttl: this.jwtConfiguration.accessTokenTtl
            },
            refreshToken: {
                token: refreshToken,
                ttl: this.jwtConfiguration.refreshTokenTtl
            }
        }
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
        return await this.jwtService.signAsync( 
            {
                sub: userId,
                ...payload
            },
            {
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer,
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.accessTokenTtl,
            },
      );
    }
}
  