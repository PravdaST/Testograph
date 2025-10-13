"use client";

import { useState } from "react";
import { TestLayout } from "@/components/test/TestLayout";
import { EngagingQuiz } from "@/components/engaging-quiz/EngagingQuiz";

export default function TestPage() {
  return (
    <TestLayout>
      <EngagingQuiz />
    </TestLayout>
  );
}
