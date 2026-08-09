"use client";

import type { Question } from "@/lib/types";
import LikertItem from "./LikertItem";
import SingleChoice from "./SingleChoice";
import MultiChoice from "./MultiChoice";
import NumberInput from "./NumberInput";

interface Props {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

export default function QuestionField({
  question,
  value,
  onChange,
  invalid,
}: Props) {
  switch (question.type) {
    case "likert7":
      return (
        <LikertItem
          code={question.code}
          text={question.text}
          anchors={question.anchors ?? ["전혀 그렇지 않다", "매우 그렇다"]}
          value={value}
          onChange={onChange}
          invalid={invalid}
        />
      );
    case "single":
      return (
        <SingleChoice
          code={question.code}
          text={question.text}
          options={question.options ?? []}
          value={value}
          onChange={onChange}
          invalid={invalid}
        />
      );
    case "yesno":
      return (
        <SingleChoice
          code={question.code}
          text={question.text}
          options={question.options ?? ["예", "아니오"]}
          value={value}
          onChange={onChange}
          invalid={invalid}
          horizontal
        />
      );
    case "multi":
      return (
        <MultiChoice
          code={question.code}
          text={question.text}
          options={question.options ?? []}
          exclusiveValues={question.exclusiveValues}
          value={value}
          onChange={onChange}
          invalid={invalid}
        />
      );
    case "number":
      return (
        <NumberInput
          question={question}
          value={value}
          onChange={onChange}
          invalid={invalid}
        />
      );
    default:
      return null;
  }
}
