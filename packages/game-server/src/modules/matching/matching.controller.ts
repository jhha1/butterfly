import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MatchingService } from './matching.service';
import { CandidateListRequestDto } from './dto/candidatelistrequest.dto';
import { CandidateListResponseDto } from './dto/candidatelistresponse.dto';
import { RequestMatchRequestDto } from './dto/requestmatchrequest.dto';
import { RequestMatchResponseDto } from './dto/requestmatchresponse.dto';
import { AcceptMatchRequestDto } from './dto/acceptmatchrequest.dto';
import { AcceptMatchResponseDto } from './dto/acceptmatchresponse.dto';

@Controller()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @GrpcMethod('MatchingService', 'CandidateList')
  async candidateList(request: CandidateListRequestDto): Promise<CandidateListResponseDto> {
    return this.matchingService.candidateList(request);
  }

  @GrpcMethod('MatchingService', 'RequestMatch')
  async requestMatch(request: RequestMatchRequestDto): Promise<RequestMatchResponseDto> {
    return this.matchingService.requestMatch(request);
  }

  @GrpcMethod('MatchingService', 'AcceptMatch')
  async acceptMatch(request: AcceptMatchRequestDto): Promise<AcceptMatchResponseDto> {
    return this.matchingService.acceptMatch(request);
  }
}