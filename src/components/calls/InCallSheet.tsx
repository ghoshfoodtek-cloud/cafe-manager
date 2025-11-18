import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCallSession } from "@/hooks/useCallSession";
import { createCallLog } from "@/lib/supabase-call-logs";
import type { Client } from "@/types/client";
import { Phone, Mic, MicOff, Save, ExternalLink, StopCircle } from "lucide-react";

interface InCallSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client | null;
  phone: string | null;
}

const InCallSheet = ({ open, onOpenChange, client, phone }: InCallSheetProps) => {
  const { toast } = useToast();
  const session = useCallSession();

  const startDial = () => {
    if (!phone) return;
    // Start local session and open the dialer
    if (!session.active) session.start();
    window.location.href = `tel:${phone}`;
  };

  const endAndSave = async () => {
    if (!client || !phone) return;
    try {
      const result = await session.stop();
      await createCallLog({
        clientId: client.id,
        clientName: client.fullName,
        phone,
        ...result,
        startedAt: result.startedAt || new Date().toISOString(),
      });
      toast({ title: "Call saved", description: `Logged call with ${client.fullName}` });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving call log:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save call log",
        variant: "destructive"
      });
    }
  };

  const discard = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{client ? `Call ${client.fullName}` : "Call"}</SheetTitle>
          <SheetDescription>
            {phone ? `Using ${phone}. Take notes and optionally record a voice note.` : "Select a phone number to start."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-2xl font-semibold">{session.timeLabel}</div>
            </div>
            <div className="flex gap-2">
              {!session.active ? (
                <Button onClick={session.start} disabled={!phone}>
                  <Phone className="mr-2 h-4 w-4" /> Start Session
                </Button>
              ) : (
                <Button variant="destructive" onClick={async () => await endAndSave()}>
                  <StopCircle className="mr-2 h-4 w-4" /> End & Save
                </Button>
              )}
              <Button variant="outline" onClick={startDial} disabled={!phone}>
                <ExternalLink className="mr-2 h-4 w-4" /> Dial
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Notes</div>
            <Textarea
              placeholder="Type notes during the call"
              value={session.notes}
              onChange={(e) => session.setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Voice Note</div>
              <div className="text-xs text-muted-foreground">Records your microphone as a voice note.</div>
            </div>
            <Button variant={session.isRecording ? "destructive" : "secondary"} onClick={session.toggleRecording}>
              {session.isRecording ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Start Recording
                </>
              )}
            </Button>
          </div>
        </div>

        <SheetFooter className="mt-4">
          <Button onClick={endAndSave} className="w-full">
            <Save className="mr-2 h-4 w-4" /> Save Call Log
          </Button>
          <Button variant="outline" onClick={discard} className="w-full">Discard</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default InCallSheet;
