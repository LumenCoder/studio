
"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Upload, Calendar, AlertCircle, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { runScheduleOcr, type ScheduleEntry } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";

export function ScheduleManagement() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please choose a PDF file to upload.',
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setScheduleData([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const pdfDataUri = reader.result as string;
      const result = await runScheduleOcr({ pdfDataUri });

      if ('error' in result) {
        setError(result.error as string);
        toast({
            variant: "destructive",
            title: "Processing Failed",
            description: result.error,
        });
      } else {
        setScheduleData(result.schedule);
        toast({
            title: "Schedule Processed",
            description: "Successfully extracted schedule from the PDF. Review and save below.",
        });
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setIsProcessing(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (scheduleData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Schedule Data',
        description: 'There is no data to save. Please process a schedule first.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const weekId = `week-${format(new Date(), 'yyyy-MM-dd')}`;
      const scheduleDocRef = doc(db, 'schedules', weekId);
      await setDoc(scheduleDocRef, {
        entries: scheduleData,
        uploadedAt: serverTimestamp(),
      });
      toast({
        title: 'Schedule Saved',
        description: 'The extracted schedule has been saved to the database.',
      });
    } catch (e) {
      console.error('Error saving schedule: ', e);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the schedule to the database.',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload Schedule PDF
          </CardTitle>
          <CardDescription>
            Upload a PDF of the weekly schedule to automatically extract shift information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="schedule-pdf">Schedule File</Label>
            <Input id="schedule-pdf" type="file" accept="application/pdf" onChange={handleFileChange} />
          </div>
          <Button onClick={handleFileUpload} disabled={isProcessing || !file}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 h-4 w-4" />
            )}
            Process Schedule
          </Button>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scheduleData.length > 0 && (
          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Extracted Schedule</CardTitle>
                    <CardDescription>Review the schedule data extracted from the uploaded PDF.</CardDescription>
                  </div>
                  <Button onClick={handleSaveSchedule} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Schedule
                  </Button>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>User ID</TableHead>
                              <TableHead>Day of Week</TableHead>
                              <TableHead>Time Range</TableHead>
                              <TableHead>Hours Worked</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {scheduleData.map((entry, index) => (
                              <TableRow key={index}>
                                  <TableCell>{entry.name}</TableCell>
                                  <TableCell>{entry.userId}</TableCell>
                                  <TableCell>{entry.dayOfWeek}</TableCell>
                                  <TableCell>{entry.timeRange}</TableCell>
                                  <TableCell>{entry.hoursWorked}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
          </Card>
      )}
    </motion.div>
  );
}
