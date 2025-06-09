
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncidentReportModal({ isOpen, onClose }: IncidentReportModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("infrastructure");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!title || !description || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Mock submission - in real app this would use Supabase
    toast({
      title: "Report Submitted",
      description: "Your incident report has been submitted successfully"
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("infrastructure");
    setLocation("");
    setFiles([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          toast({
            title: "Location Captured",
            description: "Your current location has been added to the report"
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an Incident</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Incident Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the incident"
              rows={4}
            />
          </div>

          <div>
            <Label>Category</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency">Emergency</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="infrastructure" id="infrastructure" />
                <Label htmlFor="infrastructure">Infrastructure</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public_service" id="public_service" />
                <Label htmlFor="public_service">Public Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="environmental" id="environmental" />
                <Label htmlFor="environmental">Environmental</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter address or coordinates"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={getCurrentLocation}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="files">Attachments</Label>
            <div className="mt-2">
              <input
                id="files"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('files')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos/Videos
              </Button>
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{files.length} file(s) selected</p>
                </div>
              )}
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Photo Tips</p>
                  <p className="text-sm text-blue-700">
                    Include clear photos showing the issue. Multiple angles help our teams 
                    assess and prioritize the response.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
