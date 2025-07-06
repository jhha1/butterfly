import { ResponseStatus, Candidate } from './common-types';

export class CandidateListResponseDto {
  status!: ResponseStatus;
  list!: Candidate[];
}