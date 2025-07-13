"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Trophy, Medal, Award } from "lucide-react";
import { rankingAPI, type RankingEntry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("overall");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRankings, setTotalRankings] = useState(0);
  const { toast } = useToast();

  const itemsPerPage = 10;

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await rankingAPI.getRankings({
        page: currentPage,
        limit: itemsPerPage,
        category: selectedCategory
      });
      setRankings(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalRankings(response.total || 0);
    } catch (err) {
      console.error('랭킹 불러오기 실패:', err);
      toast({
        title: "오류",
        description: "랭킹 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'overall': return '전체';
      case 'weekly': return '주간';
      case 'monthly': return '월간';
      default: return category;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank <= 3) return "secondary";
    if (rank <= 10) return "outline";
    return "outline";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">랭킹</h1>
      </div>

      {/* 카테고리 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>랭킹 카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">
                랭킹 분류
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="랭킹 분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">전체 랭킹</SelectItem>
                  <SelectItem value="weekly">주간 랭킹</SelectItem>
                  <SelectItem value="monthly">월간 랭킹</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => {
              setCurrentPage(1);
              fetchRankings();
            }}>
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 랭킹 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getCategoryLabel(selectedCategory)} 랭킹 ({totalRankings}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">로딩 중...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">순위</TableHead>
                    <TableHead>플레이어</TableHead>
                    <TableHead>점수</TableHead>
                    <TableHead>티어</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((ranking) => (
                    <TableRow key={ranking.userId} className={ranking.rank <= 3 ? "bg-muted/50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(ranking.rank)}
                          <Badge variant={getRankBadgeVariant(ranking.rank)}>
                            {ranking.rank}위
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {ranking.nickname.charAt(0).toUpperCase()}
                          </div>
                          <span>{ranking.nickname}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-bold text-primary">
                          {ranking.score.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ranking.tier}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 