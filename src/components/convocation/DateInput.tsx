
import { forwardRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateInputProps {
  date: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ date, onChange, placeholder = "DD/MM/YYYY" }, ref) => {
    // Initialize input value based on date
    const [inputValue, setInputValue] = useState<string>(
      date ? formatDateToInput(date) : ''
    );
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Update input value when date prop changes
    useEffect(() => {
      if (date) {
        setInputValue(formatDateToInput(date));
      } else {
        setInputValue('');
      }
    }, [date]);

    // Format date object to dd/mm/yyyy for input display
    function formatDateToInput(date: Date): string {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Handle manual date input
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

    // Handle calendar selection
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
              placeholder={placeholder}
              className="w-full pr-10"
            />
            <PopoverTrigger asChild>
              <Button
                type="button" 
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
