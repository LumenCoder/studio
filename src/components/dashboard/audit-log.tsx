"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type AuditLog as AuditLogType } from "@/lib/types";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

type FormattedAuditLog = Omit<AuditLogType, 'timestamp'> & {
  timestamp: string;
};

export function AuditLog() {
  const [logs, setLogs] = useState<FormattedAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const formattedLogs = querySnapshot.docs.map(doc => {
        const data = doc.data() as AuditLogType;
        return {
          ...data,
          id: doc.id,
          timestamp: formatDistanceToNow(data.timestamp.toDate(), { addSuffix: true }),
        }
      });
      setLogs(formattedLogs);
      setLoading(false);
    });

    return () => unsubscribe();
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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-2 w-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
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
                <p className="text-sm text-muted-foreground text-center">No audit logs yet.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}