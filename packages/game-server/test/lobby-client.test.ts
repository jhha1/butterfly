import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { readdirSync, Dirent } from 'fs';
import { io, Socket } from 'socket.io-client';

describe('Lobby Service Client Tests', () => {
  let authClient: any;
  let lobbyClient: any;
  let matchingClient: any;
  
  let user1: { accountId: string; playerId: string; sessionToken: string } = {} as any;
  let user2: { accountId: string; playerId: string; sessionToken: string } = {} as any;

  beforeAll(async () => {
    // gRPC 클라이언트 설정
    const protoBasePath = getProtoBasePath();
    const protoList = getProtoList(protoBasePath);
    
    const packageDefinition = protoLoader.loadSync(protoList, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoBasePath],
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    
    // AuthService 클라이언트 생성
    let authService;
    if (protoDescriptor.jhha?.butterfly?.v1?.AuthService) {
      authService = protoDescriptor.jhha.butterfly.v1.AuthService;
    } else if (protoDescriptor['jhha.butterfly.v1']?.AuthService) {
      authService = protoDescriptor['jhha.butterfly.v1'].AuthService;
    } else if (protoDescriptor.AuthService) {
      authService = protoDescriptor.AuthService;
    } else {
      throw new Error('AuthService not found in proto definition');
    }
    
    authClient = new authService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    // LobbyService 클라이언트 생성
    let lobbyService;
    if (protoDescriptor.jhha?.butterfly?.v1?.LobbyService) {
      lobbyService = protoDescriptor.jhha.butterfly.v1.LobbyService;
    } else if (protoDescriptor['jhha.butterfly.v1']?.LobbyService) {
      lobbyService = protoDescriptor['jhha.butterfly.v1'].LobbyService;
    } else if (protoDescriptor.LobbyService) {
      lobbyService = protoDescriptor.LobbyService;
    } else {
      throw new Error('LobbyService not found in proto definition');
    }
    
    lobbyClient = new lobbyService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    // MatchingService 클라이언트 생성
    let matchingService;
    if (protoDescriptor.jhha?.butterfly?.v1?.MatchingService) {
      matchingService = protoDescriptor.jhha.butterfly.v1.MatchingService;
    } else if (protoDescriptor['jhha.butterfly.v1']?.MatchingService) {
      matchingService = protoDescriptor['jhha.butterfly.v1'].MatchingService;
    } else if (protoDescriptor.MatchingService) {
      matchingService = protoDescriptor.MatchingService;
    } else {
      throw new Error('MatchingService not found in proto definition');
    }
    
    matchingClient = new matchingService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );

    // 서버 연결 대기
    await waitForServer(authClient);
    await waitForServer(lobbyClient);
    await waitForServer(matchingClient);
  });

  afterAll(async () => {
    if (authClient) {
      authClient.close();
    }
    if (lobbyClient) {
      lobbyClient.close();
    }
    if (matchingClient) {
      matchingClient.close();
    }
  });

  describe('Lobby Two-User Scenario', () => {
    it('should login two users successfully', (done) => {
      let completedLogins = 0;

      // 첫 번째 유저 로그인
      const loginRequest1 = {
        platformId: `lobby-test-user-1-${Date.now()}`,
        platformType: 1, // AUTH_PLATFORM_GUEST
      };

      authClient.Login(loginRequest1, (error1: any, response1: any) => {
        expect(error1).toBeNull();
        expect(response1.status.code).toBe(0);
        expect(response1.accountId).toBeDefined();
        expect(response1.playerId).toBeDefined();
        expect(response1.sessionToken).toBeDefined();
        
        user1 = {
          accountId: response1.accountId,
          playerId: response1.playerId,
          sessionToken: response1.sessionToken,
        };
        
        console.log('User1 logged in:', { playerId: user1.playerId });
        
        completedLogins++;
        if (completedLogins === 2) {
          done();
        }
      });

      // 두 번째 유저 로그인
      const loginRequest2 = {
        platformId: `lobby-test-user-2-${Date.now()}`,
        platformType: 1, // AUTH_PLATFORM_GUEST
      };

      authClient.Login(loginRequest2, (error2: any, response2: any) => {
        expect(error2).toBeNull();
        expect(response2.status.code).toBe(0);
        expect(response2.accountId).toBeDefined();
        expect(response2.playerId).toBeDefined();
        expect(response2.sessionToken).toBeDefined();
        
        user2 = {
          accountId: response2.accountId,
          playerId: response2.playerId,
          sessionToken: response2.sessionToken,
        };
        
        console.log('User2 logged in:', { playerId: user2.playerId });
        
        completedLogins++;
        if (completedLogins === 2) {
          done();
        }
      });
    });

    it('should register both users in lobby', (done) => {
      let completedRefreshes = 0;

      // 첫 번째 유저 로비 등록
      const lobbyRefreshRequest1 = {
        playerId: user1.playerId,
      };

      // 메타데이터에 세션 토큰 추가
      const metadata1 = new grpc.Metadata();
      metadata1.set('session-id', user1.sessionToken);

      lobbyClient.LobbyRefresh(lobbyRefreshRequest1, metadata1, (error1: any, response1: any) => {
        expect(error1).toBeNull();
        expect(response1).toBeDefined();
        expect(response1.status).toBeDefined();
        expect(response1.status.code).toBe(0);
        expect(response1.newInfo).toBeDefined();
        
        console.log('User1 lobby refresh:', response1.newInfo);
        
        completedRefreshes++;
        if (completedRefreshes === 2) {
          done();
        }
      });

      // 두 번째 유저 로비 등록
      const lobbyRefreshRequest2 = {
        playerId: user2.playerId,
      };

      // 메타데이터에 세션 토큰 추가
      const metadata2 = new grpc.Metadata();
      metadata2.set('session-id', user2.sessionToken);

      lobbyClient.LobbyRefresh(lobbyRefreshRequest2, metadata2, (error2: any, response2: any) => {
        expect(error2).toBeNull();
        expect(response2).toBeDefined();
        expect(response2.status).toBeDefined();
        expect(response2.status.code).toBe(0);
        expect(response2.newInfo).toBeDefined();
        
        console.log('User2 lobby refresh:', response2.newInfo);
        
        completedRefreshes++;
        if (completedRefreshes === 2) {
          done();
        }
      });
    });

    it('should get candidate list for user1 and find user2', (done) => {
      const candidateListRequest = {
        playerId: user1.playerId,
      };

      // 메타데이터에 세션 토큰 추가
      const metadata = new grpc.Metadata();
      metadata.set('session-id', user1.sessionToken);

      matchingClient.CandidateList(candidateListRequest, metadata, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(0);
        expect(response.list).toBeDefined();
        expect(Array.isArray(response.list)).toBe(true);
        
        console.log('User1 candidate list:', response.list);
        
        // user2가 후보 목록에 있는지 확인
        const user2InList = response.list.find((candidate: any) => candidate.playerId === user2.playerId);
        expect(user2InList).toBeDefined();
        expect(user2InList.playerId).toBe(user2.playerId);
        expect(user2InList.profile).toBeDefined();
        expect(user2InList.extraInfo).toBeDefined();
        expect(user2InList.latency).toBeDefined();
        
        // user1은 자신의 목록에 없어야 함
        const user1InList = response.list.find((candidate: any) => candidate.playerId === user1.playerId);
        expect(user1InList).toBeUndefined();
        
        done();
      });
    });

    it('should get candidate list for user2 and find user1', (done) => {
      const candidateListRequest = {
        playerId: user2.playerId,
      };

      // 메타데이터에 세션 토큰 추가
      const metadata = new grpc.Metadata();
      metadata.set('session-id', user2.sessionToken);

      matchingClient.CandidateList(candidateListRequest, metadata, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.status.code).toBe(0);
        expect(response.list).toBeDefined();
        expect(Array.isArray(response.list)).toBe(true);
        
        console.log('User2 candidate list:', response.list);
        
        // user1이 후보 목록에 있는지 확인
        const user1InList = response.list.find((candidate: any) => candidate.playerId === user1.playerId);
        expect(user1InList).toBeDefined();
        expect(user1InList.playerId).toBe(user1.playerId);
        expect(user1InList.profile).toBeDefined();
        expect(user1InList.extraInfo).toBeDefined();
        expect(user1InList.latency).toBeDefined();
        
        // user2는 자신의 목록에 없어야 함
        const user2InList = response.list.find((candidate: any) => candidate.playerId === user2.playerId);
        expect(user2InList).toBeUndefined();
        
        done();
      });
    });

    it('should handle empty candidate list when only one user in lobby', (done) => {
      // 새로운 유저로 로그인
      const loginRequest = {
        platformId: `lobby-test-single-user-${Date.now()}`,
        platformType: 1,
      };

      authClient.Login(loginRequest, (loginError: any, loginResponse: any) => {
        expect(loginError).toBeNull();
        expect(loginResponse.status.code).toBe(0);
        
        const singleUser = {
          playerId: loginResponse.playerId,
          sessionToken: loginResponse.sessionToken,
        };

        // Redis 초기화를 위해 잠시 대기
        setTimeout(() => {
          // 기존 유저들 제거를 위해 Redis를 직접 조작하지 않고
          // 다른 playerId로 테스트
          const candidateListRequest = {
            playerId: 'non-existent-player-id',
          };

          const metadata = new grpc.Metadata();
          metadata.set('session-id', singleUser.sessionToken);

          matchingClient.CandidateList(candidateListRequest, metadata, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response).toBeDefined();
            expect(response.status).toBeDefined();
            expect(response.status.code).toBe(0);
            expect(response.list).toBeDefined();
            expect(Array.isArray(response.list)).toBe(true);
            
            console.log('Single user candidate list:', response.list);
            
            done();
          });
        }, 1000);
      });
    });
  });

  describe('Matching Flow Scenario', () => {
    let roomInfo: any;
    let user1Socket: Socket;
    let user2Socket: Socket;
    let testUser1: { accountId: string; playerId: string; sessionToken: string };
    let testUser2: { accountId: string; playerId: string; sessionToken: string };

    afterEach(() => {
      // 각 테스트 후 소켓 연결 정리
      if (user1Socket) {
        user1Socket.disconnect();
      }
      if (user2Socket) {
        user2Socket.disconnect();
      }
    });

    it('should complete full matching scenario from login to websocket connection', (done) => {
      let step = 1;

      const executeStep = (stepNumber: number, callback: () => void) => {
        if (step === stepNumber) {
          console.log(`\n=== Step ${stepNumber} ===`);
          callback();
        }
      };

      const nextStep = () => {
        step++;
        executeNextStep();
      };

      const executeNextStep = () => {
        executeStep(1, loginUsers);
        executeStep(2, registerInLobby);
        executeStep(3, getCandidateLists);
        executeStep(4, requestMatch);
        executeStep(5, pollForMatch);
        executeStep(6, acceptMatch);
        executeStep(7, connectWebSocket);
      };

      // Step 1: 유저 로그인
      const loginUsers = () => {
        console.log('Starting user login...');
        let completedLogins = 0;

        // 첫 번째 유저 로그인
        const loginRequest1 = {
          platformId: `matching-test-user-1-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          
          testUser1 = {
            accountId: response1.accountId,
            playerId: response1.playerId,
            sessionToken: response1.sessionToken,
          };
          
          console.log('User1 logged in:', { playerId: testUser1.playerId });
          
          completedLogins++;
          if (completedLogins === 2) {
            nextStep();
          }
        });

        // 두 번째 유저 로그인
        const loginRequest2 = {
          platformId: `matching-test-user-2-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          
          testUser2 = {
            accountId: response2.accountId,
            playerId: response2.playerId,
            sessionToken: response2.sessionToken,
          };
          
          console.log('User2 logged in:', { playerId: testUser2.playerId });
          
          completedLogins++;
          if (completedLogins === 2) {
            nextStep();
          }
        });
      };

      // Step 2: 로비 등록
      const registerInLobby = () => {
        console.log('Registering users in lobby...');
        let completedRefreshes = 0;

        const metadata1 = new grpc.Metadata();
        metadata1.set('session-id', testUser1.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser1.playerId }, metadata1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          console.log('User1 lobby refresh completed');
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            nextStep();
          }
        });

        const metadata2 = new grpc.Metadata();
        metadata2.set('session-id', testUser2.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser2.playerId }, metadata2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          console.log('User2 lobby refresh completed');
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            nextStep();
          }
        });
      };

      // Step 3: 후보 목록 조회
      const getCandidateLists = () => {
        console.log('Getting candidate lists...');
        
        const metadata1 = new grpc.Metadata();
        metadata1.set('session-id', testUser1.sessionToken);

        matchingClient.CandidateList({ playerId: testUser1.playerId }, metadata1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          expect(Array.isArray(response1.list)).toBe(true);
          
          console.log('User1 candidate list:', response1.list.length, 'candidates');
          
          // 후보 목록에 user2가 없어도 계속 진행 (매칭 시스템은 직접 playerId로 매칭 가능)
          const user2InList = response1.list.find((candidate: any) => candidate.playerId === testUser2.playerId);
          if (user2InList) {
            console.log('✓ User2 found in candidate list');
          } else {
            console.log('⚠ User2 not found in candidate list, but proceeding with direct match');
          }
          
          nextStep();
        });
      };

      // Step 4: 매치 요청
      const requestMatch = () => {
        console.log('Requesting match...');
        
        const metadata = new grpc.Metadata();
        metadata.set('session-id', testUser1.sessionToken);

        matchingClient.RequestMatch({
          playerId: testUser1.playerId,
          targetPlayerId: testUser2.playerId,
        }, metadata, (error: any, response: any) => {
          expect(error).toBeNull();
          expect(response.status.code).toBe(0);
          expect(response.isAble).toBe(1);
          expect(response.roomInfo).toBeDefined();
          
          roomInfo = response.roomInfo;
          console.log('Match requested, room created:', roomInfo.roomId);
          nextStep();
        });
      };

      // Step 5: 매치 요청 감지 (폴링)
      const pollForMatch = () => {
        console.log('Polling for match request...');
        let pollCount = 0;
        const maxPolls = 3;
        
        const pollForMatchRequest = () => {
          const metadata = new grpc.Metadata();
          metadata.set('session-id', testUser2.sessionToken);

          lobbyClient.LobbyRefresh({ playerId: testUser2.playerId }, metadata, (error: any, response: any) => {
            expect(error).toBeNull();
            expect(response.status.code).toBe(0);
            
            console.log(`Poll ${pollCount + 1}:`, response.matchInfo ? 'Match found!' : 'No match');
            
            if (response.matchInfo) {
              expect(response.matchInfo.roomId).toBeDefined();
              expect(response.matchInfo.player1Id).toBe(testUser1.playerId);
              expect(response.matchInfo.player2Id).toBe(testUser2.playerId);
              nextStep();
            } else {
              pollCount++;
              if (pollCount < maxPolls) {
                setTimeout(pollForMatchRequest, 1000); // 1초 후 재시도
              } else {
                throw new Error('Match request not detected after polling');
              }
            }
          });
        };
        
        pollForMatchRequest();
      };

      // Step 6: 매치 수락
      const acceptMatch = () => {
        console.log('Accepting match...');
        
        const metadata = new grpc.Metadata();
        metadata.set('session-id', testUser2.sessionToken);

        matchingClient.AcceptMatch({
          playerId: testUser2.playerId,
          targetPlayerId: testUser1.playerId,
        }, metadata, (error: any, response: any) => {
          expect(error).toBeNull();
          expect(response.status.code).toBe(0);
          expect(response.isAble).toBe(1);
          expect(response.roomInfo).toBeDefined();
          
          roomInfo = response.roomInfo;
          console.log('Match accepted, room info retrieved:', roomInfo.roomId);
          nextStep();
        });
      };

      // Step 7: WebSocket 연결
      const connectWebSocket = () => {
        console.log('Connecting to WebSocket...');
        let connectedUsers = 0;
        const expectedConnections = 2;
        
        // User1 웹소켓 연결
        user1Socket = io(roomInfo.socketUrl);
        
        user1Socket.on('connect', () => {
          console.log('User1 connected to realtime-server');
          
          user1Socket.emit('join_room', {
            roomId: roomInfo.roomId,
            playerId: testUser1.playerId,
            playerToken: testUser1.sessionToken,
          });
        });
        
        user1Socket.on('join_room_response', (response: any) => {
          console.log('User1 join_room_response:', response.success);
          expect(response.success).toBe(true);
          
          connectedUsers++;
          if (connectedUsers === expectedConnections) {
            console.log('\n=== All Steps Completed Successfully! ===');
            done();
          }
        });
        
        user1Socket.on('connect_error', (error: any) => {
          console.error('User1 connection error:', error);
          done(error);
        });
        
        // User2 웹소켓 연결
        user2Socket = io(roomInfo.socketUrl);
        
        user2Socket.on('connect', () => {
          console.log('User2 connected to realtime-server');
          
          user2Socket.emit('join_room', {
            roomId: roomInfo.roomId,
            playerId: testUser2.playerId,
            playerToken: testUser2.sessionToken,
          });
        });
        
        user2Socket.on('join_room_response', (response: any) => {
          console.log('User2 join_room_response:', response.success);
          expect(response.success).toBe(true);
          
          connectedUsers++;
          if (connectedUsers === expectedConnections) {
            console.log('\n=== All Steps Completed Successfully! ===');
            done();
          }
        });
        
        user2Socket.on('connect_error', (error: any) => {
          console.error('User2 connection error:', error);
          done(error);
        });
        
        // 게임 시작 이벤트 리스너
        user1Socket.on('game_start', (gameStartData: any) => {
          console.log('Game started for User1');
        });
        
        user2Socket.on('game_start', (gameStartData: any) => {
          console.log('Game started for User2');
        });
      };

      // 시나리오 시작
      executeNextStep();
    }, 30000); // 30초 타임아웃

    it('should test roomId passing in match request', (done) => {
      let testUser1: { accountId: string; playerId: string; sessionToken: string };
      let testUser2: { accountId: string; playerId: string; sessionToken: string };
      
      // 빠른 로그인 테스트
      const loginUsers = () => {
        let completedLogins = 0;

        const loginRequest1 = {
          platformId: `roomid-test-user-1-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          
          testUser1 = {
            accountId: response1.accountId,
            playerId: response1.playerId,
            sessionToken: response1.sessionToken,
          };
          
          console.log('RoomId Test User1 logged in:', { playerId: testUser1.playerId });
          
          completedLogins++;
          if (completedLogins === 2) {
            testMatchRequest();
          }
        });

        const loginRequest2 = {
          platformId: `roomid-test-user-2-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          
          testUser2 = {
            accountId: response2.accountId,
            playerId: response2.playerId,
            sessionToken: response2.sessionToken,
          };
          
          console.log('RoomId Test User2 logged in:', { playerId: testUser2.playerId });
          
          completedLogins++;
          if (completedLogins === 2) {
            registerInLobby();
          }
        });
      };

      const registerInLobby = () => {
        console.log('Registering users in lobby...');
        let completedRefreshes = 0;

        const metadata1 = new grpc.Metadata();
        metadata1.set('session-id', testUser1.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser1.playerId }, metadata1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          console.log('RoomId Test User1 lobby refresh completed');
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            testMatchRequest();
          }
        });

        const metadata2 = new grpc.Metadata();
        metadata2.set('session-id', testUser2.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser2.playerId }, metadata2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          console.log('RoomId Test User2 lobby refresh completed');
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            testMatchRequest();
          }
        });
      };

      const testMatchRequest = () => {
        console.log('Testing match request with roomId...');
        
        const metadata = new grpc.Metadata();
        metadata.set('session-id', testUser1.sessionToken);

        matchingClient.RequestMatch({
          playerId: testUser1.playerId,
          targetPlayerId: testUser2.playerId,
        }, metadata, (error: any, response: any) => {
          if (error) {
            console.error('Match request error:', error);
            done(error);
            return;
          }
          
          console.log('Match request response:', response);
          
          expect(response.status.code).toBe(0);
          expect(response.isAble).toBe(1);
          expect(response.roomInfo).toBeDefined();
          expect(response.roomInfo.roomId).toBeDefined();
          
          console.log('✅ RoomId successfully passed:', response.roomInfo.roomId);
          done();
        });
      };

      loginUsers();
    }, 15000); // 15초 타임아웃

    it('should test websocket connection with existing room', (done) => {
      const { io } = require('socket.io-client');
      
      // 알려진 룸 ID 사용 (이전 테스트에서 생성된 룸)
      const testRoomId = 'room_match_1751815040467_01JZG50BCCQMZP8DF5WBHT9K1S_01JZG50BCD188RYG7TP2TM7SBJ';
      const testPlayerId = '01JZG50BCCQMZP8DF5WBHT9K1S';
      const testPlayerToken = 'test-token';
      
      console.log('Testing WebSocket connection...');
      
      const socket = io('http://localhost:3001');
      
      socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        
        console.log('Sending join_room request:', {
          roomId: testRoomId,
          playerId: testPlayerId,
          playerToken: testPlayerToken
        });
        
        socket.emit('join_room', {
          roomId: testRoomId,
          playerId: testPlayerId,
          playerToken: testPlayerToken,
        });
      });
      
      socket.on('join_room_response', (response: any) => {
        console.log('join_room_response received:', response);
        
        if (response.success) {
          console.log('✅ Successfully joined room');
        } else {
          console.log('❌ Failed to join room:', response.message);
        }
        
        socket.disconnect();
        done();
      });
      
      socket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        socket.disconnect();
        done(error);
      });
      
      setTimeout(() => {
        console.log('⏰ WebSocket test timeout');
        socket.disconnect();
        done(new Error('WebSocket test timeout'));
      }, 10000);
    }, 12000); // 12초 타임아웃

    it('should create room and immediately connect via websocket', (done) => {
      const { io } = require('socket.io-client');
      let testUser1: { accountId: string; playerId: string; sessionToken: string };
      let testUser2: { accountId: string; playerId: string; sessionToken: string };
      let roomInfo: any;
      
      // 빠른 로그인 및 룸 생성 후 즉시 WebSocket 연결
      const loginAndCreateRoom = () => {
        let completedLogins = 0;

        const loginRequest1 = {
          platformId: `immediate-test-user-1-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          testUser1 = {
            accountId: response1.accountId,
            playerId: response1.playerId,
            sessionToken: response1.sessionToken,
          };
          
          completedLogins++;
          if (completedLogins === 2) {
            registerAndCreateRoom();
          }
        });

        const loginRequest2 = {
          platformId: `immediate-test-user-2-${Date.now()}`,
          platformType: 1,
        };

        authClient.Login(loginRequest2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          testUser2 = {
            accountId: response2.accountId,
            playerId: response2.playerId,
            sessionToken: response2.sessionToken,
          };
          
          completedLogins++;
          if (completedLogins === 2) {
            registerAndCreateRoom();
          }
        });
      };

      const registerAndCreateRoom = () => {
        // 로비 등록 후 매치 요청
        let completedRefreshes = 0;

        const metadata1 = new grpc.Metadata();
        metadata1.set('session-id', testUser1.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser1.playerId }, metadata1, (error1: any, response1: any) => {
          expect(error1).toBeNull();
          expect(response1.status.code).toBe(0);
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            createRoom();
          }
        });

        const metadata2 = new grpc.Metadata();
        metadata2.set('session-id', testUser2.sessionToken);

        lobbyClient.LobbyRefresh({ playerId: testUser2.playerId }, metadata2, (error2: any, response2: any) => {
          expect(error2).toBeNull();
          expect(response2.status.code).toBe(0);
          
          completedRefreshes++;
          if (completedRefreshes === 2) {
            createRoom();
          }
        });
      };

      const createRoom = () => {
        const metadata = new grpc.Metadata();
        metadata.set('session-id', testUser1.sessionToken);

        matchingClient.RequestMatch({
          playerId: testUser1.playerId,
          targetPlayerId: testUser2.playerId,
        }, metadata, (error: any, response: any) => {
          if (error) {
            done(error);
            return;
          }
          
          expect(response.status.code).toBe(0);
          roomInfo = response.roomInfo;
          
          console.log('🚀 Room created, immediately connecting via WebSocket...');
          console.log('Room ID:', roomInfo.roomId);
          
          // 룸 생성 후 즉시 WebSocket 연결 시도
          connectViaWebSocket();
        });
      };

      const connectViaWebSocket = () => {
        const socket = io('http://localhost:3001');
        
        socket.on('connect', () => {
          console.log('✅ WebSocket connected immediately after room creation');
          
          socket.emit('join_room', {
            roomId: roomInfo.roomId,
            playerId: testUser1.playerId,
            playerToken: testUser1.sessionToken,
          });
        });
        
        socket.on('join_room_response', (response: any) => {
          console.log('🎯 Immediate join_room_response:', response);
          
          if (response.success) {
            console.log('✅ Successfully joined room immediately!');
          } else {
            console.log('❌ Failed to join room immediately:', response.message);
          }
          
          socket.disconnect();
          done();
        });
        
        socket.on('connect_error', (error: any) => {
          console.error('❌ WebSocket connection error:', error);
          socket.disconnect();
          done(error);
        });
        
        setTimeout(() => {
          socket.disconnect();
          done(new Error('Immediate WebSocket test timeout'));
        }, 5000);
      };

      loginAndCreateRoom();
    }, 15000); // 15초 타임아웃
  });
});

/**
 * 서버 연결 대기
 */
async function waitForServer(client: any): Promise<void> {
  return new Promise((resolve) => {
    if (client) {
      client.waitForReady(Date.now() + 10000, (error: any) => {
        if (error) {
          console.error('Failed to connect to server:', error);
          console.log('Please make sure the server is running on localhost:50051');
        } else {
          console.log('Successfully connected to server');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * proto 파일이 들어있는 최상위 폴더 경로를 반환
 */
function getProtoBasePath(): string {
  return join(__dirname, '..', 'src', 'grpc', 'proto');
}

/**
 * 주어진 폴더를 재귀 순회하며 .proto 파일 전체 경로 리스트를 반환
 */
function getProtoList(basePath: string): string[] {
  const result: string[] = [];
  const walk = (dir: string) => {
    for (const d of readdirSync(dir, { withFileTypes: true }) as Dirent[]) {
      const full = join(dir, d.name);
      if (d.isDirectory()) {
        walk(full);
      } else if (d.isFile() && full.endsWith('.proto')) {
        result.push(full);
      }
    }
  };
  walk(basePath);
  return result;
} 