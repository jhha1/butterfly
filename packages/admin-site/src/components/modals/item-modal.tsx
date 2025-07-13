"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { itemAPI, type Item } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: Item | null;
}

interface ItemFormData {
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  isActive: boolean;
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
}

export function ItemModal({ isOpen, onClose, onSuccess, item }: ItemModalProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    description: "",
    type: "weapon",
    rarity: "common",
    price: 0,
    isActive: true,
    stats: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!item;

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        isActive: item.isActive,
        stats: item.stats || {}
      });
    } else if (isOpen && !item) {
      setFormData({
        name: "",
        description: "",
        type: "weapon",
        rarity: "common",
        price: 0,
        isActive: true,
        stats: {}
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && item) {
        await itemAPI.updateItem(item.id, formData);
        toast({
          title: "성공",
          description: "아이템이 성공적으로 수정되었습니다.",
          variant: "success",
        });
      } else {
        await itemAPI.createItem(formData);
        toast({
          title: "성공",
          description: "아이템이 성공적으로 생성되었습니다.",
          variant: "success",
        });
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('아이템 저장 실패:', err);
      toast({
        title: "오류",
        description: `아이템 ${isEditMode ? '수정' : '생성'}에 실패했습니다.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ItemFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatsChange = (statName: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: value || undefined
      }
    }));
  };

  // 미사용 함수들 제거 (필요시 주석 해제)
  // const getTypeLabel = (type: string) => {
  //   switch (type) {
  //     case 'weapon': return '무기';
  //     case 'armor': return '방어구';
  //     case 'consumable': return '소모품';
  //     case 'misc': return '기타';
  //     default: return type;
  //   }
  // };

  // const getRarityLabel = (rarity: string) => {
  //   switch (rarity) {
  //     case 'common': return '일반';
  //     case 'rare': return '희귀';
  //     case 'epic': return '영웅';
  //     case 'legendary': return '전설';
  //     default: return rarity;
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '아이템 수정' : '새 아이템 생성'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">아이템 이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="아이템 이름을 입력하세요"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">가격 (골드)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="아이템 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">아이템 타입</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">무기</SelectItem>
                  <SelectItem value="armor">방어구</SelectItem>
                  <SelectItem value="consumable">소모품</SelectItem>
                  <SelectItem value="misc">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rarity">희귀도</Label>
              <Select value={formData.rarity} onValueChange={(value) => handleInputChange('rarity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="희귀도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">일반</SelectItem>
                  <SelectItem value="rare">희귀</SelectItem>
                  <SelectItem value="epic">영웅</SelectItem>
                  <SelectItem value="legendary">전설</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="isActive" 
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
            <Label htmlFor="isActive">아이템 활성화</Label>
          </div>

          {/* 능력치 섹션 */}
          {(formData.type === 'weapon' || formData.type === 'armor') && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">능력치</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attack">공격력</Label>
                  <Input
                    id="attack"
                    type="number"
                    value={formData.stats.attack || ''}
                    onChange={(e) => handleStatsChange('attack', parseInt(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defense">방어력</Label>
                  <Input
                    id="defense"
                    type="number"
                    value={formData.stats.defense || ''}
                    onChange={(e) => handleStatsChange('defense', parseInt(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health">체력</Label>
                  <Input
                    id="health"
                    type="number"
                    value={formData.stats.health || ''}
                    onChange={(e) => handleStatsChange('health', parseInt(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mana">마나</Label>
                  <Input
                    id="mana"
                    type="number"
                    value={formData.stats.mana || ''}
                    onChange={(e) => handleStatsChange('mana', parseInt(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : (isEditMode ? '수정' : '생성')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 