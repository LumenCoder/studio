
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { Schedule } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CalendarX2, Info, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '@/components/ui/badge';
import { getStartOfWeek, parseTime } from '@/lib/utils';

const DAYS_OF_WEEK_ORDER = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'];

export function MySchedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today, 3); // 3 for Wednesday
    const weekId = `week-${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${startOfWeek.getDate().toString().padStart(2, '0')}`;
    
    const scheduleDocRef = doc(db, "schedules", weekId);
    
    const unsubscribe = onSnapshot(scheduleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const scheduleData = docSnap.data() as Schedule;
        scheduleData.id = docSnap.id;
        setSchedule(scheduleData);
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
    return schedule.entries
        .filter(entry => entry.userId === user.id)
        .sort((a,b) => DAYS_OF_WEEK_ORDER.indexOf(a.dayOfWeek) - DAYS_OF_WEEK_ORDER.indexOf(b.dayOfWeek));
  }, [schedule, user]);

  const teamScheduleByDay = useMemo(() => {
    if (!schedule) return {};
    const grouped: Record<string, typeof schedule.entries> = {};

    for (const day of DAYS_OF_WEEK_ORDER) {
        grouped[day] = [];
    }
    
    schedule.entries.forEach(entry => {
        if (grouped[entry.dayOfWeek]) {
            grouped[entry.dayOfWeek].push(entry);
        }
    });

    for(const day in grouped) {
        grouped[day].sort((a,b) => {
          const timeA = parseTime(a.timeRange);
          const timeB = parseTime(b.timeRange);
          if (timeA && timeB) {
            return timeA.getTime() - timeB.getTime();
          }
          return a.name.localeCompare(b.name);
        });
    }

    return grouped;
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
              <ul className="space-y-3">
                {myShifts.map((shift, index) => (
                  <motion.li key={index} variants={itemVariants} className="p-4 bg-card-foreground/5 rounded-lg border">
                    <p className="font-semibold text-primary">{shift.dayOfWeek}</p>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{shift.timeRange} ({shift.hoursWorked} hrs)</span>
                    </div>
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
                <CardTitle>Team Schedule</CardTitle>
                <CardDescription>Daily breakdown of who is working.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue='Wednesday'>
                  {DAYS_OF_WEEK_ORDER.map(day => (
                     teamScheduleByDay[day] && teamScheduleByDay[day].length > 0 && (
                        <AccordionItem value={day} key={day}>
                          <AccordionTrigger>
                            <div className='flex items-center gap-2'>
                                {day}
                                <Badge variant="secondary">{teamScheduleByDay[day].length} on shift</Badge>
                            </div>
                            </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-3 pt-2">
                               {teamScheduleByDay[day].map((shift, index) => (
                                <li key={index} className="flex items-center justify-between text-sm">
                                    <div className='flex items-center gap-2'>
                                      <Users className="w-4 h-4 text-muted-foreground"/>
                                      <span>{shift.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{shift.timeRange}</span>
                                </li>
                               ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      )
                  ))}
                </Accordion>
            </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
