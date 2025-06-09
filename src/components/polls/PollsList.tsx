
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Vote, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PollsListProps {
  userRole: string;
}

export function PollsList({ userRole }: PollsListProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const polls = [
    {
      id: "1",
      title: "City Budget 2024 - Infrastructure vs. Parks",
      description: "How should we prioritize the remaining budget allocation?",
      options: [
        { id: "infra", text: "Prioritize road and bridge repairs", votes: 245 },
        { id: "parks", text: "Invest in parks and recreation", votes: 189 },
        { id: "mixed", text: "50/50 split between both", votes: 156 }
      ],
      totalVotes: 590,
      endsAt: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      title: "Public Transportation Expansion",
      description: "Which area should receive priority for new bus routes?",
      options: [
        { id: "north", text: "North District", votes: 178 },
        { id: "south", text: "South District", votes: 234 },
        { id: "east", text: "East District", votes: 145 }
      ],
      totalVotes: 557,
      endsAt: "2024-01-20",
      status: "active"
    },
    {
      id: "3",
      title: "Community Safety Initiative",
      description: "What safety measure would have the most impact?",
      options: [
        { id: "lighting", text: "Improved street lighting", votes: 312 },
        { id: "patrols", text: "Increased police patrols", votes: 287 },
        { id: "cameras", text: "Security camera installation", votes: 198 }
      ],
      totalVotes: 797,
      endsAt: "2024-01-10",
      status: "closed"
    }
  ];

  const handleVote = (pollId: string) => {
    const selectedOption = selectedOptions[pollId];
    if (!selectedOption) {
      toast({
        title: "Please select an option",
        description: "You must choose an option before voting",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Vote Submitted",
      description: "Thank you for participating in the poll!"
    });

    // Clear selection after voting
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: ""
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Polls</h2>
          <p className="text-gray-600">Participate in decisions that shape your community</p>
        </div>
        {userRole === "government_official" && (
          <Button>
            <Vote className="h-4 w-4 mr-2" />
            Create Poll
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{poll.title}</CardTitle>
                  <CardDescription className="mt-1">{poll.description}</CardDescription>
                </div>
                <Badge variant={getStatusColor(poll.status)}>
                  {poll.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {poll.totalVotes} votes
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Ends {new Date(poll.endsAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.status === "active" && !isExpired(poll.endsAt) && userRole === "citizen" ? (
                  // Voting interface for active polls
                  <div className="space-y-4">
                    <RadioGroup
                      value={selectedOptions[poll.id] || ""}
                      onValueChange={(value) => 
                        setSelectedOptions(prev => ({ ...prev, [poll.id]: value }))
                      }
                    >
                      {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                          <Label 
                            htmlFor={`${poll.id}-${option.id}`} 
                            className="flex-1 cursor-pointer"
                          >
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button onClick={() => handleVote(poll.id)} className="w-full">
                      Submit Vote
                    </Button>
                  </div>
                ) : (
                  // Results view for closed polls or officials
                  <div className="space-y-3">
                    {poll.options.map((option) => {
                      const percentage = (option.votes / poll.totalVotes) * 100;
                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{option.text}</span>
                            <span>{option.votes} votes ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
