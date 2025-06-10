
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Vote, Clock, Users, BarChart3 } from "lucide-react";
import { Poll } from "@/lib/supabase";
import { useSocialPolls } from "@/hooks/useSocialPolls";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const { submitVote, hasUserVoted } = useSocialPolls();
  const { profile } = useAuth();
  
  const userHasVoted = hasUserVoted(poll.id);
  const isExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;

  const handleVote = async () => {
    if (selectedOption && !userHasVoted && !isExpired) {
      await submitVote(poll.id, selectedOption);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'government_official': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'government_official': return '🏛️';
      default: return '👤';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 animate-fade-in border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Vote className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {poll.profiles?.full_name || 'Anonymous'}
                </span>
                <Badge variant="outline" className={`text-xs ${getRoleColor(poll.profiles?.role || 'citizen')}`}>
                  {getRoleIcon(poll.profiles?.role || 'citizen')} {poll.profiles?.role?.replace('_', ' ') || 'citizen'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(poll.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <BarChart3 className="h-3 w-3 mr-1" />
              Poll
            </Badge>
            {isExpired && (
              <Badge variant="outline" className="text-red-600">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{poll.question}</h3>
          
          {poll.expires_at && !isExpired && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-md">
              <Clock className="h-4 w-4" />
              Ends {formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {poll.total_votes} votes
            </div>
          </div>

          {/* Voting Interface or Results */}
          <div className="space-y-3">
            {!userHasVoted && !isExpired ? (
              // Voting interface
              <div className="space-y-4">
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer font-medium">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button 
                  onClick={handleVote}
                  disabled={!selectedOption}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Vote className="h-4 w-4 mr-2" />
                  Submit Vote
                </Button>
              </div>
            ) : (
              // Results view
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = poll.total_votes > 0 ? (option.votes / poll.total_votes) * 100 : 0;
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-sm text-gray-600">
                          {option.votes} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
                
                {userHasVoted && (
                  <p className="text-sm text-green-600 font-medium">✓ You have voted on this poll</p>
                )}
                
                {isExpired && (
                  <p className="text-sm text-red-600 font-medium">⏰ This poll has expired</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
