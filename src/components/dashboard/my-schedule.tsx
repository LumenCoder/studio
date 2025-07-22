
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { Schedule, User } from '@/lib/types';
import type { ScheduleEntry } from '@/ai/flows/schedule-ocr';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, CalendarX2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function MySchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "schedules"), orderBy("uploadedAt", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const latestSchedule = querySnapshot.docs[0].data() as Schedule;
        latestSchedule.id = querySnapshot.docs[0].id;
        setSchedule(latestSchedule);
      } else {
        setSchedule(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching schedule: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const myShifts = useMemo(() => {
    if (!schedule || !user) return [];
    return schedule.entries.filter(entry => entry.userId === user.id);
  }, [schedule, user]);

  const teamScheduleChartData = useMemo(() => {
    if (!schedule) return [];
    
    const dayMap: Record<string, { name: string, hours: number }> = {
      'Monday': { name: 'Mon', hours: 0 },
      'Tuesday': { name: 'Tue', hours: 0 },
      'Wednesday': { name: 'Wed', hours: 0 },
      'Thursday': { name: 'Thu', hours: 0 },
      'Friday': { name: 'Fri', hours: 0 },
      'Saturday': { name: 'Sat', hours: 0 },
      'Sunday': { name: 'Sun', hours: 0 },
    };

    schedule.entries.forEach(entry => {
      const hours = parseFloat(entry.hoursWorked);
      if (isNaN(hours)) return;

      for (const day in dayMap) {
        if (entry.timeAndDate.toLowerCase().includes(day.toLowerCase())) {
          dayMap[day].hours += hours;
          break;
        }
      }
    });

    return Object.values(dayMap);
  }, [schedule]);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!schedule) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>No Schedule Found</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <CalendarX2 className="w-16 h-16 mb-4" />
            <p>A schedule has not been uploaded for this week yet.</p>
            {user?.role !== 'Team Training' && <p className="text-sm mt-2">Please go to "Upload Schedule" to add one.</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-3"
    >
      <motion.div variants={itemVariants} className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Shifts</CardTitle>
            <CardDescription>Here are your scheduled shifts for this week.</CardDescription>
          </CardHeader>
          <CardContent>
            {myShifts.length > 0 ? (
              <ul className="space-y-4">
                {myShifts.map((shift, index) => (
                  <motion.li key={index} variants={itemVariants} className="p-4 bg-card-foreground/5 rounded-lg border">
                    <p className="font-semibold text-primary">{shift.timeAndDate}</p>
                    <p className="text-sm text-muted-foreground">Hours: {shift.hoursWorked}</p>
                  </motion.li>
                ))}
              </ul>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <Info className="w-10 h-10 mb-2" />
                    <p>You don't have any shifts this week.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Team Hours Overview</CardTitle>
                <CardDescription>Total scheduled hours per day for the entire team.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamScheduleChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }} />
                        <RechartsTooltip
                            cursor={{ fill: 'hsl(var(--accent))' }}
                            contentStyle={{
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        <Bar dataKey="hours" name="Total Hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
