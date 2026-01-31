import { ArrowDown, Mic, Square, FileText } from 'lucide-react';
import { useState } from 'react';
import { groqService } from '@/services/groqClientService';

interface VoiceWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceWorkspace = ({ isOpen, onClose }: VoiceWorkspaceProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setIsProcessing(true);
        try {
          const text = await groqService.transcribeVoice(audioBlob);
          setTranscript(text);
        } catch (error) {
          console.error("Transcription error:", error);
          // toast.error("Failed to transcribe audio");
        } finally {
          setIsProcessing(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;

    setIsSummarizing(true);
    try {
      const result = await groqService.summarize(transcript);
      setSummary(result);
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background animate-slide-up overflow-y-auto">
      {/* Close handle */}
      <button
        onClick={onClose}
        className="flex items-center justify-center py-6 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close workspace"
      >
        <ArrowDown className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start px-8 pb-10 min-h-0">

        <div className="w-full max-w-2xl flex flex-col gap-6">

          {/* Transcript area */}
          {(transcript || isProcessing) && (
            <div className="w-full p-6 rounded-2xl bg-card/50 dark:bg-[hsl(0_0%_100%/0.04)] border border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Transcript</h3>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Transcribing audio...
                </div>
              ) : (
                <p className="text-foreground font-light leading-relaxed">{transcript}</p>
              )}
            </div>
          )}

          {/* Summary area */}
          {(summary || isSummarizing) && (
            <div className="w-full p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-sm font-medium text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Summary
              </h3>
              {isSummarizing ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Summarizing...
                </div>
              ) : (
                <p className="text-foreground font-light leading-relaxed">{summary}</p>
              )}
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="mt-auto pt-10 flex flex-col items-center">
          <button
            onClick={toggleRecording}
            className={`
                relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 press-effect
                ${isRecording ? 'scale-110' : ''}
              `}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {/* Animated ring when recording */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-destructive/10 animate-pulse" />
              </>
            )}

            {/* Button background */}
            <div
              className={`
                  relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300
                  ${isRecording
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-background dark:bg-card shadow-[6px_6px_12px_hsl(220_20%_82%),-6px_-6px_12px_hsl(0_0%_100%)] dark:shadow-none dark:border dark:border-[hsl(0_0%_100%/0.1)]'
                }
                `}
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          </button>

          <p className="mt-6 text-sm text-muted-foreground font-light">
            {isRecording ? 'Tap to stop' : 'Tap to record'}
          </p>

          {/* Actions */}
          {transcript && !isProcessing && !isRecording && (
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-normal transition-all duration-200 hover:opacity-90 press-effect disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isSummarizing ? 'Summarizing...' : 'Summarize'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceWorkspace;
