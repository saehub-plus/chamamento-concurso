
import { forwardRef } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface DateInputProps {
  date: Date;
  onChange: (date: Date) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ date, onChange }, ref) => {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateString = e.target.value;
      
      // Parse the date in DD/MM/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/').map(Number);
        
        // Check if it's a valid date
        const newDate = new Date(year, month - 1, day);
        const isValidDay = day > 0 && day <= new Date(year, month, 0).getDate();
        const isValidMonth = month > 0 && month <= 12;
        
        if (isValidDay && isValidMonth && !isNaN(newDate.getTime())) {
          onChange(newDate);
        }
      }
    };

    // Format date as DD/MM/YYYY
    const formattedDate = format(date, 'dd/MM/yyyy');

    return (
      <Input
        ref={ref}
        value={formattedDate}
        onChange={handleDateChange}
        placeholder="DD/MM/YYYY"
        className="w-full"
      />
    );
  }
);

DateInput.displayName = 'DateInput';
