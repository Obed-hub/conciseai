import { useState, useEffect, useRef } from 'react';
import SearchInput from '@/components/SearchInput';
import VoiceButton from '@/components/VoiceButton';
import ThemeToggle from '@/components/ThemeToggle';
import BottomNav from '@/components/BottomNav';
import VoiceWorkspace from '@/components/VoiceWorkspace';
import QuerySuggestions from '@/components/QuerySuggestions';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { groqService } from '@/services/groqClientService';

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to CDN for simplicity in this environment, or local if configured.
// Using unpkg or cdnjs is common for client-side only without complex build config tweaks.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

import { useSubscription } from "@/context/SubscriptionContext";

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [voiceWorkspaceOpen, setVoiceWorkspaceOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState('Chat');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContext, setFileContext] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const { checkAllowance, useCredits } = useSubscription();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSubmit = async (submittedQuery: string) => {
    console.log('Query submitted:', submittedQuery);

    // Credit Check Logic
    let feature: 'search' | 'doc' | 'chat' = 'chat';
    if (activeMode === 'Search Engine') feature = 'search';
    else if (fileContext) feature = 'doc';

    // Chat is essentially free/unlimited in this simplified model unless it's Search or Doc analysis
    // But implementation plan says "Use 'Search Engine' queries included for free" and "Unlimited Simple Chat"
    // So only Search Engine and Doc Analysis cost credits here.

    if (feature !== 'chat') {
      const cost = 1; // 1 credit per query

      // Check allowance first (this shows the modal if insufficient)
      if (!checkAllowance(cost, feature as 'search' | 'doc')) return;

      // Consume credits
      // We pass 'search' if it's search engine to use free queries, otherwise 'fuel' (which falls back to power/fuel)
      // Doc analysis consumes fuel/power.
      const consumptionType = feature === 'search' ? 'search' : 'fuel';
      const success = await useCredits(cost, consumptionType);

      if (!success) {
        // Double check - if checkAllowance passed but useCredits failed (race condition?)
        // We should probably just return or show an error.
        // But checkAllowance is synchronous based on local state, useCredits is async.
        // If local state said yes, but async failed (maybe network?), we might want to handle it.
        // For now, if useCredits returns false, we stop.
        return;
      }
    }

    setIsLoading(true);
    setResponse(null);
    try {
      const contextToUse = fileContext || '';
      let systemPrompt = '';
      let model = 'llama-3.3-70b-versatile';

      if (activeMode === 'Key Takeaway') {
        systemPrompt = 'You are an assistant that extracts key takeaways. Provide the key points from the context or query. Use full sentences only when necessary for complex explanations; otherwise use concise bullet points or fragments.';
      } else if (activeMode === 'Search Engine') {
        systemPrompt = 'STRICT INSTRUCTION: Answer in exactly one short sentence or a single word. absolute brevity. No explanations. No intro. No outro.';
        model = 'groq/compound';
      } else if (activeMode === 'Voice') {
        systemPrompt = 'You are a voice assistant. Answer in 1-2 short, conversational sentences. Be direct and concise.';
      } else {
        // Chat mode
        systemPrompt = 'You are a helpful AI assistant. Keep answers concise and relevant.';
      }

      const answer = await groqService.chat(contextToUse, submittedQuery, systemPrompt, model);
      setResponse(answer);
    } catch (error) {
      // ...
      console.error(error);
      setResponse("Error.");
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleCameraClick = () => {
    console.log('Camera clicked - MCQ/Vision solving');
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Credit Check for Vision
    if (!checkAllowance(1, 'vision')) {
      event.target.value = '';
      return;
    }
    useCredits(1, 'fuel'); // Vision consumes standard credits

    setIsLoading(true);
    setResponse(null);

    // ... (rest of logic)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result?.toString();
      if (dataUrl) {
        try {
          const answer = await groqService.solveMCQ(dataUrl);
          setResponse(`MCQ Answer: ${answer}`);
        } catch (error: any) {
          console.error("Error solving MCQ:", error);
          setResponse(`Failed to solve MCQ. ${error.message || ''}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (unchanged file upload logic, strictly parsing doesn't cost, only querying)
    // Actually implementation plan says "Capability: PDF Analysis modes".
    // But usually parsing is local. The query is what costs.
    // I'll leave upload free, and charge on query if fileContext is present.
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResponse(null);

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setFileContext(text);
        setResponse(`File loaded: ${file.name}. You can now ask questions about it.`);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setFileContext(fullText);
        setResponse(`PDF loaded: ${file.name} (${pdf.numPages} pages). You can now ask questions about it.`);
      } else {
        setResponse("Unsupported file type. Please upload .txt or .pdf");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      setResponse("Failed to read file.");
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleToolClick = (toolTitle: string) => {
    if (toolTitle === 'Voice Workspace') {
      setVoiceWorkspaceOpen(true);
    } else if (toolTitle === 'Vision') {
      fileInputRef.current?.click();
    } else if (toolTitle === 'Documents') {
      docInputRef.current?.click();
    } else {
      console.log(`Tool clicked: ${toolTitle}`);
    }
  };

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setIsLoading(true);
        setResponse(null); // Clear previous response

        try {
          const text = await groqService.transcribeVoice(audioBlob);
          setQuery(text); // Show what was heard
          await handleSubmit(text); // Automatically submit
        } catch (error) {
          console.error("Transcription error:", error);
          setResponse("Failed to transcribe audio. Please try again.");
          setIsLoading(false);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setActiveMode('Voice'); // Switch to Voice mode visually
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileClick = () => {
    docInputRef.current?.click();
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative min-h-screen min-h-[100dvh] flex w-full transition-colors duration-500">
        {/* Sidebar */}
        <AppSidebar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onToolClick={handleToolClick}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-24 relative">
          {/* Top bar */}
          {/* Top bar */}
          <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-40 flex items-center justify-between pointer-events-none">
            {/* Left Group: Trigger + Mode */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <SidebarTrigger
                className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
                    bg-background shadow-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted
                `}
              />

              {/* Mode indicator */}
              <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 backdrop-blur-md bg-background/80
                ${activeMode === 'Voice'
                  ? 'border-primary/20 text-primary animate-pulse'
                  : 'border-border/50 text-muted-foreground'
                }
                `}>
                {activeMode === 'Voice' && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />}
                <span className={`text-xs font-medium ${activeMode === 'Voice' ? 'text-primary' : ''}`}>
                  {activeMode}
                </span>
              </div>
            </div>

            {/* Right Group: Theme Toggle */}
            <div className="pointer-events-auto">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            </div>
          </div>

          {/* Main content - centered */}
          <main className="flex flex-col items-center gap-8 sm:gap-10 w-full max-w-3xl animate-fade-in mt-16">
            {/* File Input for Camera */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            {/* File Input for Docs */}
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              ref={docInputRef}
              onChange={handleFileUpload}
            />

            {/* Answer Display */}
            {(response || isLoading) && (
              <div className="w-full p-4 rounded-xl bg-muted/50 border border-border animate-in fade-in slide-in-from-bottom-4">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Thinking...
                  </div>
                ) : (
                  <p className="text-foreground">{response}</p>
                )}
              </div>
            )}

            {/* Search input with action icons */}
            <SearchInput
              value={query}
              onValueChange={setQuery}
              onSubmit={handleSubmit}
              onCameraClick={handleCameraClick}
              onMicClick={handleMicClick}
              onFileClick={handleFileClick}
            />

            {/* Query suggestions */}
            {!response && !isLoading && <QuerySuggestions onSelect={handleSuggestionSelect} />}

            {/* Voice button */}
            <VoiceButton onClick={handleMicClick} isRecording={isRecording} />
          </main>

          {/* Bottom navigation for voice workspace */}
          <BottomNav onVoiceWorkspaceOpen={() => setVoiceWorkspaceOpen(true)} />

          {/* Voice workspace overlay */}
          <VoiceWorkspace
            isOpen={voiceWorkspaceOpen}
            onClose={() => setVoiceWorkspaceOpen(false)}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
