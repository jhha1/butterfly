"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  Activity,
  TrendingUp,
  Eye
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "총 사용자",
      value: "12,345",
      description: "전체 등록 사용자",
      icon: Users,
      trend: "+5.2%",
    },
    {
      title: "활성 사용자",
      value: "8,901",
      description: "지난 30일 활성 사용자",
      icon: Activity,
      trend: "+12.3%",
    },
    {
      title: "총 아이템",
      value: "1,234",
      description: "게임 내 아이템 종류",
      icon: Package,
      trend: "+2.1%",
    },
    {
      title: "일일 접속",
      value: "2,456",
      description: "오늘 접속 사용자",
      icon: Eye,
      trend: "+8.7%",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "player_001",
      action: "새로운 사용자 가입",
      time: "2분 전",
    },
    {
      id: 2,
      user: "player_002",
      action: "아이템 구매",
      time: "5분 전",
    },
    {
      id: 3,
      user: "player_003",
      action: "랭킹 게임 완료",
      time: "10분 전",
    },
    {
      id: 4,
      user: "player_004",
      action: "로그인",
      time: "15분 전",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          Butterfly 게임 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">{stat.trend}</span>
                <span className="text-muted-foreground">지난 달 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              최근 사용자 활동 내역
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
            <CardDescription>
              서버 및 시스템 상태
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">게임 서버</span>
                <span className="text-sm text-green-500">● 정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">실시간 서버</span>
                <span className="text-sm text-green-500">● 정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">데이터베이스</span>
                <span className="text-sm text-green-500">● 정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redis</span>
                <span className="text-sm text-green-500">● 정상</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
