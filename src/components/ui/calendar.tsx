
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Componente personalizado para o cabeçalho do calendário com seletores de mês e ano
function CustomCaption({ displayMonth, onMonthChange }: CaptionProps) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  // Cria uma lista de anos para selecionar (de 70 anos atrás até 10 anos à frente)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 81 }, (_, i) => currentYear - 70 + i);
  
  // Obtém o mês e ano atuais
  const month = displayMonth.getMonth();
  const year = displayMonth.getFullYear();
  
  // Funções para atualizar o mês e ano
  const handleMonthChange = (newMonth: string) => {
    const monthIndex = months.findIndex(m => m === newMonth);
    if (monthIndex !== -1) {
      const newDate = new Date(year, monthIndex);
      onMonthChange(newDate);
    }
  };
  
  const handleYearChange = (newYear: string) => {
    const newDate = new Date(parseInt(newYear), month);
    onMonthChange(newDate);
  };
  
  return (
    <div className="flex justify-center space-x-2">
      <Select 
        value={months[month]} 
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[120px] h-7 text-xs">
          <SelectValue placeholder={months[month]} />
        </SelectTrigger>
        <SelectContent>
          {months.map((monthName) => (
            <SelectItem key={monthName} value={monthName} className="text-xs">
              {monthName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select 
        value={year.toString()} 
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[80px] h-7 text-xs">
          <SelectValue placeholder={year.toString()} />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="text-xs">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden", // Esconde o label padrão pois usamos nosso componente personalizado
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
