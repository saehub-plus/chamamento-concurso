
import { forwardRef, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  date: Date;
  onChange: (date: Date) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ date, onChange }, ref) => {
    const [inputValue, setInputValue] = useState(format(date, 'dd/MM/yyyy'));
    const [calendarOpen, setCalendarOpen] = useState(false);

    useEffect(() => {
      setInputValue(format(date, 'dd/MM/yyyy'));
    }, [date]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      
      // Parse the date in DD/MM/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        
        // Check if it's a valid date
        const newDate = new Date(year, month - 1, day);
        const isValidDay = day > 0 && day <= new Date(year, month, 0).getDate();
        const isValidMonth = month > 0 && month <= 12;
        
        if (isValidDay && isValidMonth && !isNaN(newDate.getTime())) {
          onChange(newDate);
        }
      }
    };

    const handleCalendarSelect = (date: Date | undefined) => {
      if (date) {
        onChange(date);
        setCalendarOpen(false);
      }
    };

    return (
      <div className="relative w-full">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <div className="flex items-center">
            <Input
              ref={ref}
              type="text"
              value={inputValue}
              onChange={handleDateChange}
              placeholder="DD/MM/YYYY"
              className="w-full pr-10"
            />
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarIcon className="h-4 w-4 opacity-70" />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleCalendarSelect}
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
