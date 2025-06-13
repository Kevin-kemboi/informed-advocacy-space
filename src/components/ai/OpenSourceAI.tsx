
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OpenSourceAI() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<'summarize' | 'qa' | 'analyze'>('summarize');
  const { toast } = useToast();

  const tasks = {
    summarize: {
      title: "Summarize Posts",
      description: "Analyze citizen posts to extract key themes and concerns",
      icon: <Brain className="h-4 w-4" />,
      placeholder: "Paste citizen posts here to get a summary of key themes..."
    },
    qa: {
      title: "Q&A Assistant",
      description: "Ask questions about government documents and policies",
      icon: <Sparkles className="h-4 w-4" />,
      placeholder: "Ask a question about the Finance Bill or other government policies..."
    },
    analyze: {
      title: "Incident Analysis",
      description: "Analyze incident reports to identify patterns and priorities",
      icon: <Bot className="h-4 w-4" />,
      placeholder: "Paste incident reports here for priority analysis..."
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      // Simulate AI processing with a local lightweight model
      const response = await processWithLocalAI(input, selectedTask);
      setOutput(response);
      toast({
        title: "Analysis Complete",
        description: "AI processing finished successfully."
      });
    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process with AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated local AI processing (in production, this would connect to a local LLM)
  const processWithLocalAI = async (text: string, task: string): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    switch (task) {
      case 'summarize':
        return generateSummary(text);
      case 'qa':
        return generateQAResponse(text);
      case 'analyze':
        return generateAnalysis(text);
      default:
        return "Analysis complete.";
    }
  };

  const generateSummary = (text: string): string => {
    const themes = [
      "Infrastructure concerns (road maintenance, public transport)",
      "Healthcare accessibility and quality",
      "Education funding and resources",
      "Environmental issues (pollution, waste management)",
      "Public safety and security"
    ];
    
    return `## Key Themes Summary\n\n${themes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}\n\n**Overall Sentiment**: Mixed, with strong concerns about infrastructure and healthcare.\n\n**Priority Areas**: Infrastructure improvements and healthcare accessibility appear most frequently mentioned.\n\n**Recommended Actions**: \n- Increase infrastructure budget allocation\n- Improve healthcare service delivery\n- Address environmental concerns through policy updates`;
  };

  const generateQAResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('finance bill') || lowerQ.includes('budget')) {
      return `## Finance Bill 2024 Information\n\n**Key Provisions:**\n- Standard deduction increased to $13,850\n- New tax brackets for income over $200,000\n- Small business tax credits expanded\n- Infrastructure spending: $50B allocated\n\n**Impact on Citizens:**\n- Middle-income families will see reduced tax burden\n- Small businesses get additional deductions\n- Improved public services through infrastructure investment\n\n**Implementation Timeline:** January 2025`;
    }
    
    if (lowerQ.includes('tax') || lowerQ.includes('taxation')) {
      return `## Tax Information\n\n**Current Tax Rates:**\n- 10% on income up to $10,000\n- 12% on income $10,001 - $40,525\n- 22% on income $40,526 - $86,375\n\n**Deductions Available:**\n- Standard deduction: $13,850\n- Mortgage interest deduction\n- Charitable contributions\n\n**Filing Deadline:** April 15, 2025`;
    }
    
    return `## Government Policy Response\n\nBased on your question about "${question}", here are the key points:\n\n- Current policies are under review\n- Public input is being collected\n- Implementation timelines vary by department\n- Contact your local representative for specific concerns\n\nFor more detailed information, please consult official government documents or speak with a government representative.`;
  };

  const generateAnalysis = (text: string): string => {
    return `## Incident Analysis Report\n\n**Priority Classification:**\n🔴 Critical: Water main breaks, power outages (2 incidents)\n🟡 High: Traffic issues, public safety (5 incidents)\n🟢 Medium: Noise complaints, minor repairs (8 incidents)\n\n**Geographic Patterns:**\n- Downtown district: Highest concentration (40%)\n- Residential areas: Moderate activity (35%)\n- Industrial zones: Lower activity (25%)\n\n**Recommended Response:**\n1. Deploy emergency teams to critical incidents\n2. Schedule maintenance for high-priority areas\n3. Implement preventive measures in downtown district\n\n**Resource Allocation:**\n- Emergency services: Focus on critical incidents\n- Maintenance crews: Address high-priority backlog\n- Community engagement: Increase presence in downtown area`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Open-Source AI Assistant
          </CardTitle>
          <CardDescription>
            Powered by lightweight open-source language models for government analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(tasks).map(([key, task]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedTask === key ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTask(key as any)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {task.icon}
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Input for {tasks[selectedTask].title}
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tasks[selectedTask].placeholder}
                rows={6}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !input.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>

            {output && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Badge variant="secondary">AI Analysis Result</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border">
                    {output}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
