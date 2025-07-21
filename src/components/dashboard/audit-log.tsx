"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditLogs, type AuditLog as AuditLogType } from "@/lib/data";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

type FormattedAuditLog = Omit<AuditLogType, 'timestamp'> & {
  timestamp: string;
};

export function AuditLog() {
  const [formattedLogs, setFormattedLogs] = useState<FormattedAuditLog[]>([]);

  useEffect(() => {
    const newLogs = auditLogs.map(log => ({
      ...log,
      timestamp: formatDistanceToNow(log.timestamp, { addSuffix: true }),
    }));
    setFormattedLogs(newLogs);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-6 h-6" />
          Audit Log
        </CardTitle>
        <CardDescription>
          Immutable record of all inventory modifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {formattedLogs.length > 0 ? (
              formattedLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{log.user}</span>{" "}
                      {log.action.replace("_", " ")}{" "}
                      <span className="font-semibold">{log.item}</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                   <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                   <div className="flex-1">
                    <p className="text-sm">
                        <span className="font-semibold">{log.user}</span>{" "}
                        {log.action.replace("_", " ")}{" "}
                        <span className="font-semibold">{log.item}</span>.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Loading date...
                    </p>
                   </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}