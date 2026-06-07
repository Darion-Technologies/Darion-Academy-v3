export type QuestionStatus = "not_visited" | "visited" | "answered" | "marked_for_review" | "answered_and_marked";

export type AnswersMap = Record<string, string>;

export type QuestionStatusesMap = Record<string, QuestionStatus>;

export type QuizState = "instructions" | "in_progress" | "submitting" | "submitted";
