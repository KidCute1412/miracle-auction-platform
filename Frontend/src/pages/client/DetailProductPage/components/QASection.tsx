import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageCircle, User, HelpCircle, Send, MessageSquare, Crown } from "lucide-react";
import PaginationComponent from "@/components/common/Pagination";
import Loading from "@/components/common/Loading";
import { productService } from "@/services/product.service.ts";

interface QuestionType {
  question_id: number;
  created_at: string;
  product_id: number;
  user_id: number;
  username: string;
  content: string;
  question_parent_id: number | null;
}

export default function QASection({ product_id, seller_id }: { product_id?: number; seller_id?: number }) {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 5;
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [mainQuestions, setMainQuestions] = useState<QuestionType[]>([]);
  
  const getReplies = (questionId: number) => {
    return questions.filter(q => q.question_parent_id === questionId);
  };

  useEffect(() => {
    if (!product_id) return;
    setIsLoading(true);
    async function fetchQuestions() {
      try {
        const data = await productService.getQuestions(product_id!, { page: currentPage, limit });
        setQuestions(data.data);
        setTotalQuestions(Number(data.totalQuestions) || 0);
        setTotalPages(Math.ceil(Number(data.totalQuestions) / limit) || 1);
        setMainQuestions(data.data.filter((q: QuestionType) => q.question_parent_id === null));
      } catch (error: any) {
        toast.error(error.message || "Server connection error");
      }
    }
    fetchQuestions();
    setIsLoading(false);
  }, [currentPage, product_id]);

  const handleSubmitQuestion = (e: any) => {
    e.preventDefault();
    if (e.target.question.value.trim() === "") {
      toast.error("Please enter the question or reply content");
      return;
    }

    const dataToSend = {
      content: e.target.question.value.trim(),
      question_parent_id: replyingTo,
    };

    async function postQuestion() {
      try {
        const data = await productService.postQuestion(product_id!, dataToSend);
        toast.success(data.message || "Question/reply submitted successfully");

        setQuestions((prev) => [...prev, data.data]);
        setMainQuestions((prev) => {
          if (replyingTo == null) {
            return [data.data, ...prev];
          } else {
            return prev;
          }
        });

        if (replyingTo !== null) {
          setReplyingTo(null);
        } else {
          setCurrentPage(1);
          setTotalQuestions((prev) => prev + 1);
        }
        e.target.reset();
      } catch (error: any) {
        toast.error(error.message || "Server connection error");
      }
    }
    postQuestion();
  };

  if (isLoading) {
    return <Loading className="static w-full h-full bg-transparent" />;
  }

  return (
    <div className="bg-card rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Product Q&A</h3>
        <p className="text-sm text-muted-foreground mt-1">Ask and answer questions about this product</p>
      </div>

      {/* Ask Question Form */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <form onSubmit={handleSubmitQuestion}>
              <textarea
                name="question"
                placeholder={replyingTo === null ? "Detailed description of your question..." : "Your reply content..."}
                className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none text-foreground text-sm"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                {replyingTo !== null && (
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent ml-auto cursor-pointer">
                  <Send className="w-4 h-4" />
                  {replyingTo === null ? "Submit Question" : "Submit Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-border text-sm text-muted-foreground">
        {totalQuestions} questions
      </div>
      {/* Questions List */}
      <div className="divide-y divide-border">
        {questions && mainQuestions && mainQuestions.length > 0 ? (
          mainQuestions.map((item) => {
            const replies = getReplies(item.question_id);
            return (
              <div key={item.question_id} className="px-6 py-6 hover:bg-muted/30 transition-colors duration-150">
                {/* Question */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{item.username}</span>
                      {item.user_id === seller_id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-600 text-xs font-medium rounded-full">
                          <Crown className="w-3 h-3" />
                          Seller
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">• {new Date(item.created_at).toLocaleString("en-US")}</span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>

                {/* Replies */}
                {replies.map((reply) => (
                  <div key={reply.question_id} className="flex gap-3 ml-11 mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-accent" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{reply.username}</span>
                        {reply.user_id === seller_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/15 text-yellow-600 text-xs font-medium rounded-full">
                            <Crown className="w-3 h-3" />
                            Seller
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">• {new Date(reply.created_at).toLocaleString("en-US")}</span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {/* Reply Button */}
                <div className="ml-11 mt-2">
                  <button 
                    onClick={() => setReplyingTo(item.question_id)}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === item.question_id && (
                  <div className="ml-11 mt-4 p-4 bg-muted/50 rounded-md">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <form onSubmit={handleSubmitQuestion}>
                          <textarea
                            name="question"
                            placeholder="Your reply content..."
                            className="w-full px-3 py-2 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none text-foreground text-sm"
                            rows={2}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <button 
                              type="button" 
                              onClick={() => setReplyingTo(null)}
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer">
                              <Send className="w-3 h-3" />
                              Submit Reply
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-6 py-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-1">No questions yet</h3>
            <p className="text-sm text-muted-foreground">Be the first to ask a question to get advice from the seller.</p>
          </div>
        )}

        <div className="py-4 px-6">
          <PaginationComponent numberOfPages={totalPages} currentPage={currentPage} controlPage={setCurrentPage} />
        </div>
        
      </div>
    </div>
  );
}