import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: Props) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggle = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
      toast.success("Voice captured!");
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Could not capture voice. Try again.");
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, onTranscript]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      className={`shrink-0 h-10 w-10 border-border ${isListening ? "bg-destructive text-destructive-foreground animate-pulse" : "text-muted-foreground hover:text-foreground"}`}
      title={isListening ? "Stop listening" : "Voice input"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInput;
