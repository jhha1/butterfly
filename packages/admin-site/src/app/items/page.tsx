"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { itemAPI, type Item } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ItemModal } from "@/components/modals/item-modal";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { toast } = useToast();

  const itemsPerPage = 10;

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemAPI.getItems({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: selectedType
      });
      setItems(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (err) {
      console.error('아이템 목록 불러오기 실패:', err);
      toast({
        title: "오류",
        description: "아이템 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedType]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("정말로 이 아이템을 삭제하시겠습니까?")) {
      try {
        await itemAPI.deleteItem(id);
        toast({
          title: "성공",
          description: "아이템이 성공적으로 삭제되었습니다.",
          variant: "success",
        });
        fetchItems();
      } catch (err) {
        console.error('아이템 삭제 실패:', err);
        toast({
          title: "오류",
          description: "아이템 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenModal = (item?: Item) => {
    setSelectedItem(item || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleModalSuccess = () => {
    fetchItems();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'secondary';
      case 'rare': return 'info';
      case 'epic': return 'warning';
      case 'legendary': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weapon': return '무기';
      case 'armor': return '방어구';
      case 'consumable': return '소모품';
      case 'misc': return '기타';
      default: return type;
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return '일반';
      case 'rare': return '희귀';
      case 'epic': return '영웅';
      case 'legendary': return '전설';
      default: return rarity;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">아이템 관리</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          새 아이템 추가
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                아이템 검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="아이템 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">
                아이템 타입
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="모든 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 타입</SelectItem>
                  <SelectItem value="weapon">무기</SelectItem>
                  <SelectItem value="armor">방어구</SelectItem>
                  <SelectItem value="consumable">소모품</SelectItem>
                  <SelectItem value="misc">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="h-10">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 아이템 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>아이템 목록 ({totalItems}개)</CardTitle>
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
                    <TableHead>이름</TableHead>
                    <TableHead>타입</TableHead>
                    <TableHead>희귀도</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRarityColor(item.rarity)}>
                          {getRarityLabel(item.rarity)}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.price.toLocaleString()} 골드</TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "success" : "secondary"}>
                          {item.isActive ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenModal(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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

      {/* 아이템 모달 */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        item={selectedItem}
      />
    </div>
  );
} 