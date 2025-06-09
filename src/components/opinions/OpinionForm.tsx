
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

interface OpinionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpinionForm({ isOpen, onClose }: OpinionFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Mock submission - in real app this would use Supabase
    toast({
      title: "Opinion Submitted",
      description: "Your feedback has been submitted and will be reviewed by government officials"
    });

    // Reset form
    setTitle("");
    setContent("");
    setCategory("general");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Opinion</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Opinion Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your opinion"
            />
          </div>

          <div>
            <Label htmlFor="content">Your Opinion *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your detailed thoughts, suggestions, or concerns about government policies or local issues"
              rows={6}
            />
          </div>

          <div>
            <Label>Category</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">General Policy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="finance" id="finance" />
                <Label htmlFor="finance">Finance & Budget</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="infrastructure" id="infrastructure" />
                <Label htmlFor="infrastructure">Infrastructure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="environment" id="environment" />
                <Label htmlFor="environment">Environment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="education" id="education" />
                <Label htmlFor="education">Education</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="healthcare" id="healthcare" />
                <Label htmlFor="healthcare">Healthcare</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your voice matters!</strong> All opinions are reviewed by government officials 
              and help inform policy decisions. Our AI system will analyze sentiment and identify 
              common themes to provide insights to decision-makers.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Opinion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
