
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Bot, User } from "lucide-react";

export function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm your AI assistant for understanding government documents and policies. You can ask me about the Finance Bill, local ordinances, or any civic matters. How can I help you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: "bot",
        content: getAIResponse(inputMessage)
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("finance bill") || lowerQuestion.includes("budget")) {
      return "The Finance Bill 2024 includes key provisions for:\n\n• Tax reforms affecting middle-income families\n• Infrastructure spending allocation\n• Healthcare budget increases\n• Education funding adjustments\n\nWould you like me to explain any specific section in detail?";
    }
    
    if (lowerQuestion.includes("tax") || lowerQuestion.includes("taxation")) {
      return "The new tax provisions include:\n\n• Standard deduction increase to $13,850\n• New tax brackets for higher earners\n• Small business tax credits\n• Capital gains adjustments\n\nThese changes aim to provide relief for working families while ensuring adequate government revenue.";
    }
    
    if (lowerQuestion.includes("voting") || lowerQuestion.includes("election")) {
      return "Here's what you need to know about voting:\n\n• Registration deadlines and requirements\n• Polling locations and hours\n• Absentee and early voting options\n• Voter ID requirements\n\nYou can also participate in local polls and surveys through our platform to voice your opinions on community issues.";
    }
    
    return "I understand you're asking about government policies. I can help explain:\n\n• Budget and financial legislation\n• Tax laws and implications\n• Voting procedures and rights\n• Local ordinances and regulations\n\nCould you be more specific about what you'd like to know?";
  };

  const suggestedQuestions = [
    "Explain the Finance Bill 2024",
    "How do the new tax changes affect me?",
    "What are my voting rights?",
    "Tell me about local budget allocation"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Government Assistant
          </CardTitle>
          <CardDescription>
            Get AI-powered explanations of government documents and policies in simple terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user" ? "bg-blue-500" : "bg-gray-600"
                    }`}>
                      {message.type === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${
                      message.type === "user" 
                        ? "bg-blue-500 text-white" 
                        : "bg-white border"
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about government documents, policies, or procedures..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
