import { useEffect, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, ScrollView } from "react-native";

import type { BudgetOverviewCategory } from "./useBudgetOverview";

type UseBudgetCardAnimationParams = {
  pendingBudgetId: string | null;
  pendingBudget: BudgetOverviewCategory | null;
};

export function useBudgetCardAnimation({
  pendingBudgetId,
  pendingBudget,
}: UseBudgetCardAnimationParams) {
  const scrollRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const scrolledIds = useRef(new Set<string>());
  const animatedIds = useRef(new Set<string>());
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [animatedBudgetId, setAnimatedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingBudgetId) return;

    const y = cardPositions.current[pendingBudgetId];
    if (typeof y === "number" && !scrolledIds.current.has(pendingBudgetId)) {
      scrolledIds.current.add(pendingBudgetId);
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }

    if (pendingBudget && !animatedIds.current.has(pendingBudgetId)) {
      animatedIds.current.add(pendingBudgetId);
      setAnimatedBudgetId(pendingBudgetId);
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: pendingBudget.progressPercent,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }
  }, [pendingBudget, pendingBudgetId, progressAnim]);

  const getCardLayoutHandler = (budgetId: string) => (event: LayoutChangeEvent) => {
    const yPos = event.nativeEvent.layout.y;
    cardPositions.current[budgetId] = yPos;
    if (pendingBudgetId && budgetId === pendingBudgetId) {
      if (!scrolledIds.current.has(pendingBudgetId)) {
        scrolledIds.current.add(pendingBudgetId);
        scrollRef.current?.scrollTo({ y: Math.max(0, yPos - 16), animated: true });
      }
    }
  };

  const getProgressWidth = (budgetId: string, progressPercent: number) => {
    if (animatedBudgetId === budgetId) {
      return progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
      });
    }
    return `${progressPercent}%` as const;
  };

  return {
    scrollRef,
    getCardLayoutHandler,
    getProgressWidth,
  };
}
