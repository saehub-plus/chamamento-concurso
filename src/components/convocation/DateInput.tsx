
import { forwardRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateInputProps {
  date: Date;
  onChange: (date: Date) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ date, onChange, calendarOpen, setCalendarOpen }, ref) => {
    const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateString = e.target.value;
      
      // Validate date format (DD/MM/YYYY)
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/').map(Number);
        
        // Check if it's a valid date (month between 1-12, day valid for month)
        const newDate = new Date(year, month - 1, day);
        const isValidDay = day > 0 && day <= new Date(year, month, 0).getDate();
        const isValidMonth = month > 0 && month <= 12;
        
        if (isValidDay && isValidMonth && !isNaN(newDate.getTime())) {
          onChange(newDate);
        }
      }
    };

    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={ref}
            value={format(date, 'dd/MM/yyyy')}
            onChange={handleManualDateChange}
            placeholder="DD/MM/YYYY"
            className="pl-3"
          />
        </div>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  onChange(newDate);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';
